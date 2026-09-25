"use server";

import { TranslationService } from '../services/TranslationService';
import { GeminiProvider } from '../../../lib/ai/GeminiProvider';
import { TranslatedPresentationDTO } from '../contracts/translationContracts';

export async function translatePresentationAction(
  payload: Partial<TranslatedPresentationDTO>,
  targetLanguage: 'TE' | 'HI'
): Promise<TranslatedPresentationDTO> {
  const provider = new GeminiProvider(
    process.env.GEMINI_API_KEY || '',
    process.env.GEMINI_MODEL || 'gemini-1.5-pro'
  );
  const service = new TranslationService(provider);
  return await service.translatePresentation(payload, targetLanguage);
}
