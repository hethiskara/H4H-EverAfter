import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, interpolate, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const FloatingOrb = ({ size, color, x, y, delay, duration }: any) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, 30]) }, { scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.1, 1]) }],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, left: x, top: y }, style]} />;
};

export default function AnimatedBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[COLORS.bgDark, COLORS.bgMedium, COLORS.bgDark]} style={StyleSheet.absoluteFill} />
      <FloatingOrb size={300} color={COLORS.glowPurple} x={-100} y={100} delay={0} duration={8000} />
      <FloatingOrb size={250} color={COLORS.glowPink} x={width - 100} y={height - 300} delay={1000} duration={10000} />
    </View>
  );
}
