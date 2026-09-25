export type LogLevel = 'info' | 'warn' | 'error';

export type LogEvent = 
  | { event: 'analysis.request.received', request_id: string }
  | { event: 'analysis.stage.completed', request_id: string, stage: string, duration_ms: number, status?: string }
  | { event: 'analysis.completed', request_id: string, duration_ms: number, status?: string }
  | { event: 'analysis.failed', request_id: string, duration_ms: number, error_code: string }
  | { event: 'provider.request.started', request_id: string, provider: string, stage: string }
  | { event: 'provider.request.completed', request_id: string, provider: string, stage: string, duration_ms: number }
  | { event: 'provider.request.failed', request_id: string, provider: string, stage: string, error_code: string }
  | { event: 'ai.validation.failed', request_id: string, stage: string, provider: string, error_code: string }
  | { event: 'legal_kb.lookup.completed', request_id: string, stage: string, duration_ms: number, status?: string }
  | { event: 'legal_kb.lookup.failed', request_id: string, stage: string, error_code: string }
  | { event: 'pdf.extraction.completed', request_id: string, document_id?: string, duration_ms: number, status?: string }
  | { event: 'pdf.extraction.failed', request_id: string, document_id?: string, error_code: string }
  | { event: 'prepare.request.received', request_id: string }
  | { event: 'prepare.completed', request_id: string, duration_ms: number }
  | { event: 'prepare.failed', request_id: string, error_code: string };

class StructuredLogger {
  private log(level: LogLevel, data: LogEvent) {
    // Only the exact keys defined in the union type are expected by the TypeScript compiler.
    // By using a strict allow-list approach, we prevent arbitrary object payloads from being logged.
    console[level === 'info' ? 'info' : level === 'warn' ? 'warn' : 'error'](
      JSON.stringify({
        level,
        timestamp: new Date().toISOString(),
        ...data
      })
    );
  }

  // Analysis Events
  analysisReceived(payload: { request_id: string }) { 
    this.log('info', { event: 'analysis.request.received', ...payload }); 
  }
  
  analysisStageCompleted(payload: { request_id: string, stage: string, duration_ms: number, status?: string }) { 
    this.log('info', { event: 'analysis.stage.completed', ...payload }); 
  }
  
  analysisCompleted(payload: { request_id: string, duration_ms: number, status?: string }) { 
    this.log('info', { event: 'analysis.completed', ...payload }); 
  }
  
  analysisFailed(payload: { request_id: string, duration_ms: number, error_code: string }) { 
    this.log('error', { event: 'analysis.failed', ...payload }); 
  }

  // Provider Events
  providerRequestStarted(payload: { request_id: string, provider: string, stage: string }) {
    this.log('info', { event: 'provider.request.started', ...payload });
  }

  providerRequestCompleted(payload: { request_id: string, provider: string, stage: string, duration_ms: number }) {
    this.log('info', { event: 'provider.request.completed', ...payload });
  }

  providerRequestFailed(payload: { request_id: string, provider: string, stage: string, error_code: string }) {
    this.log('error', { event: 'provider.request.failed', ...payload });
  }

  // AI Validation
  aiValidationFailed(payload: { request_id: string, stage: string, provider: string, error_code: string }) {
    this.log('error', { event: 'ai.validation.failed', ...payload });
  }

  // Legal KB
  legalKbLookupCompleted(payload: { request_id: string, stage: string, duration_ms: number, status?: string }) {
    this.log('info', { event: 'legal_kb.lookup.completed', ...payload });
  }

  legalKbLookupFailed(payload: { request_id: string, stage: string, error_code: string }) {
    this.log('error', { event: 'legal_kb.lookup.failed', ...payload });
  }

  // PDF Extraction
  pdfExtractionCompleted(payload: { request_id: string, document_id?: string, duration_ms: number, status?: string }) {
    this.log('info', { event: 'pdf.extraction.completed', ...payload });
  }

  pdfExtractionFailed(payload: { request_id: string, document_id?: string, error_code: string }) {
    this.log('error', { event: 'pdf.extraction.failed', ...payload });
  }

  // Prepare Phase
  prepareReceived(payload: { request_id: string }) {
    this.log('info', { event: 'prepare.request.received', ...payload });
  }

  prepareCompleted(payload: { request_id: string, duration_ms: number }) {
    this.log('info', { event: 'prepare.completed', ...payload });
  }

  prepareFailed(payload: { request_id: string, error_code: string }) {
    this.log('error', { event: 'prepare.failed', ...payload });
  }
}

export const logger = new StructuredLogger();
