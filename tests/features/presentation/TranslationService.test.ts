import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslationService } from '../../../src/features/presentation/services/TranslationService';
import { AIProvider } from '../../../src/lib/ai/types';
import { TranslatedPresentationDTO } from '../../../src/features/presentation/contracts/translationContracts';
import { AIProviderError } from '../../../src/lib/ai/errors';

describe('TranslationService', () => {
  let mockProvider: AIProvider;
  let service: TranslationService;

  beforeEach(() => {
    mockProvider = {
      generate: vi.fn()
    };
    service = new TranslationService(mockProvider);
    process.env.ENABLE_TRANSLATION = 'true';
  });

  const validCanonicalPayload: Partial<TranslatedPresentationDTO> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    language: 'EN' as any,
    findings: [{
      finding_id: 'F1',
      summary: 'Test summary',
      explanation: 'Test explanation',
      missing_information: []
    }]
  };

  it('translates successfully for TE', async () => {
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({
      content: JSON.stringify({
        language: 'TE',
        findings: [{
          finding_id: 'F1',
          summary: 'టెస్ట్ సారాంశం',
          explanation: 'టెస్ట్ వివరణ',
          missing_information: []
        }]
      })
    });

    const result = await service.translatePresentation(validCanonicalPayload, 'TE');
    expect(result.language).toBe('TE');
    expect(result.findings![0].summary).toBe('టెస్ట్ సారాంశం');
  });

  it('rejects if translation is disabled', async () => {
    process.env.ENABLE_TRANSLATION = 'false';
    await expect(service.translatePresentation(validCanonicalPayload, 'TE'))
      .rejects.toThrow('TRANSLATION_DISABLED');
  });

  it('rejects if source language is not EN', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invalidPayload = { ...validCanonicalPayload, language: 'TE' as any };
    await expect(service.translatePresentation(invalidPayload, 'HI'))
      .rejects.toThrow('CANONICAL_SOURCE_MUST_BE_ENGLISH');
  });

  it('maps RATE_LIMIT_EXCEEDED to TRANSLATION_QUOTA_EXCEEDED', async () => {
    vi.mocked(mockProvider.generate).mockRejectedValueOnce(
      new AIProviderError('Rate Limit', 'RATE_LIMIT_EXCEEDED')
    );

    await expect(service.translatePresentation(validCanonicalPayload, 'TE'))
      .rejects.toThrow('TRANSLATION_QUOTA_EXCEEDED');
  });

  it('rejects if AI alters finding IDs', async () => {
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({
      content: JSON.stringify({
        language: 'TE',
        findings: [{
          finding_id: 'F2_MALICIOUS', // ID changed!
          summary: 'టెస్ట్ సారాంశం',
          explanation: 'టెస్ట్ వివరణ',
          missing_information: []
        }]
      })
    });

    await expect(service.translatePresentation(validCanonicalPayload, 'TE'))
      .rejects.toThrow('AI_OUTPUT_INVALID: ID mismatch in findings');
  });

  it('rejects prompt injection attempts by validation boundary (no severity field)', async () => {
    // If the AI hallucinates a severity field because of a prompt injection,
    // the strict Zod schema validation will catch it.
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({
      content: JSON.stringify({
        language: 'TE',
        findings: [{
          finding_id: 'F1',
          summary: 'టెస్ట్ సారాంశం',
          explanation: 'టెస్ట్ వివరణ',
          missing_information: [],
          severity: 'LOW' // Injected field not in schema!
        }]
      })
    });

    await expect(service.translatePresentation(validCanonicalPayload, 'TE'))
      .rejects.toThrow(); // Zod strict error
  });
});
