import { getAllMemories } from './memoryService';
import { generateLifeSummary, isHappyEmotion } from './aiService';
import { Memory } from '../types/memory';

export interface HighlightsData {
  topHappiest: Memory[];
  mostFrequentPerson: string;
  emotionalHeat: { emotion: string; count: number }[];
  narrativeSummary: string;
}

export async function getHighlights(): Promise<HighlightsData> {
  const memories = await getAllMemories();
  
  const happyMemories = memories.filter(m => isHappyEmotion(m.emotion));
  const topHappiest = [...happyMemories]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 3);
  
  if (topHappiest.length < 3) {
    const remaining = memories.filter(m => !happyMemories.includes(m));
    topHappiest.push(...remaining.slice(0, 3 - topHappiest.length));
  }

  const personCounts: Record<string, number> = {};
  for (const m of memories) {
    for (const p of m.people || []) {
      const name = p.trim();
      if (name) personCounts[name] = (personCounts[name] || 0) + 1;
    }
  }
  const sortedPeople = Object.entries(personCounts).sort((a, b) => b[1] - a[1]);
  const mostFrequentPerson = sortedPeople[0]?.[0] || '—';

  const emotionCounts: Record<string, number> = {};
  for (const m of memories) {
    const e = m.emotion?.trim() || 'Uncategorized';
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  }
  const emotionalHeat = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => ({ emotion, count }));

  const summaries = memories
    .map(m => m.summary || m.rawText?.slice(0, 150))
    .filter(Boolean);
  const narrativeSummary = await generateLifeSummary(summaries);

  return {
    topHappiest,
    mostFrequentPerson,
    emotionalHeat,
    narrativeSummary,
  };
}
