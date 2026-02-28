import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveMemory } from '../services/memoryService';
import { enhanceMemoryWithAI } from '../services/aiService';
import { Memory } from '../types/memory';

interface MemoryModalProps {
  visible: boolean;
  date: string;
  existingMemories: Memory[];
  onClose: () => void;
  onSaved: () => void;
}

export default function MemoryModal({ visible, date, existingMemories, onClose, onSaved }: MemoryModalProps) {
  const [mode, setMode] = useState<'list' | 'new'>('list');
  const [text, setText] = useState('');
  const [enhancedData, setEnhancedData] = useState<Partial<Memory> | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setMode(existingMemories.length > 0 ? 'list' : 'new');
      setText('');
      setEnhancedData(null);
    }
  }, [visible, existingMemories.length]);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleEnhance = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Memory', 'Please write something first');
      return;
    }
    setEnhancing(true);
    try {
      const enhanced = await enhanceMemoryWithAI(text);
      setEnhancedData(enhanced);
    } catch (err: any) {
      Alert.alert('AI Enhancement Failed', err.message || 'Could not enhance memory. You can still save it.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Memory', 'Please write something first');
      return;
    }
    setSaving(true);
    try {
      await saveMemory({
        date,
        rawText: text,
        enhancedText: enhancedData?.enhancedText,
        emotion: enhancedData?.emotion,
        people: enhancedData?.people,
        location: enhancedData?.location,
        lifeStage: enhancedData?.lifeStage,
        themes: enhancedData?.themes,
        summary: enhancedData?.summary,
        mediaURLs: [],
      });
      setText('');
      setEnhancedData(null);
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setText('');
    setEnhancedData(null);
    setMode('list');
    onClose();
  };

  const renderMemoryList = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Memories</Text>
        <Text style={styles.date}>{formatDisplayDate(date)}</Text>
      </View>

      {existingMemories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No memories for this day</Text>
          <Text style={styles.emptySubtext}>Tap below to add your first memory</Text>
        </View>
      ) : (
        <View style={styles.memoriesList}>
          {existingMemories.map((memory, index) => (
            <View key={memory.id || index} style={styles.memoryItem}>
              <View style={styles.memoryHeader}>
                {memory.emotion && (
                  <View style={styles.emotionBadge}>
                    <Text style={styles.emotionText}>{memory.emotion}</Text>
                  </View>
                )}
                <Text style={styles.memoryTime}>{formatTime(memory.createdAt)}</Text>
              </View>
              <Text style={styles.memoryText}>{memory.rawText}</Text>
              {memory.enhancedText && memory.enhancedText !== memory.rawText && (
                <View style={styles.enhancedBox}>
                  <Text style={styles.enhancedLabel}>✨ Enhanced</Text>
                  <Text style={styles.enhancedText}>{memory.enhancedText}</Text>
                </View>
              )}
              {memory.themes && memory.themes.length > 0 && (
                <View style={styles.themesRow}>
                  {memory.themes.map((theme, i) => (
                    <View key={i} style={styles.themeBadge}>
                      <Text style={styles.themeText}>{theme}</Text>
                    </View>
                  ))}
                </View>
              )}
              {memory.people && memory.people.length > 0 && (
                <Text style={styles.peopleText}>👥 {memory.people.join(', ')}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={() => setMode('new')} activeOpacity={0.8}>
        <LinearGradient
          colors={['#5B4FC4', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ Add New Memory</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
        <Text style={styles.cancelBtnText}>Close</Text>
      </TouchableOpacity>
    </>
  );

  const renderNewMemory = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {existingMemories.length > 0 && (
            <TouchableOpacity onPress={() => setMode('list')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>New Memory</Text>
            <Text style={styles.date}>{formatDisplayDate(date)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>What happened?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Write your memory here..."
          placeholderTextColor="#52527A"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.mediaSection}>
        <View style={styles.mediaLabelRow}>
          <Text style={styles.label}>Add Media</Text>
          <Text style={styles.comingSoon}>Coming Soon</Text>
        </View>
        <View style={styles.mediaButtons}>
          <View style={styles.mediaBtnDisabled}>
            <Text style={styles.mediaIcon}>🎤</Text>
            <Text style={styles.mediaBtnText}>Voice</Text>
          </View>
          <View style={styles.mediaBtnDisabled}>
            <Text style={styles.mediaIcon}>📷</Text>
            <Text style={styles.mediaBtnText}>Photo</Text>
          </View>
          <View style={styles.mediaBtnDisabled}>
            <Text style={styles.mediaIcon}>🎬</Text>
            <Text style={styles.mediaBtnText}>Video</Text>
          </View>
        </View>
      </View>

      {enhancedData && (
        <View style={styles.enhancedSection}>
          <Text style={styles.enhancedTitle}>✨ AI Enhanced</Text>
          
          <View style={styles.enhancedRow}>
            <Text style={styles.enhancedLabel}>Emotion</Text>
            <View style={styles.emotionBadgeLarge}>
              <Text style={styles.emotionTextLarge}>{enhancedData.emotion}</Text>
            </View>
          </View>

          {enhancedData.enhancedText && (
            <View style={styles.enhancedRow}>
              <Text style={styles.enhancedLabel}>Enhanced Version</Text>
              <Text style={styles.enhancedValue}>{enhancedData.enhancedText}</Text>
            </View>
          )}

          {enhancedData.people && enhancedData.people.length > 0 && (
            <View style={styles.enhancedRow}>
              <Text style={styles.enhancedLabel}>People</Text>
              <Text style={styles.enhancedValue}>{enhancedData.people.join(', ')}</Text>
            </View>
          )}

          {enhancedData.themes && enhancedData.themes.length > 0 && (
            <View style={styles.enhancedRow}>
              <Text style={styles.enhancedLabel}>Themes</Text>
              <View style={styles.themesWrap}>
                {enhancedData.themes.map((theme, i) => (
                  <View key={i} style={styles.themeBadgeLarge}>
                    <Text style={styles.themeTextLarge}>{theme}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {enhancedData.summary && (
            <View style={styles.enhancedRow}>
              <Text style={styles.enhancedLabel}>Summary</Text>
              <Text style={styles.summaryText}>{enhancedData.summary}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.enhanceBtn, enhancing && styles.enhanceBtnDisabled]} 
          onPress={handleEnhance}
          disabled={enhancing || !text.trim()}
          activeOpacity={0.7}
        >
          {enhancing ? (
            <ActivityIndicator color="#A78BFA" size="small" />
          ) : (
            <>
              <Text style={styles.enhanceBtnIcon}>✨</Text>
              <Text style={styles.enhanceBtnText}>Enhance with AI</Text>
              <Text style={styles.optionalText}>(Optional)</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving || !text.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={text.trim() ? ['#5B4FC4', '#8B5CF6'] : ['#3D3D5C', '#3D3D5C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={[styles.saveBtnText, !text.trim() && styles.saveBtnTextDisabled]}>
                Store Memory
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {mode === 'list' ? renderMemoryList() : renderNewMemory()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#12122B', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '92%' },
  handle: { width: 40, height: 4, backgroundColor: '#3D3D5C', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { marginBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  backBtn: { marginRight: 12, paddingTop: 4 },
  backBtnText: { color: '#A78BFA', fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  date: { fontSize: 14, color: '#8888AA' },
  
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, color: '#FFF', fontWeight: '600', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#6B6B8D' },
  
  memoriesList: { marginBottom: 20 },
  memoryItem: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  memoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  memoryTime: { fontSize: 12, color: '#6B6B8D' },
  memoryText: { fontSize: 15, color: '#E5E5E5', lineHeight: 22 },
  enhancedBox: { backgroundColor: 'rgba(91,79,196,0.1)', borderRadius: 10, padding: 12, marginTop: 12 },
  enhancedLabel: { fontSize: 11, color: '#A78BFA', fontWeight: '600', marginBottom: 6 },
  enhancedText: { fontSize: 14, color: '#CCC', fontStyle: 'italic', lineHeight: 20 },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  themeBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  themeText: { fontSize: 11, color: '#999' },
  peopleText: { fontSize: 12, color: '#8888AA', marginTop: 10 },
  
  addBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  addBtnText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, color: '#8888AA', fontWeight: '500', marginBottom: 10 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, color: '#FFF', fontSize: 16, minHeight: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  mediaSection: { marginBottom: 20 },
  mediaLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  comingSoon: { fontSize: 11, color: '#6B6B8D', fontStyle: 'italic' },
  mediaButtons: { flexDirection: 'row', gap: 12 },
  mediaBtnDisabled: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', opacity: 0.5 },
  mediaIcon: { fontSize: 22, marginBottom: 4 },
  mediaBtnText: { fontSize: 11, color: '#6B6B8D', fontWeight: '500' },
  
  enhancedSection: { backgroundColor: 'rgba(91,79,196,0.1)', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(91,79,196,0.2)' },
  enhancedTitle: { fontSize: 16, fontWeight: '600', color: '#A78BFA', marginBottom: 14 },
  enhancedRow: { marginBottom: 14 },
  enhancedValue: { fontSize: 14, color: '#DDD', lineHeight: 20 },
  emotionBadge: { backgroundColor: 'rgba(167,139,250,0.2)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  emotionText: { fontSize: 12, color: '#A78BFA', fontWeight: '600' },
  emotionBadgeLarge: { backgroundColor: 'rgba(167,139,250,0.2)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, alignSelf: 'flex-start' },
  emotionTextLarge: { fontSize: 14, color: '#A78BFA', fontWeight: '600' },
  themesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themeBadgeLarge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 12 },
  themeTextLarge: { fontSize: 12, color: '#BBB' },
  summaryText: { fontSize: 14, color: '#CCC', fontStyle: 'italic', lineHeight: 20 },
  
  actions: { gap: 12, marginTop: 8, marginBottom: 20 },
  enhanceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.4)', backgroundColor: 'rgba(167,139,250,0.08)', gap: 8 },
  enhanceBtnDisabled: { opacity: 0.5 },
  enhanceBtnIcon: { fontSize: 16 },
  enhanceBtnText: { fontSize: 14, color: '#A78BFA', fontWeight: '600' },
  optionalText: { fontSize: 12, color: '#6B6B8D' },
  saveBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  saveBtnTextDisabled: { color: '#6B6B8D' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#6B6B8D' },
});
