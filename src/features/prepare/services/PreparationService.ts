import { ActionContext, AnalysisContext, ComparisonContext, PrepareContext, PrepareContextSchema, SourceReferenceSchema } from '../../../core/contexts/contracts';
import { z } from 'zod';
import { AIProvider } from '../../../lib/ai/types';
import { PreparationOutput, PreparationOutputSchema } from '../contracts/preparationOutput';
import { PREPARATION_SYSTEM_PROMPT, buildPreparationUserPrompt } from '../prompts/preparationPrompts';
import { validateAIOutput } from '../../../lib/ai/validator';
import { AIValidationError } from '../../../lib/ai/validationErrors';
import { LegalRule } from '../../legal-kb/models/LegalRule';
import { LegalSource } from '../../legal-kb/models/LegalSource';
import { GovernmentRoute } from '../../legal-kb/models/GovernmentRoute';

export class PreparationService {
  constructor(private readonly provider: AIProvider) {}

  async generatePreparation(
    analysisContext: AnalysisContext,
    comparisonContext: ComparisonContext,
    actionContext: ActionContext,
    userGoal: string,
    selectedFindingIds?: string[],
    selectedActionIds?: string[]
  ): Promise<{ context: PrepareContext, output: PreparationOutput }> {
    
    if (!userGoal || userGoal.trim() === '') {
      throw new Error('User goal is explicitly required for preparation generation.');
    }

    // 1. Deterministic Selection
    const findings = selectedFindingIds 
      ? analysisContext.findings.filter(f => selectedFindingIds.includes(f.finding_id))
      : analysisContext.findings;
      
    const actions = selectedActionIds
      ? actionContext.action_items.filter(a => selectedActionIds.includes(a.action_id))
      : actionContext.action_items;

    // Resolve required_information deterministically
    const requiredInfo = new Set<string>();
    actions.forEach(a => a.required_information?.forEach(info => requiredInfo.add(info)));

    // 2. Resolve verified_sources deterministically
    const ruleIds = new Set<string>();
    const sourceIds = new Set<string>();
    
    findings.forEach(f => {
      f.rule_ids.forEach(r => ruleIds.add(r));
      f.source_ids?.forEach(s => sourceIds.add(s));
    });
    
    const governmentRouteIds = new Set<string>();
    actions.forEach(a => {
      if (a.government_route_id) {
        governmentRouteIds.add(a.government_route_id);
      }
    });

    const supplementalRoutes: Record<string, unknown>[] = [];
    
    if (governmentRouteIds.size > 0) {
      const routes = await GovernmentRoute.find({ route_id: { $in: Array.from(governmentRouteIds) } }).lean();
      routes.forEach(route => {
        supplementalRoutes.push({
          route_id: route.route_id,
          name: route.name,
          authority: route.authority,
          official_url: route.official_url,
          required_information: route.required_information
        });
        route.related_rule_ids?.forEach((r: string) => ruleIds.add(r));
      });
    }

    if (ruleIds.size > 0) {
      const rules = await LegalRule.find({ rule_id: { $in: Array.from(ruleIds) } }).lean();
      rules.forEach(rule => rule.source_ids?.forEach((s: string) => sourceIds.add(s)));
    }

    const verifiedSources: z.infer<typeof SourceReferenceSchema>[] = [];
    if (sourceIds.size > 0) {
      const sources = await LegalSource.find({ source_id: { $in: Array.from(sourceIds) } }).lean();
      sources.forEach(source => {
        verifiedSources.push({
          source_id: source.source_id,
          citation: source.citation,
          authority: source.authority,
          tier: source.tier?.toString() || 'unknown',
          verified_status: source.verification_status
        });
      });
    }

    const prepareContext: PrepareContext = {
      metadata: {
        ...actionContext.metadata,
        source_stage: 'prepare'
      },
      selected_findings: findings,
      selected_actions: actions,
      user_goal: userGoal,
      required_information: Array.from(requiredInfo),
      verified_sources: verifiedSources,
      output_format: 'JSON matching PreparationOutputSchema'
    };

    PrepareContextSchema.parse(prepareContext);

    // 3. Invoke Gemini
    const request = {
      systemPrompt: PREPARATION_SYSTEM_PROMPT,
      userPrompt: buildPreparationUserPrompt(prepareContext, supplementalRoutes),
      temperature: 0
    };

    const aiResult = await this.provider.generate(request);

    // 4. Validate Zod Structure
    const output = validateAIOutput(PreparationOutputSchema, aiResult);

    // 5. Validate Provenance & Identifiers
    this.validateProvenance(output, prepareContext);

    return { context: prepareContext, output };
  }

  private validateProvenance(output: PreparationOutput, context: PrepareContext): void {
    const validFindingIds = new Set(context.selected_findings.map(f => f.finding_id));
    const validActionIds = new Set(context.selected_actions.map(a => a.action_id));
    const validSourceIds = new Set(context.verified_sources.map(s => s.source_id));

    for (const id of output.relevant_finding_ids) {
      if (id !== 'N/A' && !validFindingIds.has(id)) {
        throw new AIValidationError(`Fabricated finding_id detected: ${id}`, 'INVALID_PROVENANCE');
      }
    }

    for (const id of output.relevant_action_ids) {
      if (id !== 'N/A' && !validActionIds.has(id)) {
        throw new AIValidationError(`Fabricated action_id detected: ${id}`, 'INVALID_PROVENANCE');
      }
    }

    for (const id of output.source_references) {
      if (id !== 'N/A' && !validSourceIds.has(id)) {
        console.error('validSourceIds:', Array.from(validSourceIds), 'output.source_references:', output.source_references);
        throw new AIValidationError(`Fabricated source_id detected: ${id}`, 'INVALID_PROVENANCE');
      }
    }
  }
}
