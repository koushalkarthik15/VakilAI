// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - The user will install this dependency
import nlp from 'compromise';

export interface PersonSpan {
  text: string;
  startIndex: number;
  endIndex: number;
}

export class LocalPersonDetector {
  /**
   * Detects English PERSON spans in the provided text using `compromise`.
   * It intentionally excludes strings that compromise identifies as Places or Organizations
   * to protect legally relevant addresses.
   */
  static detect(text: string): PersonSpan[] {
    try {
      if (!nlp) {
        throw new Error('NLP library is not available');
      }

      const doc = nlp(text);
      const people = doc.people().json();
      
      const spans: PersonSpan[] = [];
      
      for (const p of people) {
        if (!p.text || typeof p.offset?.start !== 'number' || typeof p.offset?.length !== 'number') {
          continue;
        }

        const matchText = p.text;
        
        // Exclude if it's explicitly identified as a Place or Organization 
        // to minimize false positives around addresses and company names.
        const matchDoc = nlp(matchText);
        if (matchDoc.places().found || matchDoc.organizations().found) {
          continue;
        }

        spans.push({
          text: matchText,
          startIndex: p.offset.start,
          endIndex: p.offset.start + p.offset.length
        });
      }

      return spans.sort((a, b) => b.startIndex - a.startIndex);
    } catch (error) {
      console.error('LocalPersonDetector failed:', error);
      // Fail closed: Do not allow processing to continue if NER fails.
      throw new Error('PII_DETECTION_FAILED: The local person detector failed to process the text.');
    }
  }
}
