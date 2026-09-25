import Groq from 'groq-sdk';
import { AIProvider, AIRequest, AIResult } from './types';
import { AIProviderError } from './errors';

export class GroqProvider implements AIProvider {
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model: string) {
    if (!apiKey) throw new Error('GROQ_API_KEY is required');
    if (!model) throw new Error('GROQ_MODEL is required');
    
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async generate(request: AIRequest): Promise<AIResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: request.temperature ?? 0,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt }
        ]
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        content,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens
        } : undefined
      };
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      this.handleError(error);
    }
  }

  private handleError(error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): never {
    const status = error?.status;
    const message = error?.message || 'Unknown Groq Error';

    // Normalize error without leaking sensitive raw request/response objects
    if (status === 401 || status === 403) {
      throw new AIProviderError('Groq Authentication Failed', 'AUTH_FAILURE');
    }
    if (status === 429) {
      throw new AIProviderError('Groq Rate Limit Exceeded', 'RATE_LIMIT_EXCEEDED');
    }
    if (status === 400 || status === 422) {
      throw new AIProviderError(`Invalid Groq Request: ${message}`, 'INVALID_REQUEST');
    }
    if (status === 500 || status === 503) {
      throw new AIProviderError('Groq Provider Unavailable', 'PROVIDER_UNAVAILABLE');
    }

    throw new AIProviderError(message, 'UNKNOWN_FAILURE');
  }
}
