/**
 * Application Error Boundaries
 * 
 * Defines the standard error structures used across the application.
 * All feature modules must use these core error types when throwing or rejecting.
 */

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ApplicationError extends Error {
  code: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
}

export class DomainError extends Error implements ApplicationError {
  severity: ErrorSeverity;
  code: string;
  context?: Record<string, unknown>;

  constructor(message: string, code: string, severity: ErrorSeverity = 'MEDIUM', context?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.severity = severity;
    this.context = context;
  }
}

/**
 * AppClientError
 * 
 * Represents an expected application error triggered by bad client input or 
 * invalid workflow state. Does not include HTTP-specific logic. 
 * Expected to be mapped to 400 Bad Request by the API adapter.
 */
export class AppClientError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    // Hardcode BAD_REQUEST code to map directly to ApiErrorCode later
    super(message, 'BAD_REQUEST', 'LOW', context);
    this.name = 'AppClientError';
  }
}

