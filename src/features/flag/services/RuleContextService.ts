import { UnderstandingContext } from '../../../core/contexts/contracts';
import { ApplicabilityService, ApplicabilityResult, ApplicabilityQuery } from '../../legal-kb/services/applicabilityService';

export class RuleContextService {
  constructor(private readonly applicabilityService: ApplicabilityService) {}

  /**
   * Derives deterministic rule applicability directly from the AI-extracted UnderstandingContext.
   */
  async getApplicableRulesForContext(context: UnderstandingContext): Promise<ApplicabilityResult> {
    const { classification, jurisdiction, document_facts } = context;

    // 1. Check Jurisdiction Status
    if (jurisdiction.status === 'OUTSIDE_SCOPE') {
      return { status: 'OUTSIDE_SCOPE' };
    }
    if (jurisdiction.status === 'JURISDICTION_UNCLEAR') {
      return { status: 'JURISDICTION_UNCLEAR' };
    }

    // 2. Resolve document type
    const documentType = classification.type;
    if (documentType === 'UNKNOWN' || documentType === 'UNSUPPORTED') {
      return { status: 'OUTSIDE_SCOPE' }; // Or another failure state; but usually UNKNOWN halts early in S1
    }

    // 3. Resolve explicitly established date
    // Precedence: effective_date > execution_date
    const effectiveDateFact = document_facts.find(f => f.field === 'effective_date');
    const executionDateFact = document_facts.find(f => f.field === 'execution_date');

    let relevantDate: Date | undefined;

    if (effectiveDateFact?.status === 'STATED' && effectiveDateFact.value) {
      const parsed = new Date(effectiveDateFact.value);
      if (!isNaN(parsed.getTime())) {
        relevantDate = parsed;
      }
    } 
    
    if (!relevantDate && executionDateFact?.status === 'STATED' && executionDateFact.value) {
      const parsed = new Date(executionDateFact.value);
      if (!isNaN(parsed.getTime())) {
        relevantDate = parsed;
      }
    }

    // SAFE / STRICT DATE HANDLING:
    // If we could not extract a reliable date, we must explicitly fail with INSUFFICIENT_SOURCE.
    // We do NOT fallback to new Date() or assume current law.
    if (!relevantDate) {
      return { status: 'INSUFFICIENT_SOURCE' };
    }

    // 4. Construct Query
    const query: ApplicabilityQuery = {
      jurisdictionStatus: jurisdiction.status,
      // For now, we map SUPPORTED to 'TELANGANA' by default if no specific value is provided,
      // but ideally this is extracted explicitly. We will assume 'TELANGANA' for V1.
      jurisdictionValue: 'TELANGANA', 
      documentType,
      relevantDate
    };

    // 5. Call deterministic service
    return await this.applicabilityService.getApplicableRules(query);
  }
}
