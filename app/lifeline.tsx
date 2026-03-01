import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllMemories } from '../src/services/memoryService';
import { getEmbeddingsBatch, cosineSimilarity } from '../src/services/aiService';
import { Memory } from '../src/types/memory';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NODE_SIZE = 28;
const NODE_SPACING = 50;

const EMOTION_COLORS: Record<string, { primary: string; glow: string; rgb: string }> = {
  Joy: { primary: '#FFD700', glow: 'rgba(255,215,0,0.5)', rgb: '255,215,0' },
  Love: { primary: '#FF69B4', glow: 'rgba(255,105,180,0.5)', rgb: '255,105,180' },
  Gratitude: { primary: '#50C878', glow: 'rgba(80,200,120,0.5)', rgb: '80,200,120' },
  Pride: { primary: '#FF8C00', glow: 'rgba(255,140,0,0.5)', rgb: '255,140,0' },
  Excitement: { primary: '#FF4500', glow: 'rgba(255,69,0,0.5)', rgb: '255,69,0' },
  Peace: { primary: '#87CEEB', glow: 'rgba(135,206,235,0.5)', rgb: '135,206,235' },
  Nostalgia: { primary: '#DDA0DD', glow: 'rgba(221,160,221,0.5)', rgb: '221,160,221' },
  Hope: { primary: '#00CED1', glow: 'rgba(0,206,209,0.5)', rgb: '0,206,209' },
  Contentment: { primary: '#90EE90', glow: 'rgba(144,238,144,0.5)', rgb: '144,238,144' },
  Sadness: { primary: '#4682B4', glow: 'rgba(70,130,180,0.5)', rgb: '70,130,180' },
  Anxiety: { primary: '#9370DB', glow: 'rgba(147,112,219,0.5)', rgb: '147,112,219' },
  Longing: { primary: '#BA55D3', glow: 'rgba(186,85,211,0.5)', rgb: '186,85,211' },
  Confidence: { primary: '#FF6347', glow: 'rgba(255,99,71,0.5)', rgb: '255,99,71' },
  Courage: { primary: '#FF7F50', glow: 'rgba(255,127,80,0.5)', rgb: '255,127,80' },
  Purpose: { primary: '#20B2AA', glow: 'rgba(32,178,170,0.5)', rgb: '32,178,170' },
  Contemplative: { primary: '#778899', glow: 'rgba(119,136,153,0.5)', rgb: '119,136,153' },
  default: { primary: '#A78BFA', glow: 'rgba(167,139,250,0.5)', rgb: '167,139,250' },
};

interface MemoryNode {
  memory: Memory;
  x: number;
  y: number;
  cluster: string;
}

interface Connection {
  from: MemoryNode;
  to: MemoryNode;
  strength: number;
  type: 'person' | 'location' | 'semantic';
}

interface Insight {
  title: string;
  description: string;
}

