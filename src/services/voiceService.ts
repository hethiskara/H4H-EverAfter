import { Audio } from 'expo-av';
import { getAllMemories } from './memoryService';
import { getEmbeddingsBatch, cosineSimilarity } from './aiService';
import { Memory } from '../types/memory';

const ELEVENLABS_API_KEY = 'sk_cfa29557b334539253da5d127502092d8710239fce3b8255';
const ELEVENLABS_VOICE_ID = 'K6WfMhWKHCmnnSDX18hJ';

const getOpenAIKey = () => process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export interface SpeakResponse {
  text: string;
  audioUri: string | null;
  relevantMemories: Memory[];
}

export async function findRelevantMemories(query: string, topK: number = 3): Promise<Memory[]> {
  console.log('[Voice] Finding relevant memories for:', query);
  
  const memories = await getAllMemories();
  if (memories.length === 0) return [];

  const texts = memories.map(m => m.rawText || m.summary || '');
  const allTexts = [query, ...texts];
  
  const embeddings = await getEmbeddingsBatch(allTexts);
  
  if (embeddings[0].length === 0) {
    console.log('[Voice] Embeddings failed, using keyword matching');
    return keywordMatch(query, memories, topK);
  }

  const queryEmbedding = embeddings[0];
  const memoryEmbeddings = embeddings.slice(1);

  const scored = memories.map((memory, i) => ({
    memory,
    score: cosineSimilarity(queryEmbedding, memoryEmbeddings[i]),
  }));

  scored.sort((a, b) => b.score - a.score);
  
  const topMemories = scored.slice(0, topK).map(s => s.memory);
  console.log('[Voice] Found top memories with scores:', scored.slice(0, topK).map(s => s.score.toFixed(3)));
  
  return topMemories;
}

function keywordMatch(query: string, memories: Memory[], topK: number): Memory[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const scored = memories.map(memory => {
    const text = `${memory.rawText} ${memory.summary} ${memory.themes?.join(' ')} ${memory.people?.join(' ')} ${memory.location}`.toLowerCase();
    let score = 0;
    
    for (const word of queryWords) {
      if (text.includes(word)) score += 1;
    }
    
    return { memory, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.memory);
}

export async function generateNarrativeResponse(query: string, memories: Memory[]): Promise<string> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const memoriesContext = memories.map((m, i) => {
    const date = new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { 
      month: 'long', day: 'numeric', year: 'numeric' 
    });
    return `Memory ${i + 1} (${date}):
"${m.rawText}"
Emotion: ${m.emotion || 'Not specified'}
People: ${m.people?.join(', ') || 'None mentioned'}
Location: ${m.location || 'Not specified'}`;
  }).join('\n\n');

  const prompt = `You are helping someone relive their memories. Based on these personal memories, answer their question in first-person narrative as if you ARE them remembering. Be warm, reflective, and emotionally authentic. Keep it conversational and under 150 words.

USER'S MEMORIES:
${memoriesContext}

USER'S QUESTION: "${query}"

Respond as if you are the person remembering these moments. Start naturally without phrases like "Based on my memories" - just speak from the heart.`;

  console.log('[Voice] Generating narrative response...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('No response generated');

  console.log('[Voice] Generated response:', text.slice(0, 100) + '...');
  return text;
}

export async function textToSpeech(text: string): Promise<string> {
  console.log('[Voice] Converting to speech with ElevenLabs...');

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log('[Voice] ElevenLabs error:', error);
    throw new Error('Voice synthesis failed');
  }

  const audioBlob = await response.blob();
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

export async function speakWithMemories(query: string): Promise<SpeakResponse> {
  console.log('[Voice] Starting speak with memories flow...');

  const relevantMemories = await findRelevantMemories(query, 3);
  
  if (relevantMemories.length === 0) {
    return {
      text: "I don't have any memories stored yet. Start adding some memories to your calendar, and I'll be able to help you remember.",
      audioUri: null,
      relevantMemories: [],
    };
  }

  const text = await generateNarrativeResponse(query, relevantMemories);
  
  let audioUri: string | null = null;
  try {
    audioUri = await textToSpeech(text);
  } catch (err) {
    console.log('[Voice] TTS failed, returning text only:', err);
  }

  return { text, audioUri, relevantMemories };
}

let currentSound: Audio.Sound | null = null;
let onPlaybackFinished: (() => void) | null = null;

export async function playAudio(base64Uri: string, onFinished?: () => void): Promise<void> {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    onPlaybackFinished = onFinished || null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync({ uri: base64Uri });
    currentSound = sound;
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
        if (onPlaybackFinished) {
          onPlaybackFinished();
          onPlaybackFinished = null;
        }
      }
    });

    await sound.playAsync();
  } catch (err) {
    console.log('[Voice] Playback error:', err);
    throw err;
  }
}

export async function pauseAudio(): Promise<void> {
  if (currentSound) {
    await currentSound.pauseAsync();
  }
}

export async function resumeAudio(): Promise<void> {
  if (currentSound) {
    await currentSound.playAsync();
  }
}

export async function stopAudio(): Promise<void> {
  onPlaybackFinished = null;
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (err) {
      console.log('[Voice] Stop error:', err);
    }
    currentSound = null;
  }
}
