export type DocumentClassificationResult = {
  type: 'RENTAL_LEASE' | 'FREELANCER_SERVICE' | 'UNKNOWN' | 'UNSUPPORTED';
  matched_patterns: Array<{
    pattern_id: string;
    matched_text: string;
  }>;
};

type ClassificationPattern = {
  category: 'RENTAL_LEASE' | 'FREELANCER_SERVICE' | 'UNSUPPORTED';
  pattern_id: string;
  pattern: RegExp;
  description: string;
};

export const CLASSIFICATION_THRESHOLD = 3;

/**
 * Fixed registry of application-defined constants for matching document types.
 * Constraints:
 * - Simple, bounded, non-backtracking regular expressions.
 * - Stable, unique pattern_ids.
 */
export const CLASSIFICATION_PATTERNS: readonly ClassificationPattern[] = [
  // RENTAL_LEASE
  {
    category: 'RENTAL_LEASE',
    pattern_id: 'RENTAL_001',
    pattern: /\b(lease agreement|rental agreement)\b/gi,
    description: 'Explicit lease/rental agreement phrase'
  },
  {
    category: 'RENTAL_LEASE',
    pattern_id: 'RENTAL_002',
    pattern: /\b(tenant|lessee)\b/gi,
    description: 'Tenant or lessee party identification'
  },
  {
    category: 'RENTAL_LEASE',
    pattern_id: 'RENTAL_003',
    pattern: /\b(landlord|lessor)\b/gi,
    description: 'Landlord or lessor party identification'
  },
  {
    category: 'RENTAL_LEASE',
    pattern_id: 'RENTAL_004',
    pattern: /\b(security deposit)\b/gi,
    description: 'Security deposit clause indicator'
  },
  {
    category: 'RENTAL_LEASE',
    pattern_id: 'RENTAL_005',
    pattern: /\b(rent(?:al)? amount|monthly rent)\b/gi,
    description: 'Rent amount indicator'
  },
  {
    category: 'RENTAL_LEASE',
    pattern_id: 'RENTAL_006',
    pattern: /\b(demised premises|leased premises)\b/gi,
    description: 'Premises indicator'
  },

  // FREELANCER_SERVICE
  {
    category: 'FREELANCER_SERVICE',
    pattern_id: 'FREELANCE_001',
    pattern: /\b(freelance|independent contractor)\b/gi,
    description: 'Freelance or contractor phrasing'
  },
  {
    category: 'FREELANCER_SERVICE',
    pattern_id: 'FREELANCE_002',
    pattern: /\b(service agreement|master service agreement|statement of work)\b/gi,
    description: 'Service agreement phrasing'
  },
  {
    category: 'FREELANCER_SERVICE',
    pattern_id: 'FREELANCE_003',
    pattern: /\b(service provider|consultant)\b/gi,
    description: 'Service provider party identification'
  },
  {
    category: 'FREELANCER_SERVICE',
    pattern_id: 'FREELANCE_004',
    pattern: /\b(client)\b/gi,
    description: 'Client party identification'
  },
  {
    category: 'FREELANCER_SERVICE',
    pattern_id: 'FREELANCE_005',
    pattern: /\b(deliverables?|milestones?)\b/gi,
    description: 'Deliverables or milestones'
  },
  {
    category: 'FREELANCER_SERVICE',
    pattern_id: 'FREELANCE_006',
    pattern: /\b(professional services)\b/gi,
    description: 'Professional services phrase'
  },

  // UNSUPPORTED (Employment Agreement only for S1-M1.2)
  {
    category: 'UNSUPPORTED',
    pattern_id: 'EMPLOYMENT_001',
    pattern: /\b(employment agreement|employment contract)\b/gi,
    description: 'Explicit employment agreement phrase'
  },
  {
    category: 'UNSUPPORTED',
    pattern_id: 'EMPLOYMENT_002',
    pattern: /\b(employer)\b/gi,
    description: 'Employer party identification'
  },
  {
    category: 'UNSUPPORTED',
    pattern_id: 'EMPLOYMENT_003',
    pattern: /\b(employee)\b/gi,
    description: 'Employee party identification'
  },
  {
    category: 'UNSUPPORTED',
    pattern_id: 'EMPLOYMENT_004',
    pattern: /\b(salary|base pay)\b/gi,
    description: 'Salary or base pay indicator'
  },
  {
    category: 'UNSUPPORTED',
    pattern_id: 'EMPLOYMENT_005',
    pattern: /\b(probationary period|probation period)\b/gi,
    description: 'Probation period indicator'
  },
  {
    category: 'UNSUPPORTED',
    pattern_id: 'EMPLOYMENT_006',
    pattern: /\b(full-time employment|part-time employment)\b/gi,
    description: 'Full-time/part-time employment phrasing'
  }
];

/**
 * Deterministically classifies raw PDF text into exactly one of four states.
 * 
 * @param text The raw extracted text from the PDF
 * @returns DocumentClassificationResult containing the type and deterministic pattern-match evidence
 */
export function classifyDocument(text: string): DocumentClassificationResult {
  const result: DocumentClassificationResult = {
    type: 'UNKNOWN',
    matched_patterns: []
  };

  if (!text || text.trim() === '') {
    return result;
  }

  // Generates a non-destructive temporary matching representation.
  // We collapse whitespace safely to allow patterns to match across newlines/garbled spacing,
  // without mutating the authoritative `text` string (pure function).
  const normalizedText = text.replace(/\s+/g, ' ');

  const distinctMatchesByCategory: Record<ClassificationPattern['category'], Set<string>> = {
    RENTAL_LEASE: new Set(),
    FREELANCER_SERVICE: new Set(),
    UNSUPPORTED: new Set()
  };

  for (const { category, pattern_id, pattern } of CLASSIFICATION_PATTERNS) {
    // Because patterns use the 'g' flag, `match()` returns an array of all substrings matched.
    const match = normalizedText.match(pattern);
    if (match && match.length > 0) {
      result.matched_patterns.push({
        pattern_id,
        matched_text: match[0] // Record the exact string that triggered the match
      });
      // A pattern contributes at most ONE distinct match to its category, regardless of repetitions.
      distinctMatchesByCategory[category].add(pattern_id);
    }
  }

  // Count which categories met the deterministic threshold.
  const reachedThresholdCategories = (Object.keys(distinctMatchesByCategory) as ClassificationPattern['category'][])
    .filter(cat => distinctMatchesByCategory[cat].size >= CLASSIFICATION_THRESHOLD);

  // Apply deterministic decision table
  if (reachedThresholdCategories.length === 1) {
    result.type = reachedThresholdCategories[0]!;
  } else {
    // Fallback behavior: No category reaches 3, OR multiple categories reach 3.
    // We map to UNKNOWN, but all matched pattern evidence is preserved in result.matched_patterns.
    result.type = 'UNKNOWN';
  }

  return result;
}
