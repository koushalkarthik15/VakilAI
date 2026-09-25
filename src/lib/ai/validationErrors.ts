import { DomainError } from '../../core/errors';
import { ZodError, ZodIssue } from 'zod';

export type AIValidationErrorCode = 
  | 'OVERSIZED_RESPONSE'
  | 'MALFORMED_JSON'
  | 'SCHEMA_VIOLATION'
  | 'INVALID_PROVENANCE'
  | 'EMPTY_RESPONSE';

export interface SafeZodIssue {
  code: string;
  path: (string | number)[];
  message: string;
  // NOTE: Deliberately omitting `input` to prevent PII leakage
}

/**
 * AIValidationError
 * 
 * Represents a failure in validating untrusted AI output against our strict schemas.
 * Normalizes Zod issues and JSON parse errors while strictly preventing raw payload 
 * text or PII (e.g. from Zod issue.input) from leaking into the error message.
 */
export class AIValidationError extends DomainError {
  constructor(
    message: string,
    code: AIValidationErrorCode,
    context?: Record<string, unknown>
  ) {
    super(message, code, 'HIGH', context);
    this.name = 'AIValidationError';
  }

  /**
   * Safely creates an AIValidationError from a ZodError, extracting only safe metadata.
   */
  static fromZodError(error: ZodError): AIValidationError {
    const safeIssues: SafeZodIssue[] = error.issues.map((issue: ZodIssue) => ({
      code: issue.code,
      path: issue.path as (string | number)[],
      message: issue.message
    }));

    return new AIValidationError(
      'AI output failed strict schema validation',
      'SCHEMA_VIOLATION',
      { issues: safeIssues }
    );
  }
}
