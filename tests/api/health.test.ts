/**
 * @vitest-environment node
 */
import { GET } from '@/app/api/health/route';

describe('Health API Route', () => {
  it('should return 200 OK and match ApiResponse contract', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });
});
