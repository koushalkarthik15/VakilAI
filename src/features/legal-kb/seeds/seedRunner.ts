import mongoose from 'mongoose';
import { seedDomains, seedSources, seedRules } from './seedData';
import { LegalDomain } from '../models/LegalDomain';
import { LegalSource } from '../models/LegalSource';
import { LegalRule } from '../models/LegalRule';
import { loadEnvConfig } from '@next/env';

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);


async function verifyReferentialIntegrity() {
  console.log('Verifying referential integrity...');
  const domainIds = new Set(seedDomains.map(d => d.domain_id));
  const sourceIds = new Set(seedSources.map(s => s.source_id));

  for (const rule of seedRules) {
    if (!rule.domain_id || !domainIds.has(rule.domain_id)) {
      throw new Error(`Referential Integrity Error: Rule ${rule.rule_id} references missing domain ${rule.domain_id}`);
    }
    if (!rule.source_ids || rule.source_ids.length === 0) {
      throw new Error(`Referential Integrity Error: Rule ${rule.rule_id} has no source_ids`);
    }
    for (const sourceId of rule.source_ids) {
      if (!sourceIds.has(sourceId)) {
        throw new Error(`Referential Integrity Error: Rule ${rule.rule_id} references missing source ${sourceId}`);
      }
    }
  }
  console.log('Referential integrity verified.');
}

async function runSeed() {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error('Failed to connect to MongoDB via MONGODB_URL. Please set MONGODB_URL environment variable.');
  }

  try {
    await verifyReferentialIntegrity();
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    console.log('Seeding LegalDomains...');
    for (const domain of seedDomains) {
      await LegalDomain.updateOne({ domain_id: domain.domain_id }, { $set: domain }, { upsert: true });
    }

    console.log('Seeding LegalSources...');
    for (const source of seedSources) {
      await LegalSource.updateOne({ source_id: source.source_id }, { $set: source }, { upsert: true });
    }

    console.log('Seeding LegalRules...');
    for (const rule of seedRules) {
      await LegalRule.updateOne({ rule_id: rule.rule_id }, { $set: rule }, { upsert: true });
    }

    console.log('Seed execution completed successfully.');
  } catch (error) {
    console.error('Seed execution failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

// Execute the seed if run directly
if (require.main === module) {
  runSeed().catch((error) => {
    console.error('Unhandled Seed Error:', error);
    process.exit(1);
  });
}

export { runSeed, verifyReferentialIntegrity };
