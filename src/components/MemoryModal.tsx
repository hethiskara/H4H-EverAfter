import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveMemory } from '../services/memoryService';
import { enhanceMemoryWithAI } from '../services/aiService';
import { Memory } from '../types/memory';

interface MemoryModalProps {
  visible: boolean;
  date: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function MemoryModal({ visible, date, onClose, onSaved }: MemoryModalProps) {
  const [text, setText] = useState('');
  const [enhancedData, setEnhancedData] = useState<Partial<Memory> | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [saving, setSaving] = useState(false);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
      Alert.alert('Error', err.message);
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
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.handle} />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>New Memory</Text>
              <Text style={styles.date}>{formatDisplayDate(date)}</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>What happened today?</Text>
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
              <Text style={styles.label}>Add Media</Text>
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaBtn}>
                  <Text style={styles.mediaIcon}>🎤</Text>
                  <Text style={styles.mediaBtnText}>Voice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaBtn}>
                  <Text style={styles.mediaIcon}>📷</Text>
                  <Text style={styles.mediaBtnText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaBtn}>
                  <Text style={styles.mediaIcon}>🎬</Text>
                  <Text style={styles.mediaBtnText}>Video</Text>
                </TouchableOpacity>
              </View>
            </View>

            {enhancedData && (
              <View style={styles.enhancedSection}>
                <Text style={styles.enhancedTitle}>✨ AI Enhanced</Text>
                
                <View style={styles.enhancedRow}>
                  <Text style={styles.enhancedLabel}>Emotion</Text>
                  <View style={styles.emotionBadge}>
                    <Text style={styles.emotionText}>{enhancedData.emotion}</Text>
                  </View>
                </View>

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
                        <View key={i} style={styles.themeBadge}>
                          <Text style={styles.themeText}>{theme}</Text>
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
                style={styles.enhanceBtn} 
                onPress={handleEnhance}
                disabled={enhancing}
              >
                {enhancing ? (
                  <ActivityIndicator color="#A78BFA" size="small" />
                ) : (
                  <>
                    <Text style={styles.enhanceBtnIcon}>✨</Text>
                    <Text style={styles.enhanceBtnText}>Enhance with AI</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSave} disabled={saving}>
                <LinearGradient
                  colors={['#5B4FC4', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveBtn}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Store Memory</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#12122B', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  handle: { width: 40, height: 4, backgroundColor: '#3D3D5C', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  date: { fontSize: 14, color: '#8888AA' },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, color: '#8888AA', fontWeight: '500', marginBottom: 10 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, color: '#FFF', fontSize: 16, minHeight: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  mediaSection: { marginBottom: 20 },
  mediaButtons: { flexDirection: 'row', gap: 12 },
  mediaBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  mediaIcon: { fontSize: 24, marginBottom: 6 },
  mediaBtnText: { fontSize: 12, color: '#8888AA', fontWeight: '500' },
  enhancedSection: { backgroundColor: 'rgba(91,79,196,0.1)', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(91,79,196,0.2)' },
  enhancedTitle: { fontSize: 16, fontWeight: '600', color: '#A78BFA', marginBottom: 12 },
  enhancedRow: { marginBottom: 12 },
  enhancedLabel: { fontSize: 12, color: '#6B6B8D', fontWeight: '500', marginBottom: 4 },
  enhancedValue: { fontSize: 14, color: '#CCC' },
  emotionBadge: { backgroundColor: 'rgba(167,139,250,0.2)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, alignSelf: 'flex-start' },
  emotionText: { fontSize: 14, color: '#A78BFA', fontWeight: '600' },
  themesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themeBadge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  themeText: { fontSize: 12, color: '#AAA' },
  summaryText: { fontSize: 14, color: '#CCC', fontStyle: 'italic', lineHeight: 20 },
  actions: { gap: 12, marginTop: 8, marginBottom: 20 },
  enhanceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.4)', backgroundColor: 'rgba(167,139,250,0.08)', gap: 8 },
  enhanceBtnIcon: { fontSize: 18 },
  enhanceBtnText: { fontSize: 15, color: '#A78BFA', fontWeight: '600' },
  saveBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#6B6B8D' },
});
