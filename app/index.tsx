import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser } from '../src/config/firebase';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    console.log('[Splash] Mounted');
    const timer = setTimeout(async () => {
      const user = await getCurrentUser();
      console.log('[Splash] User check:', user?.email || 'none');
      router.replace(user ? '/home' : '/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.tagline}>Preserve a Mind Before It Fades</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B2B', justifyContent: 'center', alignItems: 'center', padding: 32 },
  logo: { width: 280, height: 280, marginBottom: 16 },
  tagline: { fontSize: 16, color: '#A1A1AA', letterSpacing: 1, textAlign: 'center' },
});
