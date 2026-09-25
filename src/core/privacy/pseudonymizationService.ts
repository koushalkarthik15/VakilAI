import { DocumentContext } from '../contexts/contracts';
import { PiiCategory, PiiMapping, PseudonymizedDocumentContext } from './piiMapping';
import { PiiDetector } from './piiDetector';
import { LocalPersonDetector } from './localPersonDetector';

export class PseudonymizationService {
  /**
   * Pseudonymizes the extraction text of a DocumentContext and generates an ephemeral mapping.
   * Ensures that no accidental leakage of raw text enters the external AI boundary.
   *
   * @param context The raw DocumentContext
   * @returns A tuple containing the securely branded PseudonymizedDocumentContext and the generated PiiMapping
   */
  static pseudonymizeDocument(context: DocumentContext): {
    pseudonymizedContext: PseudonymizedDocumentContext;
    mapping: PiiMapping[];
  } {
    const rawText = context.extraction.text;
    
    // 1. Invariant: Fail if text is missing or invalid
    if (typeof rawText !== 'string') {
      throw new Error('PSEUDONYMIZATION_FAILED: Invalid extraction text.');
    }

    const { pseudonymizedText, mapping } = this.pseudonymizeText(rawText, []);

    // Clone the context and replace the text
    const clonedContext = JSON.parse(JSON.stringify(context)) as DocumentContext;
    clonedContext.extraction.text = pseudonymizedText;

    // We must also pseudonymize the text inside clauses if they contain text
    // (In v1, clauses array might just have refs, but if they have raw_text/normalized_text, they need replacement)
    // Actually, DocumentContext clauses are ClauseReferenceSchema which doesn't have raw text, 
    // it only has clause_id, page_id, etc. If it has text, we'd replace it here.
    
    // 2. Runtime Invariant Check
    if (clonedContext.extraction.text === rawText && mapping.length > 0) {
      throw new Error('PSEUDONYMIZATION_FAILED: Replacement invariant failed.');
    }

    // 3. Brand the context via this controlled internal factory boundary
    const pseudonymizedContext = clonedContext as PseudonymizedDocumentContext;

    return { pseudonymizedContext, mapping };
  }

  /**
   * Pseudonymizes arbitrary text using an existing mapping to maintain session consistency.
   * Useful for user goals/queries before sending to AI.
   */
  static pseudonymizeText(text: string, existingMapping: PiiMapping[]): {
    pseudonymizedText: string;
    mapping: PiiMapping[];
  } {
    if (!text || text.trim() === '') {
      return { pseudonymizedText: text, mapping: [...existingMapping] };
    }

    // Detect collision potentials: check existing [[PII_*_NN]] in the text
    const occupiedIds = new Set<string>();
    const collisionRegex = /\[\[PII_[A-Z]+_\d+\]\]/g;
    let match;
    while ((match = collisionRegex.exec(text)) !== null) {
      occupiedIds.add(match[0]);
    }

    // State for assignments
    const mapping = [...existingMapping];
    const originalToPlaceholder = new Map<string, string>();
    existingMapping.forEach(m => originalToPlaceholder.set(m.original, m.placeholder));

    const getNextPlaceholder = (category: PiiCategory): string => {
      let index = 1;
      let placeholder = '';
      const prefix = category === 'PERSON_NAME' ? 'PERSON' : category;
      do {
        placeholder = `[[PII_${prefix}_${index.toString().padStart(2, '0')}]]`;
        index++;
      } while (occupiedIds.has(placeholder));
      occupiedIds.add(placeholder);
      return placeholder;
    };

    // 1. Detect Deterministic PII (Email, Phone, Aadhaar, PAN)
    const deterministicSpans = PiiDetector.detect(text);
    
    // 2. Detect Person Names (Local NER)
    const personSpans = LocalPersonDetector.detect(text);

    // Combine and sort by startIndex descending to allow string slicing from end to start
    const allSpans = [
      ...deterministicSpans.map(s => ({ text: s.match, startIndex: s.startIndex, endIndex: s.endIndex, category: s.category as PiiCategory })),
      ...personSpans.map(s => ({ text: s.text, startIndex: s.startIndex, endIndex: s.endIndex, category: 'PERSON_NAME' as PiiCategory }))
    ].sort((a, b) => b.startIndex - a.startIndex);

    let resultText = text;

    for (const span of allSpans) {
      // Skip if this span overlaps with something we've already replaced (due to descending order, this means a larger match contained it)
      // For simplicity in this implementation, we just replace it if it exists exactly at the expected location.
      const currentSubstring = resultText.substring(span.startIndex, span.endIndex);
      if (currentSubstring !== span.text) {
        // Overlap occurred, safely skip
        continue;
      }

      const originalVal = span.text;
      
      let placeholder = originalToPlaceholder.get(originalVal);
      if (!placeholder) {
        placeholder = getNextPlaceholder(span.category);
        originalToPlaceholder.set(originalVal, placeholder);
        mapping.push({
          placeholder,
          category: span.category,
          original: originalVal
        });
      }

      resultText = resultText.substring(0, span.startIndex) + placeholder + resultText.substring(span.endIndex);
    }

    return { pseudonymizedText: resultText, mapping };
  }
}
