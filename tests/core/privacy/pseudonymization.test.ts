import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PseudonymizationService } from '../../../src/core/privacy/pseudonymizationService';
import { PresentationRestorer } from '../../../src/core/privacy/presentationRestorer';
import { DocumentContext } from '../../../src/core/contexts/contracts';

// Mock the LocalPersonDetector because compromise might not be available
// or we want strictly controlled outputs.
vi.mock('../../../src/core/privacy/localPersonDetector', () => ({
  LocalPersonDetector: {
    detect: vi.fn((text: string) => {
      const results = [];
      if (text.includes('Ramesh Kumar')) {
        results.push({ text: 'Ramesh Kumar', startIndex: text.indexOf('Ramesh Kumar'), endIndex: text.indexOf('Ramesh Kumar') + 12 });
      }
      if (text.includes('Arjun Rao')) {
        results.push({ text: 'Arjun Rao', startIndex: text.indexOf('Arjun Rao'), endIndex: text.indexOf('Arjun Rao') + 9 });
      }
      return results;
    })
  }
}));

describe('S9-M9.1 PII Pseudonymization Lifecycle', () => {
  let mockContext: DocumentContext;

  beforeEach(() => {
    mockContext = {
      metadata: {
        schema_version: '1.0',
        session_id: 'session-123',
        document_id: 'doc-123',
        source_stage: 'extraction',
        created_at: new Date().toISOString()
      },
      document: {
        document_id: 'doc-123',
        filename: 'lease.pdf',
        page_count: 5,
        mime_type: 'application/pdf'
      },
      extraction: {
        status: 'SUCCESS',
        pages: [1, 2, 3],
        text: 'The Landlord Ramesh Kumar agrees to rent Flat 402, ABC Residency, Hyderabad to Tenant Arjun Rao. Email: ramesh@example.com Phone: +91-9876543210 Aadhaar: 1234 5678 9012 PAN: ABCDE1234F.'
      },
      clauses: []
    };
  });

  it('pseudonymizes names, emails, phones, aadhaar, pan while ignoring addresses', () => {
    const { pseudonymizedContext, mapping } = PseudonymizationService.pseudonymizeDocument(mockContext);

    const text = pseudonymizedContext.extraction.text;
    
    // Original strings must be gone
    expect(text).not.toContain('Ramesh Kumar');
    expect(text).not.toContain('Arjun Rao');
    expect(text).not.toContain('ramesh@example.com');
    expect(text).not.toContain('+91-9876543210');
    expect(text).not.toContain('1234 5678 9012');
    expect(text).not.toContain('ABCDE1234F');

    // Addresses remain
    expect(text).toContain('Flat 402, ABC Residency, Hyderabad');

    // Mapping contains the correct number of items
    expect(mapping).toHaveLength(6);
    
    // Check type-safe branding
    // The type `PseudonymizedDocumentContext` is returned, though at runtime it's an object
    expect(pseudonymizedContext._isPseudonymized).toBeUndefined(); // Runtime it doesn't exist, it's just a TS brand
  });

  it('avoids placeholder collisions', () => {
    mockContext.extraction.text = 'Pre-existing [[PII_PERSON_01]] is here. Ramesh Kumar is new.';
    
    const { pseudonymizedContext } = PseudonymizationService.pseudonymizeDocument(mockContext);
    const text = pseudonymizedContext.extraction.text;

    // Should NOT overwrite the existing placeholder with Ramesh Kumar
    expect(text).toContain('[[PII_PERSON_01]]');
    expect(text).toContain('[[PII_PERSON_02]]'); // Ramesh Kumar becomes 02

    // Original string preserved
    expect(text).not.toContain('Ramesh Kumar');
  });

  it('restores placeholders back to original text', () => {
    const originalText = 'Ramesh Kumar will contact ramesh@example.com';
    mockContext.extraction.text = originalText;
    
    const { pseudonymizedContext, mapping } = PseudonymizationService.pseudonymizeDocument(mockContext);
    
    const aiSimulatedOutput = `The landlord ${mapping.find(m => m.original === 'Ramesh Kumar')?.placeholder} will email ${mapping.find(m => m.original === 'ramesh@example.com')?.placeholder}.`;
    
    // We use the pseudonymizedContext in a dummy check to silence the linter
    expect(pseudonymizedContext).toBeDefined();
    
    const restoredText = PresentationRestorer.restore(aiSimulatedOutput, mapping);
    
    expect(restoredText).toBe('The landlord Ramesh Kumar will email ramesh@example.com.');
  });

  it('throws application error if text is empty/invalid', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockContext.extraction.text = null as any;
    expect(() => PseudonymizationService.pseudonymizeDocument(mockContext)).toThrow('PSEUDONYMIZATION_FAILED');
  });

  it('throws if invariant check fails (e.g., text remains identical despite mapping)', () => {
    // Mock mapping being generated without text changing
    const spy = vi.spyOn(PseudonymizationService, 'pseudonymizeText').mockReturnValue({
      pseudonymizedText: 'The Landlord Ramesh Kumar agrees to rent Flat 402, ABC Residency, Hyderabad to Tenant Arjun Rao. Email: ramesh@example.com Phone: +91-9876543210 Aadhaar: 1234 5678 9012 PAN: ABCDE1234F.', // Unchanged text
      mapping: [{ original: 'Ramesh Kumar', placeholder: '[[PII_PERSON_01]]', category: 'PERSON_NAME' }]
    });

    expect(() => PseudonymizationService.pseudonymizeDocument(mockContext)).toThrow('PSEUDONYMIZATION_FAILED: Replacement invariant failed.');
    
    spy.mockRestore();
  });
});
