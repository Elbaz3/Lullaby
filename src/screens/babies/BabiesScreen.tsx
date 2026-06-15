// ─────────────────────────────────────────────
//  BABIES SCREEN
//  Shows baby card matching the design mockup:
//  photo, name, age calculated from DOB
//  "Add more children" — disabled (coming soon)
// ─────────────────────────────────────────────

import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBabyStore } from '../../store/babyStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { Baby } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';
import { formatListBabyAge } from '../../utils/babyAge';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<any>;

// ── Baby Card ─────────────────────────────────
const BabyCard: React.FC<{ baby: Baby; onPress: () => void; t: (k: string, v?: Record<string, string | number>) => string }> = ({ baby, onPress, t }) => {
  const age = formatListBabyAge(baby.dateBirth, t);

  return (
    <View style={[styles.card, Shadows.md]}>
      {/* Photo */}
      <View style={styles.cardPhotoWrap}>
        {baby.avatar ? (
          <Image source={{ uri: baby.avatar }} style={styles.cardPhoto} />
        ) : (
          <View style={[styles.cardPhotoPlaceholder, { backgroundColor: baby.gender === 'male' ? '#DBEAFE' : '#FCE7F3' }]}>
            <Text style={styles.cardPhotoEmoji}>{baby.gender === 'male' ? '👦' : '👧'}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{baby.name}</Text>
        <Text style={styles.cardAge}>{age}</Text>
      </View>

      {/* View Profile */}
      <TouchableOpacity
        style={styles.viewProfileBtn}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={styles.viewProfileText}>{t('babies.viewProfile')}</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Main Screen ───────────────────────────────
export const BabiesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { babies, fetchBabies } = useBabyStore();

  useEffect(() => { fetchBabies(); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('babies.myBabies')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Baby cards */}
        {babies.map(baby => (
          <BabyCard
            key={baby.id}
            baby={baby}
            t={t}
            onPress={() => navigation.navigate('BabyDetail', { babyId: baby.id })}
          />
        ))}

        {/* Add more children — disabled coming soon */}
        <TouchableOpacity style={styles.addMoreBtn} disabled activeOpacity={1}>
          <View style={styles.addMoreLeft}>
            <View style={styles.addMoreIcon}>
              <Ionicons name="add" size={22} color={Colors.textMuted} />
            </View>
            <View>
              <Text style={styles.addMoreTitle}>{t('babies.addAnother')}</Text>
              <Text style={styles.addMoreSub}>{t('babies.addAnotherSub')}</Text>
            </View>
          </View>
          <View style={styles.comingSoonTag}>
            <Text style={styles.comingSoonText}>{t('common.comingSoon')}</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bgMain },
  header:     { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  headerTitle:{ fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  container:  { padding: Spacing.xl, gap: Spacing.lg },

  // Baby card — matches screenshot design
  card:       {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.lg, flexDirection: 'row',
    alignItems: 'center', gap: Spacing.lg,
  },
  cardPhotoWrap: {
    width: 72, height: 72, borderRadius: 36, overflow: 'hidden',
    borderWidth: 2, borderColor: Colors.primarySoft,
  },
  cardPhoto:    { width: '100%', height: '100%' },
  cardPhotoPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  cardPhotoEmoji: { fontSize: 32 },
  cardInfo:     { flex: 1, gap: 4 },
  cardName:     { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textDark },
  cardAge:      { fontSize: FontSize.sm, color: Colors.textMuted },
  viewProfileBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  viewProfileText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.white },

  // Add more — disabled
  addMoreBtn:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.lg, opacity: 0.6,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
  },
  addMoreLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  addMoreIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center',
  },
  addMoreTitle:    { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textMedium },
  addMoreSub:      { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  comingSoonTag:   {
    backgroundColor: Colors.bgInput, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  comingSoonText:  { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted },
});