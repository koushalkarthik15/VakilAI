
import { describe, it, expect } from 'vitest';
import { validatePdfMetadata, validatePdfSignature } from '../../../src/features/document/services/pdfValidation';
import { extractPdfText } from '../../../src/features/document/services/pdfExtraction';
import { DocumentContextSchema } from '../../../src/core/contexts/contracts';
import { minimalValidPdfBase64, emptyPdfBase64, malformedPdfBase64, base64ToArrayBuffer } from '../../fixtures/pdfFixtures';
import * as pdfjsLib from 'pdfjs-dist';
import path from 'path';
import { pathToFileURL } from 'url';

// For Vitest environment, to ensure the worker loads successfully instead of 404ing on a relative '/' URL,
// we map it to the actual synced public asset or node_modules path using a proper file:// URL.
// This preserves the exact production worker strategy while accommodating Node's lack of a static server.
const workerPath = path.resolve(__dirname, '../../../node_modules/pdfjs-dist/build/pdf.worker.mjs');
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const standardFontsPath = path.resolve(__dirname, '../../../node_modules/pdfjs-dist/standard_fonts/');
// @ts-expect-error: standardFontDataUrl might not be typed in this version of the declaration files, but it exists at runtime.
pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = pathToFileURL(standardFontsPath).href + '/';

describe('S1-M1.1: PDF Validation Service', () => {
  it('validates basic metadata correctly', () => {
    const validFile = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
    expect(validatePdfMetadata(validFile).isValid).toBe(true);

    const invalidType = new File(['%PDF-1.4'], 'test.pdf', { type: 'text/plain' });
    expect(validatePdfMetadata(invalidType).error).toBe('INVALID_TYPE');

    const invalidExt = new File(['%PDF-1.4'], 'test.txt', { type: 'application/pdf' });
    expect(validatePdfMetadata(invalidExt).error).toBe('INVALID_EXTENSION');
  });

  it('validates file size limits correctly (10MB)', () => {
    // Under limit
    const smallFile = new File([new Uint8Array(1024)], 'small.pdf', { type: 'application/pdf' });
    expect(validatePdfMetadata(smallFile).isValid).toBe(true);

    // Exactly at limit (10 * 1024 * 1024)
    const exactFile = new File([new Uint8Array(10 * 1024 * 1024)], 'exact.pdf', { type: 'application/pdf' });
    expect(validatePdfMetadata(exactFile).isValid).toBe(true);

    // Over limit
    const oversizedFile = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf', { type: 'application/pdf' });
    expect(validatePdfMetadata(oversizedFile).error).toBe('FILE_TOO_LARGE');
  });

  it('validates magic bytes correctly', () => {
    const validBuffer = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]).buffer; // %PDF-1.4
    expect(validatePdfSignature(validBuffer).isValid).toBe(true);

    const invalidBuffer = new Uint8Array([0, 1, 2, 3, 4, 5]).buffer;
    expect(validatePdfSignature(invalidBuffer).error).toBe('INVALID_SIGNATURE');
    
    const shortBuffer = new Uint8Array([37, 80]).buffer;
    expect(validatePdfSignature(shortBuffer).error).toBe('INVALID_SIGNATURE');
  });
});

describe('S1-M1.1: PDF Extraction Service', () => {
  const defaultMeta = { document_id: 'doc_123', filename: 'test.pdf', mime_type: 'application/pdf' };

  it('successfully extracts a valid text PDF and maps to DocumentContext shape', async () => {
    const buffer = base64ToArrayBuffer(minimalValidPdfBase64);
    const result = await extractPdfText(buffer, defaultMeta);

    expect(result.extraction.status).toBe('SUCCESS');
    expect(result.extraction.pages).toEqual([1]);
    expect(result.extraction.text).toContain('Hello World');
    
    // Verify compatibility with DocumentContext (extraction and document shapes)
    expect(() => DocumentContextSchema.shape.extraction.parse(result.extraction)).not.toThrow();
    expect(() => DocumentContextSchema.shape.document.parse(result.document)).not.toThrow();
  });

  it('identifies malformed PDFs and maps to FAILED', async () => {
    const buffer = base64ToArrayBuffer(malformedPdfBase64);
    const result = await extractPdfText(buffer, defaultMeta);

    expect(result.extraction.status).toBe('FAILED');
    expect(result.extraction.pages).toEqual([]);
    expect(result.extraction.text).toBe('');
    
    expect(() => DocumentContextSchema.shape.extraction.parse(result.extraction)).not.toThrow();
    
    // Security check: ensure raw buffer or filename isn't leaked into a stack trace or log unsafely
    // (This is implicitly tested by the service catching all exceptions and returning standard FAILED)
  });

  it('identifies zero-text PDFs and maps to UNREADABLE', async () => {
    const buffer = base64ToArrayBuffer(emptyPdfBase64);
    const result = await extractPdfText(buffer, defaultMeta);

    expect(result.extraction.status).toBe('UNREADABLE');
    expect(result.extraction.pages).toEqual([1]);
    expect(result.extraction.text.trim()).toBe('--- Page 1 ---');
    
    expect(() => DocumentContextSchema.shape.extraction.parse(result.extraction)).not.toThrow();
  });
});
