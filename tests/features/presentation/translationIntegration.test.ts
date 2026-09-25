import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslationService } from '../../../src/features/presentation/services/TranslationService';


describe('Presentation Language Switching Integration (S8-M8.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ENABLE_TRANSLATION = 'true';
  });

  const canonicalFinding = {
    finding_id: 'F100',
    summary: 'The agreement does not specify a notice period.',
    explanation: 'A 60-day notice is standard, but omitted here.',
    missing_information: ['Notice period']
  };

  const canonicalPayload = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    language: 'EN' as any,
    findings: [canonicalFinding]
  };

  it('preserves canonical structured state across English, Telugu, and Hindi', async () => {
    const mockProvider = {
      generate: vi.fn()
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = new TranslationService(mockProvider as any);

    // 1. English (Canonical presentation is immediate, no translation service called normally, but if forced, it should reject)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(service.translatePresentation(canonicalPayload, 'EN' as any)).rejects.toThrow();

    // 2. Telugu Translation
    mockProvider.generate.mockResolvedValueOnce({
      content: JSON.stringify({
        language: 'TE',
        findings: [{
          finding_id: 'F100',
          summary: 'ఒప్పందంలో నోటీసు వ్యవధి పేర్కొనబడలేదు.',
          explanation: '60 రోజుల నోటీసు ప్రామాణికం, కానీ ఇక్కడ వదిలివేయబడింది.',
          missing_information: ['నోటీసు వ్యవధి']
        }]
      })
    });

    const teResult = await service.translatePresentation(canonicalPayload, 'TE');
    
    // 3. Hindi Translation
    mockProvider.generate.mockResolvedValueOnce({
      content: JSON.stringify({
        language: 'HI',
        findings: [{
          finding_id: 'F100',
          summary: 'समझौते में नोटिस अवधि निर्दिष्ट नहीं है।',
          explanation: '60 दिन का नोटिस मानक है, लेकिन यहां छोड़ दिया गया है।',
          missing_information: ['नोटिस अवधि']
        }]
      })
    });

    const hiResult = await service.translatePresentation(canonicalPayload, 'HI');

    // Verification: IDs must remain identical across translations
    expect(teResult.findings![0].finding_id).toBe(canonicalFinding.finding_id);
    expect(hiResult.findings![0].finding_id).toBe(canonicalFinding.finding_id);

    // Verification: Content translated
    expect(teResult.findings![0].summary).not.toBe(canonicalFinding.summary);
    expect(hiResult.findings![0].summary).not.toBe(canonicalFinding.summary);
    
    // Verification: Both languages derived from the original EN payload (not TE -> HI)
    // Implicit in the test structure as both calls pass canonicalPayload
  });
});
