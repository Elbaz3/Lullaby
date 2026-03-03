import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../../store/babyStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { Card, SectionHeader } from '../../components/ui/Card';
import { MOCK_DAILY_REPORT } from '../../constants/mockData';
import { DailyReport } from '../../types';

const StatBlock: React.FC<{
  emoji: string;
  value: string;
  label: string;
  bg: string;
}> = ({ emoji, value, label, bg }) => (
  <View style={[statStyles.block, { backgroundColor: bg }]}>
    <Text style={statStyles.emoji}>{emoji}</Text>
    <Text style={statStyles.value}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  block: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 4,
    ...Shadows.sm,
  },
  emoji: { fontSize: 24, marginBottom: 4 },
  value: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

export const ReportsScreen: React.FC = () => {
  const { activeBaby } = useBabyStore();
  const [report] = useState<DailyReport>(MOCK_DAILY_REPORT);

  const sleepHours = Math.floor(report.sleepDuration / 60);
  const sleepMins = report.sleepDuration % 60;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Report</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Baby info */}
        {activeBaby && (
          <View style={[styles.babyBanner, Shadows.sm]}>
            <Text style={styles.babyBannerEmoji}>
              {activeBaby.gender === 'boy' ? '👦' : '👧'}
            </Text>
            <View>
              <Text style={styles.babyBannerName}>{activeBaby.name}</Text>
              <Text style={styles.babyBannerSub}>Today's summary</Text>
            </View>
            <View style={styles.overallScore}>
              <Text style={styles.scoreValue}>Good</Text>
              <Text style={styles.scoreLabel}>Overall</Text>
            </View>
          </View>
        )}

        {/* Vitals Summary */}
        <SectionHeader title="Vitals Summary" />
        <View style={styles.statsGrid}>
          <StatBlock
            emoji="💓"
            value={`${report.avgHeartRate}`}
            label="Avg Heart Rate bpm"
            bg={Colors.heartCard}
          />
          <StatBlock
            emoji="🌡️"
            value={`${report.avgTemperature}°C`}
            label="Avg Temperature"
            bg={Colors.tempCard}
          />
        </View>
        <View style={styles.statsGrid}>
          <StatBlock
            emoji="💨"
            value={`${report.avgBreathingRate}`}
            label="Breathing /min"
            bg={Colors.breathCard}
          />
          <StatBlock
            emoji="🩺"
            value={`${report.avgOxygenLevel}%`}
            label="Avg SpO₂"
            bg={Colors.airCard}
          />
        </View>

        {/* Cry Events */}
        <SectionHeader title="Cry Analysis" />
        <Card style={styles.cryCard}>
          <View style={styles.cryTop}>
            <View style={styles.cryCount}>
              <Text style={styles.cryCountValue}>{report.totalCryEvents}</Text>
              <Text style={styles.cryCountLabel}>Cry events today</Text>
            </View>
            <View style={styles.cryBreakdown}>
              {report.cryReasonBreakdown.map(({ reason, count }) => {
                const meta = {
                  hungry: { emoji: '🍼', label: 'Hungry' },
                  tired: { emoji: '😴', label: 'Tired' },
                  discomfort: { emoji: '😣', label: 'Discomfort' },
                  pain: { emoji: '💢', label: 'Pain' },
                }[reason] ?? { emoji: '❓', label: reason };
                return (
                  <View key={reason} style={styles.cryBreakdownItem}>
                    <Text style={styles.cryItemEmoji}>{meta.emoji}</Text>
                    <Text style={styles.cryItemLabel}>{meta.label}</Text>
                    <View style={styles.cryItemBar}>
                      <View
                        style={[
                          styles.cryItemBarFill,
                          {
                            width: `${(count / report.totalCryEvents) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.cryItemCount}>{count}x</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Sleep */}
        <SectionHeader title="Sleep" />
        <Card>
          <View style={styles.sleepRow}>
            <Text style={styles.sleepEmoji}>😴</Text>
            <View style={styles.sleepInfo}>
              <Text style={styles.sleepValue}>
                {sleepHours}h {sleepMins}m
              </Text>
              <Text style={styles.sleepLabel}>Total sleep duration</Text>
            </View>
            <View style={styles.sleepBadge}>
              <Text style={styles.sleepBadgeText}>
                {report.sleepDuration >= 720 ? '✅ Good' : '⚠️ Low'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Air Quality */}
        <SectionHeader title="Environment" />
        <Card>
          <View style={styles.airQualityRow}>
            <Ionicons name="leaf-outline" size={28} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.aqiValue}>AQI {report.avgAirQuality}</Text>
              <Text style={styles.aqiLabel}>
                {report.avgAirQuality <= 50
                  ? '🟢 Air quality was good all day'
                  : report.avgAirQuality <= 100
                  ? '🟡 Air quality was moderate'
                  : '🔴 Poor air quality detected'}
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: { padding: Spacing.xl, gap: Spacing.lg },
  babyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  babyBannerEmoji: { fontSize: 36 },
  babyBannerName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  babyBannerSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  overallScore: {
    marginLeft: 'auto' as any,
    alignItems: 'center',
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.lg,
  },
  scoreValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  scoreLabel: { fontSize: FontSize.xs, color: Colors.success },
  statsGrid: { flexDirection: 'row', gap: Spacing.md },
  cryCard: { gap: Spacing.md },
  cryTop: { flexDirection: 'row', gap: Spacing.lg, alignItems: 'flex-start' },
  cryCount: { alignItems: 'center', minWidth: 70 },
  cryCountValue: {
    fontSize: 48,
    fontWeight: FontWeight.extrabold,
    color: Colors.textDark,
    lineHeight: 52,
  },
  cryCountLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  cryBreakdown: { flex: 1, gap: Spacing.sm },
  cryBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cryItemEmoji: { fontSize: 14, width: 20 },
  cryItemLabel: { fontSize: FontSize.xs, color: Colors.textMedium, width: 70 },
  cryItemBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgInput,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cryItemBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  cryItemCount: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    width: 24,
    textAlign: 'right',
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sleepEmoji: { fontSize: 32 },
  sleepInfo: { flex: 1 },
  sleepValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  sleepLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  sleepBadge: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  sleepBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  airQualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  aqiValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  aqiLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMedium,
    marginTop: 2,
  },
});
