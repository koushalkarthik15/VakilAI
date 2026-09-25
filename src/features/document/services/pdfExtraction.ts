import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

/**
 * Configure worker to use the static synchronized asset from public/
 * Only set this if running in the browser.
 */
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

export interface PdfProcessingResult {
  document: {
    document_id: string;
    filename: string;
    page_count: number;
    mime_type: string;
  };
  extraction: {
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'UNREADABLE' | 'UNSUPPORTED';
    pages: number[];
    text: string;
  };
}

/**
 * Extracts and normalizes text from a raw PDF ArrayBuffer using pdfjs-dist.
 */
export async function extractPdfText(
  buffer: ArrayBuffer,
  fileMetadata: { document_id: string; filename: string; mime_type: string }
): Promise<PdfProcessingResult> {
  
  let pdfDocument: pdfjsLib.PDFDocumentProxy;
  try {
    pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  } catch (error) {
    console.error('PDF.js getDocument error:', error);
    // If the PDF fails to parse entirely, we consider it FAILED.
    return {
      document: {
        document_id: fileMetadata.document_id,
        filename: fileMetadata.filename,
        page_count: 0,
        mime_type: fileMetadata.mime_type
      },
      extraction: {
        status: 'FAILED',
        pages: [],
        text: ''
      }
    };
  }

  const pageCount = pdfDocument.numPages;
  const pages: number[] = [];
  const extractedTextParts: string[] = [];
  
  let hasExtractionFailure = false;
  let hasUsableText = false;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    pages.push(pageNum);
    
    try {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let pageText = '';
      for (const item of textContent.items) {
        if ('str' in item) {
          pageText += (item as TextItem).str;
          if ((item as TextItem).hasEOL) {
            pageText += '\n';
          }
        }
      }
      
      // We do not destructively collapse whitespace.
      // We only ensure the text is recorded exactly as PDF.js sees it.
      if (pageText.trim().length > 0) {
        hasUsableText = true;
      }
      
      extractedTextParts.push(`--- Page ${pageNum} ---\n${pageText}`);
    } catch {
      hasExtractionFailure = true;
      extractedTextParts.push(`--- Page ${pageNum} ---\n[Extraction Failed]`);
    }
  }

  const fullText = extractedTextParts.join('\n\n');
  
  let finalStatus: PdfProcessingResult['extraction']['status'] = 'SUCCESS';
  
  if (hasExtractionFailure) {
    finalStatus = 'PARTIAL';
  }
  
  if (!hasUsableText) {
    finalStatus = 'UNREADABLE';
  }

  return {
    document: {
      document_id: fileMetadata.document_id,
      filename: fileMetadata.filename,
      page_count: pageCount,
      mime_type: fileMetadata.mime_type
    },
    extraction: {
      status: finalStatus,
      pages,
      text: fullText
    }
  };
}
