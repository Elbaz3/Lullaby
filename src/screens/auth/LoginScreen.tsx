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

const { width, height } = Dimensions.get('window')
type Nav = NativeStackNavigationProp<any>

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()
  const { login, isLoading, error, clearError } = useAuthStore()

  // ── State ────────────────────────────────────
  const [identifier, setIdentifier] = useState('') // email or phone
  const [password, setPassword] = useState('')
  const [secureText, setSecureText] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string
    password?: string
  }>({})

  // Clear global error when user types
  useEffect(() => {
    if (error) clearError()
  }, [identifier, password])

  // ── Validation Logic ────────────────────────────
  const validate = (): boolean => {
    const errors: typeof fieldErrors = {}
    if (!identifier.trim()) {
      errors.identifier = t('auth.identifierRequired')
    }
    if (!password) {
      errors.password = t('auth.passwordRequired')
    } else if (password.length < 6) {
      errors.password = t('auth.passwordMin6')
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Submit Logic ────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return
    try {
      await login(identifier.trim().toLowerCase(), password)
      // Navigation is handled by RootNavigator watching authStore status
    } catch (e) {
      // Errors handled via store
    }
  }

  return (
    <View style={styles.flex}>
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
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={20} color="#787777" />
            </TouchableOpacity>

            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {t('auth.loginTitle').replace(' 👋', '')}
              </Text>
              <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
            </View>

            {/* Global API error banner */}
            {error && (
              <View style={styles.apiErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#FF0000" />
                <Text style={styles.apiErrorText}>{error}</Text>
              </View>
            )}

            {/* Form Frame */}
            <View style={styles.formFrame}>
              {/* Identifier Input (Email or Phone) */}
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.identifier && styles.inputErrorStyle
                ]}
              >
                <Ionicons name="person-outline" size={18} color="#936174" />
                <TextInput
                  placeholder={t('auth.emailOrPhonePh')}
                  placeholderTextColor="#797979"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={identifier}
                  onChangeText={(v) => {
                    setIdentifier(v)
                    setFieldErrors((p) => ({ ...p, identifier: undefined }))
                  }}
                />
              </View>
              {fieldErrors.identifier && (
                <Text style={styles.errorText}>{fieldErrors.identifier}</Text>
              )}

              {/* Password Input */}
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.password && styles.inputErrorStyle
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#936174"
                />
                <TextInput
                  placeholder={t('auth.passwordPh')}
                  placeholderTextColor="#797979"
                  secureTextEntry={secureText}
                  style={styles.input}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v)
                    setFieldErrors((p) => ({ ...p, password: undefined }))
                  }}
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

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotText}>
                  {t('auth.forgotPassword')}
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && { opacity: 0.8 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.signIn')}</Text>
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
                <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.footerLink}>{t('auth.signUp')}</Text>
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
  backBtn: {
    width: 35,
    height: 35,
    marginTop: 20,
    marginLeft: 25,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8DADC'
  },
  header: {
    marginTop: 30,
    paddingHorizontal: 35,
    gap: 5
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
    marginTop: 25,
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
    marginTop: 15
  },
  inputErrorStyle: {
    borderWidth: 1,
    borderColor: '#FF000055'
  },
  errorText: {
    width: width * 0.8,
    color: '#FF0000',
    fontSize: 10,
    marginTop: 5,
    marginLeft: 5,
    alignSelf: 'flex-start'
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 10
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginRight: width * 0.08,
    marginTop: 12
  },
  forgotText: {
    fontSize: 12,
    color: '#936174',
    textDecorationLine: 'underline',
    fontWeight: '500'
  },
  button: {
    width: width * 0.85,
    height: 55,
    backgroundColor: '#C07792',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
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
    marginTop: 35,
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
    marginTop: 30
  },
  footerText: {
    fontSize: 13,
    color: '#6E6E6E'
  },
  footerLink: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#C07792',
    marginLeft: 4
  }
})
