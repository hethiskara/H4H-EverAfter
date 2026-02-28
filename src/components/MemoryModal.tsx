import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveMemory } from '../services/memoryService';
import { enhanceMemoryWithAI, inferEmotionFromText, inferLifeStageFromText } from '../services/aiService';
import { pickImage, takePhoto, startRecording, stopRecording, uploadMedia, playAudio, MediaFile, UploadedMedia } from '../services/mediaService';
import { Memory, MediaItem } from '../types/memory';
import { Audio } from 'expo-av';

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
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [savingStatus, setSavingStatus] = useState('');

  useEffect(() => {
    if (visible) {
      setMode(existingMemories.length > 0 ? 'list' : 'new');
      setText('');
      setMediaFiles([]);
      setRecording(false);
      setRecordingTime(0);
      setSavingStatus('');
    }
  }, [visible, existingMemories.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [currentSound]);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePickImage = async () => {
    try {
      const file = await pickImage();
      if (file) {
        setMediaFiles(prev => [...prev, file]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const file = await takePhoto();
      if (file) {
        setMediaFiles(prev => [...prev, file]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handlePhotoPress = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleVoicePress = async () => {
    try {
      if (recording) {
        const file = await stopRecording();
        setRecording(false);
        setRecordingTime(0);
        if (file) {
          setMediaFiles(prev => [...prev, file]);
        }
      } else {
        await startRecording();
        setRecording(true);
      }
    } catch (err: any) {
      setRecording(false);
      setRecordingTime(0);
      Alert.alert('Error', err.message);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlayAudio = async (uri: string) => {
    try {
      if (currentSound) {
        await currentSound.unloadAsync();
      }
      if (playingAudio === uri) {
        setPlayingAudio(null);
        setCurrentSound(null);
        return;
      }
      const sound = await playAudio(uri);
      setCurrentSound(sound);
      setPlayingAudio(uri);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
        }
      });
    } catch (err: any) {
      Alert.alert('Error', 'Could not play audio');
    }
  };

  const handleSave = async () => {
    if (!text.trim() && mediaFiles.length === 0) {
      Alert.alert('Empty Memory', 'Please write something or add media');
      return;
    }
    setSaving(true);
    
    try {
      const mediaURLs: string[] = [];
      const media: MediaItem[] = [];
      const voiceTranscripts: string[] = [];
      
      if (mediaFiles.length > 0) {
        setSavingStatus('Uploading media...');
        for (const file of mediaFiles) {
          const uploaded: UploadedMedia = await uploadMedia(file);
          mediaURLs.push(uploaded.url);
          
          const mediaItem: MediaItem = {
            url: uploaded.url,
            type: uploaded.type,
          };
          if (uploaded.transcript) {
            mediaItem.transcript = uploaded.transcript;
          }
          media.push(mediaItem);
          
          if (uploaded.type === 'audio' && uploaded.transcript) {
            voiceTranscripts.push(uploaded.transcript);
          }
        }
      }
      
      const fullText = voiceTranscripts.length > 0 
        ? (text ? `${text}\n\n🎤 Voice: ${voiceTranscripts.join('\n\n🎤 Voice: ')}` : `🎤 Voice: ${voiceTranscripts.join('\n\n🎤 Voice: ')}`)
        : (text || '(Media memory)');
      
      setSavingStatus('Analyzing memory...');
      let enhancedData: any = {};
      try {
        enhancedData = await enhanceMemoryWithAI(fullText);
      } catch (err) {
        console.log('[Memory] AI enhancement failed, using fallback extraction');
      }
      
      const emotion = enhancedData?.emotion || inferEmotionFromText(fullText);
      const lifeStage = enhancedData?.lifeStage || inferLifeStageFromText(fullText);
      
      setSavingStatus('Saving...');
      await saveMemory({
        date,
        rawText: fullText,
        enhancedText: enhancedData?.enhancedText || null,
        emotion: emotion || null,
        people: enhancedData?.people || [],
        location: enhancedData?.location || null,
        lifeStage: lifeStage || null,
        themes: enhancedData?.themes || [],
        summary: enhancedData?.summary || null,
        mediaURLs,
        media,
        voiceTranscripts,
      });
      
      setText('');
      setMediaFiles([]);
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
      setSavingStatus('');
    }
  };

  const handleClose = () => {
    if (recording) {
      stopRecording();
      setRecording(false);
    }
    if (currentSound) {
      currentSound.unloadAsync();
    }
    setText('');
    setMediaFiles([]);
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
              
              {memory.mediaURLs && memory.mediaURLs.length > 0 && (
                <View style={styles.mediaPreviewRow}>
                  {memory.mediaURLs.map((url, i) => (
                    url.includes('.m4a') || url.includes('voice_') ? (
                      <TouchableOpacity 
                        key={i} 
                        style={[styles.audioPreview, playingAudio === url && styles.audioPreviewPlaying]}
                        onPress={() => handlePlayAudio(url)}
                      >
                        <Text style={styles.audioIcon}>{playingAudio === url ? '⏹️' : '▶️'}</Text>
                        <Text style={styles.audioText}>{playingAudio === url ? 'Stop' : 'Play'}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Image key={i} source={{ uri: url }} style={styles.imagePreview} />
                    )
                  ))}
                </View>
              )}
              
              {memory.enhancedText && memory.enhancedText !== memory.rawText && (
                <View style={styles.enhancedBox}>
                  <Text style={styles.enhancedLabelSmall}>✨ Enhanced</Text>
                  <Text style={styles.enhancedTextStyle}>{memory.enhancedText}</Text>
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
        <Text style={styles.label}>Add Media</Text>
        <View style={styles.mediaButtons}>
          <TouchableOpacity 
            style={[styles.mediaBtn, recording && styles.mediaBtnRecording]} 
            onPress={handleVoicePress}
            activeOpacity={0.7}
          >
            <Text style={styles.mediaIcon}>{recording ? '⏹️' : '🎤'}</Text>
            <Text style={[styles.mediaBtnText, recording && styles.mediaBtnTextActive]}>
              {recording ? formatRecordingTime(recordingTime) : 'Voice'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mediaBtn} 
            onPress={handlePhotoPress}
            activeOpacity={0.7}
          >
            <Text style={styles.mediaIcon}>📷</Text>
            <Text style={styles.mediaBtnText}>Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {mediaFiles.length > 0 && (
        <View style={styles.attachedMedia}>
          <Text style={styles.attachedLabel}>Attached ({mediaFiles.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachedScroll}>
            {mediaFiles.map((file, index) => (
              <View key={index} style={styles.attachedItem}>
                {file.type === 'image' ? (
                  <Image source={{ uri: file.uri }} style={styles.attachedImage} />
                ) : (
                  <View style={styles.attachedAudio}>
                    <Text style={styles.attachedAudioIcon}>🎵</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeBtn}
                  onPress={() => removeMedia(index)}
                >
                  <Text style={styles.removeBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving || (!text.trim() && mediaFiles.length === 0)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={(text.trim() || mediaFiles.length > 0) ? ['#5B4FC4', '#8B5CF6'] : ['#3D3D5C', '#3D3D5C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            {saving ? (
              <View style={styles.savingRow}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.saveBtnText}> {savingStatus || 'Saving...'}</Text>
              </View>
            ) : (
              <Text style={[styles.saveBtnText, (!text.trim() && mediaFiles.length === 0) && styles.saveBtnTextDisabled]}>
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
  
  mediaPreviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  imagePreview: { width: 80, height: 80, borderRadius: 10 },
  audioPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(167,139,250,0.15)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, gap: 8 },
  audioPreviewPlaying: { backgroundColor: 'rgba(239,68,68,0.15)' },
  audioIcon: { fontSize: 16 },
  audioText: { fontSize: 13, color: '#A78BFA', fontWeight: '600' },
  
  enhancedBox: { backgroundColor: 'rgba(91,79,196,0.1)', borderRadius: 10, padding: 12, marginTop: 12 },
  enhancedLabelSmall: { fontSize: 11, color: '#A78BFA', fontWeight: '600', marginBottom: 6 },
  enhancedTextStyle: { fontSize: 14, color: '#CCC', fontStyle: 'italic', lineHeight: 20 },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  themeBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  themeText: { fontSize: 11, color: '#999' },
  peopleText: { fontSize: 12, color: '#8888AA', marginTop: 10 },
  
  addBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  addBtnText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, color: '#8888AA', fontWeight: '500', marginBottom: 10 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, color: '#FFF', fontSize: 16, minHeight: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  
  mediaSection: { marginBottom: 16 },
  mediaButtons: { flexDirection: 'row', gap: 12 },
  mediaBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  mediaBtnRecording: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
  mediaIcon: { fontSize: 22, marginBottom: 4 },
  mediaBtnText: { fontSize: 11, color: '#8888AA', fontWeight: '500' },
  mediaBtnTextActive: { color: '#EF4444' },
  
  attachedMedia: { marginBottom: 20 },
  attachedLabel: { fontSize: 13, color: '#8888AA', fontWeight: '500', marginBottom: 10 },
  attachedScroll: { flexDirection: 'row' },
  attachedItem: { marginRight: 12, position: 'relative' },
  attachedImage: { width: 70, height: 70, borderRadius: 10 },
  attachedAudio: { width: 70, height: 70, borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.15)', justifyContent: 'center', alignItems: 'center' },
  attachedAudioIcon: { fontSize: 28 },
  removeBtn: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: -2 },
  
  enhancedSection: { backgroundColor: 'rgba(91,79,196,0.1)', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(91,79,196,0.2)' },
  enhancedTitle: { fontSize: 16, fontWeight: '600', color: '#A78BFA', marginBottom: 14 },
  enhancedRow: { marginBottom: 14 },
  enhancedLabel: { fontSize: 12, color: '#6B6B8D', fontWeight: '500', marginBottom: 4 },
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
  enhanceBtnDisabledStyle: { opacity: 0.5 },
  enhanceBtnIcon: { fontSize: 16 },
  enhanceBtnText: { fontSize: 14, color: '#A78BFA', fontWeight: '600' },
  optionalText: { fontSize: 12, color: '#6B6B8D' },
  saveBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  savingRow: { flexDirection: 'row', alignItems: 'center' },
  saveBtnText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  saveBtnTextDisabled: { color: '#6B6B8D' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#6B6B8D' },
});
