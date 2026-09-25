import { LegalRule, ILegalRule } from '../models/LegalRule';
import { LegalSource, ILegalSource } from '../models/LegalSource';

export interface ILegalRuleRepository {
  /**
   * Fetches all ACTIVE LegalRules.
   */
  getActiveRules(): Promise<ILegalRule[]>;

  /**
   * Fetches LegalSources by their IDs.
   */
  getSourcesByIds(sourceIds: string[]): Promise<ILegalSource[]>;
}

export class LegalRuleRepository implements ILegalRuleRepository {
  async getActiveRules(): Promise<ILegalRule[]> {
    return LegalRule.find({ status: 'ACTIVE' }).lean();
  }

  async getSourcesByIds(sourceIds: string[]): Promise<ILegalSource[]> {
    return LegalSource.find({ source_id: { $in: sourceIds } }).lean();
  }
}
