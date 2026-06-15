// ─────────────────────────────────────────────
//  REGISTER SCREEN
//  Fields: name, email, phone, password, passwordConfirm
//  On success → navigate to OTP screen with email
//  Errors: inline field errors + global API error
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../constants/theme';
import { useTranslation } from '../../i18n/useTranslation';

type Nav = NativeStackNavigationProp<any>;

type FieldErrors = {
  name?:            string;
  email?:           string;
  phone?:           string;
  password?:        string;
  passwordConfirm?: string;
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({
    name:            '',
    email:           '',
    phone:           '',
    password:        '',
    passwordConfirm: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const set = (key: keyof typeof form) => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    if (error) clearError();
  };

  // ── Validation ────────────────────────────
  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!form.name.trim()) {
      errors.name = t('auth.nameRequired');
    } else if (form.name.trim().length < 3) {
      errors.name = t('auth.nameMin3');
    } else if (form.name.trim().length > 20) {
      errors.name = t('auth.nameMax20');
    }

    if (!form.email.trim()) {
      errors.email = t('auth.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = t('auth.emailInvalid');
    }

    if (!form.phone.trim()) {
      errors.phone = t('auth.phoneRequired');
    } else if (!/^\+[0-9]{7,15}$/.test(form.phone.trim())) {
      errors.phone = t('auth.phoneInvalid');
    }

    if (!form.password) {
      errors.password = t('auth.passwordRequired');
    } else if (form.password.length < 6) {
      errors.password = t('auth.passwordMin6');
    } else if (form.password.length > 20) {
      errors.password = t('auth.passwordMax20');
    }

    if (!form.passwordConfirm) {
      errors.passwordConfirm = t('auth.confirmRequired');
    } else if (form.password !== form.passwordConfirm) {
      errors.passwordConfirm = t('auth.passwordsMismatch');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        name:            form.name.trim(),
        email:           form.email.trim().toLowerCase(),
        phone:           form.phone.trim(),
        password:        form.password,
        passwordConfirm: form.passwordConfirm,
      });
      // Navigate to OTP with email + reason="verify"
      navigation.navigate('OTPVerification', {
        email:      form.email.trim().toLowerCase(),
        identifier: form.email.trim().toLowerCase(),
        reason:     'verify',
        mode:       'register',
      });
    } catch {
      // Error already in store, displayed in errorBanner
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
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.registerTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
          </View>

          {/* Global API error */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t('auth.fullName')}
              placeholder={t('auth.fullNamePh')}
              value={form.name}
              onChangeText={set('name')}
              autoCapitalize="words"
              leftIcon="person-outline"
              error={fieldErrors.name}
            />

            <Input
              label={t('auth.emailAddr')}
              placeholder={t('auth.emailPh')}
              value={form.email}
              onChangeText={set('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              error={fieldErrors.email}
            />

            <Input
              label={t('auth.phone')}
              placeholder={t('auth.phonePh')}
              value={form.phone}
              onChangeText={set('phone')}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={fieldErrors.phone}
              hint={t('auth.phoneHint')}
            />

            <Input
              label={t('auth.password')}
              placeholder={t('auth.passwordMinPh')}
              value={form.password}
              onChangeText={set('password')}
              isPassword
              leftIcon="lock-closed-outline"
              error={fieldErrors.password}
            />

            <Input
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPh')}
              value={form.passwordConfirm}
              onChangeText={set('passwordConfirm')}
              isPassword
              leftIcon="lock-closed-outline"
              error={fieldErrors.passwordConfirm}
            />
          </View>

          {/* Submit */}
          <Button
            label={t('auth.createAccount')}
            onPress={handleRegister}
            loading={isLoading}
            size="lg"
          />

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{t('auth.haveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('auth.signInLink')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.white },
  container:   { padding: Spacing.xl, gap: Spacing.xl, flexGrow: 1 },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  header:      { gap: Spacing.sm },
  title:       { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:    { fontSize: FontSize.md, color: Colors.textMuted },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.dangerSoft, borderRadius: Radius.md,
    padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.danger,
  },
  errorBannerText: { flex: 1, fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.medium },
  form:      { gap: Spacing.lg },
  loginRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto' as any, paddingTop: Spacing.lg },
  loginText: { fontSize: FontSize.md, color: Colors.textMuted },
  loginLink: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.bold },
});