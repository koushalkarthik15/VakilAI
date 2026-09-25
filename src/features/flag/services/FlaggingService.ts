import { z } from 'zod';
import { 
  UnderstandingContext, 
  AnalysisContext, 
  AnalysisContextSchema,
  FindingSchema
} from '../../../core/contexts/contracts';
import { ApplicabilityResult } from '../../legal-kb/services/applicabilityService';
import { AIProvider } from '../../../lib/ai/types';
import { validateAIOutput } from '../../../lib/ai/validator';
import { AIValidationError } from '../../../lib/ai/validationErrors';
import { FLAGGING_SYSTEM_PROMPT, buildFlaggingUserPrompt } from '../prompts/flaggingPrompts';

// Schema for ONLY the AI generated output
const AIFlaggingResponseSchema = z.object({
  relevant_clauses: z.array(z.string()),
  detected_patterns: z.array(z.string()),
  missing_information: z.array(z.string()),
  findings: z.array(FindingSchema)
});

export class FlaggingService {
  constructor(private readonly provider: AIProvider) {}

  async analyze(
    understandingContext: UnderstandingContext,
    applicabilityResult: ApplicabilityResult
  ): Promise<AnalysisContext> {
    
    // 1. Check Deterministic Bypass Conditions
    if (applicabilityResult.status !== 'SUCCESS') {
      return this.createDeterministicBypassContext(understandingContext, applicabilityResult.status);
    }

    // 2. Prepare AI Request
    const aiRequest = {
      systemPrompt: FLAGGING_SYSTEM_PROMPT,
      userPrompt: buildFlaggingUserPrompt(understandingContext, applicabilityResult),
      temperature: 0
    };

    // 3. Call AI
    const aiResult = await this.provider.generate(aiRequest);

    // 4. Zod Structural Validation
    const aiData = validateAIOutput(AIFlaggingResponseSchema, aiResult);

    // 5. Deterministic Provenance Validation
    this.validateProvenance(aiData.findings, understandingContext, applicabilityResult);

    // 6. Map deterministic rules
    const applicableRules = applicabilityResult.rules.map(r => ({
      rule_id: r.rule_id,
      domain_id: r.domain_id,
      summary: r.description,
      applicability_basis: { jurisdiction: r.jurisdiction },
      effective_period: `${r.effective_from.toISOString()} to ${r.effective_to ? r.effective_to.toISOString() : 'Present'}`,
      source_ids: r.source_ids
    }));

    // 7. Construct Final AnalysisContext
    const finalContext = {
      metadata: {
        ...understandingContext.metadata,
        source_stage: 'flagging'
      },
      document_type: understandingContext.classification.type,
      jurisdiction: understandingContext.jurisdiction.status,
      applicable_rules: applicableRules,
      source_references: [], // Mapped externally or populated if needed, keeping empty for boundary check
      analysis_constraints: [],
      ...aiData
    };

    return AnalysisContextSchema.parse(finalContext);
  }

  private validateProvenance(
    findings: z.infer<typeof FindingSchema>[], 
    understandingContext: UnderstandingContext,
    applicabilityResult: ApplicabilityResult
  ): void {
    if (applicabilityResult.status !== 'SUCCESS') return;

    const validClauseIds = new Set(understandingContext.clauses.map(c => c.clause_id));
    const validRuleIds = new Set(applicabilityResult.rules.map(r => r.rule_id));
    
    // Map of rule_id -> Set of source_ids valid for that rule
    const ruleToSources = new Map<string, Set<string>>();
    applicabilityResult.rules.forEach(r => {
      ruleToSources.set(r.rule_id, new Set(r.source_ids));
    });

    for (const finding of findings) {
      // Validate clause_ids
      for (const clauseId of finding.clause_ids) {
        if (!validClauseIds.has(clauseId)) {
          throw new AIValidationError(`Fabricated clause_id detected: ${clauseId}`, 'INVALID_PROVENANCE');
        }
      }

      // Validate rule_ids
      for (const ruleId of finding.rule_ids) {
        if (!validRuleIds.has(ruleId)) {
          throw new AIValidationError(`Fabricated rule_id detected: ${ruleId}`, 'INVALID_PROVENANCE');
        }
      }

      // Validate source_ids belong to the stated rule relationships
      for (const sourceId of finding.source_ids) {
        let validRelationshipFound = false;
        for (const ruleId of finding.rule_ids) {
          if (ruleToSources.get(ruleId)?.has(sourceId)) {
            validRelationshipFound = true;
            break;
          }
        }
        if (!validRelationshipFound) {
          throw new AIValidationError(`Fabricated or unlinked source_id detected: ${sourceId}`, 'INVALID_PROVENANCE');
        }
      }
    }
  }

  private createDeterministicBypassContext(
    understandingContext: UnderstandingContext,
    status: string
  ): AnalysisContext {
    const finalContext = {
      metadata: {
        ...understandingContext.metadata,
        source_stage: 'flagging'
      },
      document_type: understandingContext.classification.type,
      jurisdiction: understandingContext.jurisdiction.status,
      applicable_rules: [],
      source_references: [],
      relevant_clauses: [],
      detected_patterns: [],
      missing_information: [],
      analysis_constraints: [status],
      findings: []
    };

    return AnalysisContextSchema.parse(finalContext);
  }
}
