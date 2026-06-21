import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Dimensions,
  TextInput,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as ImagePicker from 'expo-image-picker'

// Logic & Theme Imports
import { Colors, Shadows } from '../../constants/theme'
import { useBabyStore } from '../../store/babyStore'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../i18n/useTranslation'

const { width } = Dimensions.get('window')
type Nav = NativeStackNavigationProp<any>

type Gender = 'male' | 'female'
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
const BLOOD_TYPES: BloodType[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+' | 'AB-',
  'O+',
  'O-'
]

export const OnboardingAddBabyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()
  const { addBaby } = useBabyStore()
  const { completeOnboarding } = useAuthStore()

  // ── State ────────────────────────────────────
  const [photo, setPhoto] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bloodType, setBloodType] = useState<BloodType | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Photo Logic ──────────────────────────────
  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          t('onboarding.permPhotoTitle'),
          t('onboarding.permPhotoBody')
        )
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      })
      if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri)
    } catch {
      Alert.alert(
        t('onboarding.pickerUnavailableTitle'),
        t('onboarding.pickerUnavailableBody')
      )
    }
  }

  // ── Validation ──────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2)
      e.name = t('onboarding.nameMin2')
    if (!gender) e.gender = t('onboarding.selectGender')
    if (!day || !month || !year) e.dob = t('addBaby.dobRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Save Logic ───────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      // Construct date string YYYY-MM-DD
      const dateBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

      await addBaby(
        {
          name: name.trim(),
          gender: gender!,
          dateBirth,
          height: height ? Number(height) : undefined,
          wight: weight ? Number(weight) : undefined, // Backend expects 'wight'
          bloodType: bloodType ?? undefined
        },
        photo
      )

      completeOnboarding()
      navigation.navigate('OnboardingConnectDevice', {
        babyName: name.trim(),
        babyPhoto: photo
      })
    } catch (err: any) {
      Alert.alert(
        t('addBaby.errorTitle'),
        err.message || t('onboarding.saveFailed')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={18} color="#787777" />
          </TouchableOpacity>

          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              onPress={handlePickPhoto}
              style={styles.photoFrame}
              activeOpacity={0.8}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.babyImg} />
              ) : (
                <Image
                  source={require('../../../assets/icon.png')}
                  style={styles.placeholderIcon}
                  resizeMode="contain"
                />
              )}
              <View style={styles.photoBadge}>
                <Ionicons name="pencil" size={14} color="#C07792" />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>
              {t('onboarding.photoHintOptional')}
            </Text>
          </View>

          <Text style={styles.mainTitle}>
            {t('onboarding.addDetailsSubtitle')}
          </Text>

          {/* Child's Name */}
          <View style={styles.inputGroup}>
            <View style={styles.floatingLabel}>
              <Text style={styles.labelTxt}>{t('addBaby.babyName')}</Text>
            </View>
            <TextInput
              style={[styles.rectInput, errors.name && styles.inputError]}
              value={name}
              onChangeText={(v) => {
                setName(v)
                setErrors({ ...errors, name: '' })
              }}
              placeholder={t('addBaby.babyNamePh')}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          {/* Date of Birth (3-Part UI) */}
          <View style={styles.dateSection}>
            <Text style={styles.labelTxt}>{t('addBaby.dob')}</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={styles.dateField}
                placeholder="DD"
                value={day}
                onChangeText={setDay}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={styles.dateField}
                placeholder="MM"
                value={month}
                onChangeText={setMonth}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={styles.dateField}
                placeholder="YYYY"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            {errors.dob ? (
              <Text style={styles.errorText}>{errors.dob}</Text>
            ) : null}
          </View>

          {/* Weight & Height */}
          <View style={styles.measurementsRow}>
            <View style={styles.weightContainer}>
              <View style={styles.floatingLabel}>
                <Text style={styles.labelTxt}>{t('addBaby.weightKg')}</Text>
              </View>
              <TextInput
                style={styles.measureInput}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="0.0"
              />
            </View>
            <View style={styles.heightContainer}>
              <View style={styles.floatingLabel}>
                <Text style={styles.labelTxt}>{t('addBaby.heightCm')}</Text>
              </View>
              <TextInput
                style={styles.measureInput}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                placeholder="0"
              />
            </View>
          </View>

          {/* Blood Type Grid */}
          <Text style={styles.sectionLabel}>
            {t('addBaby.bloodType')} {t('addBaby.optional')}
          </Text>
          <View style={styles.bloodGrid}>
            {BLOOD_TYPES.map((bt) => (
              <TouchableOpacity
                key={bt}
                onPress={() => setBloodType(bloodType === bt ? null : bt)}
                style={[
                  styles.bloodBtn,
                  bloodType === bt && styles.bloodBtnSelected
                ]}
              >
                <Text
                  style={[
                    styles.bloodText,
                    bloodType === bt && { color: '#C07792' }
                  ]}
                >
                  {bt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Gender Buttons */}
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === 'male' ? styles.gActive : styles.gInactive
              ]}
              onPress={() => {
                setGender('male')
                setErrors({ ...errors, gender: '' })
              }}
            >
              <Text
                style={[
                  styles.gText,
                  gender === 'male' ? { color: '#FFF' } : { color: '#C07792' }
                ]}
              >
                {t('addBaby.male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === 'female' ? styles.gActive : styles.gInactive
              ]}
              onPress={() => {
                setGender('female')
                setErrors({ ...errors, gender: '' })
              }}
            >
              <Text
                style={[
                  styles.gText,
                  gender === 'female' ? { color: '#FFF' } : { color: '#C07792' }
                ]}
              >
                {t('addBaby.female')}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.gender ? (
            <Text style={[styles.errorText, { textAlign: 'center' }]}>
              {errors.gender}
            </Text>
          ) : null}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveText}>
                {t('onboarding.saveContinue')}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  scrollContainer: { paddingBottom: 60 },
  backBtn: {
    width: 35,
    height: 35,
    marginTop: 10,
    marginLeft: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8DADC',
    alignItems: 'center',
    justifyContent: 'center'
  },

  avatarContainer: { marginTop: 10, alignItems: 'center' },
  photoFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#C0779220',
    borderWidth: 1,
    borderColor: '#E8D0DC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  babyImg: { width: '100%', height: '100%' },
  placeholderIcon: { width: 80, height: 80, opacity: 0.6 },
  photoBadge: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    width: 30,
    height: 30,
    backgroundColor: '#FFF',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm
  },
  photoHint: { fontSize: 11, color: '#A97C8E', marginTop: 8 },

  mainTitle: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 25,
    fontWeight: '600',
    fontSize: 20,
    textAlign: 'center',
    color: '#936174',
    lineHeight: 24
  },

  inputGroup: { width: width - 40, alignSelf: 'center', marginTop: 30 },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 15,
    zIndex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 6
  },
  labelTxt: { fontWeight: '500', fontSize: 13, color: '#C07792' },
  rectInput: {
    width: '100%',
    height: 48,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#C07792',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    color: '#4A3B40'
  },
  inputError: { borderColor: '#E53935' },
  errorText: { color: '#E53935', fontSize: 11, marginTop: 4, marginLeft: 5 },

  dateSection: { width: width - 40, alignSelf: 'center', marginTop: 25 },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  dateField: {
    width: (width - 60) / 3,
    height: 44,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#C07792',
    textAlign: 'center',
    fontSize: 14,
    color: '#4A3B40'
  },

  measurementsRow: {
    flexDirection: 'row',
    width: width - 40,
    alignSelf: 'center',
    marginTop: 30,
    gap: 10
  },
  weightContainer: { flex: 1 },
  heightContainer: { flex: 1 },
  measureInput: {
    width: '100%',
    height: 48,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#C07792',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    color: '#4A3B40'
  },

  sectionLabel: {
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 12,
    fontWeight: '500',
    fontSize: 14,
    color: '#C07792'
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  bloodBtn: {
    width: 65,
    height: 42,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F0D5E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  bloodBtnSelected: { borderColor: '#C07792', backgroundColor: '#FFF0F5' },
  bloodText: { fontWeight: '600', fontSize: 16, color: '#CEAFBB' },

  genderRow: {
    flexDirection: 'row',
    width: width - 40,
    alignSelf: 'center',
    marginTop: 35,
    gap: 15
  },
  genderBtn: {
    flex: 1,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm
  },
  gActive: { backgroundColor: '#C07792' },
  gInactive: {
    backgroundColor: '#FDF2F5',
    borderWidth: 1,
    borderColor: '#F8C8DC'
  },
  gText: { fontWeight: '700', fontSize: 15 },

  saveBtn: {
    width: width * 0.6,
    height: 50,
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 25,
    backgroundColor: '#C07792',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md
  },
  saveText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
})
