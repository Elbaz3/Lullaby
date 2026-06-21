// ─────────────────────────────────────────────
//  LULLABY — Updated Design Tokens (Pink Theme)
// ─────────────────────────────────────────────

export const Colors = {
  // Primary palette (Based on the new Pink UI)
  primary: '#C07792', // The main brand pink
  primaryDark: '#8E5E71', // Darker rose for headers/titles
  primaryLight: '#E8B7D4', // Lighter pink for gradients
  primarySoft: '#FFF0F5', // Lavender Blush (very soft pink for backgrounds)

  // Backgrounds
  bgMain: '#FDF2F4', // Softest pink background
  bgCard: '#FFFFFF', // Solid white for cards
  bgCardTranslucent: '#FFFFFFCC', // Translucent white for blur effects
  bgInput: '#FDF8FA', // Slightly pinkish white for inputs

  // Text (Shifted to brownish-rose tones for warmth)
  textDark: '#4A3B40', // Dark grayish brown for main text
  textMedium: '#8E5E71', // Medium rose for sub-headers
  textMuted: '#A97C8E', // Grayish-pink for captions
  textLight: '#CEAFBB', // Very light pink for placeholders

  // Semantic
  success: '#4CAF50',
  successSoft: '#E8F5E9',
  warning: '#FF9800',
  warningSoft: '#FFF3E0',
  danger: '#E53935',
  dangerSoft: '#FFEBEE',
  info: '#2196F3',
  infoSoft: '#E3F2FD',

  // Dashboard / Sensor Card Specific Colors (Matches your logic)
  tempCard: '#5DADE2', // Blue for Temperature
  heartCard: '#EBADBD', // Pink for Heart Rate
  breathCard: '#D2B4DE', // Purple for Breathing
  vaccineCard: '#AED6F1', // Light Blue for Vaccination
  routineCard: '#F5CBA7', // Peach/Orange for Routine
  cryCard: '#F1948A', // Salmon/Red for Cry Detection
  airCard: '#82E0AA', // Greenish for Air Quality

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  border: '#E8D0DC', // Soft pink-grey border
  divider: '#F0D5E0', // Light pink divider
  overlay: 'rgba(74, 59, 64, 0.4)', // Semi-transparent dark rose

  // Tab bar (Matches the pill-shaped image)
  tabActive: '#C07792',
  tabInactive: '#D1D1D1',
  tabBg: '#FFFFFF'
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  giant: 64
} as const

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 25, // Updated to 25 to match the rounded cards in new UI
  xxxl: 32, // For the main feature cards
  full: 999
} as const

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18, // Slightly increased for the Poppins aesthetic
  xl: 22,
  xxl: 28,
  xxxl: 32,
  display: 36
} as const

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const
}

export const Shadows = {
  sm: {
    shadowColor: '#936174', // Tinted shadows for the pink theme
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  md: {
    shadowColor: '#936174',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5
  },
  lg: {
    shadowColor: '#C07792',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10
  }
} as const

export const Layout = {
  screenPadding: Spacing.xl,
  cardPadding: Spacing.lg,
  inputHeight: 52,
  buttonHeight: 55, // Slightly taller buttons
  tabBarHeight: 70,
  headerHeight: 60
} as const
