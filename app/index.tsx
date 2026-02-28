import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../src/components/AnimatedBackground';
import { COLORS, GRADIENTS, SPACING } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  console.log('[Splash] Screen mounted');
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0);
  const ring2Opacity = useSharedValue(0);

  const navigateToNext = () => {
    console.log('[Splash] Navigate check - Loading:', loading, 'User:', user?.email || 'none');
    if (!loading) {
      if (user) {
        console.log('[Splash] Navigating to home...');
        router.replace('/home');
      } else {
        console.log('[Splash] Navigating to login...');
        router.replace('/login');
      }
    }
  };

  useEffect(() => {
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      )
    );

    ringOpacity.value = withDelay(600, withTiming(0.6, { duration: 600 }));
    ringScale.value = withDelay(
      600,
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );

    ring2Opacity.value = withDelay(900, withTiming(0.4, { duration: 600 }));
    ring2Scale.value = withDelay(
      900,
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) })
    );

    titleOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(
      1200,
      withSpring(0, { damping: 12, stiffness: 100 })
    );

    taglineOpacity.value = withDelay(1600, withTiming(1, { duration: 800 }));
    taglineTranslateY.value = withDelay(
      1600,
      withSpring(0, { damping: 12, stiffness: 100 })
    );

    const timeout = setTimeout(() => {
      navigateToNext();
    }, 3500);

    return () => clearTimeout(timeout);
  }, [loading, user]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const ring2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.ring, ringAnimatedStyle]}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.1)']}
              style={styles.ringGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          
          <Animated.View style={[styles.ring2, ring2AnimatedStyle]}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.ringGradient}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </Animated.View>
          
          <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoText}>∞</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          EverAfter
        </Animated.Text>
        
        <Animated.Text style={[styles.tagline, taglineAnimatedStyle]}>
          Preserve a Mind Before It Fades
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <LoadingDot key={i} delay={i * 200} />
          ))}
        </View>
      </View>
    </View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      )
    );

    const interval = setInterval(() => {
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        )
      );
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  ring2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  ringGradient: {
    flex: 1,
    borderRadius: 125,
  },
  logoWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 60,
    color: COLORS.textPrimary,
    fontWeight: '200',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
