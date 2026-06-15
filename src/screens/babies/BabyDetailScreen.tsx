import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBabyStore } from '../../store/babyStore';
import { sensorService } from '../../services/sensor.service';
import { vaccinationService } from '../../services/vaccination.service';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { Card, SectionHeader, Badge } from '../../components/ui/Card';
import { BabyAvatar } from '../../components/BabyAvatar';
import { SensorReading } from '../../types';
import { VaccinationRecord } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';
import { formatDetailBabyAge } from '../../utils/babyAge';

const { width } = Dimensions.get('window');

type RouteParams = { BabyDetail: { babyId: string } };
type Nav = NativeStackNavigationProp<any>;

const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon as any} size={16} color={Colors.primary} />
    </View>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export const BabyDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RouteParams, 'BabyDetail'>>();
  const { babyId } = route.params;
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  const { babies, setActiveBaby } = useBabyStore();
  const baby = babies.find(b => b.id === babyId);

  const [reading, setReading] = useState<SensorReading | null>(null);
  const [vacRecords, setVacRecords] = useState<VaccinationRecord[]>([]);

  useEffect(() => {
    if (!baby) return;
    sensorService.getLatestReading(babyId).then(setReading);
    vaccinationService.getByType("all").then(setVacRecords);
  }, [babyId]);

  if (!baby) return null;

  const stats = vaccinationService.getStats(vacRecords);
  const nextVac = vacRecords.find(r => r.status === 'upcoming' || r.status === 'overdue');
  const overdueCount = vacRecords.filter(r => r.status === 'overdue').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('babyDetail.title')}</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddBaby', { babyId: baby.id })}
        >
          <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={[styles.heroCard, Shadows.lg]}>
          <View style={styles.heroTop}>
            <BabyAvatar baby={baby} size={80} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{baby.name}</Text>
              <Text style={styles.heroAge}>
                {formatDetailBabyAge(baby.dateBirth, t)}
                {t('babyDetail.oldSuffix')}
              </Text>
              <View style={styles.heroTags}>
                <Badge
                  label={baby.gender === 'male' ? t('babyDetail.boy') : t('babyDetail.girl')}
                  variant="primary"
                />
                {baby.deviceId && <Badge label={t('babyDetail.connected')} variant="success" />}
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{baby.weight ?? baby.wight ?? '—'}</Text>
              <Text style={styles.heroStatLabel}>{t('babyDetail.kg')}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{baby.height ?? '—'}</Text>
              <Text style={styles.heroStatLabel}>{t('babyDetail.cm')}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{baby.bloodType ?? '—'}</Text>
              <Text style={styles.heroStatLabel}>{t('babyDetail.bloodType')}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.percentage}%</Text>
              <Text style={styles.heroStatLabel}>{t('babyDetail.vaccinated')}</Text>
            </View>
          </View>
        </View>

        {/* Set as Active */}
        <TouchableOpacity
          style={styles.setActiveBtn}
          onPress={() => { setActiveBaby(baby.id); navigation.goBack(); }}
        >
          <Ionicons name="radio-button-on-outline" size={18} color={Colors.primary} />
          <Text style={styles.setActiveBtnText}>{t('babyDetail.setActive')}</Text>
        </TouchableOpacity>

        {/* Live Vitals */}
        {reading && (
          <>
            <SectionHeader title={t('babyDetail.liveVitals')} />
            <Card style={styles.vitalsCard}>
              <View style={styles.vitalsGrid}>
                {[
                  { icon: 'thermometer-outline', label: t('babyDetail.temp'), value: `${reading.temperature.toFixed(1)}°C`, color: '#FF7043' },
                  { icon: 'heart-outline', label: t('babyDetail.heart'), value: `${reading.heartRate} bpm`, color: '#E91E63' },
                  { icon: 'water-outline', label: t('babyDetail.breath'), value: `${reading.breathingRate}/min`, color: Colors.success },
                  { icon: 'pulse-outline', label: t('babyDetail.spo2'), value: `${reading.oxygenLevel}%`, color: Colors.info },
                ].map(item => (
                  <View key={item.label} style={styles.vitalItem}>
                    <View style={[styles.vitalIcon, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={styles.vitalValue}>{item.value}</Text>
                    <Text style={styles.vitalLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </>
        )}

        {/* Vaccination Summary */}
        <SectionHeader
          title={t('babyDetail.vaccinations')}
          action={t('babyDetail.viewAll')}
          onAction={() => navigation.navigate('Vaccination', { babyId: baby.id })}
        />
        <Card style={styles.vacCard}>
          {/* Progress bar */}
          <View style={styles.vacProgress}>
            <View style={styles.vacProgressHeader}>
              <Text style={styles.vacProgressLabel}>{t('babyDetail.overallProgress')}</Text>
              <Text style={styles.vacProgressPct}>{stats.percentage}%</Text>
            </View>
            <View style={styles.vacProgressBar}>
              <View style={[styles.vacProgressFill, { width: `${stats.percentage}%` as any }]} />
            </View>
          </View>

          {/* Counts */}
          <View style={styles.vacCounts}>
            <View style={styles.vacCount}>
              <Text style={[styles.vacCountNum, { color: Colors.success }]}>{stats.done}</Text>
              <Text style={styles.vacCountLabel}>{t('babyDetail.done')}</Text>
            </View>
            <View style={styles.vacCount}>
              <Text style={[styles.vacCountNum, { color: Colors.warning }]}>{stats.upcoming}</Text>
              <Text style={styles.vacCountLabel}>{t('babyDetail.upcoming')}</Text>
            </View>
            <View style={styles.vacCount}>
              <Text style={[styles.vacCountNum, { color: Colors.danger }]}>{stats.overdue}</Text>
              <Text style={styles.vacCountLabel}>{t('babyDetail.overdue')}</Text>
            </View>
          </View>

          {/* Next vaccine */}
          {nextVac && (
            <View style={[
              styles.nextVac,
              { backgroundColor: nextVac.status === 'overdue' ? Colors.dangerSoft : Colors.warningSoft }
            ]}>
              <Ionicons
                name="medical-outline"
                size={16}
                color={nextVac.status === 'overdue' ? Colors.danger : Colors.warning}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.nextVacTitle}>
                  {nextVac.status === 'overdue' ? t('babyDetail.nextOverdue') : t('babyDetail.nextUpcoming')}
                  {nextVac.vaccine?.name ?? t('babyDetail.vaccine')} ({t('babyDetail.dose')} {nextVac.vaccine?.dose ?? '—'})
                </Text>
                <Text style={styles.nextVacDate}>
                  {t('babyDetail.scheduled')}{' '}
                  {new Date(nextVac.scheduledDate).toLocaleDateString(dateLocale, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Quick Info */}
        <SectionHeader title={t('babyDetail.details')} />
        <Card>
          <InfoRow icon="calendar-outline" label={t('babyDetail.dob')}
            value={baby.dateBirth ? new Date(baby.dateBirth).toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' }) : '—'} />
          <View style={styles.rowDivider} />
          <InfoRow icon="person-outline" label={t('babyDetail.gender')}
            value={baby.gender === 'male' ? t('babyDetail.boyShort') : t('babyDetail.girlShort')} />
          {baby.bloodType && <>
            <View style={styles.rowDivider} />
            <InfoRow icon="water-outline" label={t('babyDetail.bloodType')} value={baby.bloodType} />
          </>}
          { (baby.weight ?? baby.wight) && (
              <>
                <View style={styles.rowDivider} />
                <InfoRow 
                  icon="scale-outline" 
                  label={t('babyDetail.weight')} 
                  value={`${baby.weight ?? baby.wight} ${t('babyDetail.kg')}`} 
                />
              </>
          )}
          {baby.height && <>
            <View style={styles.rowDivider} />
            <InfoRow icon="resize-outline" label={t('babyDetail.height')} value={`${baby.height} ${t('babyDetail.cm')}`} />
          </>}
          <View style={styles.rowDivider} />
          <InfoRow icon="radio-outline" label={t('babyDetail.device')}
            value={baby.deviceId ? t('babyDetail.deviceConnected') : t('babyDetail.deviceNotPaired')} />
        </Card>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  editBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  container: { padding: Spacing.xl, gap: Spacing.lg },
  heroCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    padding: Spacing.xl, gap: Spacing.lg,
  },
  heroTop: { flexDirection: 'row', gap: Spacing.lg, alignItems: 'center' },
  heroInfo: { flex: 1, gap: Spacing.sm },
  heroName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  heroAge: { fontSize: FontSize.sm, color: Colors.textMuted },
  heroTags: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroStats: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  heroStat: { alignItems: 'center', gap: 2 },
  heroStatValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  heroStatLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  heroStatDivider: { width: 1, backgroundColor: Colors.divider },
  setActiveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.primarySoft,
    borderRadius: Radius.full, paddingVertical: Spacing.md,
  },
  setActiveBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
  vitalsCard: {},
  vitalsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  vitalItem: { alignItems: 'center', gap: 6 },
  vitalIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vitalValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textDark },
  vitalLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  vacCard: { gap: Spacing.md },
  vacProgress: { gap: Spacing.sm },
  vacProgressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  vacProgressLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textMedium },
  vacProgressPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  vacProgressBar: { height: 8, backgroundColor: Colors.bgInput, borderRadius: 4, overflow: 'hidden' },
  vacProgressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  vacCounts: { flexDirection: 'row', justifyContent: 'space-around' },
  vacCount: { alignItems: 'center', gap: 2 },
  vacCountNum: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  vacCountLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  nextVac: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.md,
  },
  nextVacTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textDark },
  nextVacDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  infoIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textMedium },
  infoValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textDark },
  rowDivider: { height: 1, backgroundColor: Colors.divider, marginLeft: 44 },
});