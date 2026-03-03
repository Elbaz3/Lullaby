import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBabyStore } from '../../store/babyStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { BabyAvatar } from '../../components/BabyAvatar';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Card';
import { Baby } from '../../types';

type Nav = NativeStackNavigationProp<any>;

// ── Helpers ───────────────────────────────────

const getAgeString = (dob: string): string => {
  const diff = Date.now() - new Date(dob).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} days old`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} old`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo old` : `${years} year${years > 1 ? 's' : ''} old`;
};

// ── Baby Card ─────────────────────────────────

const BabyCard: React.FC<{ baby: Baby; isActive: boolean; onPress: () => void; onDelete: () => void }> = ({
  baby,
  isActive,
  onPress,
  onDelete,
}) => (
  <TouchableOpacity
    style={[styles.babyCard, isActive && styles.babyCardActive, Shadows.sm]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <BabyAvatar baby={baby} size={60} />
    <View style={styles.babyInfo}>
      <View style={styles.babyNameRow}>
        <Text style={styles.babyName}>{baby.name}</Text>
        {isActive && (
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activePillText}>Active</Text>
          </View>
        )}
      </View>
      <Text style={styles.babyAge}>{getAgeString(baby.dateOfBirth)}</Text>
      <View style={styles.babyMeta}>
        {baby.weight && (
          <Text style={styles.babyMetaText}>⚖️ {baby.weight} kg</Text>
        )}
        {baby.bloodType && (
          <Text style={styles.babyMetaText}>🩸 {baby.bloodType}</Text>
        )}
        <Text style={styles.babyMetaText}>
          {baby.deviceId ? '📡 Connected' : '📡 No device'}
        </Text>
      </View>
    </View>
    <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ── Babies Screen ─────────────────────────────

export const BabiesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { babies, activeBabyId, setActiveBaby, fetchBabies, deleteBaby, isLoading } = useBabyStore();

  useEffect(() => {
    fetchBabies();
  }, []);

  const handleDelete = (baby: Baby) => {
    Alert.alert(
      `Remove ${baby.name}?`,
      'This will permanently delete this baby profile and all associated data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBaby(baby.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Babies</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddBaby')}
        >
          <Ionicons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {babies.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              emoji="👶"
              title="No babies yet"
              subtitle="Start by adding your child to monitor their health, daily routine, and vaccinations with ease."
            />
            <Button
              label="Add New Baby"
              onPress={() => navigation.navigate('AddBaby')}
            />
          </View>
        ) : (
          babies.map((baby) => (
            <BabyCard
              key={baby.id}
              baby={baby}
              isActive={baby.id === activeBabyId}
              onPress={() => setActiveBaby(baby.id)}
              onDelete={() => handleDelete(baby)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.huge,
  },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  babyCardActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  babyInfo: { flex: 1, gap: 4 },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  babyName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
  },
  babyAge: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  babyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 4,
  },
  babyMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textMedium,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    gap: Spacing.xl,
    marginTop: Spacing.xxl,
  },
});