export default function LifeLineScreen() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Loading memories...');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [highlightedCluster, setHighlightedCluster] = useState<string | null>(null);
  const [embeddings, setEmbeddings] = useState<Record<string, number[]>>({});
  const [semanticConnections, setSemanticConnections] = useState<{from: string; to: string; score: number}[]>([]);
  const [connectionFilter, setConnectionFilter] = useState<'all' | 'person' | 'location' | 'semantic'>('all');

  const pulseAnims = useRef<Record<string, Animated.Value>>({}).current;

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setLoadingStatus('Loading memories...');
      const all = await getAllMemories();
      const sorted = all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setMemories(sorted);
      
      if (sorted.length > 0) {
        setLoadingStatus('Computing semantic similarity...');
        await computeSemanticSimilarity(sorted);
      }
    } catch (err) {
      console.log('[LifeLine] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const computeSemanticSimilarity = async (mems: Memory[]) => {
    try {
      const texts = mems.map(m => m.rawText || m.summary || '');
      const batchSize = 50;
      const allEmbeddings: Record<string, number[]> = {};
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchMems = mems.slice(i, i + batchSize);
        const results = await getEmbeddingsBatch(batch);
        
        results.forEach((emb, idx) => {
          if (emb.length > 0) {
            allEmbeddings[batchMems[idx].id] = emb;
          }
        });
      }
      
      setEmbeddings(allEmbeddings);
      
      const connections: {from: string; to: string; score: number}[] = [];
      const memIds = Object.keys(allEmbeddings);
      const SIMILARITY_THRESHOLD = 0.82;
      
      for (let i = 0; i < memIds.length; i++) {
        for (let j = i + 1; j < memIds.length; j++) {
          const score = cosineSimilarity(allEmbeddings[memIds[i]], allEmbeddings[memIds[j]]);
          if (score >= SIMILARITY_THRESHOLD) {
            connections.push({ from: memIds[i], to: memIds[j], score });
          }
        }
      }
      
      connections.sort((a, b) => b.score - a.score);
      setSemanticConnections(connections.slice(0, 100));
      console.log('[LifeLine] Semantic connections found:', connections.length);
    } catch (err) {
      console.log('[LifeLine] Semantic analysis error:', err);
    }
  };

  const filterOptions = useMemo(() => {
    const people = new Set<string>();
    const themes = new Set<string>();
    const emotions = new Set<string>();
    
    memories.forEach(m => {
      m.people?.forEach(p => people.add(p));
      m.themes?.forEach(t => themes.add(t));
      if (m.emotion) emotions.add(m.emotion);
    });
    
    return {
      people: Array.from(people).sort(),
      themes: Array.from(themes).sort(),
      emotions: Array.from(emotions).sort(),
    };
  }, [memories]);

  const filteredMemories = useMemo(() => {
    if (activeFilters.size === 0) return memories;
    
    return memories.filter(m => {
      for (const filter of activeFilters) {
        if (m.emotion === filter) return true;
        if (m.people?.includes(filter)) return true;
        if (m.themes?.includes(filter)) return true;
      }
      return false;
    });
  }, [memories, activeFilters]);

  const clusters = useMemo(() => {
    const personCount: Record<string, number> = {};
    filteredMemories.forEach(m => {
      m.people?.forEach(p => {
        personCount[p] = (personCount[p] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(personCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
    
    return ['Personal', ...sorted];
  }, [filteredMemories]);

  // Grid-based layout - NO OVERLAPPING
  const { nodes, connections, galaxyWidth, galaxyHeight } = useMemo(() => {
    const nodes: MemoryNode[] = [];
    const connections: Connection[] = [];
    
    if (filteredMemories.length === 0) {
      return { nodes, connections, galaxyWidth: SCREEN_WIDTH, galaxyHeight: 400 };
    }

    // Assign memories to clusters
    const clusterMemories: Record<string, Memory[]> = {};
    clusters.forEach(c => clusterMemories[c] = []);
    
    filteredMemories.forEach(m => {
      let assignedCluster = 'Personal';
      for (const person of clusters) {
        if (person !== 'Personal' && m.people?.includes(person)) {
          assignedCluster = person;
          break;
        }
      }
      clusterMemories[assignedCluster].push(m);
    });

    // Calculate layout
    const CLUSTER_PADDING = 40;
    const CLUSTER_GAP = 30;
    let currentY = 80;
    
    clusters.forEach((cluster) => {
      const mems = clusterMemories[cluster];
      if (mems.length === 0) return;
      
      // Grid layout for this cluster
      const cols = Math.min(Math.floor((SCREEN_WIDTH - 80) / NODE_SPACING), 6);
      const rows = Math.ceil(mems.length / cols);
      const clusterWidth = cols * NODE_SPACING;
      const startX = (SCREEN_WIDTH - clusterWidth) / 2 + NODE_SPACING / 2;
      
      mems.forEach((memory, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        nodes.push({
          memory,
          x: startX + col * NODE_SPACING,
          y: currentY + CLUSTER_PADDING + row * NODE_SPACING,
          cluster,
        });
      });
      
      currentY += CLUSTER_PADDING * 2 + rows * NODE_SPACING + CLUSTER_GAP;
    });

    const nodeMap: Record<string, MemoryNode> = {};
    nodes.forEach(n => nodeMap[n.memory.id] = n);

    // 1. Person-based connections - only between different clusters, limit per cluster pair
    const personConnections: Connection[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const m1 = nodes[i].memory;
        const m2 = nodes[j].memory;
        const sharedPeople = m1.people?.filter(p => m2.people?.includes(p)) || [];
        
        if (sharedPeople.length > 0 && nodes[i].cluster !== nodes[j].cluster) {
          personConnections.push({
            from: nodes[i],
            to: nodes[j],
            strength: sharedPeople.length,
            type: 'person',
          });
        }
      }
    }
    // Keep only top 15 strongest person connections
    personConnections.sort((a, b) => b.strength - a.strength);
    connections.push(...personConnections.slice(0, 15));

    // 2. Location-based connections - group by location, only show one representative connection per location
    const locationGroups: Record<string, MemoryNode[]> = {};
    nodes.forEach(node => {
      const loc = node.memory.location?.toLowerCase().trim();
      if (loc && loc !== 'not specified' && loc !== 'unknown' && loc.length > 2) {
        if (!locationGroups[loc]) locationGroups[loc] = [];
        locationGroups[loc].push(node);
      }
    });
    
    // For each location with 2+ memories, connect only the first and last (chronologically)
    Object.entries(locationGroups).forEach(([loc, group]) => {
      if (group.length >= 2) {
        // Sort by date
        group.sort((a, b) => new Date(a.memory.date).getTime() - new Date(b.memory.date).getTime());
        // Connect first to last only (shows span of time at that location)
        const first = group[0];
        const last = group[group.length - 1];
        if (first.memory.id !== last.memory.id) {
          connections.push({
            from: first,
            to: last,
            strength: group.length,
            type: 'location',
          });
        }
      }
    });

    // 3. Semantic similarity connections - only top 20 strongest
    const semanticConns: Connection[] = [];
    semanticConnections.slice(0, 20).forEach(sc => {
      const fromNode = nodeMap[sc.from];
      const toNode = nodeMap[sc.to];
      if (fromNode && toNode) {
        semanticConns.push({
          from: fromNode,
          to: toNode,
          strength: Math.round(sc.score * 10) / 10,
          type: 'semantic',
        });
      }
    });
    connections.push(...semanticConns);

    return {
      nodes,
      connections,
      galaxyWidth: SCREEN_WIDTH,
      galaxyHeight: currentY + 50,
    };
  }, [filteredMemories, clusters, semanticConnections]);

  const insights = useMemo((): Insight[] => {
    if (memories.length < 3) return [];
    
    const insights: Insight[] = [];
    
    const personCount: Record<string, number> = {};
    memories.forEach(m => m.people?.forEach(p => personCount[p] = (personCount[p] || 0) + 1));
    const topPerson = Object.entries(personCount).sort((a, b) => b[1] - a[1])[0];
    if (topPerson && topPerson[1] >= 3) {
      insights.push({
        title: `${topPerson[0]} is central to your story`,
        description: `Appears in ${topPerson[1]} memories`,
      });
    }
    
    const emotionCount: Record<string, number> = {};
    memories.forEach(m => m.emotion && (emotionCount[m.emotion] = (emotionCount[m.emotion] || 0) + 1));
    const topEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0];
    if (topEmotion) {
      const percentage = Math.round((topEmotion[1] / memories.length) * 100);
      insights.push({
        title: `${topEmotion[0]} defines ${percentage}% of memories`,
        description: `Your dominant emotional theme`,
      });
    }
    
    const connectionPairs: Record<string, number> = {};
    memories.forEach(m => {
      const people = m.people || [];
      for (let i = 0; i < people.length; i++) {
        for (let j = i + 1; j < people.length; j++) {
          const key = [people[i], people[j]].sort().join(' & ');
          connectionPairs[key] = (connectionPairs[key] || 0) + 1;
        }
      }
    });
    const topPair = Object.entries(connectionPairs).sort((a, b) => b[1] - a[1])[0];
    if (topPair && topPair[1] >= 2) {
      insights.push({
        title: `${topPair[0]} often together`,
        description: `${topPair[1]} shared memories`,
      });
    }
    
    return insights.slice(0, 3);
  }, [memories]);

  useEffect(() => {
    nodes.forEach(node => {
      const id = node.memory.id;
      if (!pulseAnims[id]) {
        pulseAnims[id] = new Animated.Value(1);
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnims[id], {
              toValue: 1.15,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnims[id], {
              toValue: 1,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });
  }, [nodes]);

  const getEmotionColor = (emotion: string | null | undefined) => {
    return EMOTION_COLORS[emotion || ''] || EMOTION_COLORS.default;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  const CONNECTION_COLORS = {
    person: { normal: 'rgba(167,139,250,0.5)', highlight: 'rgba(167,139,250,0.9)' },
    location: { normal: 'rgba(80,200,120,0.5)', highlight: 'rgba(80,200,120,0.9)' },
    semantic: { normal: 'rgba(255,165,0,0.5)', highlight: 'rgba(255,165,0,0.9)' },
  };

  const connectionCounts = useMemo(() => {
    const counts = { person: 0, location: 0, semantic: 0 };
    connections.forEach(c => counts[c.type]++);
    return counts;
  }, [connections]);

  const filteredConnections = useMemo(() => {
    if (connectionFilter === 'all') return connections;
    return connections.filter(c => c.type === connectionFilter);
  }, [connections, connectionFilter]);

  const renderConnections = () => {
    return filteredConnections.map((conn, i) => {
      const dx = conn.to.x - conn.from.x;
      const dy = conn.to.y - conn.from.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      const isHighlighted = highlightedCluster && 
        (conn.from.cluster === highlightedCluster || conn.to.cluster === highlightedCluster);
      
      const colors = CONNECTION_COLORS[conn.type];
      
      return (
        <View
          key={`conn-${i}`}
          style={[
            styles.connection,
            {
              left: conn.from.x,
              top: conn.from.y,
              width: length,
              backgroundColor: isHighlighted ? colors.highlight : colors.normal,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />
      );
    });
  };

  const renderClusterHeaders = () => {
    const headers: { cluster: string; y: number; count: number }[] = [];
    let currentY = 40;
    
    clusters.forEach(cluster => {
      const count = nodes.filter(n => n.cluster === cluster).length;
      if (count > 0) {
        headers.push({ cluster, y: currentY, count });
        const cols = Math.min(Math.floor((SCREEN_WIDTH - 80) / NODE_SPACING), 6);
        const rows = Math.ceil(count / cols);
        currentY += 80 + rows * NODE_SPACING + 30;
      }
    });

    return headers.map(({ cluster, y, count }) => {
      const isHighlighted = highlightedCluster === cluster;
      return (
        <TouchableOpacity
          key={`header-${cluster}`}
          style={[styles.clusterHeader, { top: y }]}
          onPress={() => setHighlightedCluster(isHighlighted ? null : cluster)}
          activeOpacity={0.7}
        >
          <View style={[styles.clusterHeaderBg, isHighlighted && styles.clusterHeaderActive]}>
            <Text style={styles.clusterName}>{cluster}</Text>
            <View style={styles.clusterCountBadge}>
              <Text style={styles.clusterCount}>{count}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };

  const renderNode = (node: MemoryNode) => {
    const colors = getEmotionColor(node.memory.emotion);
    const pulse = pulseAnims[node.memory.id] || new Animated.Value(1);
    const isHighlighted = !highlightedCluster || node.cluster === highlightedCluster;
    const opacity = isHighlighted ? 1 : 0.25;

    return (
      <TouchableOpacity
        key={node.memory.id}
        style={[
          styles.nodeWrapper,
          {
            left: node.x - NODE_SIZE / 2,
            top: node.y - NODE_SIZE / 2,
            opacity,
          },
        ]}
        onPress={() => setSelectedMemory(node.memory)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.nodeGlow,
            {
              backgroundColor: colors.glow,
              transform: [{ scale: pulse }],
            },
          ]}
        />
        <View style={[styles.nodeCore, { backgroundColor: colors.primary, shadowColor: colors.primary }]} />
      </TouchableOpacity>
    );
  };

  const renderMemoryModal = () => {
    if (!selectedMemory) return null;
    const colors = getEmotionColor(selectedMemory.emotion);

    return (
      <Modal visible={!!selectedMemory} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[`rgba(${colors.rgb},0.2)`, 'rgba(11,11,43,0.98)', 'rgba(11,11,43,1)']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalEmotionBadge}>
                  <View style={[styles.emotionDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.modalEmotion}>{selectedMemory.emotion || 'Memory'}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedMemory(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDate}>{formatDate(selectedMemory.date)}</Text>
              
              {selectedMemory.location && (
                <Text style={styles.modalLocation}>{selectedMemory.location}</Text>
              )}

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalText}>{selectedMemory.rawText}</Text>

                {selectedMemory.summary && (
                  <View style={[styles.summaryBox, { borderLeftColor: colors.primary }]}>
                    <Text style={styles.summaryText}>{selectedMemory.summary}</Text>
                  </View>
                )}

                {selectedMemory.people && selectedMemory.people.length > 0 && (
                  <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>People</Text>
                    <View style={styles.metaTags}>
                      {selectedMemory.people.map((p, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.metaTag}
                          onPress={() => {
                            setSelectedMemory(null);
                            toggleFilter(p);
                          }}
                        >
                          <Text style={styles.metaTagText}>{p}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {selectedMemory.themes && selectedMemory.themes.length > 0 && (
                  <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>Themes</Text>
                    <View style={styles.metaTags}>
                      {selectedMemory.themes.map((t, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[styles.metaTag, { backgroundColor: `rgba(${colors.rgb},0.2)` }]}
                          onPress={() => {
                            setSelectedMemory(null);
                            toggleFilter(t);
                          }}
                        >
                          <Text style={styles.metaTagText}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {selectedMemory.lifeStage && (
                  <View style={styles.lifeStageBox}>
                    <Text style={styles.lifeStageText}>{selectedMemory.lifeStage}</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFiltersModal = () => (
    <Modal visible={showFilters} transparent animationType="slide">
      <View style={styles.filtersOverlay}>
        <View style={styles.filtersContent}>
          <View style={styles.filtersHandle} />
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filter Memories</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.filtersDone}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.filterHint}>Select multiple to see memories matching any filter</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.filterSectionTitle}>People</Text>
            <View style={styles.filterChips}>
              {filterOptions.people.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.filterChip, activeFilters.has(p) && styles.filterChipActive]}
                  onPress={() => toggleFilter(p)}
                >
                  <Text style={[styles.filterChipText, activeFilters.has(p) && styles.filterChipTextActive]}>
                    {p}
                  </Text>
                  {activeFilters.has(p) && <Text style={styles.filterCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Emotions</Text>
            <View style={styles.filterChips}>
              {filterOptions.emotions.map(e => {
                const colors = getEmotionColor(e);
                return (
                  <TouchableOpacity
                    key={e}
                    style={[
                      styles.filterChip,
                      activeFilters.has(e) && { backgroundColor: `rgba(${colors.rgb},0.3)`, borderColor: colors.primary },
                    ]}
                    onPress={() => toggleFilter(e)}
                  >
                    <View style={[styles.filterDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.filterChipText, activeFilters.has(e) && { color: '#FFF' }]}>{e}</Text>
                    {activeFilters.has(e) && <Text style={styles.filterCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterSectionTitle}>Themes</Text>
            <View style={styles.filterChips}>
              {filterOptions.themes.slice(0, 15).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterChip, activeFilters.has(t) && styles.filterChipActive]}
                  onPress={() => toggleFilter(t)}
                >
                  <Text style={[styles.filterChipText, activeFilters.has(t) && styles.filterChipTextActive]}>
                    {t}
                  </Text>
                  {activeFilters.has(t) && <Text style={styles.filterCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {activeFilters.size > 0 && (
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={() => setActiveFilters(new Set())}
              >
                <Text style={styles.clearAllText}>Clear All ({activeFilters.size})</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0B0B2B', '#1a1a3e', '#0B0B2B']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>{loadingStatus}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050510', '#0B0B2B', '#0a0a20']} style={StyleSheet.absoluteFill} />

      {/* Header - Fixed */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Memory Galaxy</Text>
        <Text style={styles.subtitle}>
          {filteredMemories.length} memories · Tap nodes to explore
        </Text>
      </View>

      {/* Filter Bar - Fixed */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Text style={styles.filterButtonText}>
            {activeFilters.size === 0 ? 'Filter' : `${activeFilters.size} filters`}
          </Text>
        </TouchableOpacity>

        {activeFilters.size > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
            {Array.from(activeFilters).map(f => (
              <TouchableOpacity
                key={f}
                style={styles.activeFilterChip}
                onPress={() => toggleFilter(f)}
              >
                <Text style={styles.activeFilterText}>{f}</Text>
                <Text style={styles.activeFilterX}>×</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
      >
        {/* Insights */}
        {insights.length > 0 && activeFilters.size === 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Insights</Text>
            {insights.map((insight, i) => (
              <View key={i} style={styles.insightCard}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDesc}>{insight.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Emotion Colors Legend - Above Galaxy */}
        <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Emotion Colors</Text>
          <View style={styles.legendGrid}>
            {['Joy', 'Love', 'Pride', 'Peace', 'Hope', 'Sadness', 'Anxiety', 'Gratitude'].map(e => (
              <View key={e} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getEmotionColor(e).primary }]} />
                <Text style={styles.legendText}>{e}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Connection Types Legend */}
        <View style={styles.connectionLegendSection}>
          <Text style={styles.legendTitle}>Connection Types (tap to filter)</Text>
          <View style={styles.connectionTypeRow}>
            <TouchableOpacity 
              style={[styles.connectionTypeBtn, connectionFilter === 'all' && styles.connectionTypeBtnActive]}
              onPress={() => setConnectionFilter('all')}
            >
              <Text style={[styles.connectionTypeText, connectionFilter === 'all' && styles.connectionTypeTextActive]}>
                All ({connections.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.connectionTypeBtn, connectionFilter === 'person' && styles.connectionTypeBtnActive]}
              onPress={() => setConnectionFilter('person')}
            >
              <View style={[styles.connectionLine, { backgroundColor: 'rgba(167,139,250,0.8)' }]} />
              <Text style={[styles.connectionTypeText, connectionFilter === 'person' && styles.connectionTypeTextActive]}>
                People ({connectionCounts.person})
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.connectionTypeRow}>
            <TouchableOpacity 
              style={[styles.connectionTypeBtn, connectionFilter === 'location' && styles.connectionTypeBtnActive]}
              onPress={() => setConnectionFilter('location')}
            >
              <View style={[styles.connectionLine, { backgroundColor: 'rgba(80,200,120,0.8)' }]} />
              <Text style={[styles.connectionTypeText, connectionFilter === 'location' && styles.connectionTypeTextActive]}>
                Location ({connectionCounts.location})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.connectionTypeBtn, connectionFilter === 'semantic' && styles.connectionTypeBtnActive]}
              onPress={() => setConnectionFilter('semantic')}
            >
              <View style={[styles.connectionLine, { backgroundColor: 'rgba(255,165,0,0.8)' }]} />
              <Text style={[styles.connectionTypeText, connectionFilter === 'semantic' && styles.connectionTypeTextActive]}>
                Similar ({connectionCounts.semantic})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Galaxy */}
        <View style={styles.galaxySection}>
          <Text style={styles.sectionTitle}>Relationship Map</Text>
          <Text style={styles.sectionHint}>Grouped by people · Lines show shared memories</Text>
          
          <View style={[styles.galaxyContainer, { height: galaxyHeight }]}>
            {renderConnections()}
            {renderClusterHeaders()}
            {nodes.map(renderNode)}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{memories.length}</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filterOptions.people.length}</Text>
            <Text style={styles.statLabel}>People</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filterOptions.emotions.length}</Text>
            <Text style={styles.statLabel}>Emotions</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderMemoryModal()}
      {renderFiltersModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050510' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingOrb: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#A78BFA', marginBottom: 20, opacity: 0.6 },
  loadingText: { color: '#8888AA', fontSize: 16 },

  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12 },
  backBtn: { marginBottom: 8 },
  backBtnText: { color: '#A78BFA', fontSize: 15, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#6B6B8D', marginTop: 4 },

  filterBar: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 12, alignItems: 'center', gap: 10 },
  filterButton: { backgroundColor: 'rgba(167,139,250,0.15)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  filterButtonText: { color: '#A78BFA', fontSize: 14, fontWeight: '600' },
  activeFiltersScroll: { flex: 1 },
  activeFilterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(167,139,250,0.25)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginRight: 8, gap: 6 },
  activeFilterText: { color: '#FFF', fontSize: 12, fontWeight: '500' },
  activeFilterX: { color: '#A78BFA', fontSize: 14, fontWeight: '600' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  insightsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 12 },
  sectionHint: { fontSize: 12, color: '#6B6B8D', marginBottom: 16, marginTop: -8 },
  insightCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  insightTitle: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  insightDesc: { color: '#8888AA', fontSize: 13 },

  galaxySection: { marginBottom: 24 },
  galaxyContainer: { position: 'relative', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, overflow: 'hidden' },

  connection: { position: 'absolute', height: 2, transformOrigin: 'left center' },

  clusterHeader: { position: 'absolute', left: 20, zIndex: 10 },
  clusterHeaderBg: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,30,60,0.95)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  clusterHeaderActive: { backgroundColor: 'rgba(167,139,250,0.3)', borderColor: '#A78BFA' },
  clusterName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  clusterCountBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },
  clusterCount: { color: '#8888AA', fontSize: 11, fontWeight: '600' },

  nodeWrapper: { position: 'absolute', width: NODE_SIZE, height: NODE_SIZE, alignItems: 'center', justifyContent: 'center' },
  nodeGlow: { position: 'absolute', width: NODE_SIZE + 12, height: NODE_SIZE + 12, borderRadius: (NODE_SIZE + 12) / 2, opacity: 0.4 },
  nodeCore: { width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },

  legendSection: { marginBottom: 16 },
  legendTitle: { fontSize: 14, fontWeight: '600', color: '#8888AA', marginBottom: 12 },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: '#6B6B8D', fontSize: 13 },

  connectionLegendSection: { marginBottom: 20 },
  connectionTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  connectionTypeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  connectionTypeBtnActive: { backgroundColor: 'rgba(167,139,250,0.2)', borderColor: '#A78BFA' },
  connectionLine: { width: 16, height: 3, borderRadius: 2 },
  connectionTypeText: { color: '#8888AA', fontSize: 12, fontWeight: '500' },
  connectionTypeTextActive: { color: '#FFF' },
  connectionStats: { color: '#6B6B8D', fontSize: 11 },

  statsSection: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statValue: { color: '#A78BFA', fontSize: 24, fontWeight: '700' },
  statLabel: { color: '#6B6B8D', fontSize: 11, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, overflow: 'hidden', maxHeight: SCREEN_HEIGHT * 0.8 },
  modalGradient: { padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalEmotionBadge: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emotionDot: { width: 14, height: 14, borderRadius: 7 },
  modalEmotion: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#FFF', fontSize: 24, marginTop: -2 },
  modalDate: { color: '#A78BFA', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  modalLocation: { color: '#6B6B8D', fontSize: 14, marginBottom: 16 },
  modalScroll: { maxHeight: SCREEN_HEIGHT * 0.45 },
  modalText: { color: '#E5E5E5', fontSize: 16, lineHeight: 26, marginBottom: 20 },
  summaryBox: { backgroundColor: 'rgba(167,139,250,0.08)', borderRadius: 12, padding: 14, marginBottom: 20, borderLeftWidth: 3 },
  summaryText: { color: '#CCC', fontSize: 14, fontStyle: 'italic', lineHeight: 22 },
  metaSection: { marginBottom: 16 },
  metaLabel: { color: '#6B6B8D', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  metaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaTag: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  metaTagText: { color: '#CCC', fontSize: 13 },
  lifeStageBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 12, marginTop: 8 },
  lifeStageText: { color: '#AAA', fontSize: 14, fontWeight: '500' },

  filtersOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  filtersContent: { backgroundColor: '#12122B', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: SCREEN_HEIGHT * 0.8 },
  filtersHandle: { width: 40, height: 4, backgroundColor: '#3D3D5C', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  filtersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  filtersTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  filtersDone: { color: '#A78BFA', fontSize: 16, fontWeight: '600' },
  filterHint: { color: '#6B6B8D', fontSize: 12, marginBottom: 20 },
  filterSectionTitle: { color: '#8888AA', fontSize: 14, fontWeight: '600', marginBottom: 12, marginTop: 8 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 6 },
  filterChipActive: { backgroundColor: 'rgba(167,139,250,0.25)', borderColor: '#A78BFA' },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterChipText: { color: '#AAA', fontSize: 13 },
  filterChipTextActive: { color: '#FFF', fontWeight: '600' },
  filterCheck: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  clearAllBtn: { marginTop: 16, padding: 16, borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center' },
  clearAllText: { color: '#EF4444', fontWeight: '600' },
});
