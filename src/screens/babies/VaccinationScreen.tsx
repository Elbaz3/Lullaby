// ─────────────────────────────────────────────
//  VACCINATION SCREEN
//
//  Strategy:
//   - Mount: fetch ?type=all once → stats card
//   - Tab change: fetch ?type=<tab> → list
//   - Status derived client-side from isTaken + scheduledDate
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, Modal, ActivityIndicator,
  RefreshControl, Switch, Alert,
} from 'react-native';
import { SafeAreaView }              from 'react-native-safe-area-context';
import { Ionicons }                  from '@expo/vector-icons';
import { useNavigation }             from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vaccinationService, VaccineFilterType } from '../../services/vaccination.service';
import { VaccinationRecord }         from '../../types';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useTranslation } from '../../i18n/useTranslation';

type Nav = NativeStackNavigationProp<any>;

type TabDef = { key: VaccineFilterType; label: string; statusKey?: 'done' | 'upcoming' | 'overdue' };

const STATUS_BASE = {
  done:      { color: Colors.success, bg: Colors.successSoft, icon: 'checkmark-circle' as const },
  upcoming:  { color: Colors.warning, bg: Colors.warningSoft, icon: 'time-outline'     as const },
  overdue:   { color: Colors.danger,  bg: Colors.dangerSoft,  icon: 'alert-circle'     as const },
};

const VACCINE_TYPE_COLOR: Record<string, string> = {
  live:        '#8B5CF6',
  inactivated: '#0EA5E9',
  subunit:     '#F59E0B',
  toxoid:      '#10B981',
  mrna:        '#EC4899',
};

