import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vaccinationService } from '../../services/vaccination.service';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { Card, SectionHeader, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VaccinationRecord } from '../../constants/mockData';

type RouteParams = { Vaccination: { babyId: string } };
type Nav = NativeStackNavigationProp<any>;

const STATUS_CONFIG = {
  completed: { color: Colors.success, bg: Colors.successSoft, icon: 'checkmark-circle', label: 'Completed' },
  upcoming:  { color: Colors.warning, bg: Colors.warningSoft, icon: 'time-outline',     label: 'Upcoming' },
  overdue:   { color: Colors.danger,  bg: Colors.dangerSoft,  icon: 'alert-circle',     label: 'Overdue' },
  skipped:   { color: Colors.textMuted, bg: Colors.bgInput,   icon: 'close-circle',     label: 'Skipped' },
};

type FilterType = 'all' | 'upcoming' | 'completed' | 'overdue';

export const VaccinationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RouteParams, 'Vaccination'>>();
  const { babyId } = route.params;

  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VaccinationRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    vaccinationService.getRecords(babyId).then(r => {
      setRecords(r);
      setLoading(false);
    });
  }, [babyId]);

  const stats = vaccinationService.getStats(records);

  const filtered = filter === 'all'
    ? records
    : records.filter(r => r.status === filter);

  const handleMarkDone = (record: VaccinationRecord) => {
    setSelected(record);
    setModalVisible(true);
  };

  const confirmMarkDone = async () => {
    if (!selected) return;
    await vaccinationService.markCompleted(selected.id, {
      administeredDate: new Date().toISOString().split('T')[0],
      location: 'Clinic',
    });
    setRecords(prev => prev.map(r =>
      r.id === selected.id
        ? { ...r, status: 'completed', administeredDate: new Date().toISOString().split('T')[0] }
        : r
    ));
    setModalVisible(false);
    setSelected(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vaccination Schedule</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={[styles.statsRow, Shadows.sm]}>
          {[
            { label: 'Total', value: stats.total, color: Colors.primary },
            { label: 'Done', value: stats.completed, color: Colors.success },
            { label: 'Upcoming', value: stats.upcoming, color: Colors.warning },
            { label: 'Overdue', value: stats.overdue, color: Colors.danger },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress */}
        <Card>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Vaccination Progress</Text>
            <Text style={styles.progressPct}>{stats.percentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stats.percentage}%` as any }]} />
          </View>
          <Text style={styles.progressSub}>
            {stats.completed} of {stats.total} vaccines completed
          </Text>
        </Card>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 'upcoming', 'overdue', 'completed'] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, filter === f && styles.filterPillActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && ` (${records.filter(r => r.status === f).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Records */}
        <SectionHeader title={`${filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Vaccines`} />
        <View style={styles.list}>
          {filtered.map(record => {
            const cfg = STATUS_CONFIG[record.status];
            return (
              <View key={record.id} style={[styles.recordCard, Shadows.sm]}>
                <View style={[styles.recordIconWrap, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
                </View>
                <View style={styles.recordInfo}>
                  <View style={styles.recordTop}>
                    <Text style={styles.recordName}>{record.vaccineName}</Text>
                    <Badge label={`Dose ${record.doseNumber}`} variant="neutral" />
                  </View>
                  <View style={styles.recordMeta}>
                    <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.recordDate}>
                      {record.status === 'completed' && record.administeredDate
                        ? `Given: ${new Date(record.administeredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : `Due: ${new Date(record.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      }
                    </Text>
                  </View>
                  {record.location && (
                    <View style={styles.recordMeta}>
                      <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                      <Text style={styles.recordDate}>{record.location}</Text>
                    </View>
                  )}
                  {(record.status === 'upcoming' || record.status === 'overdue') && (
                    <TouchableOpacity
                      style={[styles.markDoneBtn, { backgroundColor: cfg.color + '15' }]}
                      onPress={() => handleMarkDone(record)}
                    >
                      <Text style={[styles.markDoneText, { color: cfg.color }]}>Mark as Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>💉</Text>
            <Text style={styles.modalTitle}>Mark as Completed?</Text>
            <Text style={styles.modalSubtitle}>
              Confirm that {selected?.vaccineName} (Dose {selected?.doseNumber}) was administered today.
            </Text>
            <View style={styles.modalActions}>
              <Button label="Cancel" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button label="Confirm" onPress={confirmMarkDone} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm,
  },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  container: { padding: Spacing.xl, gap: Spacing.lg },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: Radius.xl, padding: Spacing.lg, justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textMedium },
  progressPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  progressBar: { height: 10, backgroundColor: Colors.bgInput, borderRadius: 5, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  progressSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  filterRow: { gap: Spacing.sm, paddingBottom: Spacing.xs },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.full, backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterPillText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textMedium },
  filterPillTextActive: { color: Colors.white },
  list: { gap: Spacing.md },
  recordCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.lg, gap: Spacing.md,
  },
  recordIconWrap: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1, gap: 4 },
  recordTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  recordName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textDark, flex: 1 },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  markDoneBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full, marginTop: 6 },
  markDoneText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontWeight: FontWeight.bold },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modalCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    padding: Spacing.xxl, alignItems: 'center', gap: Spacing.lg, width: '100%',
  },
  modalEmoji: { fontSize: 48 },
  modalTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  modalSubtitle: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  modalActions: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
});
