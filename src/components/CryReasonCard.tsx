import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadows } from '../constants/theme';
import { CryEvent, CryReasonMeta } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface CryReasonCardProps {
  event: CryEvent;
  meta: CryReasonMeta;
  onPress?: () => void;
  compact?: boolean;
}

export const CryReasonCard: React.FC<CryReasonCardProps> = ({
  event,
  meta,
  onPress,
  compact = false,
}) => {
  const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
  const durationStr =
    event.duration >= 60
      ? `${Math.floor(event.duration / 60)}m ${event.duration % 60}s`
      : `${event.duration}s`;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, Shadows.sm]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={[styles.emojiWrap, { backgroundColor: meta.color + '18' }]}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactLabel}>{meta.label}</Text>
          <Text style={styles.compactTime}>{timeAgo}</Text>
        </View>
        <View style={styles.confidencePill}>
          <Text style={[styles.confidenceText, { color: meta.color }]}>
            {event.confidence}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.md, { borderLeftColor: meta.color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={[styles.emojiWrap, { backgroundColor: meta.color + '18' }]}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
        </View>
        <View style={styles.titleGroup}>
          <Text style={styles.reasonLabel}>{meta.label}</Text>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
        <View style={[styles.confBadge, { backgroundColor: meta.color + '18' }]}>
          <Text style={[styles.confValue, { color: meta.color }]}>
            {event.confidence}%
          </Text>
          <Text style={[styles.confLabel, { color: meta.color }]}>confidence</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{meta.description}</Text>

      {/* Suggestion */}
      <View style={[styles.suggestionBox, { backgroundColor: meta.color + '10' }]}>
        <Ionicons name="bulb-outline" size={14} color={meta.color} />
        <Text style={[styles.suggestionText, { color: Colors.textMedium }]}>
          {meta.suggestion}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.footerText}>Duration: {durationStr}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderLeftWidth: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  titleGroup: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  timeText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  confBadge: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  confValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  confLabel: {
    fontSize: 9,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textMedium,
    lineHeight: 20,
  },
  suggestionBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'flex-start',
  },
  suggestionText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: 4,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Compact
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  compactInfo: {
    flex: 1,
  },
  compactLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textDark,
  },
  compactTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  confidencePill: {
    backgroundColor: Colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  confidenceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});