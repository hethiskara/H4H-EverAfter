import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingGuideProps {
  visible: boolean;
  onComplete: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to EverAfter! 👋',
    description: 'Let\'s take a quick tour to help you preserve your precious memories.',
    highlight: null,
    position: 'center',
  },
  {
    title: 'Quick Add Memories',
    description: 'Tap the purple + button to quickly add memories via text, voice, or photo.',
    highlight: { bottom: 30, right: 20, width: 64, height: 64 },
    position: 'bottom-right',
    icon: '➕',
  },
  {
    title: 'Your Memory Calendar',
    description: 'Tap any day on the calendar to view or add memories for that date.',
    highlight: { top: 280, left: 20, right: 20, height: 350 },
    position: 'top',
    icon: '📅',
  },
  {
    title: 'Relive Your Story',
    description: 'Ask questions about your past and hear your memories come alive with AI.',
    highlight: { top: 180, left: 20, right: 20, height: 100 },
    position: 'top',
    icon: '🎙',
  },
  {
    title: 'Explore Your Life',
    description: 'Visualize your memories as an interactive network of connected moments.',
    highlight: { bottom: 180, left: 20, width: 170, height: 120 },
    position: 'bottom-left',
    icon: '🌌',
  },
  {
    title: 'Track Your Progress',
    description: 'Build streaks and watch your memory collection grow over time.',
    highlight: { bottom: 60, left: 20, right: 20, height: 100 },
    position: 'bottom',
    icon: '🔥',
  },
  {
    title: 'You\'re All Set! 🎉',
    description: 'Start capturing your memories today. Every moment matters.',
    highlight: null,
    position: 'center',
  },
];

export default function OnboardingGuide({ visible, onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];

  const getTooltipPosition = () => {
    switch (step.position) {
      case 'top':
        return { top: 100, left: 20, right: 20 };
      case 'bottom':
        return { bottom: 120, left: 20, right: 20 };
      case 'bottom-left':
        return { bottom: 320, left: 20, width: 280 };
      case 'bottom-right':
        return { bottom: 120, right: 20, width: 280 };
      case 'center':
      default:
        return { top: SCREEN_HEIGHT * 0.35, left: 20, right: 20 };
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Highlight Spotlight */}
        {step.highlight && (
          <Animated.View
            style={[
              styles.spotlight,
              step.highlight,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0.3, 0.5],
                }),
              },
            ]}
          />
        )}

        {/* Tooltip Card */}
        <Animated.View
          style={[
            styles.tooltip,
            getTooltipPosition(),
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(139,92,246,0.95)', 'rgba(91,79,196,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tooltipGradient}
          >
            {step.icon && (
              <Animated.Text
                style={[
                  styles.tooltipIcon,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {step.icon}
              </Animated.Text>
            )}

            <Text style={styles.tooltipTitle}>{step.title}</Text>
            <Text style={styles.tooltipDescription}>{step.description}</Text>

            {/* Progress Dots */}
            <View style={styles.progressDots}>
              {ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep && styles.dotActive,
                  ]}
                />
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {currentStep > 0 && (
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipText}>Skip Tour</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <LinearGradient
                  colors={['#A78BFA', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextGradient}
                >
                  <Text style={styles.nextText}>
                    {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Step Counter */}
        <View style={styles.stepCounter}>
          <Text style={styles.stepText}>
            {currentStep + 1} / {ONBOARDING_STEPS.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#A78BFA',
    backgroundColor: 'transparent',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  tooltip: {
    position: 'absolute',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  tooltipGradient: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tooltipIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  tooltipTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  tooltipDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#FFF',
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextGradient: {
    padding: 14,
    alignItems: 'center',
  },
  nextText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepCounter: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(167,139,250,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.5)',
  },
  stepText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
