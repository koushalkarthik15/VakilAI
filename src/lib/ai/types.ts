/**
 * AI Provider Types
 * 
 * Defines the strict, provider-independent boundaries for the AI layer.
 */

export interface AIRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export interface AIResult {
  /** The raw, untrusted text/JSON string returned from the provider */
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AIProvider {
  /**
   * Sends the request to the provider.
   * Throws an AIProviderError (extending DomainError) on SDK/provider failure.
   */
  generate(request: AIRequest): Promise<AIResult>;
}
