import { z } from 'zod';
import { 
  UnderstandingContext, 
  AnalysisContext, 
  ComparisonContext, 
  ComparisonContextSchema,
  ComparisonItemSchema
} from '../../../core/contexts/contracts';
import { AIProvider } from '../../../lib/ai/types';
import { validateAIOutput } from '../../../lib/ai/validator';
import { AIValidationError } from '../../../lib/ai/validationErrors';
import { COMPARISON_SYSTEM_PROMPT, buildComparisonUserPrompt } from '../prompts/comparisonPrompts';

// Schema for ONLY the AI generated output, omitting deterministic metadata
const AIComparisonResponseSchema = z.object({
  comparison_items: z.array(ComparisonItemSchema),
  unresolved_questions: z.array(z.string())
});

export class ComparisonService {
  constructor(private readonly provider: AIProvider) {}

  async compare(
    understandingContext: UnderstandingContext,
    analysisContext: AnalysisContext
  ): Promise<ComparisonContext> {
    
    // 1. Check Deterministic Bypass Conditions
    // If analysis was blocked by constraints (e.g. INSUFFICIENT_SOURCE, OUTSIDE_SCOPE, JURISDICTION_UNCLEAR)
    // or if there are no findings, we bypass the AI invocation.
    const hasBlockingConstraints = analysisContext.analysis_constraints.some(c => 
      ['INSUFFICIENT_SOURCE', 'OUTSIDE_SCOPE', 'JURISDICTION_UNCLEAR'].includes(c)
    );
    
    if (hasBlockingConstraints || analysisContext.findings.length === 0) {
      return this.createDeterministicBypassContext(analysisContext);
    }

    // 2. Prepare AI Request
    const aiRequest = {
      systemPrompt: COMPARISON_SYSTEM_PROMPT,
      userPrompt: buildComparisonUserPrompt(understandingContext, analysisContext),
      temperature: 0
    };

    // 3. Call AI
    const aiResult = await this.provider.generate(aiRequest);

    // 4. Zod Structural Validation
    const aiData = validateAIOutput(AIComparisonResponseSchema, aiResult);

    // 5. Deterministic Provenance Validation
    this.validateProvenance(aiData.comparison_items, analysisContext);

    // 6. Construct Final ComparisonContext
    const finalContext = {
      metadata: {
        ...analysisContext.metadata,
        source_stage: 'compare'
      },
      ...aiData
    };

    return ComparisonContextSchema.parse(finalContext);
  }

  private validateProvenance(
    items: z.infer<typeof ComparisonItemSchema>[], 
    analysisContext: AnalysisContext
  ): void {
    const validClauseIds = new Set(analysisContext.relevant_clauses);
    const validRuleIds = new Set(analysisContext.applicable_rules.map(r => r.rule_id));
    
    // Map of rule_id -> Set of source_ids valid for that rule
    const ruleToSources = new Map<string, Set<string>>();
    analysisContext.applicable_rules.forEach(r => {
      ruleToSources.set(r.rule_id, new Set(r.source_ids));
    });

    for (const item of items) {
      // Validate arrays of clause_ids
      for (const clauseId of item.clause_ids) {
        if (clauseId !== 'N/A' && !validClauseIds.has(clauseId)) {
          throw new AIValidationError(`Fabricated clause_id detected: ${clauseId}`, 'INVALID_PROVENANCE');
        }
      }

      // Validate contract_position clause_id
      if (item.contract_position.clause_id && item.contract_position.clause_id !== 'N/A') {
        if (!validClauseIds.has(item.contract_position.clause_id)) {
          throw new AIValidationError(`Fabricated contract_position.clause_id detected: ${item.contract_position.clause_id}`, 'INVALID_PROVENANCE');
        }
      }

      // Validate arrays of rule_ids
      for (const ruleId of item.rule_ids) {
        if (ruleId !== 'N/A' && !validRuleIds.has(ruleId)) {
          throw new AIValidationError(`Fabricated rule_id detected: ${ruleId}`, 'INVALID_PROVENANCE');
        }
      }

      // Validate legal_baseline rule_id
      if (item.legal_baseline.rule_id && item.legal_baseline.rule_id !== 'N/A' && !validRuleIds.has(item.legal_baseline.rule_id)) {
        throw new AIValidationError(`Fabricated legal_baseline.rule_id detected: ${item.legal_baseline.rule_id}`, 'INVALID_PROVENANCE');
      }

      // Validate arrays of source_ids belong to at least one valid rule relationship in this item
      for (const sourceId of item.source_ids) {
        if (sourceId === 'N/A') continue;
        let validRelationshipFound = false;
        for (const ruleId of item.rule_ids) {
          if (ruleToSources.get(ruleId)?.has(sourceId)) {
            validRelationshipFound = true;
            break;
          }
        }
        if (!validRelationshipFound) {
          throw new AIValidationError(`Fabricated or unlinked source_id detected: ${sourceId}`, 'INVALID_PROVENANCE');
        }
      }

      // Validate legal_baseline source_ids belong to the legal_baseline rule
      for (const sourceId of item.legal_baseline.source_ids) {
        if (!ruleToSources.get(item.legal_baseline.rule_id)?.has(sourceId)) {
          throw new AIValidationError(`Fabricated or unlinked legal_baseline.source_id detected: ${sourceId}`, 'INVALID_PROVENANCE');
        }
      }
    }
  }

  private createDeterministicBypassContext(
    analysisContext: AnalysisContext
  ): ComparisonContext {
    const finalContext = {
      metadata: {
        ...analysisContext.metadata,
        source_stage: 'compare'
      },
      comparison_items: [],
      unresolved_questions: [...analysisContext.missing_information, ...analysisContext.analysis_constraints]
    };

    return ComparisonContextSchema.parse(finalContext);
  }
}
