import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadows } from '../constants/theme';

interface SensorCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  iconColor: string;
  status?: 'normal' | 'warning' | 'critical';
  subtitle?: string;
  onPress?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit,
  icon,
  bgColor,
  iconColor,
  status = 'normal',
  subtitle,
  onPress,
}) => {
  const statusColor = {
    normal: Colors.success,
    warning: Colors.warning,
    critical: Colors.danger,
  }[status];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: iconColor + '25' }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flex: 1,
    minWidth: 140,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  unit: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textMedium,
    marginBottom: 2,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textDark,
    marginTop: 2,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});