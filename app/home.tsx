import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signOutUser, getCurrentUser } from '../src/config/firebase';

export default function HomeScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    console.log('[Home] Mounted');
    getCurrentUser().then(u => setUserEmail(u?.email || ''));
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
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
        <LinearGradient colors={['rgba(91,79,196,0.15)', 'rgba(139,92,246,0.05)']} style={styles.card}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.cardTitle}>You're all set!</Text>
          <Text style={styles.cardSub}>Your memory journey begins here.</Text>
          {userEmail ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{userEmail}</Text>
            </View>
          ) : null}
        </LinearGradient>
        <Text style={styles.coming}>Calendar & Memory features coming soon...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B2B', paddingHorizontal: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  greeting: { fontSize: 16, color: '#8888AA', marginBottom: 4 },
  title: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  signOut: { padding: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  signOutText: { color: '#8888AA', fontSize: 14 },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { width: '100%', padding: 28, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  logo: { width: 120, height: 120, marginBottom: 12 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  cardSub: { fontSize: 15, color: '#8888AA', marginBottom: 16 },
  badge: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(91,79,196,0.2)' },
  badgeText: { color: '#A78BFA', fontSize: 14, fontWeight: '500' },
  coming: { marginTop: 32, fontSize: 14, color: '#52527A', fontStyle: 'italic' },
});
