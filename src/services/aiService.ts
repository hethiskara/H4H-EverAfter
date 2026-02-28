const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

interface EnhancedMemory {
  enhancedText: string;
  emotion: string;
  people: string[];
  location: string;
  lifeStage: string;
  themes: string[];
  summary: string;
}

export async function enhanceMemoryWithAI(rawText: string): Promise<EnhancedMemory> {
  console.log('[AI] Enhancing memory...');
  
  const prompt = `Analyze this personal memory and extract structured information. Return ONLY valid JSON, no other text.

Memory: "${rawText}"

Return this exact JSON structure:
{
  "enhancedText": "A more vivid, detailed version of the memory (2-3 sentences)",
  "emotion": "Primary emotion (one word: Joy, Sadness, Love, Gratitude, Nostalgia, Pride, Peace, Excitement, etc.)",
  "people": ["List of people mentioned or implied"],
  "location": "Location if mentioned, or 'Unknown'",
  "lifeStage": "Life stage (Childhood, Teenage, Young Adult, Adult, etc.)",
  "themes": ["2-4 key themes like Family, Achievement, Travel, Love, Growth, etc."],
  "summary": "One sentence summary"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.log('[AI] API Error:', data.error.message);
      return getFallbackEnhancement(rawText);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return getFallbackEnhancement(rawText);
    }

    const parsed = JSON.parse(content);
    console.log('[AI] Enhancement complete');
    return parsed;
  } catch (error) {
    console.log('[AI] Error:', error);
    return getFallbackEnhancement(rawText);
  }
}

function getFallbackEnhancement(rawText: string): EnhancedMemory {
  return {
    enhancedText: rawText,
    emotion: 'Reflective',
    people: [],
    location: 'Unknown',
    lifeStage: 'Adult',
    themes: ['Personal', 'Memory'],
    summary: rawText.slice(0, 100) + (rawText.length > 100 ? '...' : ''),
  };
}
