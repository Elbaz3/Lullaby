import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radius, Spacing, FontSize, FontWeight, Shadows } from '../../constants/theme';

// ── Card ─────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = Spacing.lg,
  shadow = true,
}) => (
  <View style={[styles.card, shadow && Shadows.md, { padding }, style]}>
    {children}
  </View>
);

// ── Badge ─────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  textStyle,
}) => (
  <View style={[styles.badge, styles[`badge_${variant}`], style]}>
    <Text style={[styles.badgeText, styles[`badgeText_${variant}`], textStyle]}>
      {label}
    </Text>
  </View>
);

// ── StatusDot ─────────────────────────────────

interface StatusDotProps {
  status: 'connected' | 'disconnected' | 'warning' | 'error';
  size?: number;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, size = 8 }) => {
  const colorMap = {
    connected: Colors.success,
    disconnected: Colors.textMuted,
    warning: Colors.warning,
    error: Colors.danger,
  };
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colorMap[status],
      }}
    />
  );
};

// ── SectionHeader ─────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  action,
  onAction,
  style,
}) => (
  <View style={[styles.sectionHeader, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <Text style={styles.sectionAction} onPress={onAction}>
        {action}
      </Text>
    )}
  </View>
);

// ── EmptyState ────────────────────────────────

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  style,
}) => (
  <View style={[styles.emptyState, style]}>
    <Text style={styles.emptyEmoji}>{emoji}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

// ── Divider ───────────────────────────────────

export const Divider: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

// ── Styles ────────────────────────────────────

const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
  },

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  badge_success: { backgroundColor: Colors.successSoft },
  badge_warning: { backgroundColor: Colors.warningSoft },
  badge_danger: { backgroundColor: Colors.dangerSoft },
  badge_info: { backgroundColor: Colors.infoSoft },
  badge_primary: { backgroundColor: Colors.primarySoft },
  badge_neutral: { backgroundColor: Colors.bgInput },
  badgeText_success: { color: Colors.success },
  badgeText_warning: { color: Colors.warning },
  badgeText_danger: { color: Colors.danger },
  badgeText_info: { color: Colors.info },
  badgeText_primary: { color: Colors.primary },
  badgeText_neutral: { color: Colors.textMuted },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  sectionAction: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textDark,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.xl,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
});