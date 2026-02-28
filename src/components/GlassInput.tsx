import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function GlassInput({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  ...props
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 200 });
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.1)', COLORS.primary]
    );

    return {
      borderColor,
      borderWidth: 1.5,
    };
  });

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <View style={styles.inputContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          
          <TextInput
            {...props}
            style={[styles.input, props.style]}
            placeholderTextColor={COLORS.textMuted}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconContainer}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  container: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingVertical: SPACING.md,
  },
  rightIconContainer: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
