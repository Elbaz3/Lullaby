import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { GrowthScreenShell } from './GrowthScreenShell';
import { babyGrowthService, PhysicalGrowthData } from '../../services/babyGrowth.service';
import { ApiError } from '../../services/api';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useTranslation } from '../../i18n/useTranslation';

type Route = RouteProp<{ PhysicalGrowth: { month: number } }, 'PhysicalGrowth'>;

export const PhysicalGrowthScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const month = route.params?.month > 0 ? route.params.month : 1;

  const [data, setData] = useState<PhysicalGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await babyGrowthService.getPhysicalGrowth(month);
      setData(d);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t('growth.errorPhysical');
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
          <View style={[styles.rangeBadge, Shadows.sm]}>
            <Text style={styles.rangeText}>
              {t('growth.monthsRange', { min: data.minMonth, max: data.maxMonth })}
            </Text>
          </View>
          <Text style={styles.overview}>{data.overview}</Text>
          <View style={[styles.block, Shadows.md]}>
            <Text style={styles.blockLabel}>{t('growth.weight')}</Text>
            <Text style={styles.blockBody}>{data.weight}</Text>
          </View>
          <View style={[styles.block, Shadows.md]}>
            <Text style={styles.blockLabel}>{t('growth.height')}</Text>
            <Text style={styles.blockBody}>{data.height}</Text>
          </View>
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
  blockLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blockBody: {
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
