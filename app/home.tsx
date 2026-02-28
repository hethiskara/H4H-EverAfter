import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signOutUser, getCurrentUser } from '../src/config/firebase';
import Calendar from '../src/components/Calendar';
import MemoryModal from '../src/components/MemoryModal';
import { getMemoriesForMonth } from '../src/services/memoryService';
import { Memory } from '../src/types/memory';

export default function HomeScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoriesDates, setMemoriesDates] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[Home] Mounted');
    getCurrentUser().then(u => setUserEmail(u?.email || ''));
  }, []);

  const loadMemories = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const loaded = await getMemoriesForMonth(year, month);
    setMemories(loaded);
    setMemoriesDates(new Set(loaded.map(m => m.date)));
  }, [currentDate]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

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

  const todayMemories = memories.filter(m => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return m.date === todayStr;
  });

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

        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          memoriesDates={memoriesDates}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {todayMemories.length > 0 && (
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Today's Memories</Text>
            {todayMemories.map((memory, index) => (
              <View key={index} style={styles.memoryCard}>
                {memory.emotion && (
                  <View style={styles.emotionBadge}>
                    <Text style={styles.emotionText}>{memory.emotion}</Text>
                  </View>
                )}
                <Text style={styles.memoryText} numberOfLines={3}>{memory.rawText}</Text>
                {memory.themes && memory.themes.length > 0 && (
                  <View style={styles.themesRow}>
                    {memory.themes.slice(0, 3).map((theme, i) => (
                      <View key={i} style={styles.themeBadge}>
                        <Text style={styles.themeText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(91,79,196,0.2)', 'rgba(139,92,246,0.1)']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>🌌</Text>
              <Text style={styles.actionTitle}>Explore My Life</Text>
              <Text style={styles.actionSub}>View your LifeLine</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
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
        onClose={() => setModalVisible(false)}
        onSaved={loadMemories}
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
  todaySection: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  memoryCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  emotionBadge: { backgroundColor: 'rgba(167,139,250,0.2)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 10 },
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
