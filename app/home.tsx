import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../src/components/AnimatedBackground';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);

  useEffect(() => {
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.title}>EverAfter</Text>
          </View>
          
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
            style={styles.welcomeCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.iconText}>✨</Text>
              </LinearGradient>
            </View>
            
            <Text style={styles.welcomeTitle}>You're all set!</Text>
            <Text style={styles.welcomeSubtitle}>
              Your memory preservation journey begins here.
            </Text>
            
            {user?.email && (
              <View style={styles.emailBadge}>
                <Text style={styles.emailText}>{user.email}</Text>
              </View>
            )}
          </LinearGradient>

          <Text style={styles.comingSoon}>
            Calendar & Memory features coming soon...
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  signOutButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  signOutText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    width: '100%',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 36,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emailBadge: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  emailText: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '500',
  },
  comingSoon: {
    marginTop: SPACING.xl,
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
