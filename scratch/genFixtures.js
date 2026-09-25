const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

(async () => {
  try {
    // 1. Create Valid PDF with text
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    page.drawText('Hello World');
    const valid = await doc.saveAsBase64();

    // 2. Create Empty PDF (0 text)
    const doc2 = await PDFDocument.create();
    doc2.addPage();
    const empty = await doc2.saveAsBase64();

    // 3. Write to the test fixture file
    const content = `/**
 * S1-M1.1: PDF Test Fixtures (Generated via pdf-lib)
 */
export const minimalValidPdfBase64 = "${valid}";
export const emptyPdfBase64 = "${empty}";
export const malformedPdfBase64 = "JVBERi0xLjcKSlZCRVFR"; // invalid base64 padding/magic

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
`;

    fs.writeFileSync('tests/fixtures/pdfFixtures.ts', content);
    console.log('Fixtures successfully generated!');
  } catch (error) {
    console.error('Error generating fixtures:', error);
  }
})();
