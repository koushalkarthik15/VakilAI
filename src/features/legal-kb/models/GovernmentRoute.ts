import mongoose, { Schema, Document } from 'mongoose';

export interface IGovernmentRoute extends Document {
  route_id: string;
  name: string;
  purpose: string;
  authority: string;
  jurisdiction: string;
  applicable_document_types: string[];
  conditions?: unknown[];
  official_url?: string;
  required_information?: string[];
  status: 'ACTIVE' | 'OUTDATED' | 'RETIRED';
  verified_at?: Date;
  notes?: string;
  related_rule_ids: string[];
}

const GovernmentRouteSchema: Schema = new Schema({
  route_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  purpose: { type: String, required: true },
  authority: { type: String, required: true },
  jurisdiction: { type: String, required: true },
  applicable_document_types: { 
    type: [String], 
    required: true,
    validate: [
      (arr: string[]) => arr.length > 0,
      'applicable_document_types must have at least one entry'
    ]
  },
  conditions: { type: [Schema.Types.Mixed] },
  official_url: { type: String },
  required_information: { type: [String] },
  status: { type: String, enum: ['ACTIVE', 'OUTDATED', 'RETIRED'], required: true },
  verified_at: { type: Date },
  notes: { type: String },
  related_rule_ids: { 
    type: [String], 
    required: true,
    validate: [
      (arr: string[]) => arr.length > 0,
      'related_rule_ids must have at least one entry'
    ]
  }
});

export const GovernmentRoute = mongoose.models.GovernmentRoute || mongoose.model<IGovernmentRoute>('GovernmentRoute', GovernmentRouteSchema);
