import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComparisonService } from '../../../src/features/compare/services/ComparisonService';
import { FlaggingService } from '../../../src/features/flag/services/FlaggingService';
import { ActionService } from '../../../src/features/act/services/ActionService';
import { GroqProvider } from '../../../src/lib/ai/GroqProvider';
import { UnderstandingContext } from '../../../src/core/contexts/contracts';
import { ApplicabilityResult } from '../../../src/features/legal-kb/services/applicabilityService';
import { ILegalRule } from '../../../src/features/legal-kb/models/LegalRule';
import { GovernmentRoute } from '../../../src/features/legal-kb/models/GovernmentRoute';
import { ActionTypes } from '../../../src/features/act/constants/actionTypes';



describe('Act Chain (E2E)', () => {
  let mockProvider: GroqProvider;
  let flaggingService: FlaggingService;
  let comparisonService: ComparisonService;
  let actionService: ActionService;

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
    actionService = new ActionService();
    vi.clearAllMocks();
  });

  it('successfully traces finding -> clause -> rule -> source -> route through the complete chain', async () => {
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
        summary: 'Rent Differs',
        explanation: 'Rent is not compliant.',
        severity: 'HIGH',
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
        relationship: 'DIFFERS',
        explanation: 'The contract differs from the law.',
        severity: 'HIGH',
        confidence: 'HIGH',
        status: 'SUPPORTED'
      }],
      unresolved_questions: []
    };

    // Mock AI calls
    vi.mocked(mockProvider.generate)
      .mockResolvedValueOnce({ content: JSON.stringify(aiFlaggingResponse) }) // S5
      .mockResolvedValueOnce({ content: JSON.stringify(aiComparisonResponse) }); // S6

    // Mock Government Route Lookup
    vi.spyOn(GovernmentRoute, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([{
        route_id: 'ROUTE-XYZ',
        name: 'File Rent Complaint',
        purpose: 'File a complaint',
        authority: 'Rent Authority',
        jurisdiction: 'TELANGANA',
        applicable_document_types: ['RENTAL_LEASE'],
        status: 'ACTIVE',
        related_rule_ids: ['r1']
      }])
    } as unknown as ReturnType<typeof GovernmentRoute.find>);

    // Execute S5
    const analysisContext = await flaggingService.analyze(mockUnderstandingContext, mockApplicabilityResult);

    // Execute S6
    const comparisonContext = await comparisonService.compare(mockUnderstandingContext, analysisContext);

    // Execute S7
    const actionContext = await actionService.generateActionContext(analysisContext, comparisonContext);

    // Validate the complete trace
    expect(actionContext.action_items.length).toBe(1);
    const action = actionContext.action_items[0];

    // Assert that the action points directly back to finding_id
    expect(action.related_finding_ids).toContain('find1');
    expect(action.action_type).toBe(ActionTypes.REVIEW_CLAUSE);

    // Assert that the action links to the official government route
    expect(action.government_route_id).toBe('ROUTE-XYZ');
    expect(actionContext.government_routes).toContain('ROUTE-XYZ');

    // AI is proven to NOT be used in S7
    expect(mockProvider.generate).toHaveBeenCalledTimes(2); // Only S5 and S6
  });
});
