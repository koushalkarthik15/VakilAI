import mongoose, { Schema, Document } from 'mongoose';

export interface ILegalRule extends Document {
  rule_id: string;
  domain_id: string;
  title: string;
  description: string;
  jurisdiction: string;
  document_types: string[];
  source_ids: string[];
  status?: 'ACTIVE' | 'OUTDATED' | 'RETIRED';
  last_verified_at?: Date;
  effective_from: Date;
  effective_to?: Date;
  applicability_conditions?: unknown[];
  exclusions?: unknown[];
}

const LegalRuleSchema: Schema = new Schema({
  rule_id: { type: String, required: true, unique: true },
  domain_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  jurisdiction: { type: String, required: true },
  document_types: { 
    type: [String], 
    required: true,
    validate: [
      (arr: string[]) => arr.length > 0,
      'document_types must have at least one entry'
    ]
  },
  source_ids: { 
    type: [String], 
    required: true, 
    validate: [
      (arr: string[]) => arr.length > 0,
      'source_ids must have at least one entry'
    ]
  },
  status: { type: String, enum: ['ACTIVE', 'OUTDATED', 'RETIRED'], default: 'ACTIVE' },
  last_verified_at: { type: Date },
  effective_from: { type: Date, required: true },
  effective_to: { type: Date },
  applicability_conditions: { type: [Schema.Types.Mixed] },
  exclusions: { type: [Schema.Types.Mixed] }
});

export const LegalRule = mongoose.models.LegalRule || mongoose.model<ILegalRule>('LegalRule', LegalRuleSchema);
