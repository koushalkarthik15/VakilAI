import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../src/app/api/analyze/route';
import { logger } from '../../src/core/logging/logger';
import { classifyDocument } from '../../src/features/document/services/classification';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/core/logging/logger', () => ({
  logger: {
    analysisReceived: vi.fn(),
    analysisStageCompleted: vi.fn(),
    analysisCompleted: vi.fn(),
    analysisFailed: vi.fn(),
  }
}));

vi.mock('@/lib/ai/GeminiProvider', () => ({
  GeminiProvider: class {
    generate = vi.fn().mockResolvedValue({ content: "{}" });
  }
}));

vi.mock('@/lib/ai/GroqProvider', () => ({
  GroqProvider: class {
    generate = vi.fn().mockResolvedValue({ content: "{}" });
  }
}));

vi.mock('@/features/document/services/classification', () => ({
  classifyDocument: vi.fn()
}));

// Mock the services 
vi.mock('@/features/understand/services/UnderstandingService', () => {
  return {
    UnderstandingService: class {
      extractUnderstanding = vi.fn().mockResolvedValue({ document_facts: [] });
    }
  };
});

vi.mock('@/features/legal-kb/services/applicabilityService', () => {
  return {
    ApplicabilityService: class {
      getApplicableRules = vi.fn().mockResolvedValue([]);
    }
  };
});

vi.mock('@/features/flag/services/FlaggingService', () => {
  return {
    FlaggingService: class {
      analyze = vi.fn().mockResolvedValue({ findings: [] });
    }
  };
});

vi.mock('@/features/compare/services/ComparisonService', () => {
  return {
    ComparisonService: class {
      compare = vi.fn().mockResolvedValue({ comparisons: [] });
    }
  };
});

vi.mock('@/features/act/services/ActionService', () => {
  return {
    ActionService: class {
      generateActionContext = vi.fn().mockResolvedValue({ recommended_actions: [] });
    }
  };
});

describe('/api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_MODEL', 'test-model');
    vi.stubEnv('GROQ_API_KEY', 'test-key');
    vi.stubEnv('GROQ_MODEL', 'test-model');
    vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/test');
  });

  const createRequest = (body: unknown) => {
    return new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  it('rejects invalid request payload with 400', async () => {
    const req = createRequest({ missing_text: true });
    const response = await POST(req);
    const json = await response.json();
    
    expect(response.status).toBe(400);
    expect(json.error).toBe('Missing or invalid text payload');
    expect(logger.analysisFailed).toHaveBeenCalledWith(expect.objectContaining({
      error_code: 'INVALID_REQUEST'
    }));
  });

  it('handles UNSUPPORTED classification early return safely', async () => {
    vi.mocked(classifyDocument).mockReturnValueOnce({
      type: 'UNSUPPORTED',
      matched_patterns: []
    });

    const req = createRequest({ text: 'Some unsupported employment text', filename: 'test.pdf' });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('UNSUPPORTED');
    expect(json.classification.type).toBe('UNSUPPORTED');
    
    // Verifies we log completion instead of failure, since UNSUPPORTED is a valid application state
    expect(logger.analysisCompleted).toHaveBeenCalledWith(expect.objectContaining({
      status: 'UNSUPPORTED'
    }));
  });

  it('handles UNKNOWN classification early return safely', async () => {
    vi.mocked(classifyDocument).mockReturnValueOnce({
      type: 'UNKNOWN',
      matched_patterns: []
    });

    const req = createRequest({ text: 'Cooking recipe', filename: 'test.pdf' });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('UNKNOWN');
    expect(logger.analysisCompleted).toHaveBeenCalledWith(expect.objectContaining({
      status: 'UNKNOWN'
    }));
  });

  it('successfully orchestrates the entire pipeline for valid text', async () => {
    vi.mocked(classifyDocument).mockReturnValueOnce({
      type: 'RENTAL_LEASE',
      matched_patterns: []
    });

    const req = createRequest({ text: 'Valid rental lease text here.', filename: 'lease.pdf' });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('SUCCESS');
    expect(json.understandingContext).toBeDefined();
    expect(json.analysisContext).toBeDefined();
    expect(json.comparisonContext).toBeDefined();
    expect(json.actionContext).toBeDefined();

    // Verify all stage logging
    expect(logger.analysisReceived).toHaveBeenCalled();
    expect(logger.analysisStageCompleted).toHaveBeenCalledWith(expect.objectContaining({ stage: 'classification' }));
    expect(logger.analysisStageCompleted).toHaveBeenCalledWith(expect.objectContaining({ stage: 'understanding' }));
    expect(logger.analysisStageCompleted).toHaveBeenCalledWith(expect.objectContaining({ stage: 'applicability' }));
    expect(logger.analysisStageCompleted).toHaveBeenCalledWith(expect.objectContaining({ stage: 'flagging' }));
    expect(logger.analysisStageCompleted).toHaveBeenCalledWith(expect.objectContaining({ stage: 'comparison' }));
    expect(logger.analysisStageCompleted).toHaveBeenCalledWith(expect.objectContaining({ stage: 'action_mapping' }));
    
    expect(logger.analysisCompleted).toHaveBeenCalledWith(expect.objectContaining({
      status: 'SUCCESS'
    }));
  });
});
