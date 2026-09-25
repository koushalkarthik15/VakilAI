import { z } from 'zod';
import { AIResult } from './types';
import { AIValidationError } from './validationErrors';

export const MAX_AI_OUTPUT_LENGTH = 5_000_000; // 5 MB / 5 million characters

/**
 * validateAIOutput
 * 
 * Safely parses and validates untrusted AI output against a provided Zod schema.
 * Rejects oversized, malformed, or schema-invalid payloads without silently truncating 
 * or losing data. Maintains strict data privacy in error boundaries.
 */
export function validateAIOutput<T>(schema: z.ZodSchema<T>, result: AIResult): T {
  const content = result.content;

  if (content === null || content === undefined || content.trim() === '') {
    throw new AIValidationError('AI output is empty', 'EMPTY_RESPONSE');
  }

  // 1. Size Check
  if (content.length > MAX_AI_OUTPUT_LENGTH) {
    throw new AIValidationError(
      `AI output exceeded maximum allowed length of ${MAX_AI_OUTPUT_LENGTH} characters`,
      'OVERSIZED_RESPONSE'
    );
  }

  // 2. Conservative Markdown Fence Removal
  const cleanedContent = stripMarkdownFence(content);

  // 3. JSON Parse
  let parsedObject: unknown;
  try {
    parsedObject = JSON.parse(cleanedContent);
  } catch {
    throw new AIValidationError('AI output is not valid JSON', 'MALFORMED_JSON');
  }

  // 4. Zod Validation
  try {
    return schema.parse(parsedObject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw AIValidationError.fromZodError(error);
    }
    throw new AIValidationError('Unexpected schema validation failure', 'SCHEMA_VIOLATION');
  }
}

/**
 * Detects if the entire string is wrapped in a markdown code block (e.g. ```json ... ```)
 * and safely removes the exact delimiters. 
 * Does NOT perform arbitrary string extraction or heuristic recovery.
 */
function stripMarkdownFence(content: string): string {
  const trimmed = content.trim();
  
  // Check if it starts with ``` and ends with ```
  if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
    const lines = trimmed.split('\n');
    
    // Ensure we have at least the opening and closing fence lines
    if (lines.length >= 2) {
      const firstLine = lines[0];
      const lastLine = lines[lines.length - 1];
      
      // The first line must just be the fence (and optional language tag like ```json)
      // The last line must just be the closing fence
      if (firstLine.startsWith('```') && lastLine.trim() === '```') {
        // Strip the first and last line
        return lines.slice(1, lines.length - 1).join('\n').trim();
      }
    }
  }
  
  return trimmed;
}
