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

    if (process.env.MOCK_AI_PROVIDERS === 'true') {
      // In mock mode, skip MongoDB queries and use AI mock directly
      const { validateAIOutput } = await import('@/lib/ai/validator');
      const { PreparationOutputSchema } = await import('@/features/prepare/contracts/preparationOutput');
      
      const aiResult = await geminiProvider.generate({
        systemPrompt: 'Preparation',
        userPrompt: userGoal,
        temperature: 0
      });
      
      const output = validateAIOutput(PreparationOutputSchema, aiResult);
      
      const prepareContext = {
        metadata: {
          schema_version: '1.0',
          session_id: request_id,
          document_id: 'mock-doc',
          created_at: new Date().toISOString(),
          source_stage: 'prepare'
        },
        selected_findings: analysisContext.findings || [],
        selected_actions: actionContext.action_items || [],
        user_goal: userGoal,
        required_information: [],
        verified_sources: [],
        output_format: 'JSON matching PreparationOutputSchema',
        output
      };

      logger.prepareCompleted({ request_id, duration_ms: Date.now() - startTime });
      return successResponse({ status: 'SUCCESS', prepareContext });
    }

    const { default: dbConnect } = await import('@/lib/dbConnect');
    await dbConnect();

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
