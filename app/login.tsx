import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../src/components/AnimatedBackground';
import GlassInput from '../src/components/GlassInput';
import GlowButton from '../src/components/GlowButton';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);

  useEffect(() => {
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setConfirmPassword('');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            entering={FadeInDown.duration(800).delay(200)}
            style={styles.header}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.logoSmall}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoText}>∞</Text>
            </LinearGradient>
            <Text style={styles.title}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Sign in to continue your journey'
                : 'Start preserving your memories'}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.form, formAnimatedStyle]}>
            <View style={styles.formCard}>
              <GlassInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                icon={<EmailIcon />}
              />

              <GlassInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={errors.password}
                icon={<LockIcon />}
                rightIcon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {!isLogin && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <GlassInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    error={errors.confirmPassword}
                    icon={<LockIcon />}
                  />
                </Animated.View>
              )}

              <View style={styles.buttonContainer}>
                <GlowButton
                  title={isLogin ? 'Sign In' : 'Create Account'}
                  onPress={handleSubmit}
                  loading={loading}
                />
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <GlowButton
                title="Continue with Google"
                onPress={handleGoogleSignIn}
                variant="outline"
                icon={<GoogleIcon />}
              />
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(600).delay(600)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.footerLink}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const EmailIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>✉</Text>
  </View>
);

const LockIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>🔒</Text>
  </View>
);

const EyeIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>👁</Text>
  </View>
);

const EyeOffIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>🙈</Text>
  </View>
);

const GoogleIcon = () => (
  <View style={styles.googleIcon}>
    <Text style={styles.googleIconText}>G</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: height * 0.08,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoSmall: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  logoText: {
    fontSize: 36,
    color: COLORS.textPrimary,
    fontWeight: '200',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.xl,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginHorizontal: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  icon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.bgDark,
  },
});
