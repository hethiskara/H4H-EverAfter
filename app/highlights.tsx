import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getHighlights, HighlightsData } from '../src/services/highlightsService';
import { Memory } from '../src/types/memory';

export default function HighlightsScreen() {
  const router = useRouter();
  const [data, setData] = useState<HighlightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const highlights = await getHighlights();
      setData(highlights);
    } catch (err) {
      console.log('[Highlights] Load error:', err);
      setData(null);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Building your story...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Story So Far</Text>
        <Text style={styles.subtitle}>Memory Highlights</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />}
      >
        {data?.narrativeSummary && (
          <View style={styles.narrativeCard}>
            <LinearGradient
              colors={['rgba(91,79,196,0.25)', 'rgba(139,92,246,0.1)']}
              style={styles.narrativeGradient}
            >
              <Text style={styles.narrativeLabel}>✨ Your life so far</Text>
              <Text style={styles.narrativeText}>{data.narrativeSummary}</Text>
            </LinearGradient>
          </View>
        )}

        {data?.mostFrequentPerson && data.mostFrequentPerson !== '—' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Most in Your Memories</Text>
            <View style={styles.personCard}>
              <Text style={styles.personName}>{data.mostFrequentPerson}</Text>
              <Text style={styles.personSub}>Appears most often in your memories</Text>
            </View>
          </View>
        )}

        {data?.emotionalHeat && data.emotionalHeat.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Emotional Heat</Text>
            <View style={styles.heatRow}>
              {data.emotionalHeat.slice(0, 6).map((item, i) => (
                <View key={i} style={styles.heatBadge}>
                  <Text style={styles.heatEmotion}>{item.emotion}</Text>
                  <Text style={styles.heatCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data?.topHappiest && data.topHappiest.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌟 Top 3 Happiest Memories</Text>
            {data.topHappiest.map((memory: Memory, index: number) => (
              <View key={memory.id || index} style={styles.memoryCard}>
                <View style={styles.memoryHeader}>
                  <Text style={styles.memoryDate}>{formatDate(memory.date)}</Text>
                  {memory.emotion && (
                    <View style={styles.emotionBadge}>
                      <Text style={styles.emotionText}>{memory.emotion}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memoryText} numberOfLines={3}>
                  {memory.summary || memory.rawText}
                </Text>
                {memory.themes && memory.themes.length > 0 && (
                  <View style={styles.themesRow}>
                    {memory.themes.slice(0, 3).map((t, i) => (
                      <View key={i} style={styles.themeBadge}>
                        <Text style={styles.themeText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {(!data || (data.topHappiest?.length === 0 && !data.narrativeSummary)) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>Add memories from the calendar to see your highlights</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B2B', paddingHorizontal: 20, paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#0B0B2B', justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: '#8888AA', fontSize: 14 },
  header: { marginBottom: 24 },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: '#A78BFA', fontSize: 15, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8888AA' },
  narrativeCard: { marginBottom: 24, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(91,79,196,0.3)' },
  narrativeGradient: { padding: 20 },
  narrativeLabel: { fontSize: 12, color: '#A78BFA', fontWeight: '600', marginBottom: 8 },
  narrativeText: { fontSize: 17, color: '#E5E5E5', lineHeight: 26, fontStyle: 'italic' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  personCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  personName: { fontSize: 20, fontWeight: '700', color: '#A78BFA' },
  personSub: { fontSize: 13, color: '#6B6B8D', marginTop: 4 },
  heatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  heatBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  heatEmotion: { fontSize: 13, color: '#CCC', fontWeight: '600' },
  heatCount: { fontSize: 18, color: '#A78BFA', fontWeight: '700', marginTop: 2 },
  memoryCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  memoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  memoryDate: { fontSize: 12, color: '#6B6B8D' },
  emotionBadge: { backgroundColor: 'rgba(167,139,250,0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  emotionText: { fontSize: 11, color: '#A78BFA', fontWeight: '600' },
  memoryText: { fontSize: 14, color: '#CCC', lineHeight: 21 },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  themeBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 },
  themeText: { fontSize: 11, color: '#888' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, color: '#FFF', fontWeight: '600', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#6B6B8D' },
});
