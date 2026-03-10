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
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<any>;

type Gender    = 'male' | 'female';
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Calculate age string from DOB
const calcAge = (dob: string): string => {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const now   = new Date();
  const days  = Math.floor((now.getTime() - birth.getTime()) / 86400000);
  if (days < 0)  return 'Future date';
  if (days === 0) return 'Newborn';
  const weeks  = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  const years  = Math.floor(days / 365.25);
  if (days < 30)  return `${days} day${days > 1 ? 's' : ''}`;
  if (months < 3) return `${weeks} week${weeks > 1 ? 's' : ''}`;
  if (years < 1) {
    const remWeeks = Math.floor((days - months * 30.44) / 7);
    return remWeeks > 0 ? `${months} Month${months > 1 ? 's' : ''}, ${remWeeks} Week${remWeeks > 1 ? 's' : ''}` : `${months} Month${months > 1 ? 's' : ''}`;
  }
  const remMonths = months - years * 12;
  return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years} year${years > 1 ? 's' : ''}`;
};

export const OnboardingAddBabyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const { addBaby } = useBabyStore();
  const [photo,     setPhoto]     = useState<string | null>(null);
  const [name,      setName]      = useState('');
  const [gender,    setGender]    = useState<Gender | null>(null);
  const [dob,       setDob]       = useState(''); // DD/MM/YYYY
  const [weight,    setWeight]    = useState('');
  const [height,    setHeight]    = useState('');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  // ── Photo picker ──────────────────────────
  // Uses expo-image-picker — install if not present
  const handlePickPhoto = async () => {
    try {
      // Dynamic import so it doesn't crash if not installed
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
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
      Alert.alert('Photo picker unavailable', 'Run: npx expo install expo-image-picker');
    }
  };

  // ── DOB formatting DD/MM/YYYY ─────────────
  const handleDobChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
    else if (digits.length > 2) formatted = `${digits.slice(0,2)}/${digits.slice(2)}`;
    setDob(formatted);
    setErrors(p => ({ ...p, dob: '' }));
  };

  // Parse DD/MM/YYYY → ISO
  const parseDate = (val: string): string | null => {
    const parts = val.split('/');
    if (parts.length !== 3 || parts[2].length !== 4) return null;
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  // ── Validation ────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!gender) e.gender = 'Please select gender';
    if (!dob || !parseDate(dob)) e.dob = 'Enter a valid date (DD/MM/YYYY)';
    if (weight && isNaN(Number(weight))) e.weight = 'Enter a valid weight';
    if (height && isNaN(Number(height))) e.height = 'Enter a valid height';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ──────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dateBirth = parseDate(dob)!.split('T')[0]; // YYYY-MM-DD

      await addBaby(
        {
          name:      name.trim(),
          gender,                       // 'male' | 'female'
          dateBirth,                    // YYYY-MM-DD
          height:    height ? Number(height) : undefined,
          weight:     weight ? Number(weight) : undefined, // backend typo
          bloodType: bloodType ?? undefined,
        },
        photo,                          // avatar image URI or null
      );

      navigation.navigate('OnboardingConnectDevice', {
        babyName:  name.trim(),
        babyPhoto: photo,
      });
    } catch (err: any) {
      setErrors({ name: err.message ?? 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const agePreview = dob.length === 10 ? calcAge(parseDate(dob) ?? '') : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Baby Details</Text>
            <Text style={styles.subtitle}>Tell us about your little one</Text>
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
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.photoBadge}>
                <Ionicons name="camera" size={14} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>Optional — tap to upload</Text>
          </View>

          {/* Name */}
          <Input
            label="Baby's Name"
            placeholder="Enter baby's name"
            value={name}
            onChangeText={v => { setName(v); setErrors(p => ({ ...p, name: '' })); }}
            leftIcon="person-outline"
            error={errors.name}
          />

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {(['male', 'female'] as Gender[]).map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => { setGender(g); setErrors(p => ({ ...p, gender: '' })); }}
                >
                  <Text style={styles.genderEmoji}>{g === 'male' ? '👦' : '👧'}</Text>
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          </View>

          {/* DOB */}
          <View style={styles.fieldGroup}>
            <Input
              label="Date of Birth"
              placeholder="DD/MM/YYYY"
              value={dob}
              onChangeText={handleDobChange}
              keyboardType="number-pad"
              leftIcon="calendar-outline"
              error={errors.dob}
              maxLength={10}
            />
            {agePreview && !errors.dob && (
              <View style={styles.agePreview}>
                <Ionicons name="time-outline" size={14} color={Colors.primary} />
                <Text style={styles.agePreviewText}>Age: {agePreview}</Text>
              </View>
            )}
          </View>

          {/* Weight & Height */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Weight (kg)"
                placeholder="e.g. 3.5"
                value={weight}
                onChangeText={v => { setWeight(v); setErrors(p => ({ ...p, weight: '' })); }}
                keyboardType="decimal-pad"
                leftIcon="scale-outline"
                error={errors.weight}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Height (cm)"
                placeholder="e.g. 50"
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
            <Text style={styles.fieldLabel}>Blood Type <Text style={styles.optional}>(optional)</Text></Text>
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
          <Button label="Save & Continue" onPress={handleSave} loading={saving} size="lg" />

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