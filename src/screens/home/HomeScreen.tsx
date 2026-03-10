import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
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

const { width } = Dimensions.get('window');

const calcBabyAge = (dob: string): string => {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const days   = Math.floor((Date.now() - birth.getTime()) / 86400000);
  if (days < 0)  return 'Future date';
  if (days === 0) return 'Newborn';
  const months = Math.floor(days / 30.44);
  const years  = Math.floor(days / 365.25);
  if (days < 7)   return `${days}d`;
  if (days < 30)  return `${Math.floor(days / 7)}Weeks`;
  if (years < 1) {
    const remWeeks = Math.floor((days - months * 30.44) / 7);
    return remWeeks > 0
      ? `${months}Months,${remWeeks}Weeks`
      : `${months}Months`;
  }
  const remMonths = months - years * 12;
  return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years}yr`;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
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

  const firstName = (user?.name ?? user?.fullName ?? 'Parent').split(' ')[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const aqiStatus = latestReading?.airQuality.status ?? 'good';
  const aqiColor = {
    good: Colors.success,
    moderate: Colors.warning,
    poor: Colors.danger,
    hazardous: Colors.danger,
  }[aqiStatus];

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
            <Text style={styles.name}>HI,{firstName}</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textDark} />
            <View style={styles.notifBadge} />
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
                <Text style={styles.babyCardAge}>{calcBabyAge(activeBaby.dateBirth)}</Text>
              </View>
            </View>
            {/* View Profile */}
            <TouchableOpacity
              style={styles.viewProfileBtn}
              onPress={() => navigation.navigate('Babies')}
              activeOpacity={0.85}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Banner */}
        {activeBaby && (
          <View style={[styles.statusBanner, Shadows.md]}>
            <View style={styles.statusLeft}>
              <View style={styles.liveDot} />
              <Text style={styles.statusLabel}>Live Monitoring</Text>
            </View>
            <Badge
              label={activeBaby.deviceId ? '● Connected' : '○ No Device'}
              variant={activeBaby.deviceId ? 'success' : 'neutral'}
            />
          </View>
        )}

        {/* Cry Alert */}
        {latestCryEvent && latestCryMeta && (
          <View style={[styles.cryAlert, { borderLeftColor: latestCryMeta.color }]}>
            <Text style={styles.cryAlertEmoji}>{latestCryMeta.emoji}</Text>
            <View style={styles.cryAlertText}>
              <Text style={styles.cryAlertTitle}>
                Baby might be {latestCryMeta.label.toLowerCase()}
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
            <SectionHeader title="Vitals" action="History" />
            <View style={styles.sensorGrid}>
              <SensorCard
                label="Body Temp"
                value={latestReading.temperature.toFixed(1)}
                unit="°C"
                icon="thermometer-outline"
                bgColor={Colors.tempCard}
                iconColor="#FF7043"
                status={latestReading.temperature > 37.5 ? 'warning' : 'normal'}
                subtitle={latestReading.temperature > 37.5 ? 'Slightly elevated' : 'Normal range'}
              />
              <SensorCard
                label="Heart Rate"
                value={latestReading.heartRate}
                unit="bpm"
                icon="heart-outline"
                bgColor={Colors.heartCard}
                iconColor="#E91E63"
                status={latestReading.heartRate > 160 ? 'warning' : 'normal'}
                subtitle={`${latestReading.heartRate > 160 ? 'High' : 'Normal'}`}
              />
            </View>
            <View style={styles.sensorGrid}>
              <SensorCard
                label="Breathing"
                value={latestReading.breathingRate}
                unit="/min"
                icon="water-outline"
                bgColor={Colors.breathCard}
                iconColor="#4CAF50"
                status="normal"
                subtitle="Steady rhythm"
              />
              <SensorCard
                label="SpO₂"
                value={latestReading.oxygenLevel}
                unit="%"
                icon="pulse-outline"
                bgColor={Colors.airCard}
                iconColor="#03A9F4"
                status={latestReading.oxygenLevel < 95 ? 'warning' : 'normal'}
                subtitle={latestReading.oxygenLevel >= 95 ? 'Optimal' : 'Check needed'}
              />
            </View>

            {/* Air Quality */}
            <SectionHeader title="Air Quality" />
            <Card style={styles.airCard}>
              <View style={styles.airTop}>
                <View>
                  <Text style={styles.aqiValue}>{latestReading.airQuality.aqi}</Text>
                  <Text style={styles.aqiLabel}>Air Quality Index</Text>
                </View>
                <Badge
                  label={aqiStatus.toUpperCase()}
                  variant={aqiStatus === 'good' ? 'success' : aqiStatus === 'moderate' ? 'warning' : 'danger'}
                />
              </View>
              <View style={styles.airRow}>
                <AirMetric icon="water-outline" label="Humidity" value={`${latestReading.airQuality.humidity}%`} />
                <AirMetric icon="thermometer-outline" label="Room Temp" value={`${latestReading.airQuality.temperature}°C`} />
                <AirMetric icon="cloud-outline" label="CO₂" value={`${latestReading.airQuality.co2}ppm`} />
              </View>
            </Card>
          </>
        )}

        {/* No babies state */}
        {babies.length === 0 && !isFetchingLive && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyTitle}>No baby profile yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your baby's profile to start monitoring
            </Text>
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
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
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
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
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
});