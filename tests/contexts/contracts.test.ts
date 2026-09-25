import { describe, it, expect } from 'vitest';
import {
  ContextMetadataSchema,
  DocumentContextSchema,
  UnderstandingContextSchema,
  AnalysisContextSchema,
  ComparisonContextSchema,
  ActionContextSchema
} from '@/core/contexts/contracts';
import fs from 'fs';
import path from 'path';

describe('AI Context Contracts (S0-M0.5)', () => {

  const validMetadata = {
    schema_version: '1.0' as const,
    session_id: 'sess-123',
    document_id: 'doc-456',
    created_at: new Date().toISOString(),
    source_stage: 'STAGE_NAME'
  };

  describe('Versioning & Metadata', () => {
    it('accepts version 1.0', () => {
      expect(() => ContextMetadataSchema.parse(validMetadata)).not.toThrow();
    });

    it('rejects unsupported schema version', () => {
      const invalidMeta = { ...validMetadata, schema_version: '2.0' };
      expect(() => ContextMetadataSchema.parse(invalidMeta)).toThrowError(/invalid_value/);
    });
  });

  describe('Strict Parsing & Hallucination Rejection', () => {
    it('rejects unknown top-level fields', () => {
      const hallucinatedContext = {
        metadata: validMetadata,
        document: {
          document_id: 'doc-456',
          filename: 'test.pdf',
          page_count: 5,
          mime_type: 'application/pdf'
        },
        extraction: {
          status: 'SUCCESS' as const,
          pages: [1],
          text: 'Hello world'
        },
        clauses: [],
        hallucinated_field: true // Top level hallucination
      };

      expect(() => DocumentContextSchema.parse(hallucinatedContext)).toThrowError(/Unrecognized key/);
    });

    it('rejects unknown nested fields in arrays and objects', () => {
      const nestedHallucination = {
        metadata: validMetadata,
        document: {
          document_id: 'doc-456',
          filename: 'test.pdf',
          page_count: 5,
          mime_type: 'application/pdf',
          fake_doc_metadata: 123 // Nested hallucination
        },
        extraction: { status: 'SUCCESS' as const, pages: [], text: '' },
        clauses: []
      };

      expect(() => DocumentContextSchema.parse(nestedHallucination)).toThrowError(/Unrecognized key/);
    });
  });

  describe('UnderstandingContext Validation', () => {
    const validUnderstanding = {
      metadata: validMetadata,
      classification: { type: 'RENTAL_LEASE' as const },
      jurisdiction: { status: 'SUPPORTED' as const },
      parties: [],
      document_facts: [
        {
          fact_id: 'fact-1',
          field: 'deposit',
          status: 'NOT_STATED' as const
        }
      ],
      clauses: [],
      missing_information: [],
      uncertainties: []
    };

    it('accepts a valid UnderstandingContext', () => {
      expect(() => UnderstandingContextSchema.parse(validUnderstanding)).not.toThrow();
    });

    it('rejects invalid jurisdiction status enum', () => {
      const invalidEnum = {
        ...validUnderstanding,
        jurisdiction: { status: 'NATIONWIDE' }
      };
      expect(() => UnderstandingContextSchema.parse(invalidEnum)).toThrowError(/Invalid option: expected one of/);
    });

    it('rejects omitted required fields', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { metadata, ...missingMetadata } = validUnderstanding;
      expect(() => UnderstandingContextSchema.parse(missingMetadata)).toThrowError(/Invalid input: expected object, received undefined/);
    });
  });

  describe('AnalysisContext Validation', () => {
    const validAnalysis = {
      metadata: validMetadata,
      document_type: 'RENTAL_LEASE',
      jurisdiction: 'Telangana',
      relevant_clauses: [],
      applicable_rules: [],
      source_references: [],
      detected_patterns: [],
      missing_information: [],
      analysis_constraints: [],
      findings: [
        {
          finding_id: 'find-1',
          clause_ids: ['c-1'],
          rule_ids: ['r-1'],
          source_ids: ['s-1'],
          issue_type: 'MISSING_CLAUSE',
          summary: 'Missing deposit clause',
          explanation: 'It is missing.',
          severity: 'HIGH',
          confidence: 'MEDIUM',
          status: 'NOT_STATED' as const,
          missing_information: []
        }
      ]
    };

    it('accepts a valid AnalysisContext', () => {
      expect(() => AnalysisContextSchema.parse(validAnalysis)).not.toThrow();
    });
  });

  describe('ComparisonContext Validation', () => {
    const validComparison = {
      metadata: validMetadata,
      comparison_items: [
        {
          comparison_id: 'comp-1',
          clause_ids: [],
          rule_ids: [],
          source_ids: [],
          contract_position: {
            clause_id: 'c-1',
            statement: 'Something'
          },
          legal_baseline: {
            rule_id: 'r-1',
            summary: 'Baseline summary',
            source_ids: ['s-1']
          },
          relationship: 'POTENTIAL_TENSION' as const,
          explanation: 'They conflict.',
          severity: 'HIGH',
          confidence: 'HIGH',
          status: 'REVIEWED'
        }
      ],
      unresolved_questions: []
    };

    it('accepts a valid ComparisonContext', () => {
      expect(() => ComparisonContextSchema.parse(validComparison)).not.toThrow();
    });
  });

  describe('ActionContext Validation', () => {
    const validAction = {
      metadata: validMetadata,
      findings: [],
      action_items: [
        {
          action_id: 'act-1',
          related_finding_ids: ['find-1'],
          title: 'Review clause',
          description: 'Review the conflicting clause',
          action_type: 'REVIEW',
          required_information: [],
          government_route_id: 'gov-route-abc',
          status: 'PENDING'
        }
      ],
      government_routes: [],
      questions: [],
      information_to_collect: [],
      warnings: []
    };

    it('accepts a valid ActionContext', () => {
      expect(() => ActionContextSchema.parse(validAction)).not.toThrow();
    });
  });

  describe('AI Safety & Provenance Rejections', () => {
    it('rejects AI-shaped text instead of structured object', () => {
      expect(() => ActionContextSchema.parse("I found 3 clauses that differ.")).toThrowError(/Invalid input: expected object, received string/);
    });

    it('rejects findings with malformed provenance', () => {
      const invalidClauseRef = {
        clause_id: 'C-01',
        // page_start omitted
        page_end: 2,
        text: 'Hello',
        clause_type: 'GENERAL',
        extraction_status: 'SUCCESS'
      };

      const doc = {
        metadata: validMetadata,
        document: {
          document_id: 'doc-456',
          filename: 'test.pdf',
          page_count: 5,
          mime_type: 'application/pdf'
        },
        extraction: {
          status: 'SUCCESS' as const,
          pages: [1],
          text: 'Hello world'
        },
        clauses: [invalidClauseRef]
      };

      expect(() => DocumentContextSchema.parse(doc)).toThrowError(/Invalid input: expected number, received undefined/);
    });
  });

  describe('Architectural Independence', () => {
    it('context schemas do not import frameworks or stores', () => {
      const schemaPath = path.join(__dirname, '../../src/core/contexts/contracts.ts');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      expect(schemaContent).not.toContain('next/server');
      expect(schemaContent).not.toContain('react');
      expect(schemaContent).not.toContain('zustand');
      expect(schemaContent).not.toContain('mongodb');
      expect(schemaContent).not.toContain('gemini');
      expect(schemaContent).not.toContain('groq');
    });
  });
});
