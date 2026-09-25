import crypto from 'crypto';
import { 
  AnalysisContext, 
  ComparisonContext, 
  ActionContext, 
  ActionContextSchema,
  ActionItemSchema
} from '../../../core/contexts/contracts';
import { GovernmentRoute } from '../../legal-kb/models/GovernmentRoute';
import { ActionTypes, ActionType } from '../constants/actionTypes';
import { z } from 'zod';

export class ActionService {
  /**
   * Deterministically maps comparison results to actions and official government routes.
   */
  public async generateActionContext(
    analysisContext: AnalysisContext,
    comparisonContext: ComparisonContext
  ): Promise<ActionContext> {
    const findings = analysisContext.findings;
    const actionItems: z.infer<typeof ActionItemSchema>[] = [];
    const governmentRouteIds = new Set<string>();
    const questions: string[] = [];
    const informationToCollect: string[] = [];
    const warnings: string[] = [];

    // Transfer unresolved questions from comparison context
    if (comparisonContext.unresolved_questions) {
      questions.push(...comparisonContext.unresolved_questions);
    }

    // Map each comparison item to applicable finding(s)
    for (const comp of comparisonContext.comparison_items) {
      // Find related findings deterministically by matching clause and rule IDs
      const relatedFindings = findings.filter(f => 
        f.clause_ids.some(cid => comp.clause_ids.includes(cid)) &&
        f.rule_ids.some(rid => comp.rule_ids.includes(rid))
      );

      const relatedFindingIds = relatedFindings.map(f => f.finding_id);

      // Handle Uncertainties
      if (['NOT_STATED', 'REQUIRES_REVIEW', 'INSUFFICIENT_SOURCE', 'JURISDICTION_UNCLEAR'].includes(comp.relationship as string)) {
        if (comp.relationship === 'NOT_STATED') {
          informationToCollect.push(comp.explanation);
        } else if (comp.relationship === 'REQUIRES_REVIEW') {
          warnings.push(`Requires human review: ${comp.explanation}`);
        } else if (comp.relationship === 'INSUFFICIENT_SOURCE') {
          warnings.push(`Insufficient source: ${comp.explanation}`);
        } else if ((comp.relationship as string) === 'JURISDICTION_UNCLEAR') {
          questions.push(`Jurisdiction unclear: ${comp.explanation}`);
        }
        continue;
      }

      // Handle Deterministic Action Mapping
      let actionType: ActionType | null = null;
      if (comp.relationship === 'DIFFERS' || comp.relationship === 'POTENTIAL_TENSION') {
        actionType = ActionTypes.REVIEW_CLAUSE;
        if (comp.relationship === 'POTENTIAL_TENSION') {
          warnings.push(`Potential tension detected: ${comp.explanation}`);
        }
      }

      if (actionType && relatedFindingIds.length > 0) {
        let mappedRouteId: string | undefined = undefined;

        // Try to find a government route
        const activeRoutes = await GovernmentRoute.find({
          status: 'ACTIVE',
          jurisdiction: analysisContext.jurisdiction,
          applicable_document_types: analysisContext.document_type,
          related_rule_ids: { $in: comp.rule_ids }
        }).lean();

        if (activeRoutes && activeRoutes.length > 0) {
          // If multiple routes match, just take the first one (or preserve all if schema allowed, but ActionItem only takes one string)
          // We don't invent rankings. We'll assign the first matching route's ID.
          const route = activeRoutes[0];
          mappedRouteId = route.route_id;
          if (mappedRouteId) {
            governmentRouteIds.add(mappedRouteId);
          }
          // Upgrade action if we have a government route? The instructions say they are separate.
          // "A government route is separate and may only be added if the verified GovernmentRoute lookup succeeds."
          // But should we change actionType to VISIT_GOVERNMENT_ROUTE? No, instruction says "DIFFERS -> REVIEW_CLAUSE"
          // We just attach the government_route_id to the ActionItem.
        }

        actionItems.push({
          action_id: `ACT-${crypto.randomUUID()}`,
          related_finding_ids: relatedFindingIds,
          title: `Review Clause for ${comp.legal_baseline.summary}`,
          description: comp.explanation,
          action_type: actionType,
          required_information: [],
          government_route_id: mappedRouteId,
          status: 'PENDING'
        });
      }
    }

    const finalContext = {
      metadata: {
        ...analysisContext.metadata,
        source_stage: 'act'
      },
      findings,
      action_items: actionItems,
      government_routes: Array.from(governmentRouteIds),
      questions,
      information_to_collect: informationToCollect,
      warnings
    };

    return ActionContextSchema.parse(finalContext);
  }
}
