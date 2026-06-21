import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  I18nManager
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import {
  recommendationService,
  Recommendation
} from '../../services/Recommendation.service'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadows
} from '../../constants/theme'
import { useTranslation } from '../../i18n/useTranslation'

type Nav = NativeStackNavigationProp<any>

// ── Helpers ───────────────────────────────────

/** Individual Vital Tile */
const VitalCard: React.FC<{
  label: string
  value: string | number
  unit: string
  type: string
  isRTL: boolean
}> = ({ label, value, unit, type, isRTL }) => {
  const { t } = useTranslation()

  const getVitalStatus = (type: string, val: number) => {
    if (type === 'temp') {
      if (val >= 38.5)
        return {
          color: '#EF4444',
          label: t('routine.vitalStatusHigh'),
          icon: 'thermometer'
        }
      if (val < 36.0)
        return {
          color: '#3B82F6',
          label: t('routine.vitalStatusLow'),
          icon: 'thermometer'
        }
      return {
        color: '#22C55E',
        label: t('routine.vitalStatusNormal'),
        icon: 'thermometer'
      }
    }
    if (type === 'oxygen') {
      if (val < 95)
        return {
          color: '#F59E0B',
          label: t('routine.vitalStatusLow'),
          icon: 'water'
        }
      return {
        color: '#22C55E',
        label: t('routine.vitalStatusNormal'),
        icon: 'water'
      }
    }
    return {
      color: Colors.primary,
      label: t('routine.vitalStatusNormal'),
      icon: 'pulse'
    }
  }

  const numVal = typeof value === 'number' ? value : parseFloat(value)
  const status = getVitalStatus(type, numVal)

  return (
    <View style={[vs.vitalItem, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={[vs.iconCircle, { backgroundColor: status.color + '15' }]}>
        <Ionicons name={status.icon as any} size={18} color={status.color} />
      </View>
      <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
        <Text style={vs.vitalLabel}>{label}</Text>
        <View style={[vs.valueRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={[vs.vitalValue, { color: status.color }]}>{value}</Text>
          <Text style={vs.vitalUnit}>{unit}</Text>
        </View>
      </View>
    </View>
  )
}

const vs = StyleSheet.create({
  vitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '48%',
    backgroundColor: '#FFFFFFCC',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E8D0DC'
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  vitalLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase'
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2
  },
  vitalValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold
  },
  vitalUnit: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold
  }
})

/** Percentage bar */
const ConfidenceBar: React.FC<{ value: number; color: string }> = ({
  value,
  color
}) => (
  <View style={bar.track}>
    <View
      style={[
        bar.fill,
        { width: `${Math.round(value * 100)}%`, backgroundColor: color }
      ]}
    />
  </View>
)
const bar = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: '#F0D5E0',
    borderRadius: 3,
    overflow: 'hidden',
    flex: 1
  },
  fill: { height: '100%', borderRadius: 3 }
})

const SectionTitle: React.FC<{
  icon: string
  title: string
  color?: string
  isRTL: boolean
}> = ({ icon, title, color = Colors.primary, isRTL }) => (
  <View style={[sc.row, isRTL && { flexDirection: 'row-reverse' }]}>
    <View style={[sc.iconBox, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={16} color={color} />
    </View>
    <Text style={[sc.title, isRTL && { textAlign: 'right' }]}>{title}</Text>
  </View>
)
const sc = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textDark
  }
})

// ── Main Screen ───────────────────────────────

