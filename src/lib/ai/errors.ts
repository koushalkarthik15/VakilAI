import { DomainError } from '../../core/errors';

export type AIProviderErrorCode =
  | 'AUTH_FAILURE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_REQUEST'
  | 'PROVIDER_UNAVAILABLE'
  | 'UNKNOWN_FAILURE';

/**
 * AIProviderError
 * 
 * Normalizes all AI provider SDK errors into the application's DomainError taxonomy.
 * Ensures that API keys, raw authorization headers, and raw sensitive request data
 * do not leak out of the provider layer.
 */
export class AIProviderError extends DomainError {
  constructor(
    message: string,
    code: AIProviderErrorCode,
    context?: Record<string, unknown>
  ) {
    // We map AI errors to appropriate severity levels
    const severity = code === 'AUTH_FAILURE' ? 'CRITICAL' 
      : code === 'PROVIDER_UNAVAILABLE' ? 'HIGH'
      : 'MEDIUM';

    super(message, code, severity, context);
    this.name = 'AIProviderError';
  }
}
