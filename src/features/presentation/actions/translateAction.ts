"use server";

import { TranslationService } from '../services/TranslationService';
import { ProviderFactory } from '../../../lib/ai/ProviderFactory';
import { TranslatedPresentationDTO } from '../contracts/translationContracts';

export async function translatePresentationAction(
  payload: Partial<TranslatedPresentationDTO>,
  targetLanguage: 'TE' | 'HI'
): Promise<TranslatedPresentationDTO> {
  const provider = ProviderFactory.getGeminiProvider();
  const service = new TranslationService(provider);
  return await service.translatePresentation(payload, targetLanguage);
}
