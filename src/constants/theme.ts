export const COLORS = {
  // Primary palette - Deep cosmic theme
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  
  // Accent colors
  accent: '#F472B6',
  accentLight: '#F9A8D4',
  accentDark: '#EC4899',
  
  // Background gradients
  bgDark: '#0A0A0F',
  bgMedium: '#12121A',
  bgLight: '#1A1A25',
  bgCard: '#1E1E2A',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Glow effects
  glowPurple: 'rgba(139, 92, 246, 0.5)',
  glowPink: 'rgba(244, 114, 182, 0.5)',
  glowBlue: 'rgba(59, 130, 246, 0.5)',
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
};

export const GRADIENTS = {
  primary: ['#8B5CF6', '#EC4899'],
  secondary: ['#3B82F6', '#8B5CF6'],
  dark: ['#0A0A0F', '#12121A', '#1A1A25'],
  card: ['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)'],
  glow: ['rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.1)', 'transparent'],
};

export const FONTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
