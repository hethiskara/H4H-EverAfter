interface EnhancedMemory {
  enhancedText: string;
  emotion: string;
  people: string[];
  location: string;
  lifeStage: string;
  themes: string[];
  summary: string;
}

export function inferEmotionFromText(text: string): string {
  const t = text.toLowerCase();
  if (/\b(proud|accomplish|achieved|won)\b/.test(t)) return 'Pride';
  if (/\b(happy|joy|glad|wonderful|beautiful|amazing)\b/.test(t)) return 'Joy';
  if (/\b(love|lovely|beloved|heart)\b/.test(t)) return 'Love';
  if (/\b(grateful|thankful|blessed)\b/.test(t)) return 'Gratitude';
  if (/\b(excited|thrilled|can't wait)\b/.test(t)) return 'Excitement';
  if (/\b(calm|peaceful|serene|relaxed)\b/.test(t)) return 'Peace';
  if (/\b(miss|nostalgic|remember|back then)\b/.test(t)) return 'Nostalgia';
  if (/\b(hope|hopeful|looking forward)\b/.test(t)) return 'Hope';
  if (/\b(content|satisfied|okay|fine)\b/.test(t)) return 'Contentment';
  if (/\b(sad|sorrow|miss you)\b/.test(t)) return 'Sadness';
  if (/\b(worried|anxious|nervous)\b/.test(t)) return 'Anxiety';
  if (/\b(longing|wish|craving)\b/.test(t)) return 'Longing';
  if (/\b(confident|independent|single)\b/.test(t)) return 'Confidence';
  return 'Reflective';
}

export function inferLifeStageFromText(text: string): string {
  const t = text.toLowerCase();
  if (/\b(kid|child|elementary|grade school)\b/.test(t)) return 'Childhood';
  if (/\b(teen|high school|college|university|student)\b/.test(t)) return 'Teenage Years';
  if (/\b(single|first job|graduated|moving out|dating)\b/.test(t)) return 'Young Adult';
  if (/\b(retired|grandchild|grandparent|senior)\b/.test(t)) return 'Senior';
  return 'Adult';
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
  
  const systemPrompt = `You are a memory analyst for EverAfter, a personal memory preservation app. Extract structured insights from memories. CRITICAL: You MUST always provide "emotion" and "lifeStage" - infer from context even when not explicit. Never leave them empty. Return valid JSON only.`;
  
  const userPrompt = `Analyze this personal memory and extract structured insights:

"${rawText}"

REQUIRED - never skip:
• emotion: The PRIMARY emotion felt. Choose one: Joy, Love, Gratitude, Pride, Excitement, Peace, Nostalgia, Hope, Contentment, Sadness, Anxiety, Longing, Confidence, Independence. Infer from words like "proud", "happy", "miss", "excited", "calm", "grateful".
• lifeStage: Infer from context. Choose: Childhood, Teenage Years, Young Adult, Adult, Senior. Hints: "single", "college", "first job" → Young Adult; "kids", "career" → Adult; "retired", "grandchildren" → Senior.

Also extract:
• enhancedText: Rewrite vividly (2-3 sentences). Add emotional depth.
• people: Names or relationships mentioned (e.g. "Mom", "Friend")
• location: Place if mentioned, else "Not specified"
• themes: 2-4 themes: Family, Friendship, Achievement, Growth, Adventure, Romance, Career, Health, Spirituality, Learning, Creativity, Nature, Independence
• summary: One sentence capturing the essence

Return ONLY this JSON (no markdown, no extra text):
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
        temperature: 0.4,
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
    const emotion = parsed.emotion?.trim() || inferEmotionFromText(rawText);
    const lifeStage = parsed.lifeStage?.trim() || inferLifeStageFromText(rawText);
    console.log('[AI] Enhancement complete:', { emotion, lifeStage });
    
    return {
      enhancedText: parsed.enhancedText?.trim() || rawText,
      emotion,
      people: Array.isArray(parsed.people) ? parsed.people : [],
      location: parsed.location?.trim() || 'Not specified',
      lifeStage,
      themes: Array.isArray(parsed.themes) ? parsed.themes : ['Personal'],
      summary: parsed.summary?.trim() || rawText.slice(0, 100),
    };
  } catch (error: any) {
    console.log('[AI] Error:', error.message);
    throw error;
  }
}
