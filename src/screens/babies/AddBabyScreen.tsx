// ─────────────────────────────────────────────
//  ADD / EDIT BABY SCREEN
//
//  Two modes:
//  - Add:  route has no params → fresh form → POST
//  - Edit: route has babyId param → pre-filled  → PATCH
//
//  Fields match backend DTO exactly:
//    name, gender (male/female), dateBirth (YYYY-MM-DD),
//    height (number), wight (number — backend typo),
//    bloodType (string), avatar (image file)
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert, Image,
} from 'react-native';
import { SafeAreaView }              from 'react-native-safe-area-context';
import { Ionicons }                  from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker              from 'expo-image-picker';
import { useBabyStore }              from '../../store/babyStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { Button }                    from '../../components/ui/Button';
import { Input }                     from '../../components/ui/Input';
import { DatePickerInput }           from '../../components/ui/DatePickerInput';
import { useTranslation }            from '../../i18n/useTranslation';

type Nav    = NativeStackNavigationProp<any>;
type Params = { AddBaby?: { babyId?: string } };

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const AddBabyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<RouteProp<Params, 'AddBaby'>>();
  const { t } = useTranslation();
  const { babies, activeBaby, addBaby, updateBaby, isLoading } = useBabyStore();

  // Determine mode
  const editBabyId = route.params?.babyId ?? null;
  const isEdit     = !!editBabyId;
  const babyToEdit = isEdit ? (babies.find(b => b.id === editBabyId) ?? activeBaby) : null;

  // Form state
  const [name,      setName]      = useState('');
  const [gender,    setGender]    = useState<'male' | 'female'>('male');
  const [dobISO,    setDobISO]    = useState<string | null>(null);
  const [weight,    setWeight]    = useState('');
  const [height,    setHeight]    = useState('');
  const [bloodType, setBloodType] = useState('');
  const [photo,     setPhoto]     = useState<string | null>(null);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [step,      setStep]      = useState<1 | 2>(1);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && babyToEdit) {
      setName(babyToEdit.name ?? '');
      setGender((babyToEdit.gender as any) ?? 'male');
      setDobISO(babyToEdit.dateBirth ? babyToEdit.dateBirth.split('T')[0] : null);
      setWeight(String(babyToEdit.weight ?? babyToEdit.wight ?? ''));
      setHeight(String(babyToEdit.height ?? ''));
      setBloodType(babyToEdit.bloodType ?? '');
      // Show existing avatar as preview
      if (babyToEdit.avatar) setPhoto(babyToEdit.avatar);
    }
  }, [isEdit, babyToEdit?.id]);

  // ── Photo picker ─────────────────────────
  const pickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert(t('addBaby.permissionTitle'), t('addBaby.permissionBody')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  // ── Validation ───────────────────────────
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) e.name = t('addBaby.nameShort');
    if (name.trim().length > 20)                e.name = t('addBaby.nameLong');
    if (!dobISO) e.dob = t('addBaby.dobRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────
  const handleSave = async () => {
    if (!dobISO) {
      setErrors({ dob: t('addBaby.dobRequired') });
      return;
    }
    const dateBirth = dobISO.includes('T') ? dobISO.split('T')[0] : dobISO;

    const payload = {
      name:      name.trim(),
      gender,
      dateBirth,
      height:    height    ? parseFloat(height)    : undefined,
      wight:     weight    ? parseFloat(weight)    : undefined,
      bloodType: bloodType || undefined,
    };

    // Only send photo if it's a local file (new selection), not existing URL
    const avatarUri = photo && photo.startsWith('file://') ? photo : null;

    try {
      if (isEdit && editBabyId) {
        await updateBaby(editBabyId, payload, avatarUri);
        Alert.alert(t('addBaby.updatedTitle'), t('addBaby.updatedMsg', { name: name.trim() }), [
          { text: t('addBaby.done'), onPress: () => navigation.goBack() },
        ]);
      } else {
        await addBaby(payload, avatarUri);
        Alert.alert(t('addBaby.addedTitle'), t('addBaby.addedMsg', { name: name.trim() }), [
          { text: t('addBaby.great'), onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert(t('addBaby.errorTitle'), err.message ?? t('addBaby.errorGeneric'));
    }
  };

  const isNewPhoto = photo && photo.startsWith('file://');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            if (step === 2) setStep(1);
            else navigation.goBack();
          }}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? t('addBaby.editTitle') : t('addBaby.addTitle')}</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>{step}/2</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {step === 1 ? (
            <>
              {/* Photo */}
              <TouchableOpacity style={styles.photoWrap} onPress={pickPhoto} activeOpacity={0.8}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={28} color={Colors.primary} />
                    <Text style={styles.photoLabel}>
                      {isEdit ? t('addBaby.changePhoto') : t('addBaby.addPhoto')}
                    </Text>
                  </View>
                )}
                <View style={styles.photoBadge}>
                  <Ionicons name="camera" size={14} color={Colors.white} />
                </View>
              </TouchableOpacity>
              {isEdit && photo && !isNewPhoto && (
                <Text style={styles.photoHint}>{t('addBaby.photoHintEdit')}</Text>
              )}

              {/* Name */}
              <Input
                label={t('addBaby.babyName')}
                value={name}
                onChangeText={setName}
                placeholder={t('addBaby.babyNamePh')}
                error={errors.name}
                leftIcon="person-outline"
              />

              {/* Gender */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t('addBaby.gender')}</Text>
                <View style={styles.genderRow}>
                  {(['male', 'female'] as const).map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderBtn, gender === g && styles.genderBtnActive,
                        gender === g && { backgroundColor: g === 'male' ? '#DBEAFE' : '#FCE7F3' }
                      ]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={styles.genderEmoji}>{g === 'male' ? '👦' : '👧'}</Text>
                      <Text style={[styles.genderLabel, gender === g && styles.genderLabelActive]}>
                        {g === 'male' ? t('addBaby.male') : t('addBaby.female')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date of Birth */}
              <DatePickerInput
                label={t('addBaby.dob')}
                value={dobISO}
                onChange={setDobISO}
                maxDate={new Date()}
                minDate={new Date(2000, 0, 1)}
                placeholder={t('addBaby.dobPh')}
                error={errors.dob}
              />

              <Button label={t('addBaby.next')} onPress={() => { if (validateStep1()) setStep(2); }} size="lg" />
            </>
          ) : (
            <>
              {/* Weight & Height */}
              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Input
                    label={t('addBaby.weightKg')}
                    value={weight} onChangeText={setWeight}
                    placeholder={t('addBaby.weightPh')}
                    keyboardType="decimal-pad"
                    leftIcon="scale-outline"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label={t('addBaby.heightCm')}
                    value={height} onChangeText={setHeight}
                    placeholder={t('addBaby.heightPh')}
                    keyboardType="decimal-pad"
                    leftIcon="resize-outline"
                  />
                </View>
              </View>

              {/* Blood Type */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t('addBaby.bloodType')} <Text style={styles.optional}>{t('addBaby.optional')}</Text></Text>
                <View style={styles.bloodGrid}>
                  {BLOOD_TYPES.map(bt => (
                    <TouchableOpacity
                      key={bt}
                      style={[styles.bloodChip, bloodType === bt && styles.bloodChipActive]}
                      onPress={() => setBloodType(bt === bloodType ? '' : bt)}
                    >
                      <Text style={[styles.bloodChipText, bloodType === bt && styles.bloodChipTextActive]}>
                        {bt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button
                label={isEdit ? t('addBaby.saveChanges') : t('addBaby.saveProfile')}
                onPress={handleSave}
                loading={isLoading}
                size="lg"
              />
              <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.skipText}>{t('addBaby.cancel')}</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bgMain },
  header:       { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.md },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textDark },
  stepIndicator:{ width: 36, alignItems: 'center' },
  stepText:     { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },

  progressBar:  { height: 3, backgroundColor: Colors.border, marginHorizontal: Spacing.xl, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  container:    { padding: Spacing.xl, gap: Spacing.lg },

  photoWrap:    { alignSelf: 'center', position: 'relative' },
  photoPreview: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  photoLabel:   { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  photoBadge:   {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  photoHint: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginTop: -Spacing.sm },

  field:        { gap: Spacing.sm },
  fieldLabel:   { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textDark },
  optional:     { fontWeight: FontWeight.regular, color: Colors.textMuted },

  genderRow:    { flexDirection: 'row', gap: Spacing.md },
  genderBtn:    {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
    borderRadius: Radius.xl, borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  genderBtnActive:  { borderColor: Colors.primary },
  genderEmoji:      { fontSize: 22 },
  genderLabel:      { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  genderLabelActive:{ color: Colors.textDark },

  dobRow:       { flexDirection: 'row', gap: Spacing.sm },
  dobInput:     { flex: 1 },
  dobInputYear: { flex: 2 },

  rowFields:    { flexDirection: 'row', gap: Spacing.md },

  bloodGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  bloodChip:    {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  bloodChipActive:    { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  bloodChipText:      { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  bloodChipTextActive:{ color: Colors.primary },

  skipBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  skipText: { fontSize: FontSize.md, color: Colors.textMuted },
});