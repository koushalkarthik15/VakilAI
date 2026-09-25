import { successResponse, errorResponse } from '@/core/api/response';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import { logger } from '@/core/logging/logger';

// Domain Services
import { classifyDocument } from '@/features/document/services/classification';
import { PseudonymizationService } from '@/core/privacy/pseudonymizationService';
import { PresentationRestorer } from '@/core/privacy/presentationRestorer';
import { UnderstandingService } from '@/features/understand/services/UnderstandingService';
import { ApplicabilityService } from '@/features/legal-kb/services/applicabilityService';
import { FlaggingService } from '@/features/flag/services/FlaggingService';
import { ComparisonService } from '@/features/compare/services/ComparisonService';
import { ActionService } from '@/features/act/services/ActionService';

// AI Providers
import { ProviderFactory } from '@/lib/ai/ProviderFactory';

// Repositories
import { LegalRuleRepository } from '@/features/legal-kb/repositories/legalRuleRepository';

// Context Types
import { DocumentContext } from '@/core/contexts/contracts';

export async function POST(req: Request) {
  const request_id = crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    logger.analysisReceived({ request_id });

    // Initialize Services inside handler so process.env is fully loaded
    const geminiProvider = ProviderFactory.getGeminiProvider();
    const groqProvider = ProviderFactory.getGroqProvider();
    const ruleRepository = new LegalRuleRepository();
    const understandingService = new UnderstandingService(geminiProvider);
    const applicabilityService = new ApplicabilityService(ruleRepository);
    const flaggingService = new FlaggingService(groqProvider);
    const comparisonService = new ComparisonService(groqProvider);
    const actionService = new ActionService();

    const body = await req.json();
    const { text, filename, mime_type = 'application/pdf' } = body;

    if (!text || typeof text !== 'string') {
      logger.analysisFailed({ request_id, duration_ms: Date.now() - startTime, error_code: 'INVALID_REQUEST' });
      return errorResponse('Missing or invalid text payload', 'INVALID_REQUEST', 400);
    }

    const document_id = crypto.randomUUID();

    // 1. Classification
    const classification = classifyDocument(text);
    logger.analysisStageCompleted({ request_id, stage: 'classification', duration_ms: Date.now() - startTime, status: classification.type });

    // E2E test hook: simulate provider failure by filename (pdfjs may mangle special chars in text)
    if (process.env.MOCK_AI_PROVIDERS === 'true' && filename && filename.includes('FAIL_PROVIDER')) {
      logger.analysisFailed({ request_id, duration_ms: Date.now() - startTime, error_code: 'AIProviderError' });
      return errorResponse('Simulated provider failure', 'AIProviderError', 500);
    }
    
    if (classification.type === 'UNSUPPORTED' || classification.type === 'UNKNOWN') {
      logger.analysisCompleted({ request_id, duration_ms: Date.now() - startTime, status: classification.type });
      return successResponse({
        document_id,
        filename,
        classification,
        status: classification.type
      });
    }

    // Connect to DB for Legal KB lookups
    await dbConnect();

    // 2. Document Context & Pseudonymization
    const rawDocumentContext: DocumentContext = {
      metadata: {
        schema_version: '1.0',
        session_id: request_id,
        document_id,
        created_at: new Date().toISOString(),
        source_stage: 'extraction'
      },
      document: {
        document_id,
        filename,
        page_count: 1,
        mime_type
      },
      extraction: {
        status: 'SUCCESS',
        pages: [1],
        text
      },
      clauses: []
    };

    const { pseudonymizedContext, mapping: piiMap } = PseudonymizationService.pseudonymizeDocument(rawDocumentContext);

    // 3. Understanding
    const understandingStart = Date.now();
    const understandingContext = await understandingService.extractUnderstanding(pseudonymizedContext, {
      deterministicClassification: classification,
      // For V1, default to SUPPORTED if not found
      deterministicJurisdiction: { status: 'SUPPORTED' }
    });
    logger.analysisStageCompleted({ request_id, stage: 'understanding', duration_ms: Date.now() - understandingStart });

    // 4. Applicability
    const applicabilityStart = Date.now();
    const jurisdictionFact = understandingContext.document_facts.find(f => f.field === 'JURISDICTION');
    const jurisdictionValue = jurisdictionFact?.value || 'CENTRAL';
    
    const jurisdictionStatus = (jurisdictionFact?.status === 'UNCLEAR' || jurisdictionFact?.status === 'NOT_STATED') 
      ? 'JURISDICTION_UNCLEAR' 
      : 'SUPPORTED';
    
    const applicabilityQuery = {
      jurisdictionStatus: jurisdictionStatus as 'SUPPORTED' | 'OUTSIDE_SCOPE' | 'JURISDICTION_UNCLEAR',
      jurisdictionValue,
      documentType: classification.type,
      relevantDate: new Date() 
    };
    
    const applicabilityResult = await applicabilityService.getApplicableRules(applicabilityQuery);
    logger.analysisStageCompleted({ request_id, stage: 'applicability', duration_ms: Date.now() - applicabilityStart });

    // 5. Flagging
    const flaggingStart = Date.now();
    const analysisContext = await flaggingService.analyze(understandingContext, applicabilityResult);
    logger.analysisStageCompleted({ request_id, stage: 'flagging', duration_ms: Date.now() - flaggingStart });

    // 6. Comparison
    const comparisonStart = Date.now();
    const comparisonContext = await comparisonService.compare(understandingContext, analysisContext);
    logger.analysisStageCompleted({ request_id, stage: 'comparison', duration_ms: Date.now() - comparisonStart });

    // 7. Act
    const actStart = Date.now();
    const actionContext = await actionService.generateActionContext(analysisContext, comparisonContext);
    logger.analysisStageCompleted({ request_id, stage: 'action_mapping', duration_ms: Date.now() - actStart });

    logger.analysisCompleted({ request_id, duration_ms: Date.now() - startTime, status: 'SUCCESS' });

    // Return the aggregated V1 session contexts
    return successResponse({
      document_id,
      filename,
      classification,
      status: 'SUCCESS',
      understandingContext: PresentationRestorer.restoreUnderstandingContext(understandingContext, piiMap),
      analysisContext: PresentationRestorer.restoreAnalysisContext(analysisContext, piiMap),
      comparisonContext: PresentationRestorer.restoreComparisonContext(comparisonContext, piiMap),
      actionContext: PresentationRestorer.restoreActionContext(actionContext, piiMap)
    });

  } catch (error: unknown) {
    console.error('API Error in /api/analyze:', error);
    const errorCode = error instanceof Error && error.name ? error.name : 'INTERNAL_ERROR';
    const errorMessage = error instanceof Error ? error.message : 'Analysis pipeline failed';
    
    logger.analysisFailed({ 
      request_id,
      duration_ms: Date.now() - startTime,
      error_code: errorCode 
    });
    
    
    const statusCode = errorCode === 'AIProviderError' || errorCode === 'PROVIDER_ERROR' ? 400 : 500;
    
    return errorResponse(error, errorCode, statusCode, errorMessage);
  }
}
