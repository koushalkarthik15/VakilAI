export interface PiiDetectionResult {
  match: string;
  category: 'EMAIL' | 'PHONE' | 'AADHAAR' | 'PAN';
  startIndex: number;
  endIndex: number;
}

export class PiiDetector {
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private static readonly PHONE_REGEX = /(?:\+91[\s-]?)?[0]?[6-9]\d{9}\b/g;
  private static readonly AADHAAR_REGEX = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  private static readonly PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]{1}\b/gi;

  static detect(text: string): PiiDetectionResult[] {
    const results: PiiDetectionResult[] = [];

    this.findMatches(text, this.EMAIL_REGEX, 'EMAIL', results);
    this.findMatches(text, this.PHONE_REGEX, 'PHONE', results);
    this.findMatches(text, this.AADHAAR_REGEX, 'AADHAAR', results);
    this.findMatches(text, this.PAN_REGEX, 'PAN', results);

    // Sort by descending index to allow safe backward replacement
    return results.sort((a, b) => b.startIndex - a.startIndex);
  }

  private static findMatches(
    text: string, 
    regex: RegExp, 
    category: PiiDetectionResult['category'], 
    results: PiiDetectionResult[]
  ) {
    let match;
    // Reset lastIndex for global regex
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        match: match[0],
        category,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }
}
