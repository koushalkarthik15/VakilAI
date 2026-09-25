import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FlaggingService } from '../../../src/features/flag/services/FlaggingService';
import { GroqProvider } from '../../../src/lib/ai/GroqProvider';
import { UnderstandingContext } from '../../../src/core/contexts/contracts';
import { ApplicabilityResult } from '../../../src/features/legal-kb/services/applicabilityService';
import { AIValidationError } from '../../../src/lib/ai/validationErrors';
import { ILegalRule } from '../../../src/features/legal-kb/models/LegalRule';

describe('FlaggingService', () => {
  let mockProvider: GroqProvider;
  let service: FlaggingService;

  const mockUnderstandingContext: UnderstandingContext = {
    metadata: {
      schema_version: '1.0',
      session_id: 'sess-1',
      document_id: 'doc-1',
      created_at: new Date().toISOString(),
      source_stage: 'understanding'
    },
    classification: { type: 'RENTAL_LEASE' },
    jurisdiction: { status: 'SUPPORTED' },
    parties: [],
    document_facts: [{ fact_id: 'f1', field: 'rent', value: '1000', status: 'STATED' }],
    clauses: [{ clause_id: 'c1', text: 'Rent is 1000', page_start: 1, page_end: 1, clause_type: 'RENT', extraction_status: 'SUCCESS' }],
    missing_information: [],
    uncertainties: []
  };

  const mockRule: ILegalRule = {
    rule_id: 'r1',
    domain_id: 'd1',
    title: 'Rent Rule',
    description: 'Rent rule',
    jurisdiction: 'TELANGANA',
    document_types: ['RENTAL_LEASE'],
    source_ids: ['s1'],
    effective_from: new Date('2020-01-01')
  } as ILegalRule;

  const mockApplicabilityResult: ApplicabilityResult = {
    status: 'SUCCESS',
    rules: [mockRule]
  };

  beforeEach(() => {
    mockProvider = {
      generate: vi.fn()
    } as unknown as GroqProvider;
    service = new FlaggingService(mockProvider);
  });

  // 1. Valid semantic finding
  it('successfully generates an AnalysisContext with valid semantic findings', async () => {
    const aiResponse = {
      relevant_clauses: ['c1'],
      detected_patterns: [],
      missing_information: [],
      findings: [{
        finding_id: 'find1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s1'],
        issue_type: 'Compliance',
        summary: 'Rent matches',
        explanation: 'Rent is compliant.',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED',
        missing_information: []
      }]
    };

    vi.mocked(mockProvider.generate).mockResolvedValueOnce({
      content: JSON.stringify(aiResponse)
    });

    const result = await service.analyze(mockUnderstandingContext, mockApplicabilityResult);
    expect(result.findings.length).toBe(1);
    expect(result.findings[0].clause_ids).toContain('c1');
  });

  // 2. Malformed JSON
  it('rejects malformed JSON via validateAIOutput', async () => {
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: 'invalid json' });
    await expect(service.analyze(mockUnderstandingContext, mockApplicabilityResult))
      .rejects.toThrow(AIValidationError);
  });

  // 3. Schema-invalid output
  it('rejects schema-invalid output (e.g. missing required finding fields)', async () => {
    const aiResponse = {
      relevant_clauses: [],
      detected_patterns: [],
      missing_information: [],
      findings: [{ finding_id: 'f1' }] // missing everything else
    };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.analyze(mockUnderstandingContext, mockApplicabilityResult))
      .rejects.toThrow(AIValidationError);
  });

  // 4. Fabricated rule_id
  it('rejects finding with fabricated rule_id', async () => {
    const aiResponse = {
      relevant_clauses: ['c1'],
      detected_patterns: [],
      missing_information: [],
      findings: [{
        finding_id: 'find1',
        clause_ids: ['c1'],
        rule_ids: ['r-fake'],
        source_ids: ['s1'],
        issue_type: 'Test',
        summary: 'Test',
        explanation: 'Test',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED',
        missing_information: []
      }]
    };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.analyze(mockUnderstandingContext, mockApplicabilityResult))
      .rejects.toThrowError(new AIValidationError('Fabricated rule_id detected: r-fake', 'INVALID_PROVENANCE'));
  });

  // 5. Fabricated source_id
  it('rejects finding with fabricated source_id', async () => {
    const aiResponse = {
      relevant_clauses: ['c1'],
      detected_patterns: [],
      missing_information: [],
      findings: [{
        finding_id: 'find1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s-fake'], // fabricated
        issue_type: 'Test',
        summary: 'Test',
        explanation: 'Test',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED',
        missing_information: []
      }]
    };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.analyze(mockUnderstandingContext, mockApplicabilityResult))
      .rejects.toThrowError(new AIValidationError('Fabricated or unlinked source_id detected: s-fake', 'INVALID_PROVENANCE'));
  });

  // 6. Fabricated clause_id
  it('rejects finding with fabricated clause_id', async () => {
    const aiResponse = {
      relevant_clauses: ['c1'],
      detected_patterns: [],
      missing_information: [],
      findings: [{
        finding_id: 'find1',
        clause_ids: ['c-fake'],
        rule_ids: ['r1'],
        source_ids: ['s1'],
        issue_type: 'Test',
        summary: 'Test',
        explanation: 'Test',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED',
        missing_information: []
      }]
    };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.analyze(mockUnderstandingContext, mockApplicabilityResult))
      .rejects.toThrowError(new AIValidationError('Fabricated clause_id detected: c-fake', 'INVALID_PROVENANCE'));
  });

  // 7. Valid IDs but invalid rule/source relationship
  it('rejects finding if source_id is real but does not belong to the rule_id', async () => {
    // We add another valid rule and source, but AI pairs them wrong
    const r2 = { ...mockRule, rule_id: 'r2', source_ids: ['s2'] };
    const multiResult = { status: 'SUCCESS', rules: [mockRule, r2] } as unknown as ApplicabilityResult;

    const aiResponse = {
      relevant_clauses: ['c1'],
      detected_patterns: [],
      missing_information: [],
      findings: [{
        finding_id: 'find1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s2'], // s2 belongs to r2, not r1!
        issue_type: 'Test',
        summary: 'Test',
        explanation: 'Test',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED',
        missing_information: []
      }]
    };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.analyze(mockUnderstandingContext, multiResult))
      .rejects.toThrowError(new AIValidationError('Fabricated or unlinked source_id detected: s2', 'INVALID_PROVENANCE'));
  });

  // 8. INSUFFICIENT_SOURCE bypass
  it('bypasses AI generation entirely if ApplicabilityResult is INSUFFICIENT_SOURCE', async () => {
    const result = await service.analyze(mockUnderstandingContext, { status: 'INSUFFICIENT_SOURCE' });
    expect(mockProvider.generate).not.toHaveBeenCalled();
    expect(result.findings).toEqual([]);
    expect(result.analysis_constraints).toContain('INSUFFICIENT_SOURCE');
  });

  // 9. JURISDICTION_UNCLEAR bypass
  it('bypasses AI generation entirely if ApplicabilityResult is JURISDICTION_UNCLEAR', async () => {
    const result = await service.analyze(mockUnderstandingContext, { status: 'JURISDICTION_UNCLEAR' });
    expect(mockProvider.generate).not.toHaveBeenCalled();
    expect(result.findings).toEqual([]);
    expect(result.analysis_constraints).toContain('JURISDICTION_UNCLEAR');
  });

  // 10. Empty/no-findings result
  it('handles empty/no-findings result successfully', async () => {
    const aiResponse = {
      relevant_clauses: [],
      detected_patterns: [],
      missing_information: [],
      findings: []
    };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    const result = await service.analyze(mockUnderstandingContext, mockApplicabilityResult);
    expect(result.findings).toEqual([]);
  });

  // 11. Severity and confidence remain distinct
  // This is a test of the prompt passing, but we can verify the fields exist on the result finding correctly.
  it('preserves distinction between severity and confidence on findings', async () => {
    const aiResponse = {
      relevant_clauses: ['c1'],
      detected_patterns: [],
      missing_information: [],
      findings: [{
        finding_id: 'find1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s1'],
        issue_type: 'Test',
        summary: 'Test',
        explanation: 'Test',
        severity: 'HIGH',
        confidence: 'LOW',
        status: 'SUPPORTED',
        missing_information: []
      }]
    };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    const result = await service.analyze(mockUnderstandingContext, mockApplicabilityResult);
    expect(result.findings[0].severity).toBe('HIGH');
    expect(result.findings[0].confidence).toBe('LOW');
  });

  // 12. No AI call during deterministic bypass
  it('does not invoke the AI provider during deterministic bypasses (OUTSIDE_SCOPE)', async () => {
    await service.analyze(mockUnderstandingContext, { status: 'OUTSIDE_SCOPE' });
    expect(mockProvider.generate).not.toHaveBeenCalled();
  });

  // 13. No provider/model hardcoding
  it('does not hardcode the model, leverages provider instance', async () => {
    // The service takes GroqProvider as injection. We can verify we don't instantiate it internally.
    const aiResponse = { relevant_clauses: [], detected_patterns: [], missing_information: [], findings: [] };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await service.analyze(mockUnderstandingContext, mockApplicabilityResult);
    expect(mockProvider.generate).toHaveBeenCalled();
  });

  // 14. Full regression pass is covered by executing this suite alongside others.
});
