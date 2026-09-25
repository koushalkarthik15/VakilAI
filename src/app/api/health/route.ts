import { successResponse } from '@/core/api/response';

export async function GET() {
  return successResponse({ status: 'ok', timestamp: new Date().toISOString() });
}
