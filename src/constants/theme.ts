// ─────────────────────────────────────────────
//  LULLABY — Design Tokens
// ─────────────────────────────────────────────

export const Colors = {
  // Primary palette
  primary: '#4A90D9',
  primaryDark: '#2C5F8A',
  primaryLight: '#7BB8EC',
  primarySoft: '#D6EAFB',

  // Backgrounds
  bgMain: '#E8F4FD',
  bgCard: '#FFFFFF',
  bgInput: '#F4F8FC',

  // Text
  textDark: '#1A2B4A',
  textMedium: '#4A6580',
  textMuted: '#8FA3B8',
  textLight: '#BDD0E0',

  // Semantic
  success: '#4CAF50',
  successSoft: '#E8F5E9',
  warning: '#FF9800',
  warningSoft: '#FFF3E0',
  danger: '#F44336',
  dangerSoft: '#FFEBEE',
  info: '#03A9F4',
  infoSoft: '#E1F5FE',

  // Sensor card colors
  tempCard: '#FFE0B2',
  heartCard: '#FCE4EC',
  breathCard: '#E8F5E9',
  micCard: '#EDE7F6',
  airCard: '#E1F5FE',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  border: '#DDE8F0',
  divider: '#EEF4F9',
  overlay: 'rgba(26, 43, 74, 0.5)',

  // Tab bar
  tabActive: '#4A90D9',
  tabInactive: '#8FA3B8',
  tabBg: '#FFFFFF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  giant: 64,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const Layout = {
  screenPadding: Spacing.xl,
  cardPadding: Spacing.lg,
  inputHeight: 52,
  buttonHeight: 54,
  tabBarHeight: 70,
  headerHeight: 60,
} as const;
