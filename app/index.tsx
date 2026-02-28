import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../src/components/AnimatedBackground';
import { COLORS, GRADIENTS, SPACING } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

export default function SplashScreen() {
  console.log('[Splash] Mounted');
  const router = useRouter();
  const { user, loading } = useAuth();

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(300, withSequence(withSpring(1.2, { damping: 8 }), withSpring(1, { damping: 12 })));
    titleOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));
    titleY.value = withDelay(1200, withSpring(0, { damping: 12 }));
    taglineOpacity.value = withDelay(1600, withTiming(1, { duration: 800 }));

    const timeout = setTimeout(() => {
      console.log('[Splash] Navigating - loading:', loading, 'user:', user?.email);
      if (!loading) router.replace(user ? '/home' : '/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading, user]);

  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value, transform: [{ scale: logoScale.value }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleY.value }] }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.logo}>
            <Text style={styles.logoText}>∞</Text>
          </LinearGradient>
        </Animated.View>
        <Animated.Text style={[styles.title, titleStyle]}>EverAfter</Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>Preserve a Mind Before It Fades</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl },
  logoWrap: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30, marginBottom: SPACING.xl },
  logo: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 60, color: COLORS.textPrimary, fontWeight: '200' },
  title: { fontSize: 42, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 2, marginBottom: SPACING.sm },
  tagline: { fontSize: 16, color: COLORS.textSecondary, letterSpacing: 1, textAlign: 'center' },
});
