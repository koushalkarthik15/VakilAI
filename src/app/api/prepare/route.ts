import { successResponse, errorResponse } from '@/core/api/response';
import crypto from 'crypto';
import { PreparationService } from '@/features/prepare/services/PreparationService';
import { ProviderFactory } from '@/lib/ai/ProviderFactory';
import { logger } from '@/core/logging/logger';

export async function POST(req: Request) {
  const request_id = crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    logger.prepareReceived({ request_id });

    const geminiProvider = ProviderFactory.getGeminiProvider();
    const preparationService = new PreparationService(geminiProvider);

    const body = await req.json();
    const { 
      analysisContext, 
      comparisonContext, 
      actionContext, 
      userGoal 
    } = body;

    if (!analysisContext || !comparisonContext || !actionContext || !userGoal) {
      logger.prepareFailed({ request_id, error_code: 'INVALID_REQUEST' });
      return errorResponse('Missing required contexts or goal', 'INVALID_REQUEST', 400);
    }

    const prepareResult = await preparationService.generatePreparation(
      analysisContext,
      comparisonContext,
      actionContext,
      userGoal
    );

    logger.prepareCompleted({ request_id, duration_ms: Date.now() - startTime });

    return successResponse({
      status: 'SUCCESS',
      prepareContext: prepareResult.context
    });

  } catch (error: unknown) {
    const errorCode = error instanceof Error && error.name ? error.name : 'INTERNAL_ERROR';
    logger.prepareFailed({ request_id, error_code: errorCode });
    
    return errorResponse(error, errorCode, 500, 'Preparation failed');
  }
}
