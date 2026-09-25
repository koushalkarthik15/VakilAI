import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RuleContextService } from '../../../src/features/flag/services/RuleContextService';
import { ApplicabilityService } from '../../../src/features/legal-kb/services/applicabilityService';
import { UnderstandingContext } from '../../../src/core/contexts/contracts';

describe('RuleContextService', () => {
  let mockApplicabilityService: ApplicabilityService;
  let service: RuleContextService;

  beforeEach(() => {
    mockApplicabilityService = {
      getApplicableRules: vi.fn()
    } as unknown as ApplicabilityService;
    service = new RuleContextService(mockApplicabilityService);
  });

  const baseContext: UnderstandingContext = {
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
    document_facts: [],
    clauses: [],
    missing_information: [],
    uncertainties: []
  };

  it('bypasses rule retrieval if jurisdiction is OUTSIDE_SCOPE', async () => {
    const context = { ...baseContext, jurisdiction: { status: 'OUTSIDE_SCOPE' as const } };
    const result = await service.getApplicableRulesForContext(context);
    expect(result.status).toBe('OUTSIDE_SCOPE');
    expect(mockApplicabilityService.getApplicableRules).not.toHaveBeenCalled();
  });

  it('bypasses rule retrieval if jurisdiction is JURISDICTION_UNCLEAR', async () => {
    const context = { ...baseContext, jurisdiction: { status: 'JURISDICTION_UNCLEAR' as const } };
    const result = await service.getApplicableRulesForContext(context);
    expect(result.status).toBe('JURISDICTION_UNCLEAR');
    expect(mockApplicabilityService.getApplicableRules).not.toHaveBeenCalled();
  });

  it('extracts effective_date and calls ApplicabilityService', async () => {
    const context: UnderstandingContext = {
      ...baseContext,
      document_facts: [
        { fact_id: 'f1', field: 'effective_date', value: '2025-01-01', status: 'STATED' }
      ]
    };

    vi.mocked(mockApplicabilityService.getApplicableRules).mockResolvedValueOnce({
      status: 'SUCCESS',
      rules: []
    });

    const result = await service.getApplicableRulesForContext(context);

    expect(result.status).toBe('SUCCESS');
    expect(mockApplicabilityService.getApplicableRules).toHaveBeenCalledWith({
      jurisdictionStatus: 'SUPPORTED',
      jurisdictionValue: 'TELANGANA',
      documentType: 'RENTAL_LEASE',
      relevantDate: new Date('2025-01-01')
    });
  });

  it('falls back to execution_date if effective_date is NOT_STATED', async () => {
    const context: UnderstandingContext = {
      ...baseContext,
      document_facts: [
        { fact_id: 'f1', field: 'effective_date', status: 'NOT_STATED' },
        { fact_id: 'f2', field: 'execution_date', value: '2024-12-15', status: 'STATED' }
      ]
    };

    vi.mocked(mockApplicabilityService.getApplicableRules).mockResolvedValueOnce({
      status: 'SUCCESS',
      rules: []
    });

    await service.getApplicableRulesForContext(context);

    expect(mockApplicabilityService.getApplicableRules).toHaveBeenCalledWith(
      expect.objectContaining({
        relevantDate: new Date('2024-12-15')
      })
    );
  });

  it('returns INSUFFICIENT_SOURCE safely if no reliable date is present (Strict Date Rule)', async () => {
    const context: UnderstandingContext = {
      ...baseContext,
      document_facts: [
        { fact_id: 'f1', field: 'effective_date', status: 'NOT_STATED' },
        { fact_id: 'f2', field: 'execution_date', status: 'NOT_STATED' }
      ]
    };

    const result = await service.getApplicableRulesForContext(context);

    // Should NOT call the applicability engine
    expect(mockApplicabilityService.getApplicableRules).not.toHaveBeenCalled();
    // Should safely explicitly fail due to date uncertainty
    expect(result.status).toBe('INSUFFICIENT_SOURCE');
  });

  it('returns INSUFFICIENT_SOURCE if date is present but unparseable', async () => {
    const context: UnderstandingContext = {
      ...baseContext,
      document_facts: [
        { fact_id: 'f1', field: 'effective_date', value: 'InvalidDateString', status: 'STATED' }
      ]
    };

    const result = await service.getApplicableRulesForContext(context);
    expect(result.status).toBe('INSUFFICIENT_SOURCE');
  });
});
