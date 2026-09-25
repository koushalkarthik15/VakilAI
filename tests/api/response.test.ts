import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse } from '@/core/api/response';
import { AppClientError } from '@/core/errors';
import fs from 'fs';
import path from 'path';

describe('API Response Adapters', () => {
  it('should format a successful response', async () => {
    const response = successResponse({ msg: 'hello' });
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      msg: 'hello'
    });
  });

  it('should correctly map AppClientError to 400 BAD_REQUEST', async () => {
    const clientError = new AppClientError('Invalid document type provided');
    const response = errorResponse(clientError);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toEqual({
      error_code: 'BAD_REQUEST',
      error: 'Invalid document type provided'
    });
  });

  it('should sanitize unknown errors to 500 INTERNAL_ERROR and hide stack/message', async () => {
    const secretError = new Error('Database connection failed with credentials admin:password123');
    const response = errorResponse(secretError);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body).toEqual({
      error_code: 'INTERNAL_ERROR',
      error: 'An unexpected error occurred'
    });

    // Explicitly verify the leak does not occur
    const responseText = JSON.stringify(body);
    expect(responseText).not.toContain('Database connection failed');
    expect(responseText).not.toContain('password123');
    expect(responseText).not.toContain('Error:'); // Stack trace indicator
  });

  it('should enforce architectural boundaries - core must not import next/server', () => {
    const coreApiPath = path.join(__dirname, '../../src/core/api/contract.ts');
    const coreErrorsPath = path.join(__dirname, '../../src/core/errors/index.ts');

    const apiContent = fs.readFileSync(coreApiPath, 'utf-8');
    const errorsContent = fs.readFileSync(coreErrorsPath, 'utf-8');

    expect(apiContent).not.toContain('next/server');
    expect(errorsContent).not.toContain('next/server');
    expect(apiContent).not.toContain('NextResponse');
    expect(errorsContent).not.toContain('NextResponse');
  });
});
