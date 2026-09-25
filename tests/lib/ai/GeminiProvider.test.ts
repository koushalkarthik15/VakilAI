import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiProvider } from '../../../src/lib/ai/GeminiProvider';
import { AIProviderError } from '../../../src/lib/ai/errors';

const mockGenerateContent = vi.fn();

describe('GeminiProvider', () => {
  let provider: GeminiProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new GeminiProvider(
      'primary-key',
      'primary-model',
      'secondary-key',
      'secondary-model'
    );

    // Override the real clients with our mock to avoid vi.mock cache issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (provider as any).primaryClient = {
      models: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        generateContent: (...args: any[]) => mockGenerateContent('primary-key', ...args)
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (provider as any).secondaryClient = {
      models: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        generateContent: (...args: any[]) => mockGenerateContent('secondary-key', ...args)
      }
    };
  });

  it('successfully generates content with primary key', async () => {
    mockGenerateContent.mockImplementation(async (apiKey) => {
      if (apiKey === 'primary-key') {
        return { text: 'Primary success', usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 10 } };
      }
      throw new Error('Unexpected call');
    });

    const result = await provider.generate({ systemPrompt: 'Sys', userPrompt: 'User' });
    expect(result.content).toBe('Primary success');
    expect(result.usage).toEqual({ promptTokens: 5, completionTokens: 10 });
    
    // Check that secondary was not called
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('fails over to secondary key on 429 rate limit', async () => {
    mockGenerateContent.mockImplementation(async (apiKey) => {
      if (apiKey === 'primary-key') {
        throw { status: 429, message: 'Rate Limit' };
      }
      if (apiKey === 'secondary-key') {
        return { text: 'Secondary success' };
      }
    });

    const result = await provider.generate({ systemPrompt: 'Sys', userPrompt: 'User' });
    expect(result.content).toBe('Secondary success');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('throws normalized RATE_LIMIT_EXCEEDED if secondary also hits 429', async () => {
    mockGenerateContent.mockImplementation(async () => {
      throw { status: 429, message: 'Rate Limit' };
    });

    await expect(provider.generate({ systemPrompt: 'S', userPrompt: 'U' }))
      .rejects.toThrowError(new AIProviderError('AI Provider Rate Limit Exceeded', 'RATE_LIMIT_EXCEEDED'));
  });

  it('does NOT fail over on 401 Auth Error', async () => {
    mockGenerateContent.mockImplementation(async (apiKey) => {
      if (apiKey === 'primary-key') {
        throw { status: 401, message: 'Unauthorized' };
      }
    });

    await expect(provider.generate({ systemPrompt: 'S', userPrompt: 'U' }))
      .rejects.toThrowError(new AIProviderError('AI Provider Authentication Failed', 'AUTH_FAILURE'));
      
    // Verify secondary was skipped
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('sanitizes raw provider errors and securely logs diagnostic metadata', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockGenerateContent.mockImplementation(async () => {
      throw { status: 400, message: 'API key not valid. Please pass a valid API key.' };
    });

    await expect(provider.generate({ systemPrompt: 'S', userPrompt: 'U' }))
      .rejects.toThrowError(new AIProviderError('Invalid AI Provider Request', 'INVALID_REQUEST'));

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logCall = consoleSpy.mock.calls[0][0];
    const parsedLog = JSON.parse(logCall);
    
    expect(parsedLog.error_category).toBe('INVALID_REQUEST');
    expect(parsedLog.status).toBe(400);
    expect(parsedLog.provider).toBe('Gemini');
    // Ensure raw message is completely absent from the standard log
    expect(logCall).not.toContain('API key not valid');
    
    consoleSpy.mockRestore();
  });
});
