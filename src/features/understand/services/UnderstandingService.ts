import { z } from 'zod';
import { 
  UnderstandingContext, 
  UnderstandingContextSchema,
  ClauseReferenceSchema
} from '../../../core/contexts/contracts';
import { PseudonymizedDocumentContext } from '../../../core/privacy/piiMapping';
import { AIProvider } from '../../../lib/ai/types';
import { validateAIOutput } from '../../../lib/ai/validator';
import { UNDERSTANDING_SYSTEM_PROMPT, buildUnderstandingUserPrompt } from '../prompts/understandingPrompts';

// The partial schema defining ONLY what the AI is allowed to generate.
export const AIExtractionSchema = z.object({
  parties: z.array(z.object({
    party_id: z.string().min(1),
    role: z.string(),
    display_reference: z.string(),
    pii_fields: z.record(z.string(), z.string()).optional()
  })),
  document_facts: z.array(z.object({
    fact_id: z.string().min(1),
    clause_id: z.string().min(1).optional(),
    field: z.string(),
    value: z.string().optional(),
    page_reference: z.number().int().optional(),
    status: z.enum(['STATED', 'NOT_STATED', 'UNCLEAR'])
  })),
  clauses: z.array(ClauseReferenceSchema),
  missing_information: z.array(z.string()),
  uncertainties: z.array(z.string())
});

export interface UnderstandingServiceOptions {
  deterministicClassification: UnderstandingContext['classification'];
  deterministicJurisdiction: UnderstandingContext['jurisdiction'];
}

export class UnderstandingService {
  constructor(private readonly provider: AIProvider) {}

  /**
   * Generates the UnderstandingContext from a PseudonymizedDocumentContext.
   * Merges deterministic S1/S2 data with strictly validated AI factual extraction.
   */
  async extractUnderstanding(
    documentContext: PseudonymizedDocumentContext,
    options: UnderstandingServiceOptions
  ): Promise<UnderstandingContext> {
    
    // Construct the strictly controlled request
    const aiRequest = {
      systemPrompt: UNDERSTANDING_SYSTEM_PROMPT,
      userPrompt: buildUnderstandingUserPrompt(documentContext.extraction.text),
      temperature: 0
    };

    // Call provider
    const aiResult = await this.provider.generate(aiRequest);

    // Validate the AI payload against the sub-schema using the S3-M3.2 boundary
    const aiExtractedData = validateAIOutput(AIExtractionSchema, aiResult);

    // Strict Provenance Validation for Page IDs
    const validPages = new Set(documentContext.extraction.pages);
    for (const fact of aiExtractedData.document_facts) {
      if (fact.page_reference !== undefined && !validPages.has(fact.page_reference)) {
        throw new Error(`AIValidationError: Fabricated page_reference detected: ${fact.page_reference}. Valid pages: ${Array.from(validPages).join(', ')}`);
      }
    }

    // Merge AI extracted data with deterministic data and existing metadata
    const finalContext = {
      metadata: {
        ...documentContext.metadata,
        source_stage: 'understanding'
      },
      classification: options.deterministicClassification,
      jurisdiction: options.deterministicJurisdiction,
      ...aiExtractedData
    };

    // Final authoritative validation
    return UnderstandingContextSchema.parse(finalContext);
  }
}
