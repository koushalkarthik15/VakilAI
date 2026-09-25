import { GoogleGenAI } from '@google/genai';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not defined in .env.local');
    process.exit(1);
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    console.log('Fetching available models for your API key...');
    const response = await client.models.list();
    
    // The response is an async iterable in the new @google/genai SDK
    let count = 0;
    for await (const model of response) {
      console.log(`- ${model.name}`);
      count++;
    }
    
    console.log(`\nFound ${count} available models.`);
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listModels();
