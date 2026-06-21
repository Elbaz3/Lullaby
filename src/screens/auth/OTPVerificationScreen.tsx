import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

// Logic & Theme Imports
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../i18n/useTranslation'
import { Colors, Shadows, Radius } from '../../constants/theme'

type Nav = NativeStackNavigationProp<any>
type Params = {
  OTPVerification: {
    identifier: string // email or phone
    reason: 'verify' | 'reset'
    mode: 'register' | 'forgot'
  }
}

const OTP_LENGTH = 6 // Set to 6 as requested
const RESEND_SECS = 60

export const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const route = useRoute<RouteProp<Params, 'OTPVerification'>>()
  const { identifier, reason } = route.params
  const { t } = useTranslation()

  const { verifyOTP, requestOTP, isLoading, error, clearError } = useAuthStore()

  // ── State ────────────────────────────────────
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(RESEND_SECS)
  const [canResend, setCanResend] = useState(false)
  const [activeInput, setActiveInput] = useState<number>(0)
  const inputRefs = useRef<(TextInput | null)[]>([])

  // ── Timer Logic ───────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Input Handling ────────────────────────────
  const handleDigitChange = (val: string, index: number) => {
    if (error) clearError()
    const cleaned = val.replace(/\D/g, '').slice(-1)
    const updated = [...digits]
    updated[index] = cleaned
    setDigits(updated)

    // Auto-advance to next box
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    // Backspace logic
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const otp = digits.join('')

  // Auto-submit when fully filled
  useEffect(() => {
    if (otp.length === OTP_LENGTH && !isLoading) {
      handleVerify()
    }
  }, [otp])

  // ── Submit Logic ──────────────────────────────
  const handleVerify = async () => {
    if (otp.length < OTP_LENGTH) return
    try {
      if (reason === 'reset') {
        navigation.navigate('NewPassword', { identifier, otp })
      } else {
        await verifyOTP(otp, identifier, reason)
        navigation.navigate('OnboardingWelcome')
      }
    } catch (err) {
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    }
  }

  // ── Resend Logic ──────────────────────────────
  const handleResend = async () => {
    if (!canResend) return
    try {
      await requestOTP(identifier, reason)
      setDigits(Array(OTP_LENGTH).fill(''))
      setCountdown(RESEND_SECS)
      setCanResend(false)
      inputRefs.current[0]?.focus()
    } catch {}
  }

  // ── Masking Helper ────────────────────────────
  const maskedIdentifier = identifier.includes('@')
    ? identifier.replace(/(.{2}).+(@.+)/, '$1***$2')
    : identifier.replace(/(\+\d{2})\d+(\d{3})/, '$1***$2')

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button (UI 1 Style) */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={18} color="#787777" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.otpTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.otpSubtitle', { n: OTP_LENGTH })}
              {'\n'}
              <Text style={styles.identifierTxt}>{maskedIdentifier}</Text>
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#FF0000" />
              <Text style={styles.apiError}>{error}</Text>
            </View>
          )}

          {/* OTP Input Row (6 Boxes) */}
          <View style={styles.otpRow}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputRefs.current[i] = ref
                }}
                style={[
                  styles.otpBox,
                  activeInput === i ? styles.otpBoxActive : null,
                  error ? styles.otpBoxError : null,
                  digit ? styles.otpBoxFilled : null
                ]}
                value={digit}
                onChangeText={(val) => handleDigitChange(val, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                onFocus={() => setActiveInput(i)}
                onBlur={() => setActiveInput(-1)}
                autoFocus={i === 0}
              />
            ))}
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <ActivityIndicator style={{ marginTop: 30 }} color="#C07792" />
          )}

          {/* Timer Section */}
          <View style={styles.timerRow}>
            <Text style={styles.timerText}>
              {t('auth.resendPrompt')}
              {!canResend && (
                <Text style={styles.timerBold}>
                  {' '}
                  {t('auth.resendIn', { s: countdown })}
                </Text>
              )}
            </Text>
          </View>

          {/* Resend Action */}
          {canResend && (
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleResend}
              disabled={isLoading}
            >
              <Ionicons name="refresh-outline" size={16} color="#C07792" />
              <Text style={styles.resendBtnText}>{t('auth.resend')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 40 },
  backBtn: {
    width: 40,
    height: 40,
    marginTop: 20,
    marginLeft: 30,
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8DADC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm
  },
  header: {
    marginTop: 35,
    paddingHorizontal: 36,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: 10
  },
  title: {
    fontWeight: '700',
    fontSize: 26,
    color: '#936174'
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 14,
    color: '#797979',
    lineHeight: 22
  },
  identifierTxt: {
    color: '#C07792',
    fontWeight: '600'
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 36,
    marginTop: 25,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
    gap: 10,
    alignSelf: 'stretch'
  },
  apiError: {
    color: '#FF0000',
    fontSize: 13,
    fontWeight: '500',
    flex: 1
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 50,
    gap: 8, // Reduced gap to fit 6 boxes
    paddingHorizontal: 20
  },
  otpBox: {
    width: 48, // Slightly smaller width to fit 6 boxes
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D8DADC',
    backgroundColor: '#F9F9F9',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#333333'
  },
  otpBoxFilled: {
    borderColor: '#E8D0DC',
    backgroundColor: '#FFFFFF'
  },
  otpBoxActive: {
    borderColor: '#C07792',
    borderWidth: 2,
    backgroundColor: '#FFFFFF'
  },
  otpBoxError: {
    borderColor: '#FF0000',
    backgroundColor: '#FFEBEE'
  },
  timerRow: {
    marginTop: 45
  },
  timerText: {
    fontSize: 14,
    color: '#797979'
  },
  timerBold: {
    color: '#C07792',
    fontWeight: '600'
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
    padding: 10
  },
  resendBtnText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#C07792'
  }
})
