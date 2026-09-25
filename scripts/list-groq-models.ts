import { Groq } from 'groq-sdk';

async function listGroqModels() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('Error: GROQ_API_KEY is not defined in your environment.');
    process.exit(1);
  }

  const groq = new Groq({ apiKey });

  try {
    console.log('Fetching available models for your Groq API key...');
    const response = await groq.models.list();
    
    let count = 0;
    // The response.data contains the list of models
    for (const model of response.data) {
      console.log(`- ${model.id}`);
      count++;
    }
    
    console.log(`\nFound ${count} available Groq models.`);
  } catch (error) {
    console.error('Error fetching Groq models:', error);
  }
}

listGroqModels();
