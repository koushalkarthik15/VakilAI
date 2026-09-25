import { PiiMapping } from './piiMapping';

export class PresentationRestorer {
  /**
   * Replaces all placeholders in the AI-generated text with their original
   * values based on the provided session mapping.
   * This is exclusively for UI presentation boundaries.
   */
  static restore(text: string, mapping: PiiMapping[]): string {
    if (!text || mapping.length === 0) return text;

    let restoredText = text;

    // Replace all placeholders using the mapping
    // Note: AI might hallucinate formatting, so we use string replacement instead of rigid indices
    for (const { placeholder, original } of mapping) {
      // Create a global regex to replace all instances of the placeholder
      // Escape brackets in the placeholder for regex usage
      const escapedPlaceholder = placeholder.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
      const regex = new RegExp(escapedPlaceholder, 'g');
      restoredText = restoredText.replace(regex, original);
    }

    return restoredText;
  }

  static restoreUnderstandingContext<T>(context: T, mapping: PiiMapping[]): T {
    if (!context || mapping.length === 0) return context;
    return JSON.parse(this.restore(JSON.stringify(context), mapping));
  }

  static restoreAnalysisContext<T>(context: T, mapping: PiiMapping[]): T {
    if (!context || mapping.length === 0) return context;
    return JSON.parse(this.restore(JSON.stringify(context), mapping));
  }

  static restoreComparisonContext<T>(context: T, mapping: PiiMapping[]): T {
    if (!context || mapping.length === 0) return context;
    return JSON.parse(this.restore(JSON.stringify(context), mapping));
  }

  static restoreActionContext<T>(context: T, mapping: PiiMapping[]): T {
    if (!context || mapping.length === 0) return context;
    return JSON.parse(this.restore(JSON.stringify(context), mapping));
  }
}
