// ─────────────────────────────────────────────
//  ONBOARDING — ADD BABY SCREEN
//  Fields: photo, name, gender, DOB,
//          weight, height, blood type
//  After save → ConnectDevice screen
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Platform,
  KeyboardAvoidingView, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useBabyStore } from '../../store/babyStore';
import { useAuthStore } from '../../store/authStore';
import { DatePickerInput }           from '../../components/ui/DatePickerInput';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../i18n/useTranslation';
import { formatListBabyAge } from '../../utils/babyAge';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<any>;

type Gender    = 'male' | 'female';
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const OnboardingAddBabyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();

  const { addBaby }           = useBabyStore();
  const { completeOnboarding } = useAuthStore();
  const [photo,     setPhoto]     = useState<string | null>(null);
  const [name,      setName]      = useState('');
  const [gender,    setGender]    = useState<Gender | null>(null);
  const [dobISO,    setDobISO]    = useState<string | null>(null);
  const [weight,    setWeight]    = useState('');
  const [height,    setHeight]    = useState('');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  // ── Photo picker ──────────────────────────
  // Uses expo-image-picker — install if not present
  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('onboarding.permPhotoTitle'), t('onboarding.permPhotoBody'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch {
      Alert.alert(t('onboarding.pickerUnavailableTitle'), t('onboarding.pickerUnavailableBody'));
    }
  };



  // ── Validation ────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = t('onboarding.nameMin2');
    if (!gender) e.gender = t('onboarding.selectGender');
    if (!dobISO) e.dob = t('addBaby.dobRequired');
    if (weight && isNaN(Number(weight))) e.weight = t('onboarding.validWeight');
    if (height && isNaN(Number(height))) e.height = t('onboarding.validHeight');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ──────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dateBirth = dobISO!.split('T')[0]; // YYYY-MM-DD

      await addBaby(
        {
          name:      name.trim(),
          gender:    gender!,                       // validated above
          dateBirth,                    // YYYY-MM-DD
          height:    height ? Number(height) : undefined,
          wight:     weight ? Number(weight) : undefined, // backend typo
          bloodType: bloodType ?? undefined,
        },
        photo,                          // avatar image URI or null
      );

      // Baby saved successfully → mark onboarding done
      // RootNavigator will switch to App after ConnectDevice
      completeOnboarding();

      navigation.navigate('OnboardingConnectDevice', {
        babyName:  name.trim(),
        babyPhoto: photo,
      });
    } catch (err: any) {
      setErrors({ name: err.message ?? t('onboarding.saveFailed') });
    } finally {
      setSaving(false);
    }
  };

  const agePreview = dobISO ? formatListBabyAge(dobISO, t) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('onboarding.addDetailsTitle')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.addDetailsSubtitle')}</Text>
          </View>

          {/* Progress dots */}
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>

          {/* Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoWrap} onPress={handlePickPhoto} activeOpacity={0.8}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoImg} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                  <Text style={styles.photoPlaceholderText}>{t('onboarding.addPhoto')}</Text>
                </View>
              )}
              <View style={styles.photoBadge}>
                <Ionicons name="camera" size={14} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>{t('onboarding.photoHintOptional')}</Text>
          </View>

          {/* Name */}
          <Input
            label={t('addBaby.babyName')}
            placeholder={t('addBaby.babyNamePh')}
            value={name}
            onChangeText={v => { setName(v); setErrors(p => ({ ...p, name: '' })); }}
            leftIcon="person-outline"
            error={errors.name}
          />

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('addBaby.gender')}</Text>
            <View style={styles.genderRow}>
              {(['male', 'female'] as Gender[]).map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => { setGender(g); setErrors(p => ({ ...p, gender: '' })); }}
                >
                  <Text style={styles.genderEmoji}>{g === 'male' ? '👦' : '👧'}</Text>
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                    {g === 'male' ? t('addBaby.male') : t('addBaby.female')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          </View>

          {/* DOB */}
          <View style={styles.fieldGroup}>
            <DatePickerInput
              label={t('addBaby.dob')}
              value={dobISO}
              onChange={setDobISO}
              maxDate={new Date()}
              minDate={new Date(2000, 0, 1)}
              placeholder={t('addBaby.dobPh')}
              error={errors.dob}
            />
            {agePreview && !errors.dob && (
              <View style={styles.agePreview}>
                <Ionicons name="time-outline" size={14} color={Colors.primary} />
                <Text style={styles.agePreviewText}>{t('onboarding.ageLabel')}{agePreview}</Text>
              </View>
            )}
          </View>

          {/* Weight & Height */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label={t('addBaby.weightKg')}
                placeholder={t('addBaby.weightPh')}
                value={weight}
                onChangeText={v => { setWeight(v); setErrors(p => ({ ...p, weight: '' })); }}
                keyboardType="decimal-pad"
                leftIcon="scale-outline"
                error={errors.weight}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label={t('addBaby.heightCm')}
                placeholder={t('addBaby.heightPh')}
                value={height}
                onChangeText={v => { setHeight(v); setErrors(p => ({ ...p, height: '' })); }}
                keyboardType="decimal-pad"
                leftIcon="resize-outline"
                error={errors.height}
              />
            </View>
          </View>

          {/* Blood Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('addBaby.bloodType')} <Text style={styles.optional}>{t('addBaby.optional')}</Text></Text>
            <View style={styles.bloodGrid}>
              {BLOOD_TYPES.map(bt => (
                <TouchableOpacity
                  key={bt}
                  style={[styles.bloodBtn, bloodType === bt && styles.bloodBtnActive]}
                  onPress={() => setBloodType(bloodType === bt ? null : bt)}
                >
                  <Text style={[styles.bloodText, bloodType === bt && styles.bloodTextActive]}>{bt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save */}
          <Button label={t('onboarding.saveContinue')} onPress={handleSave} loading={saving} size="lg" />

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.white },
  container:   { padding: Spacing.xl, gap: Spacing.lg },
  header:      { gap: 4, alignItems: 'center' },
  title:       { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:    { fontSize: FontSize.md, color: Colors.textMuted },
  dots:        { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive:   { width: 24, backgroundColor: Colors.primary },

  photoSection:     { alignItems: 'center', gap: Spacing.sm },
  photoWrap:        {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.bgInput, overflow: 'hidden',
    borderWidth: 3, borderColor: Colors.primarySoft, ...Shadows.md,
  },
  photoImg:         { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoPlaceholderText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  photoBadge:       {
    position: 'absolute', bottom: 4, right: 4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  photoHint:        { fontSize: FontSize.xs, color: Colors.textMuted },

  fieldGroup:  { gap: Spacing.sm },
  fieldLabel:  { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textDark },
  optional:    { fontWeight: FontWeight.regular as any, color: Colors.textMuted },
  errorText:   { fontSize: FontSize.xs, color: Colors.danger, marginTop: 2 },

  genderRow:       { flexDirection: 'row', gap: Spacing.md },
  genderBtn:       {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
    borderRadius: Radius.xl, borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
  },
  genderBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  genderEmoji:     { fontSize: 22 },
  genderText:      { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  genderTextActive:{ color: Colors.primary },

  agePreview:  {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primarySoft, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 6, alignSelf: 'flex-start',
  },
  agePreviewText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  row:         { flexDirection: 'row', gap: Spacing.md },

  bloodGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  bloodBtn:    {
    width: 64, paddingVertical: Spacing.sm, alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
  },
  bloodBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  bloodText:      { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textMedium },
  bloodTextActive:{ color: Colors.primary },
});