import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { speakWithMemories, playAudio, stopAudio, pauseAudio, resumeAudio, SpeakResponse } from '../services/voiceService';
import { Memory } from '../types/memory';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  "What was my happiest moment recently?",
  "Tell me about my family memories",
  "How did I feel during my achievements?",
  "What adventures have I been on?",
  "Remind me of times with friends",
];

export default function ReliveMemories({ visible, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [response, setResponse] = useState<SpeakResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (questionText?: string) => {
    const q = questionText || query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setIsPlaying(false);
    setIsPaused(false);

    try {
      setLoadingStage('Searching memories...');
      await new Promise(r => setTimeout(r, 500));
      
      setLoadingStage('Crafting your story...');
      const result = await speakWithMemories(q);
      
      setLoadingStage('Preparing voice...');
      await new Promise(r => setTimeout(r, 300));
      
      setResponse(result);
      setLoading(false);
      setLoadingStage('');

      if (result.audioUri) {
        setIsPlaying(true);
        playAudio(result.audioUri, () => {
          setIsPlaying(false);
          setIsPaused(false);
        });
      }
    } catch (err: any) {
      console.log('[Relive] Error:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handlePlayAgain = async () => {
    if (response?.audioUri) {
      setIsPlaying(true);
      setIsPaused(false);
      try {
        playAudio(response.audioUri, () => {
          setIsPlaying(false);
          setIsPaused(false);
        });
      } catch (err) {
        console.log('[Relive] Replay error:', err);
        setIsPlaying(false);
      }
    }
  };

  const handlePause = async () => {
    await pauseAudio();
    setIsPaused(true);
  };

  const handleResume = async () => {
    await resumeAudio();
    setIsPaused(false);
  };

  const handleStop = async () => {
    await stopAudio();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleClose = () => {
    stopAudio();
    setQuery('');
    setResponse(null);
    setError(null);
    setIsPlaying(false);
    setIsPaused(false);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#0a0a25', '#12123a', '#0a0a25']}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Relive Your Memories</Text>
            <Text style={styles.subtitle}>Ask anything about your past</Text>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Voice Orb - Static */}
            <View style={styles.orbContainer}>
              <View style={styles.orb}>
                {loading ? (
                  <ActivityIndicator size="large" color="#FFF" />
                ) : isPlaying ? (
                  <View style={styles.speakingIndicator}>
                    <View style={[styles.soundBar, styles.soundBar1]} />
                    <View style={[styles.soundBar, styles.soundBar2]} />
                    <View style={[styles.soundBar, styles.soundBar3]} />
                    <View style={[styles.soundBar, styles.soundBar2]} />
                    <View style={[styles.soundBar, styles.soundBar1]} />
                  </View>
                ) : (
                  <Text style={styles.orbIcon}>🎙</Text>
                )}
              </View>
              {loading && <Text style={styles.loadingText}>{loadingStage}</Text>}
              {isPlaying && !isPaused && <Text style={styles.playingText}>Speaking...</Text>}
              {isPaused && <Text style={styles.pausedText}>Paused</Text>}
            </View>

            {/* Input */}
            {!response && !loading && (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ask about your memories..."
                    placeholderTextColor="#6B6B8D"
                    value={query}
                    onChangeText={setQuery}
                    multiline
                    maxLength={200}
                  />
                  <TouchableOpacity
                    style={[styles.askBtn, !query.trim() && styles.askBtnDisabled]}
                    onPress={() => handleAsk()}
                    disabled={!query.trim()}
                  >
                    <Text style={styles.askBtnText}>Ask</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.suggestionsTitle}>Try asking:</Text>
                <View style={styles.suggestions}>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.suggestionChip}
                      onPress={() => {
                        setQuery(q);
                        handleAsk(q);
                      }}
                    >
                      <Text style={styles.suggestionText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Response */}
            {response && (
              <View style={styles.responseSection}>
                <View style={styles.responseCard}>
                  <Text style={styles.responseText}>{response.text}</Text>
                </View>

                <View style={styles.playbackControls}>
                  {isPlaying ? (
                    <>
                      {isPaused ? (
                        <TouchableOpacity style={styles.controlBtn} onPress={handleResume}>
                          <Text style={styles.controlBtnText}>Resume</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.controlBtn} onPress={handlePause}>
                          <Text style={styles.controlBtnText}>Pause</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={handleStop}>
                        <Text style={styles.controlBtnText}>Stop</Text>
                      </TouchableOpacity>
                    </>
                  ) : response.audioUri ? (
                    <TouchableOpacity style={styles.controlBtn} onPress={handlePlayAgain}>
                      <Text style={styles.controlBtnText}>Play Again</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.controlBtn, styles.newQuestionBtn]}
                    onPress={() => {
                      stopAudio();
                      setResponse(null);
                      setQuery('');
                      setIsPlaying(false);
                      setIsPaused(false);
                    }}
                  >
                    <Text style={styles.controlBtnText}>New Question</Text>
                  </TouchableOpacity>
                </View>

                {response.relevantMemories.length > 0 && (
                  <View style={styles.memoriesUsed}>
                    <Text style={styles.memoriesUsedTitle}>Based on these memories:</Text>
                    {response.relevantMemories.map((m, i) => (
                      <View key={i} style={styles.memoryChip}>
                        <Text style={styles.memoryChipDate}>{formatDate(m.date)}</Text>
                        <Text style={styles.memoryChipText} numberOfLines={2}>
                          {m.rawText}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Error */}
            {error && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    setError(null);
                    handleAsk();
                  }}
                >
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { flex: 1, marginTop: 50, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 10, paddingHorizontal: 20 },
  closeBtn: { position: 'absolute', top: 20, right: 20 },
  closeBtnText: { color: '#A78BFA', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#FFF', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#8888AA', marginTop: 4 },

  content: { flex: 1, paddingHorizontal: 24 },

  orbContainer: { alignItems: 'center', marginVertical: 30 },
  orb: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(167,139,250,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(167,139,250,0.5)' },
  orbIcon: { fontSize: 40 },
  loadingText: { color: '#A78BFA', fontSize: 14, marginTop: 16, fontWeight: '500' },
  playingText: { color: '#50C878', fontSize: 14, marginTop: 16, fontWeight: '500' },
  pausedText: { color: '#FFD700', fontSize: 14, marginTop: 16, fontWeight: '500' },

  speakingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  soundBar: { width: 6, backgroundColor: '#FFF', borderRadius: 3 },
  soundBar1: { height: 16 },
  soundBar2: { height: 28 },
  soundBar3: { height: 36 },

  inputContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minHeight: 56, maxHeight: 100 },
  askBtn: { backgroundColor: '#A78BFA', paddingHorizontal: 24, borderRadius: 16, justifyContent: 'center' },
  askBtnDisabled: { backgroundColor: 'rgba(167,139,250,0.3)' },
  askBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  suggestionsTitle: { color: '#6B6B8D', fontSize: 13, marginBottom: 12 },
  suggestions: { gap: 10 },
  suggestionChip: { backgroundColor: 'rgba(255,255,255,0.04)', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  suggestionText: { color: '#CCC', fontSize: 14 },

  responseSection: { marginTop: 10 },
  responseCard: { backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  responseText: { color: '#E5E5E5', fontSize: 17, lineHeight: 28, fontStyle: 'italic' },

  playbackControls: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  controlBtn: { flex: 1, minWidth: 80, backgroundColor: 'rgba(167,139,250,0.2)', paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  stopBtn: { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.3)' },
  newQuestionBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
  controlBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  memoriesUsed: { marginTop: 24 },
  memoriesUsedTitle: { color: '#6B6B8D', fontSize: 12, marginBottom: 12, fontWeight: '600' },
  memoryChip: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  memoryChipDate: { color: '#A78BFA', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  memoryChipText: { color: '#999', fontSize: 13, lineHeight: 18 },

  errorCard: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: 'rgba(239,68,68,0.2)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  retryBtnText: { color: '#EF4444', fontWeight: '600' },
});
