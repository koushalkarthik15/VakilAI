import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroqProvider } from '../../../src/lib/ai/GroqProvider';
import { AIProviderError } from '../../../src/lib/ai/errors';


// Mock the Groq SDK
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));

vi.mock('groq-sdk', () => {
  return {
    default: class {
      chat: any /* eslint-disable-line @typescript-eslint/no-explicit-any */;
      constructor() {
        this.chat = {
          completions: {
            create: mockCreate
          }
        };
      }
    }
  };
});

describe('GroqProvider', () => {
  const mockApiKey = 'mock-groq-key';
  const mockModel = 'mock-groq-model';
  let provider: GroqProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new GroqProvider(mockApiKey, mockModel);
  });

  it('successfully generates content', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Mocked response' } }],
      usage: { prompt_tokens: 10, completion_tokens: 20 }
    });

    const result = await provider.generate({
      systemPrompt: 'System',
      userPrompt: 'User'
    });

    expect(result.content).toBe('Mocked response');
    expect(result.usage).toEqual({ promptTokens: 10, completionTokens: 20 });
    expect(mockCreate).toHaveBeenCalledWith({
      model: mockModel,
      temperature: 0,
      messages: [
        { role: 'system', content: 'System' },
        { role: 'user', content: 'User' }
      ]
    });
  });

  it('normalizes 429 Rate Limit errors', async () => {
    mockCreate.mockRejectedValueOnce({ status: 429, message: 'Too Many Requests' });

    await expect(provider.generate({
      systemPrompt: 'System',
      userPrompt: 'User'
    })).rejects.toThrowError(
      new AIProviderError('Groq Rate Limit Exceeded', 'RATE_LIMIT_EXCEEDED')
    );
  });

  it('normalizes 401 Auth errors', async () => {
    mockCreate.mockRejectedValueOnce({ status: 401, message: 'Unauthorized' });

    await expect(provider.generate({
      systemPrompt: 'S', userPrompt: 'U'
    })).rejects.toThrowError(
      new AIProviderError('Groq Authentication Failed', 'AUTH_FAILURE')
    );
  });
});
