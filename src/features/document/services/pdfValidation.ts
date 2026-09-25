/**
 * S1-M1.1: PDF Validation Service
 * 
 * Provides deterministic validation of PDF files before extraction.
 * Validates File type, extension, and magic bytes.
 */

export interface PdfValidationResult {
  isValid: boolean;
  error?: 'INVALID_TYPE' | 'INVALID_EXTENSION' | 'INVALID_SIGNATURE' | 'FILE_TOO_LARGE';
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates basic file metadata to prevent processing non-PDFs.
 */
export function validatePdfMetadata(file: File): PdfValidationResult {
  if (file.type && file.type !== 'application/pdf') {
    return { isValid: false, error: 'INVALID_TYPE' };
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { isValid: false, error: 'INVALID_EXTENSION' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'FILE_TOO_LARGE' };
  }
  return { isValid: true };
}

/**
 * Validates the PDF magic bytes (%PDF-) from the first 5 bytes of the buffer.
 */
export function validatePdfSignature(buffer: ArrayBuffer): PdfValidationResult {
  if (buffer.byteLength < 5) {
    return { isValid: false, error: 'INVALID_SIGNATURE' };
  }
  
  const view = new Uint8Array(buffer, 0, 5);
  // %PDF- corresponds to 37, 80, 68, 70, 45
  if (view[0] !== 37 || view[1] !== 80 || view[2] !== 68 || view[3] !== 70 || view[4] !== 45) {
    return { isValid: false, error: 'INVALID_SIGNATURE' };
  }
  
  return { isValid: true };
}
