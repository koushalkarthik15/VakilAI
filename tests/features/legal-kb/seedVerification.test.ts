import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { runSeed } from '../../../src/features/legal-kb/seeds/seedRunner';
import { LegalRuleRepository } from '../../../src/features/legal-kb/repositories/legalRuleRepository';
import { ApplicabilityService } from '../../../src/features/legal-kb/services/applicabilityService';
import { loadEnvConfig } from '@next/env';

// Load environment variables for the test
loadEnvConfig(process.cwd());

describe('S2-M2.2: Legal KB Integration Verification', () => {
  const uri = process.env.MONGODB_URL;
  const isMongoDbAvailable = !!uri;
  
  beforeAll(async () => {
    if (isMongoDbAvailable) {
      await mongoose.connect(uri);
      // Run the idempotent seed process before tests
      await runSeed();
      // Wait for runSeed to disconnect and reconnect since runSeed manages its own connection if called directly,
      // But wait, runSeed() inside our process will close the mongoose connection if it connects and disconnects.
      // Let's reconnect for our tests if it disconnected.
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(uri);
      }
    }
  });

  afterAll(async () => {
    if (isMongoDbAvailable && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it.skipIf(!isMongoDbAvailable)('retrieves the exact seeded Contract Act rule for Freelance contracts', async () => {
    const repository = new LegalRuleRepository();
    const service = new ApplicabilityService(repository);

    const result = await service.getApplicableRules({
      jurisdictionStatus: 'SUPPORTED',
      jurisdictionValue: 'TELANGANA',
      documentType: 'FREELANCER_SERVICE',
      relevantDate: new Date('2026-09-22T00:00:00.000Z')
    });

    expect(result.status).toBe('SUCCESS');
    if (result.status === 'SUCCESS') {
      const ruleIds = result.rules.map(r => r.rule_id);
      // Both Contract Act and MSMED Act should apply, plus TS Shops
      expect(ruleIds).toContain('RULE_CONTRACT_VALIDITY');
      expect(ruleIds).toContain('RULE_MSME_PAYMENT');
      expect(ruleIds).toContain('RULE_TS_COMMERCIAL_EST');
    }
  });

  it.skipIf(!isMongoDbAvailable)('retrieves the exact seeded TS Rent Act rule for Rental Leases', async () => {
    const repository = new LegalRuleRepository();
    const service = new ApplicabilityService(repository);

    const result = await service.getApplicableRules({
      jurisdictionStatus: 'SUPPORTED',
      jurisdictionValue: 'TELANGANA',
      documentType: 'RENTAL_LEASE',
      relevantDate: new Date('2026-09-22T00:00:00.000Z')
    });

    expect(result.status).toBe('SUCCESS');
    if (result.status === 'SUCCESS') {
      const ruleIds = result.rules.map(r => r.rule_id);
      expect(ruleIds).toContain('RULE_CONTRACT_VALIDITY');
      expect(ruleIds).toContain('RULE_LEASE_DEFINITION');
      expect(ruleIds).toContain('RULE_TS_RENT_EVICTION');
      expect(ruleIds).toContain('RULE_TS_LEASE_REGISTRATION');
    }
  });
  
  it.skipIf(!isMongoDbAvailable)('idempotency: seeding again does not duplicate rules', async () => {
    const repository = new LegalRuleRepository();
    const allRulesBefore = await repository.getActiveRules();
    
    // Seed again
    await runSeed();
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri!);
    }
    
    const allRulesAfter = await repository.getActiveRules();
    expect(allRulesAfter.length).toBe(allRulesBefore.length);
  });
});
