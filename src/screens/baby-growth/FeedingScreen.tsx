import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { GrowthScreenShell } from './GrowthScreenShell';
import { babyGrowthService, FeedingData } from '../../services/babyGrowth.service';
import { ApiError } from '../../services/api';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useTranslation } from '../../i18n/useTranslation';

type Route = RouteProp<{ Feeding: { month: number } }, 'Feeding'>;

export const FeedingScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const month = route.params?.month ?? 1;

  const [data, setData] = useState<FeedingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await babyGrowthService.getFeeding(month);
      setData(d);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t('growth.errorFeeding');
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, t]);

  useEffect(() => {
    load();
  }, [load]);

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
          <View style={[styles.rangeBadge, Shadows.sm]}>
            <Text style={styles.rangeText}>
              {t('growth.monthsRange', { min: data.minMonth, max: data.maxMonth })}
            </Text>
          </View>
          {!!data.overview && <Text style={styles.overview}>{data.overview}</Text>}

          {data.foods.map((group, gi) => (
            <View key={gi} style={[styles.block, Shadows.md]}>
              {!!group.category && <Text style={styles.blockTitle}>{group.category}</Text>}
              {group.items.map((line, ii) => (
                <View key={ii} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          ))}

          {data.notes.length > 0 && (
            <View style={[styles.block, Shadows.md]}>
              <Text style={styles.blockTitle}>{t('growth.notes')}</Text>
              {data.notes.map((line, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </GrowthScreenShell>
  );
};

const styles = StyleSheet.create({
  centered: { paddingVertical: Spacing.xxxl, alignItems: 'center', gap: Spacing.md },
  content: { gap: Spacing.lg },
  rangeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rangeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  overview: {
    fontSize: FontSize.md,
    color: Colors.textMedium,
    lineHeight: 24,
  },
  block: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  blockTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  bullet: {
    fontSize: FontSize.md,
    color: Colors.primary,
    lineHeight: 24,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textDark,
    lineHeight: 24,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.danger,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  retryLabel: { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
});
