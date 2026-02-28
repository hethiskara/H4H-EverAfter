import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../src/components/AnimatedBackground';
import GlassInput from '../src/components/GlassInput';
import GlowButton from '../src/components/GlowButton';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  console.log('[Login] Mounted');
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    if (!isLogin && password !== confirmPassword) e.confirmPassword = 'Passwords must match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      isLogin ? await signIn(email, password) : await signUp(email, password);
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.header}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.logoSmall}>
              <Text style={styles.logoText}>∞</Text>
            </LinearGradient>
            <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
            <Text style={styles.subtitle}>{isLogin ? 'Sign in to continue' : 'Start preserving memories'}</Text>
          </Animated.View>

          <View style={styles.form}>
            <GlassInput label="Email" placeholder="Enter email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} icon={<Text>✉️</Text>} />
            <GlassInput label="Password" placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} error={errors.password} icon={<Text>🔒</Text>} rightIcon={<Text>{showPassword ? '🙈' : '👁️'}</Text>} onRightIconPress={() => setShowPassword(!showPassword)} />
            {!isLogin && <GlassInput label="Confirm Password" placeholder="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} error={errors.confirmPassword} icon={<Text>🔒</Text>} />}

            <View style={{ marginTop: SPACING.md }}>
              <GlowButton title={isLogin ? 'Sign In' : 'Create Account'} onPress={handleSubmit} loading={loading} />
            </View>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.line} />
            </View>

            <GlowButton title="Continue with Google" onPress={signInWithGoogle} variant="outline" icon={<Text style={{ fontSize: 18 }}>G</Text>} />
          </View>

          <Animated.View entering={FadeInUp.duration(600).delay(600)} style={styles.footer}>
            <Text style={styles.footerText}>{isLogin ? "Don't have an account? " : 'Have an account? '}</Text>
            <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setErrors({}); }}>
              <Text style={styles.footerLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: height * 0.08, paddingBottom: SPACING.xl },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logoSmall: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  logoText: { fontSize: 36, color: COLORS.textPrimary, fontWeight: '200' },
  title: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: COLORS.textSecondary },
  form: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: COLORS.textMuted, marginHorizontal: SPACING.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textSecondary, fontSize: 15 },
  footerLink: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
});
