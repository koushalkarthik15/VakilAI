import { describe, it, expect } from 'vitest';
import nextConfig from '../../../next.config';

describe('S9-M9.2 Security Headers', () => {
  it('configures required security headers', async () => {
    const headersFn = nextConfig.headers;
    expect(headersFn).toBeDefined();

    const headersList = await headersFn!();
    expect(headersList.length).toBeGreaterThan(0);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalHeaders = headersList.find((h: any) => h.source === '/(.*)')?.headers;
    expect(globalHeaders).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getHeader = (key: string) => globalHeaders?.find((h: any) => h.key === key)?.value;

    expect(getHeader('X-Content-Type-Options')).toBe('nosniff');
    expect(getHeader('X-Frame-Options')).toBe('DENY');
    expect(getHeader('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    
    // HSTS must NOT contain preload for V1
    const hsts = getHeader('Strict-Transport-Security');
    expect(hsts).toContain('max-age=31536000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).not.toContain('preload');

    // CSP must not contain unsafe-eval and must restrict object-src
    const csp = getHeader('Content-Security-Policy');
    expect(csp).toBeDefined();
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("object-src 'none'");
  });
});
