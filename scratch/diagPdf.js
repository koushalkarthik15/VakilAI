// Diagnostic script: What does pdfjs extract from FAIL_PROVIDER.pdf?
const fs = require('fs');
const path = require('path');

// Read the raw PDF
const pdfPath = path.join(__dirname, '..', 'tests', 'e2e', 'fixtures', 'FAIL_PROVIDER.pdf');
const pdfBuffer = fs.readFileSync(pdfPath);
const pdfText = pdfBuffer.toString('utf8');

console.log('=== RAW PDF CONTENT ===');
console.log(pdfText);
console.log('');

// Check for FAIL_PROVIDER in the raw PDF
console.log('Contains FAIL_PROVIDER (raw):', pdfText.includes('FAIL_PROVIDER'));
console.log('Contains FAIL PROVIDER (raw):', pdfText.includes('FAIL PROVIDER'));

// Now simulate what pdfjs would extract
// The Tj operator text is inside parentheses
const tjMatch = pdfText.match(/\(([^)]+)\)\s*Tj/);
if (tjMatch) {
  console.log('');
  console.log('=== TEXT FROM Tj OPERATOR ===');
  console.log(JSON.stringify(tjMatch[1]));
  console.log('Contains FAIL_PROVIDER:', tjMatch[1].includes('FAIL_PROVIDER'));
  console.log('Contains FAIL PROVIDER:', tjMatch[1].includes('FAIL PROVIDER'));
  
  // Check each character around FAIL_PROVIDER
  const idx = tjMatch[1].indexOf('FAIL');
  if (idx >= 0) {
    console.log('');
    console.log('=== CHARACTERS AROUND "FAIL" ===');
    for (let i = idx; i < Math.min(idx + 20, tjMatch[1].length); i++) {
      console.log(`  [${i}] char=${JSON.stringify(tjMatch[1][i])} code=${tjMatch[1].charCodeAt(i)}`);
    }
  }
}
