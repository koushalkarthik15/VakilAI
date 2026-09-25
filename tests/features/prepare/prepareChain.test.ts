import { describe, it, expect, vi } from 'vitest';
import { PreparationService } from '../../../src/features/prepare/services/PreparationService';
import { GeminiProvider } from '../../../src/lib/ai/GeminiProvider';
import { AnalysisContext, ComparisonContext, ActionContext } from '../../../src/core/contexts/contracts';
import { GovernmentRoute } from '../../../src/features/legal-kb/models/GovernmentRoute';
import { LegalRule } from '../../../src/features/legal-kb/models/LegalRule';
import { LegalSource } from '../../../src/features/legal-kb/models/LegalSource';

vi.mock('../../../src/features/legal-kb/models/GovernmentRoute', () => ({
  GovernmentRoute: { find: vi.fn() }
}));

vi.mock('../../../src/features/legal-kb/models/LegalRule', () => ({
  LegalRule: { find: vi.fn() }
}));

vi.mock('../../../src/features/legal-kb/models/LegalSource', () => ({
  LegalSource: { find: vi.fn() }
}));

describe('prepareChain integration', () => {
  it('correctly builds prepare context and output from an action context chain', async () => {
    const mockProvider = {
      generate: vi.fn()
    } as unknown as GeminiProvider;
    
    const service = new PreparationService(mockProvider);

    const analysisContext: AnalysisContext = {
      metadata: {
        schema_version: '1.0',
        session_id: '123',
        document_id: 'doc',
        created_at: new Date().toISOString(),
        source_stage: 'analysis'
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
        issue_type: 'ISSUE',
        summary: 'Sum',
        explanation: 'Exp',
        severity: 'HIGH',
        confidence: 'HIGH',
        status: 'SUPPORTED',
        missing_information: []
      }]
    };

    const comparisonContext: ComparisonContext = {
      metadata: analysisContext.metadata,
      comparison_items: [],
      unresolved_questions: []
    };

    const actionContext: ActionContext = {
      metadata: analysisContext.metadata,
      findings: analysisContext.findings,
      action_items: [{
        action_id: 'A1',
        related_finding_ids: ['F1'],
        title: 'Action',
        description: 'Do it',
        action_type: 'CONSULT_PROFESSIONAL',
        required_information: ['doc1'],
        government_route_id: 'ROUTE1',
        status: 'PENDING'
      }],
      government_routes: ['ROUTE1'],
      questions: [],
      information_to_collect: [],
      warnings: []
    };

    vi.mocked(GovernmentRoute.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([{
        route_id: 'ROUTE1',
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

    const aiOutput = {
      purpose: 'checklist',
      generated_narrative: 'Narrative with prose route details',
      relevant_finding_ids: ['F1'],
      relevant_action_ids: ['A1'],
      questions: ['Q1'],
      information_to_collect: ['doc1'],
      facts_to_verify: [],
      source_references: ['S1', 'S2'],
      warnings: []
    };

    vi.mocked(mockProvider.generate).mockResolvedValue({ content: JSON.stringify(aiOutput) });

    const result = await service.generatePreparation(analysisContext, comparisonContext, actionContext, 'Make checklist');

    expect(result.output.source_references).toContain('S1');
    expect(result.output.source_references).toContain('S2');
    expect(result.output.relevant_finding_ids).toContain('F1');
    expect(result.output.relevant_action_ids).toContain('A1');
    expect(result.output.information_to_collect).toContain('doc1');
    
    // Check if the prompt gets supplemental routes
    const requestArgs = vi.mocked(mockProvider.generate).mock.calls[0][0];
    expect(requestArgs.userPrompt).toContain('ROUTE1');
  });
});
