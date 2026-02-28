export interface MediaItem {
  url: string;
  type: 'image' | 'audio';
  transcript?: string;
}

export interface Memory {
  id: string;
  date: string;
  rawText: string;
  enhancedText?: string | null;
  emotion?: string | null;
  people?: string[];
  location?: string | null;
  lifeStage?: string | null;
  themes?: string[];
  summary?: string | null;
  mediaURLs?: string[];
  media?: MediaItem[];
  voiceTranscripts?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DayMemories {
  [date: string]: Memory[];
}
