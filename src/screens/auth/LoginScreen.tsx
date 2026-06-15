// ─────────────────────────────────────────────
//  LOGIN SCREEN
//  Field: identifier (accepts email OR phone)
//  Field: password
//  Error: displayed inline from authStore
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
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

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password,   setPassword]   = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  // Clear store error when user starts typing
  useEffect(() => { if (error) clearError(); }, [identifier, password]);

  // ── Validation ────────────────────────────
  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!identifier.trim()) {
      errors.identifier = t('auth.identifierRequired');
    }
    if (!password) {
      errors.password = t('auth.passwordRequired');
    } else if (password.length < 6) {
      errors.password = t('auth.passwordMin6');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(identifier.trim(), password);
      // Navigation handled automatically by RootNavigator
      // watching isAuthenticated in authStore
    } catch {
      // Error already set in store — displayed below
    }
  };

  // ── Forgot Password ───────────────────────
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.loginTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
          </View>

          {/* Global API error */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Fields */}
          <View style={styles.form}>
            <Input
              label={t('auth.emailOrPhone')}
              placeholder={t('auth.emailOrPhonePh')}
              value={identifier}
              onChangeText={(v) => { setIdentifier(v); setFieldErrors(p => ({ ...p, identifier: undefined })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="person-outline"
              error={fieldErrors.identifier}
            />

            <Input
              label={t('auth.password')}
              placeholder={t('auth.passwordPh')}
              value={password}
              onChangeText={(v) => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); }}
              isPassword
              leftIcon="lock-closed-outline"
              error={fieldErrors.password}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <Button
            label={t('auth.signIn')}
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
          />

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{t('auth.noAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>{t('auth.signUp')}</Text>
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
  form:        { gap: Spacing.lg },
  forgotRow:   { alignSelf: 'flex-end' },
  forgotText:  { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto' as any },
  registerText:{ fontSize: FontSize.md, color: Colors.textMuted },
  registerLink:{ fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.bold },
});