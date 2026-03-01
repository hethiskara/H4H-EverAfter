import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signOutUser, getCurrentUser } from '../src/config/firebase';
import Calendar from '../src/components/Calendar';
import MemoryModal from '../src/components/MemoryModal';
import ReliveMemories from '../src/components/ReliveMemories';
import { getMemoriesForMonth } from '../src/services/memoryService';
import { Memory } from '../src/types/memory';

export default function HomeScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reliveVisible, setReliveVisible] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    console.log('[Home] Mounted');
    getCurrentUser().then(u => setUserEmail(u?.email || ''));
  }, []);

  const loadMemories = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const loaded = await getMemoriesForMonth(year, month);
    setMemories(loaded);
  }, [currentDate]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const memoriesDates = useMemo(() => {
    return new Set(memories.map(m => m.date));
  }, [memories]);

  const selectedDateMemories = useMemo(() => {
    if (!selectedDate) return [];
    return memories.filter(m => m.date === selectedDate).sort((a, b) => b.createdAt - a.createdAt);
  }, [memories, selectedDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMemories();
    setRefreshing(false);
  }, [loadMemories]);

  const handleSignOut = async () => {
    await signOutUser();
    router.replace('/login');
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleMemorySaved = async () => {
    await loadMemories();
  };

  const recentMemories = useMemo(() => {
    return [...memories].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  }, [memories]);

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.title}>EverAfter</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Relive Memories Button - Hero Feature */}
        <TouchableOpacity 
          style={styles.reliveButton} 
          activeOpacity={0.9}
          onPress={() => setReliveVisible(true)}
        >
          <LinearGradient
            colors={['rgba(167,139,250,0.25)', 'rgba(139,92,246,0.15)', 'rgba(91,79,196,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reliveGradient}
          >
            <Animated.View style={[styles.reliveOrb, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.reliveOrbInner}>
                <Text style={styles.reliveOrbIcon}>🎙</Text>
              </View>
            </Animated.View>
            <View style={styles.reliveContent}>
              <Text style={styles.reliveTitle}>Relive Your Memories</Text>
              <Text style={styles.reliveSub}>Ask anything about your past and hear your story</Text>
            </View>
            <View style={styles.reliveArrow}>
              <Text style={styles.reliveArrowText}>→</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          memoriesDates={memoriesDates}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {recentMemories.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Memories</Text>
            {recentMemories.map((memory, index) => (
              <TouchableOpacity 
                key={memory.id || index} 
                style={styles.memoryCard}
                onPress={() => handleSelectDate(memory.date)}
                activeOpacity={0.7}
              >
                <View style={styles.memoryCardHeader}>
                  {memory.emotion && (
                    <View style={styles.emotionBadge}>
                      <Text style={styles.emotionText}>{memory.emotion}</Text>
                    </View>
                  )}
                  <Text style={styles.memoryDate}>
                    {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.memoryText} numberOfLines={2}>{memory.rawText}</Text>
                {memory.themes && memory.themes.length > 0 && (
                  <View style={styles.themesRow}>
                    {memory.themes.slice(0, 3).map((theme, i) => (
                      <View key={i} style={styles.themeBadge}>
                        <Text style={styles.themeText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/lifeline')}>
            <LinearGradient
              colors={['rgba(91,79,196,0.2)', 'rgba(139,92,246,0.1)']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>🌌</Text>
              <Text style={styles.actionTitle}>Explore My Life</Text>
              <Text style={styles.actionSub}>View your LifeLine</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/highlights')}>
            <LinearGradient
              colors={['rgba(236,72,153,0.2)', 'rgba(139,92,246,0.1)']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>🎞</Text>
              <Text style={styles.actionTitle}>Memory Highlights</Text>
              <Text style={styles.actionSub}>Your story so far</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{memories.length}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{memoriesDates.size}</Text>
            <Text style={styles.statLabel}>Days Captured</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <MemoryModal
        visible={modalVisible}
        date={selectedDate || new Date().toISOString().split('T')[0]}
        existingMemories={selectedDateMemories}
        onClose={handleModalClose}
        onSaved={handleMemorySaved}
      />

      <ReliveMemories
        visible={reliveVisible}
        onClose={() => setReliveVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B2B', paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 14, color: '#8888AA', marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  signOut: { padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  signOutText: { color: '#8888AA', fontSize: 13 },
  
  reliveButton: { marginBottom: 20 },
  reliveGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  reliveOrb: { marginRight: 14 },
  reliveOrbInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(167,139,250,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(167,139,250,0.5)' },
  reliveOrbIcon: { fontSize: 24 },
  reliveContent: { flex: 1 },
  reliveTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 2 },
  reliveSub: { fontSize: 12, color: '#8888AA', lineHeight: 16 },
  reliveArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(167,139,250,0.2)', justifyContent: 'center', alignItems: 'center' },
  reliveArrowText: { color: '#A78BFA', fontSize: 18, fontWeight: '600' },

  recentSection: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  memoryCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  memoryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  memoryDate: { fontSize: 12, color: '#6B6B8D' },
  emotionBadge: { backgroundColor: 'rgba(167,139,250,0.2)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  emotionText: { fontSize: 12, color: '#A78BFA', fontWeight: '600' },
  memoryText: { fontSize: 14, color: '#CCC', lineHeight: 20 },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  themeBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 },
  themeText: { fontSize: 11, color: '#888' },
  actionsSection: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionCard: { flex: 1 },
  actionGradient: { padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#FFF', marginBottom: 2 },
  actionSub: { fontSize: 11, color: '#8888AA' },
  statsSection: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#A78BFA' },
  statLabel: { fontSize: 12, color: '#6B6B8D', marginTop: 4 },
});
