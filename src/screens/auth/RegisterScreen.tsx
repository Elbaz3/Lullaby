import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

// Logic & Theme Imports
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../i18n/useTranslation'
import { Colors, Shadows } from '../../constants/theme'
import { AuthStackParamList } from '../../types'

const { width, height } = Dimensions.get('window')
type Nav = NativeStackNavigationProp<AuthStackParamList>

type FieldErrors = {
  name?: string
  email?: string
  phone?: string
  password?: string
  passwordConfirm?: string
}

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()
  const { register, isLoading, error, clearError } = useAuthStore()

  // ── Form State ────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+20',
    password: '',
    passwordConfirm: ''
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [secureText, setSecureText] = useState(true)
  const [secureConfirm, setSecureConfirm] = useState(true)

  // Clear global error when user types
  const set = (key: keyof typeof form) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    if (error) clearError()
  }

  // ── Validation Logic ────────────────────────────
  const validate = (): boolean => {
    const errors: FieldErrors = {}

    if (!form.name.trim()) {
      errors.name = t('auth.nameRequired')
    } else if (form.name.trim().length < 3) {
      errors.name = t('auth.nameMin3')
    }

    if (!form.email.trim()) {
      errors.email = t('auth.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = t('auth.emailInvalid')
    }

    if (!form.phone.trim() || form.phone === '+20') {
      errors.phone = t('auth.phoneRequired')
    } else if (!/^\+[0-9]{7,15}$/.test(form.phone.trim())) {
      errors.phone = t('auth.phoneInvalid')
    }

    if (!form.password) {
      errors.password = t('auth.passwordRequired')
    } else if (form.password.length < 6) {
      errors.password = t('auth.passwordMin6')
    }

    if (!form.passwordConfirm) {
      errors.passwordConfirm = t('auth.confirmRequired')
    } else if (form.password !== form.passwordConfirm) {
      errors.passwordConfirm = t('auth.passwordsMismatch')
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Submit Logic ────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        passwordConfirm: form.passwordConfirm
      })

      navigation.navigate('OTPVerification', {
        email: form.email.trim().toLowerCase(),
        identifier: form.email.trim().toLowerCase(),
        reason: 'verify',
        mode: 'register'
      })
    } catch (e) {
      // Error handled by store
    }
  }

  return (
    <View style={styles.flex}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={24} color="#936174" />
              </TouchableOpacity>
              <Text style={styles.title}>
                {t('auth.registerTitle').replace(' 🍼', '')}
              </Text>
              <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
            </View>

            {/* Global API error */}
            {error && (
              <View style={styles.apiErrorBox}>
                <Ionicons name="alert-circle" size={18} color="#FF0000" />
                <Text style={styles.apiErrorText}>{error}</Text>
              </View>
            )}

            {/* Form Frame */}
            <View style={styles.formFrame}>
              {/* Name Input */}
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.name && styles.inputError
                ]}
              >
                <Ionicons name="person-outline" size={18} color="#936174" />
                <TextInput
                  placeholder={t('auth.fullNamePh')}
                  placeholderTextColor="#797979"
                  style={styles.input}
                  value={form.name}
                  onChangeText={set('name')}
                />
              </View>
              {fieldErrors.name && (
                <Text style={styles.errorText}>{fieldErrors.name}</Text>
              )}

              {/* Email Input */}
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.email && styles.inputError
                ]}
              >
                <Ionicons name="mail-outline" size={18} color="#936174" />
                <TextInput
                  placeholder={t('auth.emailPh')}
                  placeholderTextColor="#797979"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={set('email')}
                />
              </View>
              {fieldErrors.email && (
                <Text style={styles.errorText}>{fieldErrors.email}</Text>
              )}

              {/* Phone Input */}
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.phone && styles.inputError
                ]}
              >
                <Ionicons name="call-outline" size={18} color="#936174" />
                <TextInput
                  placeholder={t('auth.phonePh')}
                  placeholderTextColor="#797979"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={set('phone')}
                />
              </View>
              {fieldErrors.phone && (
                <Text style={styles.errorText}>{fieldErrors.phone}</Text>
              )}

              {/* Password Input */}
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.password && styles.inputError
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#936174"
                />
                <TextInput
                  placeholder={t('auth.password')}
                  placeholderTextColor="#797979"
                  secureTextEntry={secureText}
                  style={styles.input}
                  value={form.password}
                  onChangeText={set('password')}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                  <Ionicons
                    name={secureText ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#936174"
                  />
                </TouchableOpacity>
              </View>
              {fieldErrors.password && (
                <Text style={styles.errorText}>{fieldErrors.password}</Text>
              )}

              {/* Confirm Password */}
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.passwordConfirm && styles.inputError
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#936174"
                />
                <TextInput
                  placeholder={t('auth.confirmPassword')}
                  placeholderTextColor="#797979"
                  secureTextEntry={secureConfirm}
                  style={styles.input}
                  value={form.passwordConfirm}
                  onChangeText={set('passwordConfirm')}
                />
                <TouchableOpacity
                  onPress={() => setSecureConfirm(!secureConfirm)}
                >
                  <Ionicons
                    name={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#936174"
                  />
                </TouchableOpacity>
              </View>
              {fieldErrors.passwordConfirm && (
                <Text style={styles.errorText}>
                  {fieldErrors.passwordConfirm}
                </Text>
              )}

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && { opacity: 0.8 }]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.signUp')}</Text>
                )}
              </TouchableOpacity>

              {/* OR Divider */}
              <View style={styles.orRow}>
                <View style={styles.line} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.line} />
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>{t('auth.signInLink')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: {
    marginTop: height * 0.03,
    paddingHorizontal: 30,
    gap: 5
  },
  backBtn: {
    marginBottom: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm
  },
  title: {
    fontWeight: '700',
    fontSize: 32,
    color: '#936174',
    lineHeight: 38
  },
  subtitle: {
    fontSize: 14,
    color: '#737373'
  },
  apiErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 30,
    marginTop: 15,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
    gap: 8
  },
  apiErrorText: {
    color: '#FF0000',
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  },
  formFrame: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%'
  },
  inputWrapper: {
    width: width * 0.85,
    height: 52,
    backgroundColor: '#FFFFFFCC',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 12
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF000055'
  },
  errorText: {
    width: width * 0.8,
    color: '#FF0000',
    fontSize: 10,
    marginTop: 4,
    marginLeft: 5,
    alignSelf: 'flex-start'
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 10
  },
  button: {
    width: width * 0.85,
    height: 55,
    backgroundColor: '#C07792',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    ...Shadows.md
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF'
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    width: width * 0.85
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#8080804D'
  },
  orText: {
    fontSize: 12,
    color: '#6E6E6E',
    marginHorizontal: 15
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20
  },
  socialBtn: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 15,
    ...Shadows.sm
  },
  iconImg: {
    width: 24,
    height: 24
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25
  },
  footerText: {
    fontSize: 13,
    color: '#6E6E6E'
  },
  footerLink: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#C07792',
    marginLeft: 5
  }
})
