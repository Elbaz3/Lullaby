import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import { RouteProp, useRoute } from '@react-navigation/native'
import { GrowthScreenShell } from './GrowthScreenShell'
import {
  babyGrowthService,
  PhysicalGrowthData
} from '../../services/babyGrowth.service'
import { ApiError } from '../../services/api'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadows
} from '../../constants/theme'
import { useTranslation } from '../../i18n/useTranslation'

type Route = RouteProp<{ PhysicalGrowth: { month: number } }, 'PhysicalGrowth'>

export const PhysicalGrowthScreen: React.FC = () => {
  const { t } = useTranslation()
  const route = useRoute<Route>()
  const month = route.params?.month > 0 ? route.params.month : 1

  const [data, setData] = useState<PhysicalGrowthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const d = await babyGrowthService.getPhysicalGrowth(month)
      setData(d)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t('growth.errorPhysical')
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [month, t])

  useEffect(() => {
    load()
  }, [load])

  // Helper component for the Floating Badge Cards
  const StatBlock = ({ label, body }: { label: string; body: string }) => (
    <View style={styles.cardContainer}>
      <View style={[styles.floatingBadge, Shadows.sm]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
      <View style={[styles.statCard, Shadows.md]}>
        <Text style={styles.cardBodyText}>{body}</Text>
      </View>
    </View>
  )

  return (
    <GrowthScreenShell centerTitle={t('growth.physicalTitle')}>
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryLabel}>{t('common.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && data && (
        <View style={styles.content}>
          {/* Centered Age Range Text */}
          <View style={styles.ageHeader}>
            <Text style={styles.ageText}>
              {t('growth.monthsRange', {
                min: data.minMonth,
                max: data.maxMonth
              })}
            </Text>
          </View>

          {/* Overview Card */}
          <View style={[styles.overviewCard, Shadows.sm]}>
            <Text style={styles.overviewText}>{data.overview}</Text>
          </View>

          {/* Weight Card with Floating Badge */}
          <StatBlock label={t('growth.weight')} body={data.weight} />

          {/* Height Card with Floating Badge */}
          <StatBlock label={t('growth.height')} body={data.height} />

          <View style={{ height: Spacing.huge }} />
        </View>
      )}
    </GrowthScreenShell>
  )
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md
  },
  content: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xl
  },
  ageHeader: {
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  ageText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: '#A97C8E' // Muted rose color from design
  },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md
  },
  overviewText: {
    fontSize: 14,
    color: '#797979',
    lineHeight: 22
  },
  cardContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    width: '100%'
  },
  floatingBadge: {
    position: 'absolute',
    top: -18,
    zIndex: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E8D0DC'
  },
  badgeText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: '#936174' // Purple-pink from design
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl, // Extra padding for the badge
    width: '100%'
  },
  cardBodyText: {
    fontSize: 15,
    color: '#797979',
    lineHeight: 22,
    textAlign: 'left'
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.danger,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full
  },
  retryLabel: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md
  }
})
