import { GoogleGenAI } from '@google/genai';
import { AIProvider, AIRequest, AIResult } from './types';
import { AIProviderError } from './errors';

export class GeminiProvider implements AIProvider {
  private primaryClient: GoogleGenAI;
  private secondaryClient: GoogleGenAI | null;
  private primaryModel: string;
  private secondaryModel: string | null;

  constructor(
    primaryKey: string,
    primaryModel: string,
    secondaryKey?: string,
    secondaryModel?: string
  ) {
    if (!primaryKey) throw new Error('GEMINI_API_KEY is required');
    if (!primaryModel) throw new Error('GEMINI_MODEL is required');
    
    this.primaryClient = new GoogleGenAI({ apiKey: primaryKey });
    this.primaryModel = primaryModel;
    
    if (secondaryKey && secondaryModel) {
      this.secondaryClient = new GoogleGenAI({ apiKey: secondaryKey });
      this.secondaryModel = secondaryModel;
    } else {
      this.secondaryClient = null;
      this.secondaryModel = null;
    }
  }

  async generate(request: AIRequest): Promise<AIResult> {
    try {
      return await this.execute(this.primaryClient, this.primaryModel, request);
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      const isRateLimit = this.isRateLimitError(error);
      
      // Failover to secondary if configured and primary hit a rate limit
      if (isRateLimit && this.secondaryClient && this.secondaryModel) {
        try {
          return await this.execute(this.secondaryClient, this.secondaryModel, request);
        } catch (secondaryError: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
          this.handleError(secondaryError); // If secondary fails, normalize and throw
        }
      }
      
      // If not rate limit, or no secondary configured, normalize and throw primary error
      this.handleError(error);
    }
  }

  private async execute(client: GoogleGenAI, model: string, request: AIRequest): Promise<AIResult> {
    const response = await client.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: request.systemPrompt + '\n\n' + request.userPrompt }] }
      ],
      config: {
        temperature: request.temperature ?? 0,
      }
    });

    return {
      content: response.text || '',
      usage: response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount ?? 0,
        completionTokens: response.usageMetadata.candidatesTokenCount ?? 0
      } : undefined
    };
  }

  private isRateLimitError(error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): boolean {
    return error?.status === 429;
  }

  private handleError(error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): never {
    const status = error?.status;
    const timestamp = new Date().toISOString();
    
    // Determine generic category
    let category: import('./errors').AIProviderErrorCode = 'UNKNOWN_FAILURE';
    let isRetryable = false;
    let genericMessage = 'An unexpected AI provider error occurred';
    
    if (status === 401 || status === 403) {
      category = 'AUTH_FAILURE';
      genericMessage = 'AI Provider Authentication Failed';
    } else if (status === 429) {
      category = 'RATE_LIMIT_EXCEEDED';
      isRetryable = true;
      genericMessage = 'AI Provider Rate Limit Exceeded';
    } else if (status === 400) {
      category = 'INVALID_REQUEST';
      genericMessage = 'Invalid AI Provider Request';
    } else if (status === 500 || status === 503) {
      category = 'PROVIDER_UNAVAILABLE';
      isRetryable = true;
      genericMessage = 'AI Provider Unavailable';
    }

    // Server-side diagnostic logging (safe metadata only, NEVER raw messages/keys)
    console.error(JSON.stringify({
      level: 'error',
      timestamp,
      provider: 'Gemini',
      operation: 'generateContent',
      error_category: category,
      status: status || 'unknown',
      retryable: isRetryable
    }));

    throw new AIProviderError(genericMessage, category);
  }
}
