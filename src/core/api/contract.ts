/**
 * API Contract
 * 
 * Defines the strict response boundaries for the application.
 * Ensures consistent success and error shapes, while preventing arbitrary string errors.
 */

export type ApiErrorCode = 'BAD_REQUEST' | 'INTERNAL_ERROR' | string;

export interface ApiErrorDetails {
  error_code: ApiErrorCode;
  error: string;
}

export type ApiResponse<T = unknown> = T | ApiErrorDetails;

