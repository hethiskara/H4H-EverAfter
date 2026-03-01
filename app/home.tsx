import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Animated, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOutUser, getCurrentUser } from '../src/config/firebase';
import Calendar from '../src/components/Calendar';
import MemoryModal from '../src/components/MemoryModal';
import ReliveMemories from '../src/components/ReliveMemories';
import OnboardingGuide from '../src/components/OnboardingGuide';
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const pulseAnim = useState(new Animated.Value(1))[0];
  const scrollX = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

  }, []);

  useEffect(() => {
    console.log('[Home] Mounted');
    getCurrentUser().then(u => setUserEmail(u?.email || ''));
    
    AsyncStorage.getItem('hasSeenOnboarding').then(value => {
      if (!value) {
        setTimeout(() => setShowOnboarding(true), 500);
      }
    });
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
  };

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

  const streak = useMemo(() => {
    if (memories.length === 0) return 0;
    const sortedDates = [...new Set(memories.map(m => m.date))].sort().reverse();
    let currentStreak = 1;
    const today = new Date().toISOString().split('T')[0];
    if (sortedDates[0] !== today) return 0;
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) currentStreak++;
      else break;
    }
    return currentStreak;
  }, [memories]);


  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.title}>EverAfter</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Streak & Quick Stats */}
        {streak > 0 && (
          <Animated.View style={styles.streakBanner}>
            <LinearGradient
              colors={['rgba(255,140,0,0.2)', 'rgba(255,69,0,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.streakGradient}
            >
              <Text style={styles.streakEmoji}>🔥</Text>
              <View style={styles.streakContent}>
                <Text style={styles.streakNumber}>{streak} Day Streak!</Text>
                <Text style={styles.streakText}>Keep the momentum going</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Memories</Text>
              <Text style={styles.sectionSubtitle}>Swipe to explore →</Text>
            </View>
            <Animated.FlatList
              ref={flatListRef}
              data={recentMemories}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 16}
              decelerationRate="fast"
              contentContainerStyle={styles.memoriesScrollContainer}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              renderItem={({ item: memory, index }) => {
                const inputRange = [
                  (index - 1) * (CARD_WIDTH + 16),
                  index * (CARD_WIDTH + 16),
                  (index + 1) * (CARD_WIDTH + 16),
                ];

                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.9, 1, 0.9],
                  extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.6, 1, 0.6],
                  extrapolate: 'clamp',
                });


                const emotionGradients: { [key: string]: [string, string, string] } = {
                  happy: ['#FFD700', '#FFA500', '#FF8C00'],
                  sad: ['#4A90E2', '#357ABD', '#2E5C8A'],
                  excited: ['#FF6B9D', '#C44569', '#A73E5C'],
                  calm: ['#50C878', '#3CB371', '#2E8B57'],
                  nostalgic: ['#9B59B6', '#8E44AD', '#7D3C98'],
                  grateful: ['#F39C12', '#E67E22', '#D35400'],
                  default: ['#A78BFA', '#8B5CF6', '#7C3AED'],
                };

                const gradient: [string, string, string] = emotionGradients[memory.emotion?.toLowerCase() || 'default'] || emotionGradients.default;
                
                const semanticSummary = memory.semantics || memory.rawText.substring(0, 100) + '...';

                return (
                  <Animated.View
                    style={[
                      styles.memoryCardContainer,
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => handleSelectDate(memory.date)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.memoryCardWrapper}>
                        <LinearGradient
                          colors={gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.memoryCardGradient}
                        >
                          <View style={styles.memoryCardOverlay}>
                            <View style={styles.memoryCardTop}>
                              {memory.emotion && (
                                <View style={styles.emotionBadgeNew}>
                                  <Text style={styles.emotionTextNew}>{memory.emotion}</Text>
                                </View>
                              )}
                              <Text style={styles.memoryDateNew}>
                                {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </Text>
                            </View>

                            <View style={styles.memoryCardContent}>
                              <Text style={styles.memoryTextNew} numberOfLines={4}>
                                {semanticSummary}
                              </Text>
                            </View>

                            {memory.themes && memory.themes.length > 0 && (
                              <View style={styles.themesRowNew}>
                                {memory.themes.slice(0, 2).map((theme: string, i: number) => (
                                  <View key={i} style={styles.themeBadgeNew}>
                                    <Text style={styles.themeTextNew}>#{theme}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              }}
              keyExtractor={(item, index) => item.id || index.toString()}
            />
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/lifeline')}>
            <LinearGradient
              colors={['rgba(91,79,196,0.2)', 'rgba(139,92,246,0.1)']}
              style={styles.actionGradient}
            >
              <Animated.View style={[styles.actionIconContainer, { transform: [{ rotateY: pulseAnim.interpolate({ inputRange: [1, 1.05], outputRange: ['0deg', '15deg'] }) }] }]}>
                <Text style={styles.actionIcon}>🌌</Text>
              </Animated.View>
              <Text style={styles.actionTitle}>Explore My Life</Text>
              <Text style={styles.actionSub}>View your LifeLine</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/highlights')}>
            <LinearGradient
              colors={['rgba(236,72,153,0.2)', 'rgba(139,92,246,0.1)']}
              style={styles.actionGradient}
            >
              <Animated.View style={[styles.actionIconContainer, { transform: [{ scale: pulseAnim }, { rotateZ: pulseAnim.interpolate({ inputRange: [1, 1.05], outputRange: ['0deg', '5deg'] }) }] }]}>
                <Text style={styles.actionIcon}>🎞</Text>
              </Animated.View>
              <Text style={styles.actionTitle}>Memory Highlights</Text>
              <Text style={styles.actionSub}>Your story so far</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📝</Text>
            </View>
            <Text style={styles.statNumber}>{memories.length}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📅</Text>
            </View>
            <Text style={styles.statNumber}>{memoriesDates.size}</Text>
            <Text style={styles.statLabel}>Days Captured</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>⚡</Text>
            </View>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
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


      {/* Onboarding Guide */}
      <OnboardingGuide
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </View>
  );
}

const CARD_WIDTH = 280;
const CARD_HEIGHT = 200;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B2B', paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, color: '#8888AA', marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  signOut: { padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  signOutText: { color: '#8888AA', fontSize: 13 },
  
  streakBanner: { marginBottom: 20 },
  streakGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,140,0,0.3)' },
  streakEmoji: { fontSize: 32, marginRight: 12 },
  streakContent: { flex: 1 },
  streakNumber: { fontSize: 18, fontWeight: '700', color: '#FF8C00', marginBottom: 2 },
  streakText: { fontSize: 12, color: '#FFA500' },
  
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

  recentSection: { marginTop: 24, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  sectionSubtitle: { fontSize: 13, color: '#8888AA', fontStyle: 'italic' },
  memoriesScrollContainer: { paddingHorizontal: 4, paddingVertical: 8 },
  memoryCardContainer: { width: CARD_WIDTH, marginRight: 16 },
  memoryCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  memoryCardGradient: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  memoryCardOverlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  memoryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emotionBadgeNew: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  emotionTextNew: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memoryDateNew: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  memoryCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  memoryTextNew: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  themesRowNew: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  themeBadgeNew: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  themeTextNew: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  actionsSection: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionCard: { flex: 1 },
  actionGradient: { padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  actionIconContainer: { marginBottom: 8 },
  actionIcon: { fontSize: 40 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#FFF', marginBottom: 2 },
  actionSub: { fontSize: 11, color: '#8888AA' },
  statsSection: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statIconContainer: { marginBottom: 8 },
  statIcon: { fontSize: 24 },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#A78BFA' },
  statLabel: { fontSize: 11, color: '#6B6B8D', marginTop: 4 },
  
});
