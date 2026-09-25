import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const reqId = crypto.randomUUID();
    
    console.log(`\n[PDF Parser Log][${reqId}] Received client-side extraction results:`);
    console.log(`[PDF Parser Log][${reqId}] Filename: ${data.filename}`);
    console.log(`[PDF Parser Log][${reqId}] Status: ${data.status}`);
    console.log(`[PDF Parser Log][${reqId}] Text Extracted: ${data.textLength} chars`);
    
    if (data.status === 'FAILED' || data.status === 'UNREADABLE') {
      console.error(`[PDF Parser Log][${reqId}] ❌ Extraction failed on the client side.`);
    } else {
      console.log(`[PDF Parser Log][${reqId}] ✅ Extraction successful.`);
      console.log(`[PDF Parser Log][${reqId}] Text snippet: ${data.snippet}...`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error(`[PDF Parser Log] Error receiving log:`, error);
    return NextResponse.json({ error: 'Failed to process log' }, { status: 500 });
  }
}
