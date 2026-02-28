export interface Memory {
  id?: string;
  date: string;
  rawText: string;
  enhancedText?: string;
  emotion?: string;
  people?: string[];
  location?: string;
  lifeStage?: string;
  themes?: string[];
  summary?: string;
  mediaURLs?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DayMemories {
  [date: string]: Memory[];
}
