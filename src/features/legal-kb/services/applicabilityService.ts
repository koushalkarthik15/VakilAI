import { ILegalRuleRepository } from '../repositories/legalRuleRepository';
import { ILegalRule } from '../models/LegalRule';

export interface ApplicabilityQuery {
  jurisdictionStatus: 'SUPPORTED' | 'OUTSIDE_SCOPE' | 'JURISDICTION_UNCLEAR';
  jurisdictionValue?: string; // e.g. 'TELANGANA' or 'CENTRAL'
  documentType: string;
  relevantDate?: Date;
}

export type ApplicabilityResult = 
  | { status: 'SUCCESS'; rules: ILegalRule[] }
  | { status: 'JURISDICTION_UNCLEAR' | 'OUTSIDE_SCOPE' | 'NO_APPLICABLE_RULE' | 'INSUFFICIENT_SOURCE' };

export class ApplicabilityService {
  constructor(private readonly repository: ILegalRuleRepository) {}

  async getApplicableRules(query: ApplicabilityQuery): Promise<ApplicabilityResult> {
    if (query.jurisdictionStatus === 'OUTSIDE_SCOPE') {
      return { status: 'OUTSIDE_SCOPE' };
    }

    if (query.jurisdictionStatus === 'JURISDICTION_UNCLEAR') {
      return { status: 'JURISDICTION_UNCLEAR' };
    }

    const allActiveRules = await this.repository.getActiveRules();
    
    // Determine potentially applicable rules by jurisdiction and document type
    const candidateRules = allActiveRules.filter(rule => {
      // Document Type
      if (!rule.document_types.includes(query.documentType)) {
        return false;
      }
      // Jurisdiction (Exact match or CENTRAL if appropriate. For now exact match)
      // Assuming central rules have jurisdiction 'CENTRAL'. We allow both matching jurisdiction and 'CENTRAL'
      if (rule.jurisdiction !== query.jurisdictionValue && rule.jurisdiction !== 'CENTRAL') {
        return false;
      }
      return true;
    });

    if (candidateRules.length === 0) {
      return { status: 'NO_APPLICABLE_RULE' };
    }

    // Temporal Applicability
    const temporallyValidRules = candidateRules.filter(rule => {
      if (!query.relevantDate) {
        // If relevantDate is unknown, we cannot safely select a rule if there are temporal restrictions.
        // But if there's only one rule, maybe it's safe? The docs say:
        // "surface uncertainty rather than silently selecting a rule, if temporal differences materially affect applicability."
        // We will keep them for now, but mark it for INSUFFICIENT_SOURCE if ambiguity exists? 
        // Actually, if we don't know the date, we should fail safely if there are effective_from/to constraints that might exclude it.
        // Since we don't have a specific way to determine material difference yet, let's include it but maybe downstream handles ambiguity.
        // Wait, "If relevantDate is unknown: surface uncertainty rather than silently selecting a rule, if temporal differences materially affect applicability."
        // If effective_from > "Unix Epoch" or something, any rule has an effective_from. 
        // If we don't know the date, we return INSUFFICIENT_SOURCE to surface uncertainty.
        return false; 
      }

      const date = query.relevantDate.getTime();
      const from = rule.effective_from.getTime();
      
      // effective_from <= relevant_date
      if (from > date) {
        return false;
      }

      // relevant_date < effective_to
      if (rule.effective_to) {
        const to = rule.effective_to.getTime();
        if (date >= to) {
          return false;
        }
      }

      return true;
    });

    if (temporallyValidRules.length === 0) {
      // If we filtered everything out due to date (or lack of date), we have NO_APPLICABLE_RULE
      // Wait, if lack of date caused it, is it NO_APPLICABLE_RULE or INSUFFICIENT_SOURCE?
      // "If relevantDate is unknown... surface uncertainty". We can return INSUFFICIENT_SOURCE.
      if (!query.relevantDate) {
        return { status: 'INSUFFICIENT_SOURCE' };
      }
      return { status: 'NO_APPLICABLE_RULE' };
    }

    // Source Relationship Resolution
    // Retain rules that reference at least one LegalSource whose verification_status is VERIFIED
    // We need to fetch all relevant source_ids
    const allSourceIds = new Set<string>();
    temporallyValidRules.forEach(r => r.source_ids.forEach(id => allSourceIds.add(id)));
    
    const sources = await this.repository.getSourcesByIds(Array.from(allSourceIds));
    const verifiedSourceIds = new Set(
      sources.filter(s => s.verification_status === 'VERIFIED').map(s => s.source_id)
    );

    const verifiedRules = temporallyValidRules.filter(rule => {
      // Must have at least one verified source
      return rule.source_ids.some(id => verifiedSourceIds.has(id));
    });

    if (verifiedRules.length === 0) {
      return { status: 'INSUFFICIENT_SOURCE' };
    }

    return { status: 'SUCCESS', rules: verifiedRules };
  }
}
