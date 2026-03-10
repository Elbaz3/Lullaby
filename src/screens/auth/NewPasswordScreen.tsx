// ─────────────────────────────────────────────
//  NEW PASSWORD SCREEN
//
//  Receives from OTPVerificationScreen:
//    identifier — email or phone
//    otp        — the code the user entered
//
//  Calls POST /auth/verify-forgot-password with:
//    { identifier, otp, password, passwordConfirm }
//
//  On success → VerificationSuccess screen
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView }              from 'react-native-safe-area-context';
import { Ionicons }                  from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp }                 from '@react-navigation/native';
import { useAuthStore }              from '../../store/authStore';
import { Button }                    from '../../components/ui/Button';
import { Input }                     from '../../components/ui/Input';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { AuthStackParamList }        from '../../types';

// ── New Password Screen ───────────────────────
type NewPasswordProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'NewPassword'>;
  route:      RouteProp<AuthStackParamList, 'NewPassword'>;
};

export const NewPasswordScreen: React.FC<NewPasswordProps> = ({ navigation, route }) => {
  const { identifier, otp } = route.params;
  const { verifyForgotPassword, isLoading, error, clearError } = useAuthStore();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [errors,    setErrors]    = useState<{ password?: string; confirm?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!password)              e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    else if (password.length > 20) e.password = 'Maximum 20 characters';
    if (!confirm)               e.confirm  = 'Please confirm your password';
    else if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    try {
      // Single call with all fields — backend verifies OTP and sets password
      await verifyForgotPassword({
        identifier,
        otp,
        password,
        passwordConfirm: confirm,
      });
      navigation.navigate('VerificationSuccess');
    } catch {
      // error shown from store
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed-outline" size={38} color={Colors.primary} />
            </View>
            <Text style={styles.title}>New Password</Text>
            <Text style={styles.subtitle}>
              Create a strong password for{'\n'}
              <Text style={styles.identifierText}>{identifier}</Text>
            </Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="New Password"
              placeholder="Min 6 characters"
              value={password}
              onChangeText={(v) => { setPassword(v); if (error) clearError(); }}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirm}
              onChangeText={(v) => { setConfirm(v); if (error) clearError(); }}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.confirm}
            />
          </View>

          {/* Password strength hint */}
          <View style={styles.hintCard}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.hintText}>
              Password must be 6–20 characters. Use a mix of letters and numbers for a stronger password.
            </Text>
          </View>

          <Button
            label="Reset Password"
            onPress={handleReset}
            loading={isLoading}
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Verification Success Screen ───────────────
type SuccessProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerificationSuccess'>;
};

export const VerificationSuccessScreen: React.FC<SuccessProps> = ({ navigation }) => (
  <View style={successStyles.container}>
    <View style={successStyles.circle}>
      <Ionicons name="checkmark" size={60} color={Colors.white} />
    </View>
    <Text style={successStyles.title}>Password Reset!</Text>
    <Text style={successStyles.subtitle}>
      Your password has been successfully reset.{'\n'}You can now sign in with your new password.
    </Text>
    <Button
      label="Go to Sign In"
      onPress={() => navigation.navigate('Login')}
      style={successStyles.btn}
      size="lg"
    />
  </View>
);

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.white },
  container:   { padding: Spacing.xl, paddingTop: Spacing.xxl, gap: Spacing.xl },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  header:      { alignItems: 'center', gap: Spacing.md },
  iconCircle:  { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', ...Shadows.md },
  title:       { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:    { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 24 },
  identifierText: { color: Colors.primary, fontWeight: FontWeight.semibold },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.dangerSoft, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.danger },
  errorText:   { flex: 1, fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.medium },
  form:        { gap: Spacing.lg },
  hintCard:    { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.primarySoft, borderRadius: Radius.md, padding: Spacing.md },
  hintText:    { flex: 1, fontSize: FontSize.xs, color: Colors.primary, lineHeight: 18 },
});

const successStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.xl },
  circle:    { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.lg },
  title:     { fontSize: FontSize.display, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:  { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.xl },
  btn:       { marginTop: Spacing.lg },
});