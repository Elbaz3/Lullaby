// ─────────────────────────────────────────────
//  OTP VERIFICATION SCREEN
//
//  Used for two flows:
//  1. After register  → reason = "verify"
//  2. Forgot password → reason = "reset"
//
//  Params received via navigation:
//  { identifier, reason, mode }
// ─────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../constants/theme';
import { useTranslation } from '../../i18n/useTranslation';

type Nav = NativeStackNavigationProp<any>;
type Params = {
  OTPVerification: {
    identifier: string;     // email or phone — sent to backend
    reason:     'verify' | 'reset';
    mode:       'register' | 'forgot'; // for UI text only
  };
};

const OTP_LENGTH  = 6;
const RESEND_SECS = 60;

export const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<RouteProp<Params, 'OTPVerification'>>();
  const { identifier, reason } = route.params;
  const { t } = useTranslation();

  const { verifyOTP, requestOTP, isLoading, error, clearError } = useAuthStore();

  // OTP digits as array for individual box UI
  const [digits,    setDigits]    = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // ── Countdown timer ───────────────────────
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── OTP input handling ────────────────────
  const handleDigitChange = (val: string, index: number) => {
    if (error) clearError();
    const cleaned = val.replace(/\D/g, '').slice(-1); // digits only, 1 char
    const updated = [...digits];
    updated[index] = cleaned;
    setDigits(updated);

    // Auto-advance to next box
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Backspace on empty box → go to previous
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const otp = digits.join('');

  // ── Submit ────────────────────────────────
const handleVerify = async () => {
  if (otp.length < OTP_LENGTH) return;
  try {
    if (reason === 'reset') {
      // Forgot password: pass identifier + otp to NewPassword
      navigation.navigate('NewPassword', { identifier, otp });
    } else {
      // Registration verify: call verifyOTP then go to onboarding
      await verifyOTP(otp, identifier, reason);
      navigation.navigate('OnboardingWelcome');
    } // Removed the extra }); that was here
  } catch (err) { // Added 'err' or just catch {}
    // Error in store, shown below
    setDigits(Array(OTP_LENGTH).fill('')); // clear boxes on wrong OTP
    inputRefs.current[0]?.focus();
  }
};

  // ── Resend ────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    try {
      await requestOTP(identifier, reason);
      setDigits(Array(OTP_LENGTH).fill(''));
      setCountdown(RESEND_SECS);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch {
      // Error in store
    }
  };

  const maskedIdentifier = identifier.includes('@')
    ? identifier.replace(/(.{2}).+(@.+)/, '$1***$2')
    : identifier.replace(/(\+\d{2})\d+(\d{3})/, '$1***$2');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{t('auth.otpTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.otpSubtitle', { n: OTP_LENGTH })}
              {'\n'}
              <Text style={styles.identifier}>{maskedIdentifier}</Text>
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={ref => { inputRefs.current[i] = ref; }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error  ? styles.otpBoxError : null,
                ]}
                value={digit}
                onChangeText={val => handleDigitChange(val, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={i === 0}
              />
            ))}
          </View>

          {/* Submit */}
          <Button
            label={t('auth.verify')}
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length < OTP_LENGTH}
            size="lg"
          />

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>{t('auth.resendPrompt')}</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={styles.resendLink}>{t('auth.resend')}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>
                {t('auth.resendIn', { s: countdown })}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.white },
  container:   { flex: 1, padding: Spacing.xl, gap: Spacing.xl },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  header:      { alignItems: 'center', gap: Spacing.md },
  iconCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title:       { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:    { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  identifier:  { color: Colors.primary, fontWeight: FontWeight.semibold },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.dangerSoft, borderRadius: Radius.md,
    padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.danger,
  },
  errorText:   { flex: 1, fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.medium },
  otpRow:      { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md },
  otpBox:      {
    width: 48, height: 56, borderRadius: Radius.md,
    borderWidth: 2, borderColor: Colors.border,
    textAlign: 'center', fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold, color: Colors.textDark,
    backgroundColor: Colors.bgInput,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  otpBoxError:  { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
  resendRow:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendText:  { fontSize: FontSize.md, color: Colors.textMuted },
  resendLink:  { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.bold },
  resendTimer: { fontSize: FontSize.md, color: Colors.textMuted },
  resendTimerBold: { fontWeight: FontWeight.bold, color: Colors.textDark },
});