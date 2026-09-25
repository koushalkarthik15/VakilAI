import { describe, it, expect } from 'vitest';
import { LegalDomain } from '../../../src/features/legal-kb/models/LegalDomain';
import { LegalSource } from '../../../src/features/legal-kb/models/LegalSource';
import { LegalRule } from '../../../src/features/legal-kb/models/LegalRule';
import { seedDomains, seedSources, seedRules } from '../../../src/features/legal-kb/seeds/seedData';

describe('S2-M2.2: Seed Data Validation', () => {
  it('all seedDomains are valid according to LegalDomain schema', async () => {
    for (const data of seedDomains) {
      const domain = new LegalDomain(data);
      await expect(domain.validate()).resolves.toBeUndefined();
    }
  });

  it('all seedSources are valid according to LegalSource schema', async () => {
    for (const data of seedSources) {
      const source = new LegalSource(data);
      await expect(source.validate()).resolves.toBeUndefined();
    }
  });

  it('all seedRules are valid according to LegalRule schema', async () => {
    for (const data of seedRules) {
      const rule = new LegalRule(data);
      await expect(rule.validate()).resolves.toBeUndefined();
    }
  });

  it('maintains referential integrity from LegalRule to LegalDomain and LegalSource', () => {
    const domainIds = new Set(seedDomains.map(d => d.domain_id));
    const sourceIds = new Set(seedSources.map(s => s.source_id));

    for (const rule of seedRules) {
      // Rule must reference a valid domain
      expect(domainIds.has(rule.domain_id)).toBe(true);

      // Rule must reference valid sources
      expect(rule.source_ids?.length).toBeGreaterThan(0);
      rule.source_ids?.forEach(id => {
        expect(sourceIds.has(id)).toBe(true);
      });
    }
  });

  it('no duplicate IDs exist in seed data', () => {
    const domainIds = seedDomains.map(d => d.domain_id);
    expect(new Set(domainIds).size).toBe(domainIds.length);

    const sourceIds = seedSources.map(s => s.source_id);
    expect(new Set(sourceIds).size).toBe(sourceIds.length);

    const ruleIds = seedRules.map(r => r.rule_id);
    expect(new Set(ruleIds).size).toBe(ruleIds.length);
  });
});
