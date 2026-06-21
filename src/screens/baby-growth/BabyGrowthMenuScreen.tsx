import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { GrowthScreenShell } from './GrowthScreenShell'
import {
  GROWTH_MONTH_BANDS,
  GROWTH_CATEGORIES,
  GrowthCategoryId
} from './babyGrowthConstants'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadows
} from '../../constants/theme'
import { useTranslation } from '../../i18n/useTranslation'

// Map category IDs to specific illustration assets to match the screenshot
const CATEGORY_IMAGES: Record<string, any> = {
  physical: require('../../../assets/illustrations/growth_physical.png'),
  motor: require('../../../assets/illustrations/growth_motor.png'),
  feeding: require('../../../assets/illustrations/growth_feeding.png')
}

type Nav = NativeStackNavigationProp<any>

export const BabyRoutineScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t, isRTL } = useTranslation()
  const [selectedMonth, setSelectedMonth] = useState(
    GROWTH_MONTH_BANDS[0].month
  )

  const openCategory = useCallback(
    (id: GrowthCategoryId) => {
      if (id === 'physical') {
        navigation.navigate('PhysicalGrowth', { month: selectedMonth })
        return
      }
      if (id === 'motor') {
        navigation.navigate('MotorDevelopment', { month: selectedMonth })
        return
      }
      if (id === 'feeding') {
        navigation.navigate('Feeding', { month: selectedMonth })
        return
      }
      Alert.alert(t('common.comingSoon'), t('common.comingSoonBody'))
    },
    [navigation, selectedMonth, t]
  )

  return (
    <GrowthScreenShell scroll>
      <View style={styles.container}>
        {/* Title Section */}
        <Text style={styles.screenTitle}>{t('growth.screenTitle')}</Text>
        <Text style={styles.screenSubtitle}>{t('growth.screenSubtitle')}</Text>

        {/* Month Selector Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={styles.pillsScroll}
        >
          {GROWTH_MONTH_BANDS.map((band) => {
            const active = band.month === selectedMonth
            return (
              <TouchableOpacity
                key={band.labelKey}
                style={[
                  styles.pill,
                  active ? styles.pillActive : styles.pillInactive
                ]}
                onPress={() => setSelectedMonth(band.month)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.pillText,
                    active ? styles.pillTextActive : styles.pillTextInactive
                  ]}
                >
                  {t(band.labelKey)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Category Cards */}
        <View style={styles.cards}>
          {GROWTH_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, Shadows.md]}
              onPress={() => openCategory(cat.id)}
              activeOpacity={0.9}
            >
              {/* Illustration Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={CATEGORY_IMAGES[cat.id]}
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{t(cat.titleKey)}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {t(cat.descKey)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </GrowthScreenShell>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#936174', // Dusty Rose from screenshot
    marginBottom: 10,
    textAlign: 'left'
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#797979', // Gray from screenshot
    lineHeight: 20,
    marginBottom: 25,
    textAlign: 'left'
  },
  pillsScroll: {
    marginHorizontal: -Spacing.xl,
    marginBottom: 30
  },
  pillsRow: {
    paddingHorizontal: Spacing.xl,
    gap: 12
  },
  pill: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12, // More squared-round like the image
    borderWidth: 1.5
  },
  pillActive: {
    backgroundColor: '#C07792', // Darker rose
    borderColor: '#C07792'
  },
  pillInactive: {
    backgroundColor: Colors.white,
    borderColor: '#C07792'
  },
  pillText: {
    fontSize: 15,
    fontWeight: '600'
  },
  pillTextActive: {
    color: Colors.white
  },
  pillTextInactive: {
    color: '#C07792'
  },
  cards: {
    gap: 20
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 25, // Large rounded corners from screenshot
    padding: 20,
    gap: 15
  },
  imageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  illustration: {
    width: '100%',
    height: '100%'
  },
  cardText: {
    flex: 1,
    gap: 4
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#936174' // Dusty Rose
  },
  cardDesc: {
    fontSize: 12,
    color: '#797979',
    lineHeight: 18
  }
})
