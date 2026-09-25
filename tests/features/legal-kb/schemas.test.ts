import { describe, it, expect } from 'vitest';

import { LegalDomain } from '../../../src/features/legal-kb/models/LegalDomain';
import { LegalSource } from '../../../src/features/legal-kb/models/LegalSource';
import { LegalRule } from '../../../src/features/legal-kb/models/LegalRule';
import { GovernmentRoute } from '../../../src/features/legal-kb/models/GovernmentRoute';

describe('S2-M2.1: Legal KB Schema Validation', () => {

  describe('LegalDomain Schema', () => {
    it('validates a correct LegalDomain', async () => {
      const domain = new LegalDomain({
        domain_id: 'DOMAIN_001',
        name: 'Rental Agreements',
        description: 'Laws relating to leases and rentals',
        status: 'ACTIVE'
      });
      await expect(domain.validate()).resolves.toBeUndefined();
    });

    it('rejects LegalDomain without stable ID (domain_id)', async () => {
      const domain = new LegalDomain({
        name: 'Rental Agreements'
      });
      await expect(domain.validate()).rejects.toThrowError(/domain_id/);
    });
  });

  describe('LegalSource Schema', () => {
    it('validates a correct LegalSource', async () => {
      const source = new LegalSource({
        source_id: 'SRC_001',
        title: 'Telangana Rent Control Act',
        authority: 'Telangana Legislature',
        source_type: 'ACT',
        tier: 1,
        jurisdiction: 'TELANGANA',
        verification_status: 'VERIFIED'
      });
      await expect(source.validate()).resolves.toBeUndefined();
    });

    it('rejects LegalSource with invalid tier', async () => {
      const source = new LegalSource({
        source_id: 'SRC_002',
        title: 'Random Book',
        authority: 'Author',
        source_type: 'BOOK',
        tier: 6, // Out of bounds (1-5)
        jurisdiction: 'TELANGANA',
        verification_status: 'VERIFIED'
      });
      await expect(source.validate()).rejects.toThrowError(/tier/);
    });

    it('rejects LegalSource with invalid verification_status enum', async () => {
      const source = new LegalSource({
        source_id: 'SRC_003',
        title: 'Pending Case',
        authority: 'High Court',
        source_type: 'CASE',
        tier: 2,
        jurisdiction: 'TELANGANA',
        verification_status: 'NOT_A_STATUS' // Invalid enum
      });
      await expect(source.validate()).rejects.toThrowError(/verification_status/);
    });
  });

  describe('LegalRule Schema', () => {
    it('validates a correct LegalRule with source provenance and effective date', async () => {
      const rule = new LegalRule({
        rule_id: 'RULE_001',
        domain_id: 'DOMAIN_001',
        title: 'Security Deposit Limit',
        description: 'Deposit cannot exceed 2 months rent',
        jurisdiction: 'TELANGANA',
        document_types: ['RENTAL_LEASE'],
        source_ids: ['SRC_001'],
        effective_from: new Date('2026-01-01')
      });
      await expect(rule.validate()).resolves.toBeUndefined();
    });

    it('rejects LegalRule without source provenance (empty source_ids)', async () => {
      const rule = new LegalRule({
        rule_id: 'RULE_002',
        domain_id: 'DOMAIN_001',
        title: 'Security Deposit Limit',
        description: 'Deposit cannot exceed 2 months rent',
        jurisdiction: 'TELANGANA',
        document_types: ['RENTAL_LEASE'],
        source_ids: [], // Empty
        effective_from: new Date('2026-01-01')
      });
      await expect(rule.validate()).rejects.toThrowError(/source_ids/);
    });

    it('rejects LegalRule without source provenance (missing source_ids entirely)', async () => {
      const rule = new LegalRule({
        rule_id: 'RULE_003',
        domain_id: 'DOMAIN_001',
        title: 'Security Deposit Limit',
        description: 'Deposit cannot exceed 2 months rent',
        jurisdiction: 'TELANGANA',
        document_types: ['RENTAL_LEASE'],
        effective_from: new Date('2026-01-01')
      });
      await expect(rule.validate()).rejects.toThrowError(/source_ids/);
    });

    it('rejects un-versioned LegalRule (missing effective_from)', async () => {
      const rule = new LegalRule({
        rule_id: 'RULE_004',
        domain_id: 'DOMAIN_001',
        title: 'Security Deposit Limit',
        description: 'Deposit cannot exceed 2 months rent',
        jurisdiction: 'TELANGANA',
        document_types: ['RENTAL_LEASE'],
        source_ids: ['SRC_001']
      });
      await expect(rule.validate()).rejects.toThrowError(/effective_from/);
    });

    it('rejects LegalRule with invalid document types', async () => {
      const rule = new LegalRule({
        rule_id: 'RULE_005',
        domain_id: 'DOMAIN_001',
        title: 'Security Deposit Limit',
        description: 'Deposit cannot exceed 2 months rent',
        jurisdiction: 'TELANGANA',
        document_types: [], // Empty
        source_ids: ['SRC_001'],
        effective_from: new Date('2026-01-01')
      });
      await expect(rule.validate()).rejects.toThrowError(/document_types/);
    });
  });

  describe('GovernmentRoute Schema', () => {
    it('validates a correct GovernmentRoute with related_rule_ids', async () => {
      const route = new GovernmentRoute({
        route_id: 'ROUTE_001',
        name: 'File Rent Complaint',
        purpose: 'File a complaint',
        authority: 'Rent Authority',
        jurisdiction: 'TELANGANA',
        applicable_document_types: ['RENTAL_LEASE'],
        status: 'ACTIVE',
        related_rule_ids: ['RULE_001']
      });
      await expect(route.validate()).resolves.toBeUndefined();
    });

    it('rejects GovernmentRoute without related_rule_ids', async () => {
      const route = new GovernmentRoute({
        route_id: 'ROUTE_002',
        name: 'File Rent Complaint',
        purpose: 'File a complaint',
        authority: 'Rent Authority',
        jurisdiction: 'TELANGANA',
        applicable_document_types: ['RENTAL_LEASE'],
        status: 'ACTIVE',
        related_rule_ids: [] // Empty
      });
      await expect(route.validate()).rejects.toThrowError(/related_rule_ids/);
    });
  });

});
