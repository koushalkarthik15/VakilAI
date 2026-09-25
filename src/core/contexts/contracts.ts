import { z } from 'zod';

// ==========================================
// 1. Common Shared Schemas
// ==========================================
export const ContextMetadataSchema = z.object({
  schema_version: z.literal('1.0'),
  session_id: z.string().min(1),
  document_id: z.string().min(1),
  created_at: z.string().datetime(),
  source_stage: z.string().min(1)
}).strict();

export const SourceReferenceSchema = z.object({
  source_id: z.string().min(1),
  citation: z.string(),
  authority: z.string(),
  tier: z.string(),
  verified_status: z.string()
}).strict();

export const ClauseReferenceSchema = z.object({
  clause_id: z.string().min(1),
  page_start: z.number().int().min(1),
  page_end: z.number().int().min(1),
  text: z.string(),
  heading: z.string().optional(),
  clause_type: z.string(),
  extraction_status: z.string()
}).strict();

// ==========================================
// 2. DocumentContext (Sec 5)
// ==========================================
export const DocumentContextSchema = z.object({
  metadata: ContextMetadataSchema,
  document: z.object({
    document_id: z.string().min(1),
    filename: z.string(),
    page_count: z.number().int().min(1),
    mime_type: z.string()
  }).strict(),
  extraction: z.object({
    status: z.enum(['SUCCESS', 'PARTIAL', 'FAILED', 'UNREADABLE', 'UNSUPPORTED']),
    pages: z.array(z.number().int()),
    text: z.string() // Explicitly allowed by Sec 5.2
  }).strict(),
  clauses: z.array(ClauseReferenceSchema)
}).strict();

export type DocumentContext = z.infer<typeof DocumentContextSchema>;

// ==========================================
// 3. UnderstandingContext (Sec 8)
// ==========================================
export const UnderstandingContextSchema = z.object({
  metadata: ContextMetadataSchema,
  classification: z.object({
    type: z.enum(['RENTAL_LEASE', 'FREELANCER_SERVICE', 'UNKNOWN', 'UNSUPPORTED']),
    confidence: z.string().optional(), // E.g., HIGH/MEDIUM/LOW but not exhaustively specified
    matched_patterns: z.array(z.object({
      pattern_id: z.string(),
      matched_text: z.string()
    }).strict()).optional()
  }).strict(),
  jurisdiction: z.object({
    status: z.enum(['SUPPORTED', 'OUTSIDE_SCOPE', 'JURISDICTION_UNCLEAR'])
  }).strict(),
  parties: z.array(z.object({
    party_id: z.string().min(1),
    role: z.string(),
    display_reference: z.string(),
    pii_fields: z.record(z.string(), z.string()).optional() // Local mapping, scrubbed before external dispatch
  }).strict()),
  document_facts: z.array(z.object({
    fact_id: z.string().min(1),
    clause_id: z.string().min(1).optional(),
    field: z.string(),
    value: z.string().optional(),
    page_reference: z.number().int().optional(),
    status: z.enum(['STATED', 'NOT_STATED', 'UNCLEAR'])
  }).strict()),
  clauses: z.array(ClauseReferenceSchema),
  missing_information: z.array(z.string()),
  uncertainties: z.array(z.string())
}).strict();

export type UnderstandingContext = z.infer<typeof UnderstandingContextSchema>;

// ==========================================
// 4. AnalysisContext (Sec 13)
// ==========================================
export const FindingSchema = z.object({
  finding_id: z.string().min(1),
  clause_ids: z.array(z.string()),
  rule_ids: z.array(z.string()),
  source_ids: z.array(z.string()),
  issue_type: z.string(),
  summary: z.string(),
  explanation: z.string(),
  severity: z.string(), // Extent of impact - defer exact enum
  confidence: z.string(), // Strength of evidence - defer exact enum
  status: z.enum(['SUPPORTED', 'NEEDS_REVIEW', 'INSUFFICIENT_SOURCE', 'JURISDICTION_UNCLEAR', 'NOT_STATED']),
  missing_information: z.array(z.string())
}).strict();

export const AnalysisContextSchema = z.object({
  metadata: ContextMetadataSchema,
  document_type: z.string(),
  jurisdiction: z.string(),
  relevant_clauses: z.array(z.string()),
  applicable_rules: z.array(z.object({
    rule_id: z.string().min(1),
    domain_id: z.string(),
    summary: z.string(),
    applicability_basis: z.record(z.string(), z.string()),
    effective_period: z.string(),
    source_ids: z.array(z.string())
  }).strict()),
  source_references: z.array(SourceReferenceSchema),
  detected_patterns: z.array(z.string()),
  missing_information: z.array(z.string()),
  analysis_constraints: z.array(z.string()),
  findings: z.array(FindingSchema)
}).strict();

export type AnalysisContext = z.infer<typeof AnalysisContextSchema>;

// ==========================================
// 5. ComparisonContext (Sec 20)
// ==========================================
export const ComparisonItemSchema = z.object({
  comparison_id: z.string().min(1),
  clause_ids: z.array(z.string()),
  rule_ids: z.array(z.string()),
  source_ids: z.array(z.string()),
  contract_position: z.object({
    clause_id: z.string().min(1).optional(),
    statement: z.string()
  }).strict(),
  legal_baseline: z.object({
    rule_id: z.string().min(1),
    summary: z.string(),
    source_ids: z.array(z.string())
  }).strict(),
  relationship: z.enum(['ALIGNS', 'DIFFERS', 'POTENTIAL_TENSION', 'INSUFFICIENT_SOURCE', 'NOT_STATED', 'REQUIRES_REVIEW']),
  explanation: z.string(),
  severity: z.string(),
  confidence: z.string(),
  status: z.string()
}).strict();

export const ComparisonContextSchema = z.object({
  metadata: ContextMetadataSchema,
  comparison_items: z.array(ComparisonItemSchema),
  unresolved_questions: z.array(z.string())
}).strict();

export type ComparisonContext = z.infer<typeof ComparisonContextSchema>;

// ==========================================
// 6. ActionContext (Sec 25)
// ==========================================
export const ActionItemSchema = z.object({
  action_id: z.string().min(1),
  related_finding_ids: z.array(z.string()),
  title: z.string(),
  description: z.string(),
  action_type: z.string(),
  required_information: z.array(z.string()),
  government_route_id: z.string().min(1).optional(),
  status: z.string()
}).strict();

export const ActionContextSchema = z.object({
  metadata: ContextMetadataSchema,
  findings: z.array(FindingSchema),
  action_items: z.array(ActionItemSchema),
  government_routes: z.array(z.string()), // References to route IDs
  questions: z.array(z.string()),
  information_to_collect: z.array(z.string()),
  warnings: z.array(z.string())
}).strict();

export type ActionContext = z.infer<typeof ActionContextSchema>;

// ==========================================
// 7. PrepareContext (Sec 28)
// ==========================================
export const PrepareContextSchema = z.object({
  metadata: ContextMetadataSchema,
  selected_findings: z.array(FindingSchema),
  selected_actions: z.array(ActionItemSchema),
  user_goal: z.string(),
  required_information: z.array(z.string()),
  verified_sources: z.array(SourceReferenceSchema),
  output_format: z.string()
}).strict();

export type PrepareContext = z.infer<typeof PrepareContextSchema>;
