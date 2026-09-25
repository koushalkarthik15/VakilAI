import { NextResponse } from 'next/server';
import { ApiResponse, ApiErrorCode } from '@/core/api/contract';
import { AppClientError } from '@/core/errors';

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json(data, { status: 200 });
}

export function errorResponse(
  error: unknown,
  defaultErrorCode: ApiErrorCode = 'INTERNAL_ERROR',
  defaultStatus: number = 500,
  defaultMessage: string = 'An unexpected error occurred'
): NextResponse<ApiResponse> {
  let status = defaultStatus;
  let error_code: ApiErrorCode = defaultErrorCode;
  let message = defaultMessage;

  if (error instanceof AppClientError) {
    status = 400;
    error_code = 'BAD_REQUEST';
    message = error.message; // Safe to expose client errors
  } else if (error instanceof Error && error.name) {
    // Preserve custom error names (e.g. AIProviderError)
    if (error.name !== 'Error') {
      error_code = error.name;
      message = error.message;
      if (error_code === 'AIProviderError' || error_code === 'PROVIDER_ERROR') {
        status = 400;
      }
    }
  }

  // Allow explicit overrides if provided as plain objects or strings
  if (typeof error === 'string') {
    message = error;
  }

  return NextResponse.json(
    {
      error: message,
      error_code
    },
    { status }
  );
}
