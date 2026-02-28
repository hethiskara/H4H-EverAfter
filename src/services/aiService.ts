interface EnhancedMemory {
  enhancedText: string;
  emotion: string;
  people: string[];
  location: string;
  lifeStage: string;
  themes: string[];
  summary: string;
}

const getApiKey = () => {
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
};

export async function enhanceMemoryWithAI(rawText: string): Promise<EnhancedMemory> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.log('[AI] No API key configured');
    throw new Error('AI enhancement not configured. Please add your OpenAI API key.');
  }
  
  console.log('[AI] Enhancing memory...');
  
  const systemPrompt = `You are a memory analyst for a personal memory preservation app called EverAfter. Your job is to analyze personal memories and extract meaningful insights. Be warm, empathetic, and insightful. Always return valid JSON only.`;
  
  const userPrompt = `Analyze this personal memory and provide structured insights:

"${rawText}"

Instructions:
1. enhancedText: Rewrite the memory in a more vivid, emotionally rich way (2-3 sentences). Add sensory details and emotional depth while staying true to the original.
2. emotion: Identify the PRIMARY emotion (choose one: Joy, Love, Gratitude, Pride, Excitement, Peace, Nostalgia, Hope, Contentment, Sadness, Anxiety, Longing)
3. people: List all people mentioned or clearly implied (use names if given, or relationships like "Mom", "Friend")
4. location: Extract location if mentioned, otherwise "Not specified"
5. lifeStage: Determine life stage (Childhood, Teenage Years, Young Adult, Adult, Senior)
6. themes: Identify 2-4 life themes (Family, Friendship, Achievement, Growth, Adventure, Romance, Career, Health, Spirituality, Learning, Creativity, Nature)
7. summary: One powerful sentence capturing the essence of this memory

Return ONLY this JSON structure:
{
  "enhancedText": "...",
  "emotion": "...",
  "people": ["..."],
  "location": "...",
  "lifeStage": "...",
  "themes": ["..."],
  "summary": "..."
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const data = await response.json();
    console.log('[AI] Response received');
    
    if (data.error) {
      console.log('[AI] API Error:', data.error.message);
      throw new Error(data.error.message);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('[AI] Enhancement complete:', parsed.emotion);
    
    return {
      enhancedText: parsed.enhancedText || rawText,
      emotion: parsed.emotion || 'Reflective',
      people: Array.isArray(parsed.people) ? parsed.people : [],
      location: parsed.location || 'Not specified',
      lifeStage: parsed.lifeStage || 'Adult',
      themes: Array.isArray(parsed.themes) ? parsed.themes : ['Personal'],
      summary: parsed.summary || rawText.slice(0, 100),
    };
  } catch (error: any) {
    console.log('[AI] Error:', error.message);
    throw error;
  }
}
