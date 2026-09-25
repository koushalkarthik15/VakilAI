import { DocumentContext } from '../contexts/contracts';

export type PiiCategory = 'PERSON_NAME' | 'EMAIL' | 'PHONE' | 'AADHAAR' | 'PAN';

export interface PiiMapping {
  placeholder: string;
  category: PiiCategory;
  original: string;
}

/**
 * A branded type that guarantees the DocumentContext has been successfully
 * processed by the PseudonymizationService.
 * 
 * This type is not freely constructible. It must be returned by the
 * PseudonymizationService after runtime invariant checks.
 */
export type PseudonymizedDocumentContext = DocumentContext & { 
  readonly _isPseudonymized: unique symbol;
};
