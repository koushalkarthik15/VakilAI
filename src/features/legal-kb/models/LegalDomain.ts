import mongoose, { Schema, Document } from 'mongoose';

export interface ILegalDomain extends Document {
  domain_id: string;
  name: string;
  description?: string;
  status?: string;
}

const LegalDomainSchema: Schema = new Schema({
  domain_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
});

export const LegalDomain = mongoose.models.LegalDomain || mongoose.model<ILegalDomain>('LegalDomain', LegalDomainSchema);
