import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateAIOutput, MAX_AI_OUTPUT_LENGTH } from '../../../src/lib/ai/validator';
import { AIValidationError } from '../../../src/lib/ai/validationErrors';

const MockSchema = z.object({
  status: z.enum(['SUCCESS', 'FAILED']),
  items: z.array(z.string()),
  metadata: z.object({ count: z.number() })
}).strict();

describe('AI Output Validator', () => {
  it('successfully validates and returns valid JSON', () => {
    const validJson = JSON.stringify({
      status: 'SUCCESS',
      items: ['a', 'b'],
      metadata: { count: 2 }
    });
    const result = validateAIOutput(MockSchema, { content: validJson });
    expect(result.status).toBe('SUCCESS');
    expect(result.items).toEqual(['a', 'b']);
  });

  it('safely strips markdown fences and validates', () => {
    const raw = `\`\`\`json
{
  "status": "FAILED",
  "items": ["c"],
  "metadata": { "count": 1 }
}
\`\`\``;
    const result = validateAIOutput(MockSchema, { content: raw });
    expect(result.status).toBe('FAILED');
    expect(result.items).toEqual(['c']);
  });

  it('preserves nested structures completely without truncation', () => {
    const raw = `\`\`\`
{"status":"SUCCESS","items":["nested\\nnewline"],"metadata":{"count":1}}
\`\`\``;
    const result = validateAIOutput(MockSchema, { content: raw });
    expect(result.items[0]).toBe('nested\nnewline');
  });

  it('rejects malformed JSON safely', () => {
    expect(() => validateAIOutput(MockSchema, { content: '{ "status": "SUCCESS", ' }))
      .toThrowError(new AIValidationError('AI output is not valid JSON', 'MALFORMED_JSON'));
  });

  it('rejects unexpected extra fields (strict mode)', () => {
    const extraFields = JSON.stringify({
      status: 'SUCCESS',
      items: [],
      metadata: { count: 0 },
      unexpected_field: true
    });
    
    try {
      validateAIOutput(MockSchema, { content: extraFields });
      expect.fail('Should have thrown validation error');
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      expect(error).toBeInstanceOf(AIValidationError);
      expect(error.code).toBe('SCHEMA_VIOLATION');
      // Verify raw PII is NOT leaked in the message
      expect(error.message).not.toContain('unexpected_field');
      expect(error.context.issues[0].code).toBe('unrecognized_keys');
    }
  });

  it('rejects missing required fields', () => {
    const missing = JSON.stringify({ status: 'SUCCESS' });
    try {
      validateAIOutput(MockSchema, { content: missing });
      expect.fail('Should have thrown');
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      expect(error).toBeInstanceOf(AIValidationError);
      expect(error.code).toBe('SCHEMA_VIOLATION');
      expect(error.context.issues.some((i: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => i.path.includes('items'))).toBe(true);
    }
  });

  it('rejects empty output', () => {
    expect(() => validateAIOutput(MockSchema, { content: '   ' }))
      .toThrowError(new AIValidationError('AI output is empty', 'EMPTY_RESPONSE'));
  });

  it('rejects oversized output BEFORE parsing', () => {
    // Generate a string that exceeds the max length
    const oversized = 'a'.repeat(MAX_AI_OUTPUT_LENGTH + 1);
    
    try {
      validateAIOutput(MockSchema, { content: oversized });
      expect.fail('Should have thrown');
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      expect(error).toBeInstanceOf(AIValidationError);
      expect(error.code).toBe('OVERSIZED_RESPONSE');
      expect(error.message).toContain(MAX_AI_OUTPUT_LENGTH.toString());
      // The error message must NOT contain the oversized content
      expect(error.message.length).toBeLessThan(1000); 
    }
  });

  it('allows content exactly at the size limit', () => {
    const validJson = JSON.stringify({
      status: 'SUCCESS',
      items: [],
      metadata: { count: 0 }
    });
    // Pad with spaces up to exactly the limit
    const padded = validJson.padEnd(MAX_AI_OUTPUT_LENGTH, ' ');
    const result = validateAIOutput(MockSchema, { content: padded });
    expect(result.status).toBe('SUCCESS');
  });
});
