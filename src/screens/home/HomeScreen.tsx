import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../../store/authStore";
import { useBabyStore } from '../../store/babyStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { SensorCard } from '../../components/SensorCard';
import { CryReasonCard } from '../../components/CryReasonCard';
import { BabyAvatar } from '../../components/BabyAvatar';
import { Card, SectionHeader, Badge } from '../../components/ui/Card';
import { cryService } from '../../services/cry.service';
import { useTranslation } from '../../i18n/useTranslation';
import { formatBabyAge } from '../../utils/babyAge';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t, isRTL } = useTranslation();
  const { user } = useAuthStore();
  const {
    babies,
    activeBaby,
    activeBabyId,
    setActiveBaby,
    fetchBabies,
    fetchLiveData,
    latestReading,
    latestCryEvent,
    isFetchingLive,
  } = useBabyStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const load = useCallback(async () => {
    await fetchBabies();
  }, []);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (activeBabyId) {
      fetchLiveData(activeBabyId);
      // Poll every 30 seconds
      const interval = setInterval(() => fetchLiveData(activeBabyId), 30000);
      return () => clearInterval(interval);
    }
  }, [activeBabyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    if (activeBabyId) await fetchLiveData(activeBabyId);
    setRefreshing(false);
  };

  const firstName = (user?.name ?? user?.fullName ?? t('home.parent')).split(' ')[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('home.goodMorning') : hour < 17 ? t('home.goodAfternoon') : t('home.goodEvening');

  const aqiStatus = latestReading?.airQuality.status ?? 'good';
  const aqiPalette: Record<string, string> = {
    good: Colors.success,
    moderate: Colors.warning,
    poor: Colors.danger,
    hazardous: Colors.danger,
  };
  const aqiColor = aqiPalette[aqiStatus] ?? Colors.success;

  const latestCryMeta = latestCryEvent
    ? cryService.getCryReasonMeta(latestCryEvent.reason)
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.name}>
              {t('home.hi')}
              {firstName}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textDark} />
            <View style={[styles.notifBadge, isRTL ? styles.notifBadgeRTL : styles.notifBadgeLTR]} />
          </TouchableOpacity>
        </View>

        {/* Baby Card — matches design mockup */}
        {activeBaby && (
          <View style={[styles.babyCard, Shadows.md]}>
            <View style={styles.babyCardLeft}>
              {/* Photo */}
              <View style={styles.babyCardPhotoWrap}>
                {activeBaby.avatar ? (
                  <Image source={{ uri: activeBaby.avatar }} style={styles.babyCardPhoto} />
                ) : (
                  <View style={[styles.babyCardPhotoPlaceholder, { backgroundColor: activeBaby.gender === 'male' ? '#DBEAFE' : '#FCE7F3' }]}>
                    <Text style={styles.babyCardEmoji}>{activeBaby.gender === 'male' ? '👦' : '👧'}</Text>
                  </View>
                )}
              </View>
              {/* Info */}
              <View style={styles.babyCardInfo}>
                <Text style={styles.babyCardName}>{activeBaby.name}</Text>
                <Text style={styles.babyCardAge}>{formatBabyAge(activeBaby.dateBirth, t)}</Text>
              </View>
            </View>
            {/* View Profile */}
            <TouchableOpacity
              style={styles.viewProfileBtn}
              onPress={() => navigation.navigate('Babies')}
              activeOpacity={0.85}
            >
              <Text style={styles.viewProfileText}>{t('home.viewProfile')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Baby growth & development */}
        <TouchableOpacity
          style={[styles.growthCard, Shadows.md]}
          onPress={() => navigation.navigate('BabyGrowthMenu')}
          activeOpacity={0.9}
        >
          <View style={styles.growthIconWrap}>
            <Text style={styles.growthEmoji}>📈</Text>
          </View>
          <View style={styles.growthText}>
            <Text style={styles.growthTitle}>{t('home.growthTitle')}</Text>
            <Text style={styles.growthSub}>{t('home.growthSub')}</Text>
          </View>
          <View style={isRTL ? styles.chevronFlip : undefined}>
            <Ionicons name="chevron-forward" size={22} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Status Banner */}
        {activeBaby && (
          <View style={[styles.statusBanner, Shadows.md]}>
            <View style={styles.statusLeft}>
              <View style={styles.liveDot} />
              <Text style={styles.statusLabel}>{t('home.liveMonitoring')}</Text>
            </View>
            <Badge
              label={activeBaby.deviceId ? t('home.badgeConnected') : t('home.badgeNoDevice')}
              variant={activeBaby.deviceId ? 'success' : 'neutral'}
            />
          </View>
        )}

        {/* Cry Alert */}
        {latestCryEvent && latestCryMeta && (
          <View
            style={[
              styles.cryAlert,
              { borderStartWidth: 4, borderStartColor: latestCryMeta.color },
            ]}
          >
            <Text style={styles.cryAlertEmoji}>{latestCryMeta.emoji}</Text>
            <View style={styles.cryAlertText}>
              <Text style={styles.cryAlertTitle}>
                {t('home.cryMightBe', { reason: latestCryMeta.label.toLowerCase() })}
              </Text>
              <Text style={styles.cryAlertSub}>{latestCryMeta.suggestion}</Text>
            </View>
            <View style={[styles.cryConfBadge, { backgroundColor: latestCryMeta.color + '20' }]}>
              <Text style={[styles.cryConf, { color: latestCryMeta.color }]}>
                {latestCryEvent.confidence}%
              </Text>
            </View>
          </View>
        )}

        {/* Sensor Cards Grid */}
        {latestReading && (
          <>
            <SectionHeader title={t('home.vitals')} action={t('home.history')} />
            <View style={styles.sensorGrid}>
              <SensorCard
                label={t('home.bodyTemp')}
                value={latestReading.temperature.toFixed(1)}
                unit="°C"
                icon="thermometer-outline"
                bgColor={Colors.tempCard}
                iconColor="#FF7043"
                status={latestReading.temperature > 37.5 ? 'warning' : 'normal'}
                subtitle={latestReading.temperature > 37.5 ? t('home.slightlyElevated') : t('home.normalRange')}
              />
              <SensorCard
                label={t('home.heartRate')}
                value={latestReading.heartRate}
                unit="bpm"
                icon="heart-outline"
                bgColor={Colors.heartCard}
                iconColor="#E91E63"
                status={latestReading.heartRate > 160 ? 'warning' : 'normal'}
                subtitle={latestReading.heartRate > 160 ? t('home.high') : t('home.normal')}
              />
            </View>
            <View style={styles.sensorGrid}>
              <SensorCard
                label={t('home.breathing')}
                value={latestReading.breathingRate}
                unit="/min"
                icon="water-outline"
                bgColor={Colors.breathCard}
                iconColor="#4CAF50"
                status="normal"
                subtitle={t('home.steadyRhythm')}
              />
              <SensorCard
                label={t('home.spo2')}
                value={latestReading.oxygenLevel}
                unit="%"
                icon="pulse-outline"
                bgColor={Colors.airCard}
                iconColor="#03A9F4"
                status={latestReading.oxygenLevel < 95 ? 'warning' : 'normal'}
                subtitle={latestReading.oxygenLevel >= 95 ? t('home.optimal') : t('home.checkNeeded')}
              />
            </View>

            {/* Air Quality */}
            <SectionHeader title={t('home.airQuality')} />
            <Card style={styles.airCard}>
              <View style={styles.airTop}>
                <View>
                  <Text style={styles.aqiValue}>{latestReading.airQuality.aqi}</Text>
                  <Text style={styles.aqiLabel}>{t('home.airQualityIndex')}</Text>
                </View>
                <Badge
                  label={aqiStatus.toUpperCase()}
                  variant={aqiStatus === 'good' ? 'success' : aqiStatus === 'moderate' ? 'warning' : 'danger'}
                />
              </View>
              <View style={styles.airRow}>
                <AirMetric icon="water-outline" label={t('home.humidity')} value={`${latestReading.airQuality.humidity}%`} />
                <AirMetric icon="thermometer-outline" label={t('home.roomTemp')} value={`${latestReading.airQuality.temperature}°C`} />
                <AirMetric icon="cloud-outline" label={t('home.co2')} value={`${latestReading.airQuality.co2}ppm`} />
              </View>
            </Card>
          </>
        )}

        {/* No babies state */}
        {babies.length === 0 && !isFetchingLive && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyTitle}>{t('home.noBabyTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('home.noBabySubtitle')}</Text>
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const AirMetric: React.FC<{ icon: string; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <View style={airMetricStyles.container}>
    <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
    <Text style={airMetricStyles.value}>{value}</Text>
    <Text style={airMetricStyles.label}>{label}</Text>
  </View>
);

const airMetricStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', gap: 2 },
  value: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textDark },
  label: { fontSize: FontSize.xs, color: Colors.textMuted },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  scroll: { flex: 1 },
  container: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  greeting: { fontSize: FontSize.md, color: Colors.textMuted },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  notifBadgeLTR: { right: 10 },
  notifBadgeRTL: { left: 10 },
  babySelector: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  babySelectorItem: {
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.xl,
    minWidth: 72,
  },
  babySelectorItemActive: {
    backgroundColor: Colors.primarySoft,
  },
  babySelectorName: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  babySelectorNameActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textDark,
  },
  cryAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  chevronFlip: { transform: [{ scaleX: -1 }] },
  cryAlertEmoji: { fontSize: 32 },
  cryAlertText: { flex: 1, gap: 2 },
  cryAlertTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textDark,
  },
  cryAlertSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  cryConfBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  cryConf: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  airCard: {
    gap: Spacing.lg,
  },
  airTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aqiValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textDark,
  },
  aqiLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  airRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.sm,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // ── New Baby Card ─────────────────────────
  babyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.primarySoft,
  },
  babyCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  babyCardPhotoWrap: {
    width: 72, height: 72, borderRadius: 36,
    overflow: 'hidden', borderWidth: 2, borderColor: Colors.primarySoft,
  },
  babyCardPhoto:            { width: '100%', height: '100%' },
  babyCardPhotoPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  babyCardEmoji:            { fontSize: 32 },
  babyCardInfo:             { gap: 4 },
  babyCardName:             { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textDark },
  babyCardAge:              { fontSize: FontSize.sm, color: Colors.textMuted },
  viewProfileBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  viewProfileText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.white },

  growthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primarySoft,
  },
  growthIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthEmoji: { fontSize: 24 },
  growthText: { flex: 1, gap: 2 },
  growthTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textDark },
  growthSub: { fontSize: FontSize.sm, color: Colors.textMuted },
});