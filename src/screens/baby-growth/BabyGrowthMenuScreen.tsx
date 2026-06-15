import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { GrowthScreenShell } from './GrowthScreenShell';
import { GROWTH_MONTH_BANDS, GROWTH_CATEGORIES, GrowthCategoryId } from './babyGrowthConstants';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useTranslation } from '../../i18n/useTranslation';

type Nav = NativeStackNavigationProp<any>;

export const BabyGrowthMenuScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t, isRTL } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(GROWTH_MONTH_BANDS[0].month);

  const openCategory = useCallback(
    (id: GrowthCategoryId) => {
      if (id === 'physical') {
        navigation.navigate('PhysicalGrowth', { month: selectedMonth });
        return;
      }
      if (id === 'motor') {
        navigation.navigate('MotorDevelopment', { month: selectedMonth });
        return;
      }
      if (id === 'feeding') {
        navigation.navigate('Feeding', { month: selectedMonth });
        return;
      }
      Alert.alert(t('common.comingSoon'), t('common.comingSoonBody'));
    },
    [navigation, selectedMonth, t]
  );

  return (
    <GrowthScreenShell scroll>
      <>
        <Text style={styles.screenTitle}>{t('growth.screenTitle')}</Text>
        <Text style={styles.screenSubtitle}>{t('growth.screenSubtitle')}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={styles.pillsScroll}
        >
          {GROWTH_MONTH_BANDS.map((band) => {
            const active = band.month === selectedMonth;
            return (
              <TouchableOpacity
                key={band.labelKey}
                style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
                onPress={() => setSelectedMonth(band.month)}
                activeOpacity={0.85}
              >
                <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
                  {t(band.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.cards}>
          {GROWTH_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, Shadows.md]}
              onPress={() => openCategory(cat.id)}
              activeOpacity={0.9}
            >
              <Text style={styles.cardEmoji}>{cat.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{t(cat.titleKey)}</Text>
                <Text style={styles.cardDesc}>{t(cat.descKey)}</Text>
              </View>
              <View style={isRTL ? styles.cardChevronFlip : undefined}>
                <Text style={styles.cardChevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </>
    </GrowthScreenShell>
  );
};

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  screenSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textMedium,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  pillsScroll: { marginHorizontal: -Spacing.xl, marginBottom: Spacing.lg },
  pillsRow: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillInactive: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  pillText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  pillTextActive: { color: Colors.white },
  pillTextInactive: { color: Colors.primary },
  cards: { gap: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardEmoji: { fontSize: 36 },
  cardText: { flex: 1, gap: 4 },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  cardDesc: {
    fontSize: FontSize.sm,
    color: Colors.textMedium,
    lineHeight: 20,
  },
  cardChevron: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  cardChevronFlip: { transform: [{ scaleX: -1 }] },
});
