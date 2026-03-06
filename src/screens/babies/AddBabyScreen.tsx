import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBabyStore } from '../../store/babyStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BabyGender } from '../../types';

type Nav = NativeStackNavigationProp<any>;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const AddBabyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { addBaby, isLoading } = useBabyStore();

  const [form, setForm] = useState({
    name: '',
    gender: 'boy' as BabyGender,
    day: '',
    month: '',
    year: '',
    weight: '',
    height: '',
    bloodType: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [step, setStep] = useState<1 | 2>(1);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Baby name is required';
    const day = parseInt(form.day);
    const month = parseInt(form.month);
    const year = parseInt(form.year);
    if (!form.day || isNaN(day) || day < 1 || day > 31) e.day = 'Invalid day';
    if (!form.month || isNaN(month) || month < 1 || month > 12) e.month = 'Invalid month';
    if (!form.year || isNaN(year) || year < 2020 || year > new Date().getFullYear())
      e.year = 'Invalid year';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSave = async () => {
    try {
      const dob = new Date(
        parseInt(form.year),
        parseInt(form.month) - 1,
        parseInt(form.day)
      ).toISOString();

      await addBaby({
        name: form.name.trim(),
        gender: form.gender,
        dateOfBirth: dob,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        bloodType: form.bloodType || undefined,
      });

      Alert.alert('Baby Added! 🎉', `${form.name} has been added to your profile.`, [
        { text: 'Great!', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to add baby');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            if (step === 2) setStep(1);
            else navigation.goBack();
          }}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Baby</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>{step}/2</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.heroArea}>
            <View style={[
              styles.avatarCircle,
              { backgroundColor: form.gender === 'boy' ? Colors.primarySoft : '#FCE4EC' },
            ]}>
              <Text style={styles.avatarEmoji}>
                {/* {form.gender === 'boy' ? '👦' : '👧'} */}
                <Image source={require('../../../assets/icon.png')} style={{ width: 40, height: 40 }} />
              </Text>
            </View>
            <Text style={styles.heroTitle}>Tell us about your little one</Text>
          </View>

          {step === 1 ? (
            <>
              {/* Name */}
              <Input
                label="Child's Name"
                placeholder="Enter your child's name"
                value={form.name}
                onChangeText={set('name')}
                autoCapitalize="words"
                leftIcon="person-outline"
                error={errors.name}
              />



              {/* Date of Birth */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Date of Birth</Text>
                <View style={styles.dobRow}>
                  <Input
                    placeholder="DD"
                    value={form.day}
                    onChangeText={set('day')}
                    keyboardType="number-pad"
                    maxLength={2}
                    containerStyle={{ flex: 1 }}
                    error={errors.day ? ' ' : undefined}
                  />
                  <Input
                    placeholder="MM"
                    value={form.month}
                    onChangeText={set('month')}
                    keyboardType="number-pad"
                    maxLength={2}
                    containerStyle={{ flex: 1 }}
                    error={errors.month ? ' ' : undefined}
                  />
                  <Input
                    placeholder="YYYY"
                    value={form.year}
                    onChangeText={set('year')}
                    keyboardType="number-pad"
                    maxLength={4}
                    containerStyle={{ flex: 2 }}
                    error={errors.year ? ' ' : undefined}
                  />
                </View>
                {(errors.day || errors.month || errors.year) && (
                  <Text style={styles.dobError}>
                    {errors.day || errors.month || errors.year}
                  </Text>
                )}
              </View>

              {/* Gender */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {(['boy', 'girl'] as BabyGender[]).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderBtn,
                        form.gender === g && styles.genderBtnActive,
                        form.gender === g && g === 'girl' && styles.genderBtnGirl,
                      ]}
                      onPress={() => setForm((prev) => ({ ...prev, gender: g }))}
                    >
                      {/* <Text style={styles.genderEmoji}>{g === 'boy' ? '👦' : '👧'}</Text> */}
                      <Text
                        style={[
                          styles.genderLabel,
                          form.gender === g && styles.genderLabelActive,
                        ]}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button label="Save" onPress={handleNext} />
            </>
          ) : (
            <>
              <Text style={styles.optionalNote}>
                Optional — you can fill these in later
              </Text>

              {/* Weight */}
              <Input
                label="Weight (kg)"
                placeholder="e.g. 3.5"
                value={form.weight}
                onChangeText={set('weight')}
                keyboardType="decimal-pad"
                leftIcon="scale-outline"
              />

              {/* Height */}
              <Input
                label="Height (cm)"
                placeholder="e.g. 52"
                value={form.height}
                onChangeText={set('height')}
                keyboardType="decimal-pad"
                leftIcon="resize-outline"
              />

              {/* Blood Type */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Blood Type</Text>
                <View style={styles.bloodTypeGrid}>
                  {BLOOD_TYPES.map((bt) => (
                    <TouchableOpacity
                      key={bt}
                      style={[
                        styles.bloodTypeBtn,
                        form.bloodType === bt && styles.bloodTypeBtnActive,
                      ]}
                      onPress={() =>
                        setForm((prev) => ({
                          ...prev,
                          bloodType: prev.bloodType === bt ? '' : bt,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.bloodTypeText,
                          form.bloodType === bt && styles.bloodTypeTextActive,
                        ]}
                      >
                        {bt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button label="Save Baby Profile" onPress={handleSave} loading={isLoading} />
              <Button
                label="Skip for now"
                variant="ghost"
                onPress={() => navigation.goBack()}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  stepIndicator: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  stepText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.bgInput,
    marginHorizontal: Spacing.xl,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  container: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  heroArea: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  avatarEmoji: { fontSize: 46 },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    textAlign: 'center',
  },
  fieldGroup: { gap: Spacing.sm },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textMedium,
  },
  genderRow: { flexDirection: 'row', gap: Spacing.md },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
  },
  genderBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  genderBtnGirl: {
    borderColor: '#E91E63',
    backgroundColor: '#FCE4EC',
  },
  genderEmoji: { fontSize: 20 },
  genderLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textMedium,
  },
  genderLabelActive: { color: Colors.primary },
  dobRow: { flexDirection: 'row', gap: Spacing.md },
  dobError: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: -Spacing.sm,
  },
  optionalNote: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  bloodTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
  },
  bloodTypeBtnActive: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerSoft,
  },
  bloodTypeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMedium,
  },
  bloodTypeTextActive: { color: Colors.danger },
});