export const BabyRoutineScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t, isRTL, locale } = useTranslation()
  const [data, setData] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try {
        const res = await recommendationService.getRecommendation()
        setData(res.data)
      } catch (e: any) {
        setError(e?.message ?? t('routine.errorDefault'))
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [t]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Helper for priority labels
  const getPriorityInfo = (level: number) => {
    const labels = [
      t('routine.priorityRoutine'),
      t('routine.priorityModerate'),
      t('routine.priorityUrgent')
    ]
    const colors = ['#22C55E', '#F59E0B', '#EF4444']
    const bgs = ['#DCFCE7', '#FEF3C7', '#FEE2E2']
    return {
      label: labels[level] || labels[0],
      color: colors[level] || colors[0],
      bg: bgs[level] || bgs[0]
    }
  }

  if (loading) {
    return (
      <LinearGradient
        colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('routine.analyzing')}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (error || !data) {
    return (
      <LinearGradient
        colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.centered}>
            <Ionicons
              name="cloud-offline-outline"
              size={52}
              color={Colors.primary}
            />
            <Text style={styles.errorTitle}>{t('routine.errorTitle')}</Text>
            <Text style={styles.errorSub}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchData()}
            >
              <Text style={styles.retryText}>{t('common.tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const pInfo = getPriorityInfo(data.priority.level)
  const cryReasonKey = `cry.reasons.${data.cryAnalysis.type.toLowerCase()}.label`
  const cryLabel =
    t(cryReasonKey as any) !== cryReasonKey
      ? t(cryReasonKey as any)
      : t('cry.reasons.unknown.label')

  const timestamp = new Date(data.timestamp).toLocaleString(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  )

  const tempVal = 41.0 // Simulated
  const oxygenVal = 94.0 // Simulated

  return (
    <LinearGradient
      colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View
          style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <View style={isRTL && { transform: [{ scaleX: -1 }] }}>
              <Ionicons name="arrow-back" size={22} color="#8E5E71" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isRTL && { textAlign: 'right' }]}>
            {t('routine.screenTitle')}
          </Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => fetchData(true)}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Hero Card */}
          <View
            style={[
              styles.heroCard,
              Shadows.lg,
              isRTL && { alignItems: 'flex-end' }
            ]}
          >
            <View
              style={[
                styles.heroTop,
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: pInfo.bg },
                  isRTL && { flexDirection: 'row-reverse' }
                ]}
              >
                <View
                  style={[styles.priorityDot, { backgroundColor: pInfo.color }]}
                />
                <Text style={[styles.priorityText, { color: pInfo.color }]}>
                  {pInfo.label}
                </Text>
              </View>
              <Text style={styles.heroTimestamp}>{timestamp}</Text>
            </View>

            <Text style={[styles.heroName, isRTL && { textAlign: 'right' }]}>
              👶 {data.infantName}
            </Text>
            <Text style={[styles.heroSummary, isRTL && { textAlign: 'right' }]}>
              {data.vitalsSummary}
            </Text>
            <View style={styles.heroDivider} />

            <View
              style={[
                styles.actionRow,
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={Colors.primary}
              />
              <Text
                style={[styles.actionText, isRTL && { textAlign: 'right' }]}
              >
                {data.action}
              </Text>
            </View>

            <View
              style={[
                styles.reasonRow,
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={Colors.textMuted}
              />
              <Text
                style={[styles.reasonText, isRTL && { textAlign: 'right' }]}
              >
                {data.reason}
              </Text>
            </View>
          </View>

          {/* Vitals */}
          <View style={[styles.card, Shadows.sm]}>
            <SectionTitle
              isRTL={isRTL}
              icon="pulse-outline"
              title={t('routine.vitalsTitle')}
            />
            <View
              style={[
                styles.vitalsGrid,
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <VitalCard
                isRTL={isRTL}
                label={t('routine.vitalTemp')}
                value={tempVal.toFixed(1)}
                unit="°C"
                type="temp"
              />
              <VitalCard
                isRTL={isRTL}
                label={t('routine.vitalOxygen')}
                value={oxygenVal}
                unit="%"
                type="oxygen"
              />
              <VitalCard
                isRTL={isRTL}
                label={t('routine.vitalPulse')}
                value="82"
                unit="bpm"
                type="pulse"
              />
              <VitalCard
                isRTL={isRTL}
                label={t('routine.vitalBreath')}
                value="40"
                unit="/min"
                type="resp"
              />
            </View>
            {tempVal >= 38 && (
              <View
                style={[
                  styles.alertBanner,
                  isRTL && { flexDirection: 'row-reverse' }
                ]}
              >
                <Ionicons name="warning" size={20} color="#EF4444" />
                <Text
                  style={[styles.alertText, isRTL && { textAlign: 'right' }]}
                >
                  {t('routine.feverAlert')}
                </Text>
              </View>
            )}
          </View>

          {/* AI Confidence */}
          <View style={[styles.card, Shadows.sm]}>
            <SectionTitle
              isRTL={isRTL}
              icon="analytics-outline"
              title={t('routine.aiConfidenceTitle')}
              color="#6366F1"
            />
            <View
              style={[
                styles.confRow,
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <Text style={styles.confPct}>
                {Math.round(data.confidence * 100)}%
              </Text>
              <ConfidenceBar value={data.confidence} color="#6366F1" />
            </View>
            <Text style={[styles.confLabel, isRTL && { textAlign: 'right' }]}>
              {t('routine.aiConfidenceDesc')}
            </Text>
          </View>

          {/* Cry Analysis */}
          <View style={[styles.card, Shadows.sm]}>
            <SectionTitle
              isRTL={isRTL}
              icon="ear-outline"
              title={t('routine.cryAnalysisTitle')}
            />
            <View
              style={[styles.cryRow, isRTL && { flexDirection: 'row-reverse' }]}
            >
              <View
                style={[
                  styles.cryIconBox,
                  { backgroundColor: Colors.primary + '20' }
                ]}
              >
                <Ionicons name="mic-outline" size={28} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.cryType, isRTL && { textAlign: 'right' }]}>
                  {cryLabel}
                </Text>
                <View
                  style={[
                    styles.cryMetaRow,
                    isRTL && { flexDirection: 'row-reverse' }
                  ]}
                >
                  <Text
                    style={[
                      styles.cryMetaLabel,
                      isRTL && { textAlign: 'right' }
                    ]}
                  >
                    {t('routine.cryIntensity')}
                  </Text>
                  <ConfidenceBar
                    value={data.cryAnalysis.intensity}
                    color={Colors.primary}
                  />
                  <Text style={styles.cryMetaValue}>
                    {Math.round(data.cryAnalysis.intensity * 100)}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.cryMetaRow,
                    isRTL && { flexDirection: 'row-reverse' }
                  ]}
                >
                  <Text
                    style={[
                      styles.cryMetaLabel,
                      isRTL && { textAlign: 'right' }
                    ]}
                  >
                    {t('routine.cryConfidence')}
                  </Text>
                  <ConfidenceBar
                    value={data.cryAnalysis.confidence}
                    color={Colors.primary}
                  />
                  <Text style={styles.cryMetaValue}>
                    {Math.round(data.cryAnalysis.confidence * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pattern History */}
          <View style={[styles.card, Shadows.sm]}>
            <SectionTitle
              isRTL={isRTL}
              icon="time-outline"
              title={t('routine.historyTitle')}
              color="#0EA5E9"
            />
            <View
              style={[
                styles.historyGrid,
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <View style={styles.historyItem}>
                <Text style={styles.historyValue}>
                  {data.historyAnalysis.frequencyLast24h}
                </Text>
                <Text style={styles.historyLabel}>
                  {t('routine.historyEventsToday')}
                </Text>
              </View>
              <View style={styles.historyDivider} />
              <View style={styles.historyItem}>
                <Ionicons
                  name={
                    data.historyAnalysis.patternDetected
                      ? 'trending-up'
                      : 'remove-outline'
                  }
                  size={24}
                  color={
                    data.historyAnalysis.patternDetected
                      ? '#EF4444'
                      : Colors.success
                  }
                />
                <Text style={styles.historyLabel}>
                  {data.historyAnalysis.patternDetected
                    ? t('routine.historyPatternDetected')
                    : t('routine.historyNoPattern')}
                </Text>
              </View>
              <View style={styles.historyDivider} />
              <View style={styles.historyItem}>
                <Text style={[styles.historyValue, { fontSize: FontSize.sm }]}>
                  {data.historyAnalysis.repeatedIssue ?? '—'}
                </Text>
                <Text style={styles.historyLabel}>
                  {t('routine.historyRepeatedIssue')}
                </Text>
              </View>
            </View>
            {data.historyAnalysis.timeSinceLastSimilar && (
              <View
                style={[
                  styles.timeSince,
                  isRTL && { flexDirection: 'row-reverse' }
                ]}
              >
                <Ionicons
                  name="timer-outline"
                  size={14}
                  color={Colors.textMuted}
                />
                <Text style={styles.timeSinceText}>
                  {t('routine.historyLastEvent', {
                    time: data.historyAnalysis.timeSinceLastSimilar
                  })}
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyCenter: 'center',
    ...Shadows.sm,
    justifyContent: 'center'
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#8E5E71'
  },
  container: { padding: Spacing.xl, gap: Spacing.lg },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl
  },
  heroCard: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    gap: Spacing.md
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full
  },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  priorityText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  heroTimestamp: { fontSize: FontSize.xs, color: Colors.textMuted },
  heroName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark
  },
  heroSummary: {
    fontSize: FontSize.sm,
    color: Colors.textMedium,
    lineHeight: 20
  },
  heroDivider: { height: 1, backgroundColor: '#E8D0DC' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm
  },
  actionText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textDark
  },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reasonText: { fontSize: FontSize.sm, color: Colors.textMuted, flex: 1 },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  alertText: {
    color: '#B91C1C',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    flex: 1
  },
  card: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.xxl,
    padding: Spacing.xl
  },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  confPct: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#6366F1',
    width: 55
  },
  confLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm
  },
  cryRow: { flexDirection: 'row', gap: Spacing.lg, alignItems: 'center' },
  cryIconBox: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cryType: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textDark
  },
  cryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cryMetaLabel: { fontSize: FontSize.xs, color: Colors.textMuted, width: 62 },
  cryMetaValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    width: 35,
    textAlign: 'right'
  },
  historyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  historyItem: { alignItems: 'center', gap: 6, flex: 1 },
  historyDivider: { width: 1, height: 50, backgroundColor: '#E8D0DC' },
  historyValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark
  },
  historyLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  timeSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E8D0DC'
  },
  timeSinceText: { fontSize: FontSize.xs, color: Colors.textMuted },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textMedium,
    marginTop: Spacing.sm
  },
  errorTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    textAlign: 'center'
  },
  errorSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: 10
  },
  retryText: {
    color: '#fff',
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md
  }
})
