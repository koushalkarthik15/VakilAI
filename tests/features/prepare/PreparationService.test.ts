import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreparationService } from '../../../src/features/prepare/services/PreparationService';
import { AnalysisContext, ComparisonContext, ActionContext } from '../../../src/core/contexts/contracts';
import { GeminiProvider } from '../../../src/lib/ai/GeminiProvider';
import { GovernmentRoute } from '../../../src/features/legal-kb/models/GovernmentRoute';
import { LegalRule } from '../../../src/features/legal-kb/models/LegalRule';
import { LegalSource } from '../../../src/features/legal-kb/models/LegalSource';
import { AIValidationError } from '../../../src/lib/ai/validationErrors';

vi.mock('../../../src/features/legal-kb/models/GovernmentRoute', () => ({
  GovernmentRoute: { find: vi.fn() }
}));

vi.mock('../../../src/features/legal-kb/models/LegalRule', () => ({
  LegalRule: { find: vi.fn() }
}));

vi.mock('../../../src/features/legal-kb/models/LegalSource', () => ({
  LegalSource: { find: vi.fn() }
}));

describe('PreparationService', () => {
  let preparationService: PreparationService;
  let mockProvider: GeminiProvider;

  beforeEach(() => {
    mockProvider = {
      generate: vi.fn()
    } as unknown as GeminiProvider;
    preparationService = new PreparationService(mockProvider);
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
    comparison_items: [],
    unresolved_questions: []
  };

  const mockActionContext: ActionContext = {
    metadata: mockAnalysisContext.metadata,
    findings: mockAnalysisContext.findings,
    action_items: [{
      action_id: 'A1',
      related_finding_ids: ['F1'],
      title: 'Review',
      description: 'Review this',
      action_type: 'REVIEW_CLAUSE',
      required_information: ['info1'],
      government_route_id: 'ROUTE-1',
      status: 'PENDING'
    }],
    government_routes: ['ROUTE-1'],
    questions: [],
    information_to_collect: [],
    warnings: []
  };

  it('throws if userGoal is empty', async () => {
    await expect(
      preparationService.generatePreparation(mockAnalysisContext, mockComparisonContext, mockActionContext, '')
    ).rejects.toThrow('User goal is explicitly required for preparation generation.');
  });

  it('generates valid preparation output successfully', async () => {
    vi.mocked(GovernmentRoute.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([{
        route_id: 'ROUTE-1',
        name: 'Gov Route',
        related_rule_ids: ['R2']
      }])
    } as unknown as ReturnType<typeof GovernmentRoute.find>);

    vi.mocked(LegalRule.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        { rule_id: 'R1', source_ids: ['S1'] },
        { rule_id: 'R2', source_ids: ['S2'] }
      ])
    } as unknown as ReturnType<typeof LegalRule.find>);

    vi.mocked(LegalSource.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        { source_id: 'S1', citation: 'Cit1', authority: 'Auth1', verification_status: 'VERIFIED' },
        { source_id: 'S2', citation: 'Cit2', authority: 'Auth2', verification_status: 'VERIFIED' }
      ])
    } as unknown as ReturnType<typeof LegalSource.find>);

    const validOutput = {
      purpose: 'test',
      generated_narrative: 'test narrative',
      relevant_finding_ids: ['F1'],
      relevant_action_ids: ['A1'],
      questions: [],
      information_to_collect: [],
      facts_to_verify: [],
      source_references: ['S1', 'S2'],
      warnings: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValue({ content: JSON.stringify(validOutput) });

    const result = await preparationService.generatePreparation(
      mockAnalysisContext,
      mockComparisonContext,
      mockActionContext,
      'Draft a checklist'
    );

    expect(result.output).toEqual(validOutput);
    expect(mockProvider.generate).toHaveBeenCalled();
  });

  it('throws AIValidationError if generated finding_id is fabricated', async () => {
    vi.mocked(GovernmentRoute.find).mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as unknown as ReturnType<typeof GovernmentRoute.find>);
    vi.mocked(LegalRule.find).mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as unknown as ReturnType<typeof LegalRule.find>);
    vi.mocked(LegalSource.find).mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as unknown as ReturnType<typeof LegalSource.find>);

    const invalidOutput = {
      purpose: 'test',
      generated_narrative: 'test narrative',
      relevant_finding_ids: ['F99'], // Fabricated
      relevant_action_ids: [],
      questions: [],
      information_to_collect: [],
      facts_to_verify: [],
      source_references: [],
      warnings: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValue({ content: JSON.stringify(invalidOutput) });

    await expect(
      preparationService.generatePreparation(mockAnalysisContext, mockComparisonContext, mockActionContext, 'Goal')
    ).rejects.toThrowError(AIValidationError);
  });

  it('throws AIValidationError if generated source_id is fabricated', async () => {
    vi.mocked(GovernmentRoute.find).mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as unknown as ReturnType<typeof GovernmentRoute.find>);
    vi.mocked(LegalRule.find).mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as unknown as ReturnType<typeof LegalRule.find>);
    vi.mocked(LegalSource.find).mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as unknown as ReturnType<typeof LegalSource.find>);

    const invalidOutput = {
      purpose: 'test',
      generated_narrative: 'test narrative',
      relevant_finding_ids: [],
      relevant_action_ids: [],
      questions: [],
      information_to_collect: [],
      facts_to_verify: [],
      source_references: ['S99'], // Fabricated
      warnings: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValue({ content: JSON.stringify(invalidOutput) });

    await expect(
      preparationService.generatePreparation(mockAnalysisContext, mockComparisonContext, mockActionContext, 'Goal')
    ).rejects.toThrowError(AIValidationError);
  });
});
