import { loadEnvConfig } from '@next/env';

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function discoverModels() {
  console.log('Discovering Gemini Models (Primary Key)...');
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error('GEMINI_API_KEY missing');
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
    const geminiData = await geminiRes.json();
    if (geminiData.error) {
      console.error('Gemini API Error:', geminiData.error.message);
    } else {
      const models = geminiData.models
        .map((m: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => m.name.replace('models/', ''))
        .filter((name: string) => name.includes('gemini-1.5') || name.includes('gemini-2.0') || name.includes('gemini-2.5'));
      console.log('Available Gemini Models (Filtered):', models.join(', '));
    }
  } catch (error) {
    console.error('Failed to fetch Gemini models:', error);
  }

  console.log('\nDiscovering Groq Models...');
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) throw new Error('GROQ_API_KEY missing');
    const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${groqKey}` }
    });
    const groqData = await groqRes.json();
    if (groqData.error) {
      console.error('Groq API Error:', groqData.error.message);
    } else {
      const models = groqData.data.map((m: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => m.id);
      console.log('Available Groq Models:', models.join(', '));
    }
  } catch (error) {
    console.error('Failed to fetch Groq models:', error);
  }
}

discoverModels().catch(console.error);
