import { GoogleGenAI } from '@google/genai';

async function testModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not defined.');
    process.exit(1);
  }

  const client = new GoogleGenAI({ apiKey });

  console.log(`Testing generation with model: ${modelName}...`);
  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: 'Hello, are you online? Reply with a single word: YES.' }] }
      ]
    });
    
    console.log('\n✅ Success! Response from model:');
    console.log(response.text);
    console.log('\nYour API key and model configuration are working perfectly!');
  } catch (error) {
    console.error('\n❌ Error generating content:');
    console.error(error);
  }
}

testModel();
