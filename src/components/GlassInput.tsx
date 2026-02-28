import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export default function GlassInput({ label, error, icon, rightIcon, onRightIconPress, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const progress = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], ['rgba(255,255,255,0.1)', COLORS.primary]),
    borderWidth: 1.5,
  }));

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.container, containerStyle]}>
        <View style={styles.row}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <TextInput
            {...props}
            style={[styles.input, props.style]}
            placeholderTextColor={COLORS.textMuted}
            onFocus={() => { setFocused(true); progress.value = withTiming(1, { duration: 200 }); }}
            onBlur={() => { setFocused(false); progress.value = withTiming(0, { duration: 200 }); }}
          />
          {rightIcon && <TouchableOpacity onPress={onRightIconPress} style={styles.icon}>{rightIcon}</TouchableOpacity>}
        </View>
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  label: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: SPACING.xs, marginLeft: SPACING.xs },
  container: { borderRadius: BORDER_RADIUS.lg, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md },
  icon: { marginRight: SPACING.sm },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 16, paddingVertical: SPACING.md },
  error: { color: COLORS.error, fontSize: 12, marginTop: SPACING.xs, marginLeft: SPACING.xs },
});
