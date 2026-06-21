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
  FeedingData
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

type Route = RouteProp<{ Feeding: { month: number } }, 'Feeding'>

export const FeedingScreen: React.FC = () => {
  const { t } = useTranslation()
  const route = useRoute<Route>()
  const month = route.params?.month ?? 1

  const [data, setData] = useState<FeedingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const d = await babyGrowthService.getFeeding(month)
      setData(d)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t('growth.errorFeeding')
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [month, t])

  useEffect(() => {
    load()
  }, [load])

  // Helper component for the Dynamic List Cards with Floating Badges
  const FeedingBlock = ({
    title,
    items
  }: {
    title: string
    items: string[]
  }) => (
    <View style={styles.cardContainer}>
      <View style={[styles.floatingBadge, Shadows.sm]}>
        <Text style={styles.badgeText}>{title}</Text>
      </View>
      <View style={[styles.listCard, Shadows.md]}>
        {items.map((line, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemText}>{line}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  return (
    <GrowthScreenShell centerTitle={t('growth.feedingTitle')}>
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
          {/* Centered Age Header */}
          <View style={styles.ageHeader}>
            <Text style={styles.ageText}>
              {t('growth.monthsRange', {
                min: data.minMonth,
                max: data.maxMonth
              })}
            </Text>
          </View>

          {/* Overview Card */}
          {!!data.overview && (
            <View style={[styles.overviewCard, Shadows.sm]}>
              <Text style={styles.overviewText}>{data.overview}</Text>
            </View>
          )}

          {/* Dynamic Food Category Cards */}
          {data.foods.map((group, gi) => (
            <FeedingBlock
              key={gi}
              title={group.category || t('growth.feedingTitle')}
              items={group.items}
            />
          ))}

          {/* Notes Card */}
          {data.notes.length > 0 && (
            <FeedingBlock title={t('growth.notes')} items={data.notes} />
          )}

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
    gap: Spacing.lg
  },
  ageHeader: {
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  ageText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: '#A97C8E' // Muted rose
  },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm
  },
  overviewText: {
    fontSize: 14,
    color: '#797979',
    lineHeight: 22
  },
  cardContainer: {
    alignItems: 'center',
    marginTop: 25,
    width: '100%'
  },
  floatingBadge: {
    position: 'absolute',
    top: -18,
    zIndex: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: 35,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E8D0DC'
  },
  badgeText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: '#936174' // Dusty Rose
  },
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    paddingTop: 35, // Space for the floating badge
    width: '100%',
    gap: Spacing.md
  },
  itemRow: {
    paddingVertical: 2
  },
  itemText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22
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
