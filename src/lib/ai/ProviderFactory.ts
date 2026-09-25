import { GeminiProvider } from './GeminiProvider';
import { GroqProvider } from './GroqProvider';
import { MockProvider } from './MockProvider';
import { AIProvider } from './types';

export class ProviderFactory {
  static getGeminiProvider(): AIProvider {
    if (process.env.MOCK_AI_PROVIDERS === 'true') {
      return new MockProvider('Gemini');
    }
    return new GeminiProvider(
      process.env.GEMINI_API_KEY!,
      process.env.GEMINI_MODEL!,
      process.env.GEMINI_API_KEY_SECONDARY,
      process.env.GEMINI_MODEL_SECONDARY
    );
  }

  static getGroqProvider(): AIProvider {
    if (process.env.MOCK_AI_PROVIDERS === 'true') {
      return new MockProvider('Groq');
    }
    return new GroqProvider(
      process.env.GROQ_API_KEY!,
      process.env.GROQ_MODEL!
    );
  }
}
