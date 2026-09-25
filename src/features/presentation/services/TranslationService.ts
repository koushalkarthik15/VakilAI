import { AIProvider } from '../../../lib/ai/types';
import { validateAIOutput } from '../../../lib/ai/validator';
import { TranslatedPresentationDTO, TranslatedPresentationDTOSchema } from '../contracts/translationContracts';
import { buildTranslationSystemPrompt, buildTranslationUserPrompt } from '../prompts/translationPrompts';
import { AIProviderError } from '../../../lib/ai/errors';

export class TranslationService {
  constructor(private aiProvider: AIProvider) {}

  async translatePresentation(
    canonicalPayload: Partial<TranslatedPresentationDTO> & { language?: 'EN' | 'TE' | 'HI' },
    targetLanguage: 'TE' | 'HI'
  ): Promise<TranslatedPresentationDTO> {
    // Deterministic translation usage guard
    if (process.env.ENABLE_TRANSLATION === 'false') {
      throw new Error('TRANSLATION_DISABLED');
    }

    if (canonicalPayload.language && (canonicalPayload.language as string) !== 'EN') {
      throw new Error('CANONICAL_SOURCE_MUST_BE_ENGLISH');
    }

    // Prepare translation request
    const request = {
      systemPrompt: buildTranslationSystemPrompt(targetLanguage),
      userPrompt: buildTranslationUserPrompt(canonicalPayload),
      temperature: 0.1 // Low temperature to stick strictly to translation without hallucination
    };

    try {
      const result = await this.aiProvider.generate(request);
      
      // Strict output validation
      const validated = validateAIOutput(TranslatedPresentationDTOSchema, result);
      
      // Identifier validation - ensure AI didn't invent or lose IDs
      this.validateIdentifiers(canonicalPayload, validated);
      
      return validated;
    } catch (error) {
      if (error instanceof AIProviderError) {
        if (error.code === 'RATE_LIMIT_EXCEEDED') {
          throw new Error('TRANSLATION_QUOTA_EXCEEDED');
        }
      }
      throw error;
    }
  }

  private validateIdentifiers(original: Partial<TranslatedPresentationDTO> & { language?: string }, translated: TranslatedPresentationDTO) {
    if (original.findings && translated.findings) {
      const originalIds = original.findings.map(f => f.finding_id).sort();
      const translatedIds = translated.findings.map(f => f.finding_id).sort();
      if (originalIds.join(',') !== translatedIds.join(',')) {
        throw new Error('AI_OUTPUT_INVALID: ID mismatch in findings');
      }
    }

    if (original.comparison_items && translated.comparison_items) {
      const originalIds = original.comparison_items.map(c => c.comparison_id).sort();
      const translatedIds = translated.comparison_items.map(c => c.comparison_id).sort();
      if (originalIds.join(',') !== translatedIds.join(',')) {
        throw new Error('AI_OUTPUT_INVALID: ID mismatch in comparison_items');
      }
    }

    if (original.action_items && translated.action_items) {
      const originalIds = original.action_items.map(a => a.action_id).sort();
      const translatedIds = translated.action_items.map(a => a.action_id).sort();
      if (originalIds.join(',') !== translatedIds.join(',')) {
        throw new Error('AI_OUTPUT_INVALID: ID mismatch in action_items');
      }
    }
  }
}
