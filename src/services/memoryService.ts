import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, getCurrentUser } from '../config/firebase';
import { Memory } from '../types/memory';

function removeUndefined(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export async function saveMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const memoryId = `${memory.date}_${Date.now()}`;
  const memoryRef = doc(db, 'users', user.uid, 'memories', memoryId);
  
  const fullMemory: Memory = {
    id: memoryId,
    date: memory.date,
    rawText: memory.rawText,
    enhancedText: memory.enhancedText || null,
    emotion: memory.emotion || null,
    people: memory.people || [],
    location: memory.location || null,
    lifeStage: memory.lifeStage || null,
    themes: memory.themes || [],
    summary: memory.summary || null,
    mediaURLs: memory.mediaURLs || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const cleanedMemory = removeUndefined(fullMemory);
  
  await setDoc(memoryRef, cleanedMemory);
  console.log('[Memory] Saved:', memoryId);
  return memoryId;
}

export async function getMemoriesForMonth(year: number, month: number): Promise<Memory[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

  try {
    const memoriesRef = collection(db, 'users', user.uid, 'memories');
    const q = query(
      memoriesRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const memories: Memory[] = [];
    snapshot.forEach(doc => memories.push(doc.data() as Memory));
    console.log('[Memory] Loaded', memories.length, 'memories for', year, month + 1);
    return memories;
  } catch (error) {
    console.log('[Memory] Load error:', error);
    return [];
  }
}

export async function getAllMemories(): Promise<Memory[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const memoriesRef = collection(db, 'users', user.uid, 'memories');
    const q = query(memoriesRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const memories: Memory[] = [];
    snapshot.forEach(doc => memories.push(doc.data() as Memory));
    return memories;
  } catch (error) {
    console.log('[Memory] Load all error:', error);
    return [];
  }
}
