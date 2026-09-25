import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComparisonService } from '../../../src/features/compare/services/ComparisonService';
import { FlaggingService } from '../../../src/features/flag/services/FlaggingService';
import { GroqProvider } from '../../../src/lib/ai/GroqProvider';
import { UnderstandingContext } from '../../../src/core/contexts/contracts';
import { ApplicabilityResult } from '../../../src/features/legal-kb/services/applicabilityService';
import { ILegalRule } from '../../../src/features/legal-kb/models/LegalRule';

describe('Comparison Chain (E2E)', () => {
  let mockProvider: GroqProvider;
  let flaggingService: FlaggingService;
  let comparisonService: ComparisonService;

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
    flaggingService = new FlaggingService(mockProvider);
    comparisonService = new ComparisonService(mockProvider);
  });

  it('successfully traces finding -> clause -> rule -> source through the complete chain', async () => {
    // 1. Mock the Flagging (AnalysisContext) output
    const aiFlaggingResponse = {
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

    // 2. Mock the Comparison output
    const aiComparisonResponse = {
      comparison_items: [{
        comparison_id: 'comp1',
        clause_ids: ['c1'],
        rule_ids: ['r1'],
        source_ids: ['s1'],
        contract_position: { clause_id: 'c1', statement: 'Rent is 1000' },
        legal_baseline: { rule_id: 'r1', summary: 'Rent rule', source_ids: ['s1'] },
        relationship: 'ALIGNS',
        explanation: 'The contract matches the law.',
        severity: 'LOW',
        confidence: 'HIGH',
        status: 'SUPPORTED'
      }],
      unresolved_questions: []
    };

    // Mock implementation will return flagging first, then comparison.
    vi.mocked(mockProvider.generate)
      .mockResolvedValueOnce({ content: JSON.stringify(aiFlaggingResponse) }) // S5
      .mockResolvedValueOnce({ content: JSON.stringify(aiComparisonResponse) }); // S6

    // Execute S5
    const analysisContext = await flaggingService.analyze(mockUnderstandingContext, mockApplicabilityResult);

    // Assert S5 output
    expect(analysisContext.findings.length).toBe(1);
    expect(analysisContext.findings[0].clause_ids).toContain('c1');
    expect(analysisContext.findings[0].rule_ids).toContain('r1');
    expect(analysisContext.findings[0].source_ids).toContain('s1');

    // Execute S6
    const comparisonContext = await comparisonService.compare(mockUnderstandingContext, analysisContext);

    // Assert S6 output
    expect(comparisonContext.comparison_items.length).toBe(1);
    const item = comparisonContext.comparison_items[0];
    
    // Validate strict trace
    expect(item.contract_position.clause_id).toBe('c1');
    expect(item.legal_baseline.rule_id).toBe('r1');
    expect(item.relationship).toBe('ALIGNS');
    expect(item.clause_ids).toContain('c1');
    expect(item.rule_ids).toContain('r1');
    expect(item.source_ids).toContain('s1');
  });
});
