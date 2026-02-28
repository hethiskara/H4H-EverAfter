import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../src/components/AnimatedBackground';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

export default function HomeScreen() {
  console.log('[Home] Mounted');
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.title}>EverAfter</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <LinearGradient colors={['rgba(139,92,246,0.1)', 'rgba(236,72,153,0.05)']} style={styles.card}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.icon}>
              <Text style={{ fontSize: 36 }}>✨</Text>
            </LinearGradient>
            <Text style={styles.cardTitle}>You're all set!</Text>
            <Text style={styles.cardSub}>Your memory journey begins here.</Text>
            {user?.email && <View style={styles.badge}><Text style={styles.badgeText}>{user.email}</Text></View>}
          </LinearGradient>
          <Text style={styles.coming}>Calendar & Memory features coming soon...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl + SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
  greeting: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  title: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary },
  signOut: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  signOutText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { width: '100%', padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  icon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  cardTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  cardSub: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  badge: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.full, backgroundColor: 'rgba(139,92,246,0.2)' },
  badgeText: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '500' },
  coming: { marginTop: SPACING.xl, fontSize: 14, color: COLORS.textMuted, fontStyle: 'italic' },
});
