import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface OrbProps {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  delay: number;
  duration: number;
}

const FloatingOrb = ({ size, color, initialX, initialY, delay, duration }: OrbProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, 30]);
    const translateX = interpolate(progress.value, [0, 0.5, 1], [0, 15, 0]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1.1, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);

    return {
      transform: [
        { translateY },
        { translateX },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: initialX,
          top: initialY,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

const ParticleField = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * width,
    y: Math.random() * height,
    delay: Math.random() * 2000,
    duration: Math.random() * 3000 + 2000,
  }));

  return (
    <>
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} {...particle} />
      ))}
    </>
  );
};

const FloatingParticle = ({ size, x, y, delay, duration }: any) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 0.5, 1], [0.1, 0.5, 0.1]),
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x,
          top: y,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function AnimatedBackground() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bgDark, COLORS.bgMedium, COLORS.bgDark]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <FloatingOrb
        size={300}
        color={COLORS.glowPurple}
        initialX={-100}
        initialY={100}
        delay={0}
        duration={8000}
      />
      <FloatingOrb
        size={250}
        color={COLORS.glowPink}
        initialX={width - 100}
        initialY={height - 300}
        delay={1000}
        duration={10000}
      />
      <FloatingOrb
        size={200}
        color={COLORS.glowBlue}
        initialX={width / 2 - 100}
        initialY={height / 2}
        delay={2000}
        duration={7000}
      />
      
      <ParticleField />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
    backgroundColor: COLORS.textPrimary,
  },
});
