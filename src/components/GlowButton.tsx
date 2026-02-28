import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, GRADIENTS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GlowButton({ title, onPress, variant = 'primary', loading, disabled, icon, style }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (variant === 'outline') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        disabled={disabled || loading}
        style={[styles.outline, animStyle, (disabled || loading) && styles.disabled, style]}
      >
        {loading ? <ActivityIndicator color={COLORS.primary} /> : <>{icon}<Text style={styles.outlineText}>{title}</Text></>}
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      disabled={disabled || loading}
      style={[animStyle, (disabled || loading) && styles.disabled, style]}
    >
      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {loading ? <ActivityIndicator color={COLORS.textPrimary} /> : <>{icon}<Text style={styles.text}>{title}</Text></>}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg, gap: SPACING.sm },
  text: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  outline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: 'rgba(139,92,246,0.1)', gap: SPACING.sm },
  outlineText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
