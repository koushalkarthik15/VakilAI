import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicabilityService } from '../../../src/features/legal-kb/services/applicabilityService';
import { ILegalRuleRepository } from '../../../src/features/legal-kb/repositories/legalRuleRepository';

const mockRepository: ILegalRuleRepository = {
  getActiveRules: vi.fn(),
  getSourcesByIds: vi.fn(),
};

const service = new ApplicabilityService(mockRepository);

describe('S2-M2.1: Legal KB Applicability Service', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Jurisdiction Evaluation', () => {
    it('returns OUTSIDE_SCOPE when jurisdictionStatus is OUTSIDE_SCOPE', async () => {
      const result = await service.getApplicableRules({
        jurisdictionStatus: 'OUTSIDE_SCOPE',
        documentType: 'RENTAL_LEASE'
      });
      expect(result.status).toBe('OUTSIDE_SCOPE');
    });

    it('returns JURISDICTION_UNCLEAR and never silently assumes supported', async () => {
      const result = await service.getApplicableRules({
        jurisdictionStatus: 'JURISDICTION_UNCLEAR',
        documentType: 'RENTAL_LEASE'
      });
      expect(result.status).toBe('JURISDICTION_UNCLEAR');
    });

    it('returns NO_APPLICABLE_RULE for jurisdiction mismatch', async () => {
      // Rule is for MAHARASHTRA, but document is TELANGANA
      vi.mocked(mockRepository.getActiveRules).mockResolvedValue([
        { jurisdiction: 'MAHARASHTRA', document_types: ['RENTAL_LEASE'], source_ids: ['SRC_1'] } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
      ]);

      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE'
      });
      expect(result.status).toBe('NO_APPLICABLE_RULE');
    });
  });

  describe('Document Type Evaluation', () => {
    it('returns NO_APPLICABLE_RULE for document-type mismatch', async () => {
      // Rule is for FREELANCER_SERVICE, but document is RENTAL_LEASE
      vi.mocked(mockRepository.getActiveRules).mockResolvedValue([
        { jurisdiction: 'TELANGANA', document_types: ['FREELANCER_SERVICE'], source_ids: ['SRC_1'] } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
      ]);

      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE'
      });
      expect(result.status).toBe('NO_APPLICABLE_RULE');
    });
  });

  describe('Temporal Boundary Tests [effective_from, effective_to)', () => {
    const effectiveFrom = new Date('2026-01-01T00:00:00.000Z');
    const effectiveTo = new Date('2026-04-01T00:00:00.000Z');

    const setupRule = () => {
      vi.mocked(mockRepository.getActiveRules).mockResolvedValue([
        { 
          jurisdiction: 'TELANGANA', 
          document_types: ['RENTAL_LEASE'], 
          source_ids: ['SRC_1'],
          effective_from: effectiveFrom,
          effective_to: effectiveTo
        } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
      ]);
      vi.mocked(mockRepository.getSourcesByIds).mockResolvedValue([
        { source_id: 'SRC_1', verification_status: 'VERIFIED' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
      ]);
    };

    it('excludes rule when before effective_from', async () => {
      setupRule();
      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE',
        relevantDate: new Date('2025-12-31T23:59:59.999Z')
      });
      expect(result.status).toBe('NO_APPLICABLE_RULE');
    });

    it('includes rule when exactly on effective_from (inclusive)', async () => {
      setupRule();
      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE',
        relevantDate: effectiveFrom
      });
      expect(result.status).toBe('SUCCESS');
      if (result.status === 'SUCCESS') expect(result.rules).toHaveLength(1);
    });

    it('includes rule when during effective period', async () => {
      setupRule();
      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE',
        relevantDate: new Date('2026-02-15T00:00:00.000Z')
      });
      expect(result.status).toBe('SUCCESS');
    });

    it('excludes rule when exactly on effective_to (exclusive)', async () => {
      setupRule();
      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE',
        relevantDate: effectiveTo
      });
      expect(result.status).toBe('NO_APPLICABLE_RULE');
    });

    it('excludes rule when after effective_to', async () => {
      setupRule();
      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE',
        relevantDate: new Date('2026-05-01T00:00:00.000Z')
      });
      expect(result.status).toBe('NO_APPLICABLE_RULE');
    });

    it('includes rule when effective_to is null (open-ended)', async () => {
      vi.mocked(mockRepository.getActiveRules).mockResolvedValue([
        { 
          jurisdiction: 'TELANGANA', 
          document_types: ['RENTAL_LEASE'], 
          source_ids: ['SRC_1'],
          effective_from: effectiveFrom,
          effective_to: null
        } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
      ]);
      vi.mocked(mockRepository.getSourcesByIds).mockResolvedValue([
        { source_id: 'SRC_1', verification_status: 'VERIFIED' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
      ]);

      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE',
        relevantDate: new Date('2026-05-01T00:00:00.000Z') // After the original effective_to
      });
      expect(result.status).toBe('SUCCESS');
    });
  });

  describe('Source Relationship Resolution', () => {
    const effectiveFrom = new Date('2020-01-01T00:00:00.000Z');

    it('excludes rule with no verified sources', async () => {
      vi.mocked(mockRepository.getActiveRules).mockResolvedValue([
        { 
          jurisdiction: 'TELANGANA', 
          document_types: ['RENTAL_LEASE'], 
          source_ids: ['SRC_1'],
          effective_from: effectiveFrom
        } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
      ]);
      vi.mocked(mockRepository.getSourcesByIds).mockResolvedValue([
        { source_id: 'SRC_1', verification_status: 'OUTDATED' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ // Unverified
      ]);

      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE',
        relevantDate: new Date('2026-01-01T00:00:00.000Z')
      });
      expect(result.status).toBe('INSUFFICIENT_SOURCE');
    });

    it('includes rule if at least one source is verified', async () => {
      vi.mocked(mockRepository.getActiveRules).mockResolvedValue([
        { 
          jurisdiction: 'TELANGANA', 
          document_types: ['RENTAL_LEASE'], 
          source_ids: ['SRC_1', 'SRC_2'],
          effective_from: effectiveFrom
        } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
      ]);
      vi.mocked(mockRepository.getSourcesByIds).mockResolvedValue([
        { source_id: 'SRC_1', verification_status: 'OUTDATED' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */, // Outdated
        { source_id: 'SRC_2', verification_status: 'VERIFIED' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */  // Verified
      ]);

      const result = await service.getApplicableRules({
        jurisdictionStatus: 'SUPPORTED',
        jurisdictionValue: 'TELANGANA',
        documentType: 'RENTAL_LEASE',
        relevantDate: new Date('2026-01-01T00:00:00.000Z')
      });
      expect(result.status).toBe('SUCCESS');
    });
  });

});
