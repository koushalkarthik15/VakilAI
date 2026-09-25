import mongoose, { Schema, Document } from 'mongoose';

export interface ILegalSource extends Document {
  source_id: string;
  title: string;
  authority: string;
  source_type: string;
  tier: number;
  jurisdiction: string;
  url?: string;
  citation?: string;
  verification_status: 'VERIFIED' | 'PENDING_VERIFICATION' | 'OUTDATED' | 'REQUIRES_REVIEW' | 'RETIRED';
  verified_at?: Date;
  effective_from?: Date;
  effective_to?: Date;
}

const LegalSourceSchema: Schema = new Schema({
  source_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  authority: { type: String, required: true },
  source_type: { type: String, required: true },
  tier: { type: Number, required: true, min: 1, max: 5 },
  jurisdiction: { type: String, required: true },
  url: { type: String },
  citation: { type: String },
  verification_status: { 
    type: String, 
    enum: ['VERIFIED', 'PENDING_VERIFICATION', 'OUTDATED', 'REQUIRES_REVIEW', 'RETIRED'], 
    required: true 
  },
  verified_at: { type: Date },
  effective_from: { type: Date },
  effective_to: { type: Date }
});

export const LegalSource = mongoose.models.LegalSource || mongoose.model<ILegalSource>('LegalSource', LegalSourceSchema);
