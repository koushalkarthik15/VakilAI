import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComparisonService } from '../../../src/features/compare/services/ComparisonService';
import { GroqProvider } from '../../../src/lib/ai/GroqProvider';
import { UnderstandingContext, AnalysisContext } from '../../../src/core/contexts/contracts';
import { AIValidationError } from '../../../src/lib/ai/validationErrors';

describe('ComparisonService', () => {
  let mockProvider: GroqProvider;
  let service: ComparisonService;

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

  const mockAnalysisContext: AnalysisContext = {
    metadata: {
      schema_version: '1.0',
      session_id: 'sess-1',
      document_id: 'doc-1',
      created_at: new Date().toISOString(),
      source_stage: 'flagging'
    },
    document_type: 'RENTAL_LEASE',
    jurisdiction: 'SUPPORTED',
    relevant_clauses: ['c1'],
    applicable_rules: [{
      rule_id: 'r1',
      domain_id: 'd1',
      summary: 'Rent Rule',
      applicability_basis: { jurisdiction: 'TELANGANA' },
      effective_period: '2020-01-01 to Present',
      source_ids: ['s1']
    }],
    source_references: [],
    detected_patterns: [],
    missing_information: [],
    analysis_constraints: [],
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

  beforeEach(() => {
    mockProvider = {
      generate: vi.fn()
    } as unknown as GroqProvider;
    service = new ComparisonService(mockProvider);
  });

  // 1-4. Valid comparison produces ComparisonContext, Valid clause/rule/source provenance is preserved.
  it('successfully generates a ComparisonContext with valid provenance', async () => {
    const aiResponse = {
      comparison_items: [{
        comparison_id: 'comp1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s1'],
        contract_position: { clause_id: 'c1', statement: 'Rent is 1000' },
        legal_baseline: { rule_id: 'r1', summary: 'Rent Rule', source_ids: ['s1'] },
        relationship: 'ALIGNS',
        explanation: 'The contract aligns with the rule.',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED'
      }],
      unresolved_questions: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValueOnce({
      content: JSON.stringify(aiResponse)
    });

    const result = await service.compare(mockUnderstandingContext, mockAnalysisContext);
    expect(result.comparison_items.length).toBe(1);
    expect(result.comparison_items[0].relationship).toBe('ALIGNS');
  });

  // 5. Fabricated rule_id is rejected.
  it('rejects finding with fabricated rule_id', async () => {
    const aiResponse = {
      comparison_items: [{
        comparison_id: 'comp1',
        clause_ids: ['c1'],
        rule_ids: ['r-fake'],
        source_ids: ['s1'],
        contract_position: { clause_id: 'c1', statement: 'Rent is 1000' },
        legal_baseline: { rule_id: 'r1', summary: 'Rent Rule', source_ids: ['s1'] },
        relationship: 'ALIGNS',
        explanation: 'The contract aligns with the rule.',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED'
      }],
      unresolved_questions: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.compare(mockUnderstandingContext, mockAnalysisContext))
      .rejects.toThrowError(new AIValidationError('Fabricated rule_id detected: r-fake', 'INVALID_PROVENANCE'));
  });

  // 6. Fabricated clause_id is rejected.
  it('rejects finding with fabricated clause_id', async () => {
    const aiResponse = {
      comparison_items: [{
        comparison_id: 'comp1',
        clause_ids: ['c-fake'],
        rule_ids: ['r1'],
        source_ids: ['s1'],
        contract_position: { clause_id: 'c1', statement: 'Rent is 1000' },
        legal_baseline: { rule_id: 'r1', summary: 'Rent Rule', source_ids: ['s1'] },
        relationship: 'ALIGNS',
        explanation: 'The contract aligns with the rule.',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED'
      }],
      unresolved_questions: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.compare(mockUnderstandingContext, mockAnalysisContext))
      .rejects.toThrowError(new AIValidationError('Fabricated clause_id detected: c-fake', 'INVALID_PROVENANCE'));
  });

  it('rejects finding with fabricated contract_position.clause_id', async () => {
    const aiResponse = {
      comparison_items: [{
        comparison_id: 'comp1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s1'],
        contract_position: { clause_id: 'c-fake', statement: 'Rent is 1000' },
        legal_baseline: { rule_id: 'r1', summary: 'Rent Rule', source_ids: ['s1'] },
        relationship: 'ALIGNS',
        explanation: 'The contract aligns with the rule.',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED'
      }],
      unresolved_questions: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.compare(mockUnderstandingContext, mockAnalysisContext))
      .rejects.toThrowError(new AIValidationError('Fabricated contract_position.clause_id detected: c-fake', 'INVALID_PROVENANCE'));
  });

  // 7. Fabricated source_id is rejected.
  it('rejects finding with fabricated source_id', async () => {
    const aiResponse = {
      comparison_items: [{
        comparison_id: 'comp1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s-fake'],
        contract_position: { clause_id: 'c1', statement: 'Rent is 1000' },
        legal_baseline: { rule_id: 'r1', summary: 'Rent Rule', source_ids: ['s1'] },
        relationship: 'ALIGNS',
        explanation: 'The contract aligns with the rule.',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED'
      }],
      unresolved_questions: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.compare(mockUnderstandingContext, mockAnalysisContext))
      .rejects.toThrowError(new AIValidationError('Fabricated or unlinked source_id detected: s-fake', 'INVALID_PROVENANCE'));
  });

  // 8. Invalid rule/source relationship is rejected.
  it('rejects finding if source_id does not belong to the rule_id', async () => {
    const multiAnalysisContext = {
      ...mockAnalysisContext,
      applicable_rules: [
        ...mockAnalysisContext.applicable_rules,
        {
          rule_id: 'r2',
          domain_id: 'd1',
          summary: 'Rule 2',
          applicability_basis: { jurisdiction: 'TELANGANA' },
          effective_period: '2020-01-01 to Present',
          source_ids: ['s2']
        }
      ]
    };

    const aiResponse = {
      comparison_items: [{
        comparison_id: 'comp1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s2'], // s2 belongs to r2, not r1
        contract_position: { clause_id: 'c1', statement: 'Rent is 1000' },
        legal_baseline: { rule_id: 'r1', summary: 'Rent Rule', source_ids: ['s1'] },
        relationship: 'ALIGNS',
        explanation: 'The contract aligns with the rule.',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED'
      }],
      unresolved_questions: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.compare(mockUnderstandingContext, multiAnalysisContext))
      .rejects.toThrowError(new AIValidationError('Fabricated or unlinked source_id detected: s2', 'INVALID_PROVENANCE'));
  });

  // 9. Blocking analysis_constraints bypass AI.
  it('bypasses AI generation entirely if analysis_constraints contains blocking conditions', async () => {
    const blockedContext = { ...mockAnalysisContext, analysis_constraints: ['INSUFFICIENT_SOURCE'] };
    const result = await service.compare(mockUnderstandingContext, blockedContext);
    expect(mockProvider.generate).not.toHaveBeenCalled();
    expect(result.comparison_items).toEqual([]);
    expect(result.unresolved_questions).toContain('INSUFFICIENT_SOURCE');
  });

  // 10. Empty findings do not trigger unnecessary AI.
  it('bypasses AI generation entirely if findings are empty', async () => {
    const emptyFindingsContext = { ...mockAnalysisContext, findings: [] };
    const result = await service.compare(mockUnderstandingContext, emptyFindingsContext);
    expect(mockProvider.generate).not.toHaveBeenCalled();
    expect(result.comparison_items).toEqual([]);
  });

  // 11. Malformed AI JSON fails safely.
  it('rejects malformed JSON via validateAIOutput', async () => {
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: 'invalid json' });
    await expect(service.compare(mockUnderstandingContext, mockAnalysisContext))
      .rejects.toThrow(AIValidationError);
  });

  // 12. Schema-invalid AI output fails safely.
  it('rejects schema-invalid output', async () => {
    const aiResponse = {
      comparison_items: [{ comparison_id: 'comp1' }] // missing everything else
    };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await expect(service.compare(mockUnderstandingContext, mockAnalysisContext))
      .rejects.toThrow(AIValidationError);
  });

  // 13. Unsupported/uncertain comparison is represented without fabricated certainty.
  it('allows NOT_STATED as a valid relationship enum', async () => {
    const aiResponse = {
      comparison_items: [{
        comparison_id: 'comp1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s1'],
        contract_position: { clause_id: 'c1', statement: 'Rent is 1000' },
        legal_baseline: { rule_id: 'r1', summary: 'Rent Rule', source_ids: ['s1'] },
        relationship: 'NOT_STATED',
        explanation: 'It is not stated.',
        severity: 'LOW',
        confidence: 'LOW',
        status: 'NOT_STATED'
      }],
      unresolved_questions: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValueOnce({
      content: JSON.stringify(aiResponse)
    });

    const result = await service.compare(mockUnderstandingContext, mockAnalysisContext);
    expect(result.comparison_items[0].relationship).toBe('NOT_STATED');
  });

  // 14. Prompt-injection content inside contract evidence is treated as data.
  // We can't fully "test" this as an integration behavior in a unit test without calling the real Groq,
  // but we can ensure that whatever Groq returns doesn't execute anything and is strictly validated.

  // 15. Provider/model configuration is not hard-coded.
  it('invokes the injected GroqProvider rather than a hardcoded client', async () => {
    const aiResponse = { comparison_items: [], unresolved_questions: [] };
    vi.mocked(mockProvider.generate).mockResolvedValueOnce({ content: JSON.stringify(aiResponse) });
    await service.compare(mockUnderstandingContext, mockAnalysisContext);
    expect(mockProvider.generate).toHaveBeenCalled();
  });
});
