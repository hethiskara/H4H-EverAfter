# EverAfter

> **"Preserve a Mind Before It Fades"**

EverAfter is an AI-powered memory preservation platform that transforms personal memories into an interactive, explorable life narrative. Built for the modern age of digital wellness, it combines advanced NLP, semantic embeddings, and voice synthesis to create a deeply personal experience.

---

## Technical Architecture

### Core Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React Native (Expo SDK 54) | Cross-platform mobile application |
| **Backend** | Firebase (Firestore, Storage, Auth) | Real-time NoSQL database, media storage, authentication |
| **AI/ML** | OpenAI GPT-4o-mini, text-embedding-3-small | Memory enhancement, semantic analysis |
| **Voice** | ElevenLabs API | Neural text-to-speech synthesis |
| **Audio** | OpenAI Whisper | Speech-to-text transcription |

---

## Key Features & Algorithms

### 1. Intelligent Memory Capture

**Calendar-Based Entry System**
- Custom-built monthly calendar grid with O(1) date lookup for memory indicators
- Modal-based memory entry supporting multimodal input (text, voice, images)
- Real-time Firestore synchronization with optimistic UI updates

**AI-Powered Memory Enhancement**
```
Input: Raw user text
Pipeline:
  1. Structured prompt engineering with GPT-4o-mini
  2. Entity extraction (people, locations, themes)
  3. Emotion classification (16-class taxonomy)
  4. Life stage inference (5-class temporal mapping)
  5. Narrative summarization
Output: Enriched memory object with metadata
```

**Fallback Heuristics**
- Keyword-based emotion inference using regex pattern matching
- Rule-based life stage detection when AI extraction fails
- Ensures 100% field population for downstream analytics

### 2. Memory Galaxy Visualization

**Relationship-Based Clustering Algorithm**
```
Algorithm: PersonClusterAssignment
Input: Set of memories M, threshold k=5

1. Build person frequency map: O(n*p) where p = avg people per memory
2. Sort by frequency, select top-k people as cluster centers
3. For each memory m in M:
   - Assign to first matching cluster (priority by frequency)
   - Default to "Personal" cluster if no match
4. Layout clusters in grid formation with NODE_SPACING=50px

Complexity: O(n*p + n*k) ≈ O(n)
```

**Multi-Dimensional Connection System**

Three connection types with distinct algorithms:

| Type | Algorithm | Complexity | Visual |
|------|-----------|------------|--------|
| **Person-based** | Set intersection on people arrays | O(n²*p) | Purple lines |
| **Location-based** | Hash grouping + temporal span | O(n) | Green lines |
| **Semantic** | Cosine similarity on embeddings | O(n²*d) | Orange lines |

**Semantic Similarity Pipeline**
```
1. Batch embedding generation (chunks of 50)
   - Model: text-embedding-3-small (1536 dimensions)
   - Batching prevents API rate limits
   
2. Pairwise cosine similarity computation
   cosine_sim(A, B) = (A · B) / (||A|| * ||B||)
   
3. Threshold filtering (similarity >= 0.82)
4. Top-k selection (k=20) for visualization
```

**Connection Limiting Strategy**
- Person connections: Top 15 by shared count
- Location connections: First-to-last temporal span only
- Semantic connections: Top 20 by similarity score
- Prevents visual clutter while preserving meaningful relationships

### 3. Memory Highlights Engine

**Happiness Scoring**
```python
HAPPY_EMOTIONS = {Joy, Love, Gratitude, Pride, Excitement, 
                  Peace, Hope, Contentment, Confidence, Nostalgia}

score(memory) = 1 if memory.emotion in HAPPY_EMOTIONS else 0
top_k = sorted(memories, key=score, reverse=True)[:3]
```

**Frequency Analysis**
- Person mention counting with O(n*p) aggregation
- Emotion distribution histogram for "emotional heat" visualization
- Theme co-occurrence matrix for pattern detection

**Narrative Generation**
- Aggregates memory summaries (max 50)
- Single-shot GPT-4o-mini prompt for life theme synthesis
- Temperature=0.6 for creative yet coherent output

