import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getCurrentUser } from '../src/config/firebase';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[Splash] Mounted');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(async () => {
      const user = await getCurrentUser();
      console.log('[Splash] User check:', user?.email || 'none');
      router.replace(user ? '/home' : '/login');
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <LinearGradient
      colors={['#0B0B2B', '#1a1a3e', '#0B0B2B']}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      
      <Animated.View style={[styles.taglineContainer, { opacity: taglineFade }]}>
        <Text style={styles.tagline}>Preserve a Mind Before It Fades</Text>
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.dot, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.dot, { opacity: glowOpacity }]} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32 
  },
  logoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#A78BFA',
    opacity: 0.3,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  logo: { 
    width: 280, 
    height: 280, 
    marginBottom: 16,
    zIndex: 1,
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  tagline: { 
    fontSize: 16, 
    color: '#A1A1AA', 
    letterSpacing: 1.5, 
    textAlign: 'center',
    fontWeight: '300',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A78BFA',
  },
});
