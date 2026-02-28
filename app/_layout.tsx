import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  console.log('[App] Layout mounted');
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B2B' }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0B2B' } }} />
    </View>
  );
}