### 4. Relive Your Memories (Voice AI)

**Semantic Memory Retrieval**
```
Query Processing:
1. Generate query embedding using text-embedding-3-small
2. Batch compute embeddings for all memories
3. Rank by cosine similarity
4. Return top-3 most relevant memories

Fallback: Keyword matching with TF weighting
```

**First-Person Narrative Generation**
```
Prompt Engineering:
- System: Memory analyst persona
- Context: Top-3 relevant memories with metadata
- Instruction: First-person narrative, <150 words
- Temperature: 0.7 (balanced creativity)
```

**Neural Voice Synthesis**
```
ElevenLabs Integration:
- Model: eleven_monolingual_v1
- Voice settings:
  - Stability: 0.5
  - Similarity boost: 0.75
  - Style: 0.5
  - Speaker boost: enabled
- Output: Base64-encoded audio stream
```

**Audio Playback State Machine**
```
States: IDLE → LOADING → PLAYING ↔ PAUSED → STOPPED
                                ↓
                            FINISHED

Transitions managed via expo-av Sound API
Callback-based completion detection
```

### 5. Media Processing Pipeline

**Voice Recording & Transcription**
```
1. expo-av Recording API (m4a format)
2. Upload to Firebase Storage
3. Parallel: Whisper API transcription
4. Store both URL and transcript in Firestore
```

**Image Handling**
```
1. expo-image-picker (camera/gallery)
2. Firebase Storage upload with unique path
3. URL reference in memory document
```

**Firestore Data Sanitization**
```javascript
function removeUndefined(obj) {
  // Recursive traversal
  // Filters undefined from objects and arrays
  // Required: Firestore rejects undefined values
}
```

---

## Data Models

### Memory Document Schema
```typescript
interface Memory {
  id: string;              // Composite: date_timestamp
  date: string;            // ISO date (YYYY-MM-DD)
  rawText: string;         // Original user input
  enhancedText: string;    // AI-enhanced narrative
  emotion: string;         // 16-class classification
  people: string[];        // Extracted entities
  location: string;        // Geographic reference
  lifeStage: string;       // Temporal classification
  themes: string[];        // Topic tags
  summary: string;         // One-line summary
  media: MediaItem[];      // Attached media
  voiceTranscripts: string[]; // Audio transcriptions
  createdAt: number;       // Unix timestamp
  updatedAt: number;       // Unix timestamp
}
```

### Firestore Structure
```
/users/{uid}/
  └── memories/{memoryId}
        ├── Core fields
        ├── AI-extracted metadata
        └── Media references
```

---

## Performance Optimizations

| Optimization | Implementation | Impact |
|--------------|----------------|--------|
| **Batch Writes** | Firestore batch API for seeding | 500 docs in single transaction |
| **Chunked Deletions** | 400-doc batches to avoid limits | Handles large datasets |
| **Embedding Batching** | 50-text batches to OpenAI | Reduces API calls by 98% |
| **Connection Limiting** | Top-k filtering per type | O(n²) → O(n*k) visual complexity |
| **Lazy Loading** | Month-based memory fetching | Reduces initial load time |
| **Memoization** | useMemo for derived state | Prevents unnecessary recalculations |

---

## Security Considerations

- Firebase Auth REST API for Expo Go compatibility
- AsyncStorage for secure token persistence
- Environment variables for API key management
- Firestore security rules (configurable per deployment)

---

## Future Roadmap

- **Voice Cloning**: Collect user audio samples → ElevenLabs voice clone → Personalized memory narration
- **Advanced Analytics**: Sentiment trends, relationship graphs, life chapter detection
- **Export Features**: PDF life books, audio compilations
- **Collaborative Memories**: Shared family memory spaces

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start --tunnel

# Scan QR code with Expo Go app
```

### Environment Variables
```
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
```

---

## Tech Credits

- **OpenAI** - GPT-4o-mini, Whisper, text-embedding-3-small
- **ElevenLabs** - Neural voice synthesis
- **Firebase** - Backend infrastructure
- **Expo** - React Native toolchain

---

*Built with passion for preserving what matters most - our memories.*
