// ─────────────────────────────────────────────
//  FORGOT PASSWORD SCREEN
//  Sends OTP with reason="reset" to the identifier
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../constants/theme';

type Nav = NativeStackNavigationProp<any>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { requestOTP, isLoading, error, clearError } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [fieldError, setFieldError] = useState<string>();

  const validate = () => {
    if (!identifier.trim()) { setFieldError('Email or phone is required'); return false; }
    setFieldError(undefined);
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    try {
      await requestOTP(identifier.trim(), 'reset');
      navigation.navigate('OTPVerification', {
        identifier: identifier.trim(),
        reason:     'reset',
        mode:       'forgot',
      });
    } catch {
      // error shown from store
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-open-outline" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter your email or phone number and we'll send you a reset code.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email or Phone"
            placeholder="Enter your email or phone"
            value={identifier}
            onChangeText={(v) => { setIdentifier(v); setFieldError(undefined); if (error) clearError(); }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="person-outline"
            error={fieldError}
          />

          <Button label="Send Reset Code" onPress={handleSend} loading={isLoading} size="lg" />

          <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.navigate('Login')}>
            <Ionicons name="arrow-back" size={16} color={Colors.primary} />
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.white },
  container:   { flex: 1, padding: Spacing.xl, gap: Spacing.xl },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  header:      { alignItems: 'center', gap: Spacing.md },
  iconCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title:       { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:    { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.dangerSoft, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.danger },
  errorText:   { flex: 1, fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.medium },
  backToLogin: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  backToLoginText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.medium },
});