export const VaccinationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-GB';

  const formatDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' }),
    [dateLocale]
  );

  const daysRelative = useCallback(
    (iso: string): string => {
      const d = new Date(iso);
      d.setHours(0, 0, 0, 0);
      const t0 = new Date();
      t0.setHours(0, 0, 0, 0);
      const diff = Math.round((d.getTime() - t0.getTime()) / 86400000);
      if (diff === 0) return t('vaccination.relToday');
      if (diff === 1) return t('vaccination.relTomorrow');
      if (diff === -1) return t('vaccination.relYesterday');
      if (diff > 0) return diff === 1 ? t('vaccination.relInOneDay') : t('vaccination.relInDays', { n: diff });
      const abs = Math.abs(diff);
      return abs === 1 ? t('vaccination.relOneDayAgo') : t('vaccination.relDaysAgo', { n: abs });
    },
    [t]
  );

  const statusCfg = useMemo(
    () => ({
      done: { ...STATUS_BASE.done, label: t('vaccination.statusDone') },
      upcoming: { ...STATUS_BASE.upcoming, label: t('vaccination.statusUpcoming') },
      overdue: { ...STATUS_BASE.overdue, label: t('vaccination.statusOverdue') },
    }),
    [t]
  );

  const TABS: TabDef[] = useMemo(
    () => [
      { key: 'all', label: t('vaccination.tabAll') },
      { key: 'upcoming', label: t('vaccination.tabUpcoming'), statusKey: 'upcoming' },
      { key: 'overdue', label: t('vaccination.tabOverdue'), statusKey: 'overdue' },
      { key: 'done', label: t('vaccination.tabDone'), statusKey: 'done' },
    ],
    [t]
  );

  // Full list (type=all) — used for stats only
  const [allRecords,  setAllRecords]  = useState<VaccinationRecord[]>([]);
  // Current tab list
  const [tabRecords,  setTabRecords]  = useState<VaccinationRecord[]>([]);
  const [activeTab,   setActiveTab]   = useState<VaccineFilterType>('all');
  const [statsLoading, setStatsLoading] = useState(true);
  const [listLoading,  setListLoading]  = useState(true);
  const [listError,    setListError]    = useState<string | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [selected,     setSelected]     = useState<VaccinationRecord | null>(null);
  const [toggling,     setToggling]     = useState<Set<string>>(new Set());

  // Stats derived from allRecords
  const stats = vaccinationService.getStats(allRecords);

  // ── Fetch stats (type=all, once) ───────────
  const fetchStats = useCallback(async () => {
    try {
      const data = await vaccinationService.getByType('all');
      setAllRecords(data);
    } catch { /* stats silently fail */ }
    finally { setStatsLoading(false); }
  }, []);

  // ── Fetch list for active tab ──────────────
  const fetchList = useCallback(async (type: VaccineFilterType, silent = false) => {
    if (!silent) setListLoading(true);
    setListError(null);
    try {
      const data = await vaccinationService.getByType(type);
      // Sort: overdue first → upcoming by date → completed last
      data.sort((a, b) => {
        const order = { overdue: 0, upcoming: 1, done: 2 } as Record<string, number>;
        const diff  = (order[a.status!] ?? 1) - (order[b.status!] ?? 1);
        return diff !== 0 ? diff
          : new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      });
      setTabRecords(data);
    } catch (err: any) {
      setListError(err.message ?? t('vaccination.loadFailed'));
    } finally {
      setListLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  // Mount: fetch both
  useEffect(() => {
    fetchStats();
    fetchList('all');
  }, []);

  // Tab change: new backend request
  const handleTabChange = (tab: VaccineFilterType) => {
    setActiveTab(tab);
    fetchList(tab);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
    fetchList(activeTab, true);
  };

  // ── Toggle isTaken ────────────────────────
  const handleToggle = async (item: VaccinationRecord) => {
    const newValue = item.status !== 'done';   // flip current state
    setToggling(prev => new Set(prev).add(item.id));
    try {
      await vaccinationService.markTaken(item.id, newValue);
      // Optimistically update both lists without full refetch
      const patch = (r: VaccinationRecord) =>
        r.id === item.id
          ? { ...r, isTaken: newValue, status: newValue ? 'done' : (
              new Date(r.scheduledDate) < new Date() ? 'overdue' : 'upcoming'
            ) as VaccinationRecord['status'] }
          : r;
      setTabRecords(prev => prev.map(patch));
      setAllRecords(prev => prev.map(patch));
      // Close modal if open on this item
      if (selected?.id === item.id) setSelected(prev => prev ? patch(prev) : null);
    } catch (err: any) {
      Alert.alert(t('vaccination.errorTitle'), err.message ?? t('vaccination.updateFailed'));
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  };

  // ── Render card ────────────────────────────
  const renderCard = ({ item }: { item: VaccinationRecord }) => {
    const cfg     = statusCfg[item.status as keyof typeof statusCfg] ?? statusCfg.upcoming;
    const typeClr = VACCINE_TYPE_COLOR[item.vaccine?.vaccineType] ?? Colors.textMuted;

    return (
      <TouchableOpacity
        style={[styles.card, Shadows.sm]}
        onPress={() => setSelected(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.vaccineName}>{item.vaccine?.name ?? '—'}</Text>
              {item.vaccine?.isBooster && (
                <View style={styles.boosterBadge}>
                  <Text style={styles.boosterText}>{t('vaccination.booster')}</Text>
                </View>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={12} color={cfg.color} />
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>

          {item.vaccine?.description && (
            <Text style={styles.vaccineDesc} numberOfLines={1}>{item.vaccine.description}</Text>
          )}

          <View style={styles.cardBottom}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.metaText}>{formatDate(item.scheduledDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
              <Text style={[styles.metaText, item.status === 'overdue' && { color: Colors.danger }]}>
                {daysRelative(item.scheduledDate)}
              </Text>
            </View>
            <View style={[styles.typeBadge, { borderColor: typeClr }]}>
              <Text style={[styles.typeText, { color: typeClr }]}>{item.vaccine?.vaccineType ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* Toggle */}
        <Switch
          value={item.status === 'done'}
          onValueChange={() => handleToggle(item)}
          disabled={toggling.has(item.id)}
          trackColor={{ false: Colors.border, true: Colors.successSoft }}
          thumbColor={item.status === 'done' ? Colors.success : Colors.textMuted}
          style={styles.cardSwitch}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('vaccination.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={listLoading ? [] : tabRecords}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }

        ListHeaderComponent={() => (
          <>
            {/* ── Progress card ── */}
            <View style={[styles.progressCard, Shadows.md]}>
              {statsLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <View style={styles.progressTop}>
                    <View>
                  <Text style={styles.progressTitle}>{t('vaccination.progressTitle')}</Text>
                  <Text style={styles.progressSub}>{t('vaccination.progressSub', { done: stats.done, total: stats.total })}</Text>
                    </View>
                    <View style={styles.progressCircle}>
                      <Text style={styles.progressPct}>{stats.percentage}%</Text>
                    </View>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${stats.percentage}%` as any }]} />
                  </View>
                  <View style={styles.statsRow}>
                    <StatChip icon="checkmark-circle" color="#86EFAC" label={t('vaccination.done')}    value={stats.done} />
                    <StatChip icon="time-outline"     color="#FDE68A" label={t('vaccination.soon')}    value={stats.upcoming}  />
                    <StatChip icon="alert-circle"     color="#FCA5A5" label={t('vaccination.overdue')} value={stats.overdue}   />
                  </View>
                </>
              )}
            </View>

            {/* ── Filter tabs ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}
            >
              {TABS.map(tab => {
                const count = tab.statusKey ? stats[tab.statusKey] : stats.total;
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, isActive && styles.tabActive]}
                    onPress={() => handleTabChange(tab.key)}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                    {count > 0 && (
                      <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                        <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        ListEmptyComponent={() => (
          listLoading ? (
            <View style={styles.centerWrap}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>{t('vaccination.loading')}</Text>
            </View>
          ) : listError ? (
            <View style={styles.centerWrap}>
              <Ionicons name="cloud-offline-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.errorTitle}>{t('vaccination.errorTitle')}</Text>
              <Text style={styles.errorSub}>{listError}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchList(activeTab)}>
                <Text style={styles.retryText}>{t('vaccination.tryAgain')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>💉</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'all'
                  ? t('vaccination.emptyAll')
                  : t('vaccination.emptyTab', { tab: TABS.find(tab => tab.key === activeTab)?.label ?? activeTab })}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === 'done'     ? t('vaccination.emptyDone') :
                 activeTab === 'overdue'  ? t('vaccination.emptyOverdue') :
                 activeTab === 'upcoming' ? t('vaccination.emptyUpcoming') :
                 t('vaccination.emptyDefault')}
              </Text>
            </View>
          )
        )}
      />

      {/* ── Detail Modal ── */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelected(null)} />
        {selected && (() => {
          const cfg     = statusCfg[selected.status as keyof typeof statusCfg] ?? statusCfg.upcoming;
          const typeClr = VACCINE_TYPE_COLOR[selected.vaccine?.vaccineType] ?? Colors.textMuted;
          return (
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              <View style={[styles.modalIconCircle, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={32} color={cfg.color} />
              </View>

              <Text style={styles.modalName}>{selected.vaccine?.name}</Text>

              <View style={[styles.statusBadge, { backgroundColor: cfg.bg, alignSelf: 'center', marginBottom: Spacing.md }]}>
                <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>

              <View style={styles.modalDetails}>
                <DetailRow icon="document-text-outline"    label={t('vaccination.modalDescription')}   value={selected.vaccine?.description ?? '—'} />
                <DetailRow icon="calendar-outline"          label={t('vaccination.modalScheduled')}     value={formatDate(selected.scheduledDate)} />
                <DetailRow icon="time-outline"              label={t('vaccination.modalWhen')}          value={daysRelative(selected.scheduledDate)} highlight={selected.status === 'overdue'} />
                <DetailRow icon="medical-outline"           label={t('vaccination.modalDoseShort')}          value={`${t('babyDetail.dose')} ${selected.vaccine?.dose ?? '—'}`} />
                <DetailRow icon="flask-outline"             label={t('vaccination.modalVaccineType')}  value={selected.vaccine?.vaccineType ?? '—'} valueColor={typeClr} />
                <DetailRow icon="calendar-number-outline"   label={t('vaccination.modalAgeRequired')}  value={
                  selected.vaccine?.ageRequired === 0
                    ? t('vaccination.atBirth')
                    : (selected.vaccine?.ageRequired === 1
                        ? t('vaccination.ageMonthOne', { n: 1 })
                        : t('vaccination.ageMonths', { n: selected.vaccine?.ageRequired ?? 0 }))
                } />
                {selected.vaccine?.isBooster && (
                  <DetailRow icon="refresh-outline" label={t('vaccination.modalType')} value={t('vaccination.modalBoosterType')} />
                )}
                {selected.vaccine?.repeat && (
                  <DetailRow icon="repeat-outline" label={t('vaccination.modalSchedule')} value={t('vaccination.modalRecurring')} />
                )}
              </View>

              {/* Toggle button in modal */}
              <TouchableOpacity
                style={[
                  styles.modalToggleBtn,
                  selected.status === 'done'
                    ? styles.modalToggleBtnUndo
                    : styles.modalToggleBtnDone,
                ]}
                onPress={() => handleToggle(selected)}
                disabled={toggling.has(selected.id)}
              >
                {toggling.has(selected.id) ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name={selected.status === 'done' ? 'close-circle-outline' : 'checkmark-circle-outline'}
                      size={18}
                      color={Colors.white}
                    />
                    <Text style={styles.modalToggleTxt}>
                      {selected.status === 'done' ? t('vaccination.markNotTaken') : t('vaccination.markDone')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelected(null)}>
                <Text style={styles.modalCloseTxt}>{t('vaccination.modalClose')}</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </Modal>
    </SafeAreaView>
  );
};

// ── Helper components ─────────────────────────
const StatChip: React.FC<{ icon: any; color: string; label: string; value: number }> = ({ icon, color, label, value }) => (
  <View style={chipSt.wrap}>
    <Ionicons name={icon} size={16} color={color} />
    <Text style={chipSt.val}>{value}</Text>
    <Text style={chipSt.lbl}>{label}</Text>
  </View>
);

const DetailRow: React.FC<{ icon: any; label: string; value: string; highlight?: boolean; valueColor?: string }> = ({
  icon, label, value, highlight, valueColor,
}) => (
  <View style={detailSt.row}>
    <View style={detailSt.iconWrap}>
      <Ionicons name={icon} size={16} color={Colors.primary} />
    </View>
    <Text style={detailSt.label}>{label}</Text>
    <Text style={[detailSt.value, highlight && { color: Colors.danger }, valueColor ? { color: valueColor } : {}]}>
      {value}
    </Text>
  </View>
);

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.bgMain },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },

  listContent:    { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 60 },

  progressCard:   { backgroundColor: Colors.primary, borderRadius: Radius.xxl, padding: Spacing.xl, gap: Spacing.lg, marginBottom: Spacing.md },
  progressTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  progressSub:    { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  progressCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  progressPct:    { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  progressBarBg:  { height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4 },
  progressBarFill:{ height: '100%', backgroundColor: Colors.white, borderRadius: 4 },
  statsRow:       { flexDirection: 'row', justifyContent: 'space-around' },

  tabsRow:        { gap: Spacing.sm, paddingBottom: Spacing.md },
  tab:            { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.full, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  tabActive:      { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText:        { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  tabTextActive:  { color: Colors.white },
  tabCount:       { backgroundColor: Colors.bgInput, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabCountText:   { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted },
  tabCountTextActive: { color: Colors.white },

  card:           { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.xl, overflow: 'hidden', alignItems: 'center' },
  cardAccent:     { width: 4, alignSelf: 'stretch' },
  cardBody:       { flex: 1, padding: Spacing.lg, gap: 6 },
  cardTop:        { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  cardTitleRow:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  vaccineName:    { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textDark },
  vaccineDesc:    { fontSize: FontSize.xs, color: Colors.textMuted },
  cardBottom:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  cardChevron:    { paddingRight: Spacing.md },

  statusBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText:     { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  metaItem:       { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText:       { fontSize: FontSize.xs, color: Colors.textMuted },
  boosterBadge:   { backgroundColor: '#F3E8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  boosterText:    { fontSize: 10, fontWeight: FontWeight.bold, color: '#8B5CF6' },
  typeBadge:      { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  typeText:       { fontSize: 10, fontWeight: FontWeight.semibold },

  centerWrap:     { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  loadingText:    { fontSize: FontSize.md, color: Colors.textMuted },
  errorTitle:     { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textDark },
  errorSub:       { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  retryBtn:       { marginTop: Spacing.md, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.full },
  retryText:      { color: Colors.white, fontWeight: FontWeight.bold },

  emptyWrap:      { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyEmoji:     { fontSize: 48 },
  emptyTitle:     { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textDark },
  emptySub:       { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: Spacing.xl },

  modalBackdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Spacing.xl, paddingBottom: 36, alignItems: 'center', gap: Spacing.sm },
  modalHandle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: Spacing.sm },
  modalIconCircle:{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  modalName:      { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark, textAlign: 'center' },
  modalDetails:   { width: '100%', backgroundColor: Colors.bgMain, borderRadius: Radius.xl, padding: Spacing.lg, gap: 2 },
  cardSwitch:     { marginRight: Spacing.md },
  modalToggleBtn:     { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderRadius: Radius.xl, paddingVertical: Spacing.lg, marginTop: Spacing.sm },
  modalToggleBtnDone: { backgroundColor: Colors.success },
  modalToggleBtnUndo: { backgroundColor: Colors.danger },
  modalToggleTxt:     { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
  modalCloseBtn:  { width: '100%', backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: Spacing.lg, alignItems: 'center', marginTop: Spacing.sm },
  modalCloseTxt:  { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
});

const chipSt = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  val:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  lbl:  { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)' },
});

const detailSt = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  iconWrap:{ width: 28, alignItems: 'center' },
  label:   { flex: 1, fontSize: FontSize.sm, color: Colors.textMuted },
  value:   { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textDark, textAlign: 'right', flexShrink: 1 },
});