import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionService } from '../../../src/features/act/services/ActionService';
import { AnalysisContext, ComparisonContext } from '../../../src/core/contexts/contracts';
import { GovernmentRoute } from '../../../src/features/legal-kb/models/GovernmentRoute';
import { ActionTypes } from '../../../src/features/act/constants/actionTypes';



describe('ActionService', () => {
  let actionService: ActionService;

  beforeEach(() => {
    actionService = new ActionService();
    vi.clearAllMocks();
  });

  const mockAnalysisContext: AnalysisContext = {
    metadata: {
      schema_version: '1.0',
      session_id: 'session-123',
      document_id: 'doc-123',
      created_at: new Date().toISOString(),
      source_stage: 'compare'
    },
    document_type: 'RENTAL_LEASE',
    jurisdiction: 'Telangana',
    relevant_clauses: ['C1'],
    applicable_rules: [],
    source_references: [],
    detected_patterns: [],
    missing_information: [],
    analysis_constraints: [],
    findings: [{
      finding_id: 'F1',
      clause_ids: ['C1'],
      rule_ids: ['R1'],
      source_ids: ['S1'],
      issue_type: 'COMPLIANCE',
      summary: 'Summary',
      explanation: 'Explanation',
      severity: 'HIGH',
      confidence: 'HIGH',
      status: 'SUPPORTED',
      missing_information: []
    }]
  };

  const mockComparisonContext: ComparisonContext = {
    metadata: mockAnalysisContext.metadata,
    comparison_items: [{
      comparison_id: 'COMP1',
      clause_ids: ['C1'],
      rule_ids: ['R1'],
      source_ids: ['S1'],
      contract_position: { clause_id: 'C1', statement: 'Contract says X' },
      legal_baseline: { rule_id: 'R1', summary: 'Law says Y', source_ids: ['S1'] },
      relationship: 'DIFFERS',
      explanation: 'They differ',
      severity: 'HIGH',
      confidence: 'HIGH',
      status: 'VERIFIED'
    }],
    unresolved_questions: []
  };

  it('maps DIFFERS relationship to REVIEW_CLAUSE action', async () => {
    vi.spyOn(GovernmentRoute, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([])
    } as unknown as ReturnType<typeof GovernmentRoute.find>);

    const result = await actionService.generateActionContext(mockAnalysisContext, mockComparisonContext);

    expect(result.action_items.length).toBe(1);
    expect(result.action_items[0].action_type).toBe(ActionTypes.REVIEW_CLAUSE);
    expect(result.action_items[0].related_finding_ids).toContain('F1');
    expect(result.government_routes).toEqual([]);
  });

  it('includes GovernmentRoute if a verified route exists', async () => {
    vi.spyOn(GovernmentRoute, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([{
        route_id: 'ROUTE-001',
        name: 'Official Registration',
        purpose: 'To register',
        authority: 'Gov',
        jurisdiction: 'Telangana',
        applicable_document_types: ['RENTAL_LEASE'],
        status: 'ACTIVE',
        related_rule_ids: ['R1']
      }])
    } as unknown as ReturnType<typeof GovernmentRoute.find>);

    const result = await actionService.generateActionContext(mockAnalysisContext, mockComparisonContext);

    expect(result.action_items.length).toBe(1);
    expect(result.action_items[0].action_type).toBe(ActionTypes.REVIEW_CLAUSE);
    expect(result.action_items[0].government_route_id).toBe('ROUTE-001');
    expect(result.government_routes).toContain('ROUTE-001');
  });

  it('handles NOT_STATED safely by populating information_to_collect', async () => {
    const notStatedContext = {
      ...mockComparisonContext,
      comparison_items: [{
        ...mockComparisonContext.comparison_items[0],
        relationship: 'NOT_STATED' as unknown as "ALIGNS" | "DIFFERS" | "POTENTIAL_TENSION",
        explanation: 'Missing info'
      }]
    };

    const result = await actionService.generateActionContext(mockAnalysisContext, notStatedContext);

    expect(result.action_items.length).toBe(0);
    expect(result.information_to_collect).toContain('Missing info');
  });

  it('handles REQUIRES_REVIEW safely by populating warnings', async () => {
    const reqReviewContext = {
      ...mockComparisonContext,
      comparison_items: [{
        ...mockComparisonContext.comparison_items[0],
        relationship: 'REQUIRES_REVIEW' as unknown as "ALIGNS" | "DIFFERS" | "POTENTIAL_TENSION",
        explanation: 'Needs human look'
      }]
    };

    const result = await actionService.generateActionContext(mockAnalysisContext, reqReviewContext);

    expect(result.action_items.length).toBe(0);
    expect(result.warnings.some(w => w.includes('Needs human look'))).toBe(true);
  });

  it('safely handles missing finding mappings', async () => {
    const missingFindingContext = {
      ...mockComparisonContext,
      comparison_items: [{
        ...mockComparisonContext.comparison_items[0],
        clause_ids: ['C99'], // No finding matches this
        rule_ids: ['R99']
      }]
    };

    const result = await actionService.generateActionContext(mockAnalysisContext, missingFindingContext);

    expect(result.action_items.length).toBe(0);
  });
});
