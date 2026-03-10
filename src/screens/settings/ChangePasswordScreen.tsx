import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

    const { changePassword, isLoading, error, clearError } = useAuthStore();
  

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.current) e.current = 'Current password is required';
    if (!form.newPass) e.newPass = 'New password is required';
    else if (form.newPass.length < 8) e.newPass = 'Min 8 characters';
    else if (form.newPass === form.current) e.newPass = 'Must be different from current password';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.newPass !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    Alert.alert('Password Changed!', 'Your password has been updated successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

    const handleSend = async () => {
    if (!validate()) return;
    try {
      await changePassword(form.current, form.newPass, form.confirm);
      Alert.alert('Password Changed!', 'Your password has been updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      // error shown from store
    }
  }

  const requirements = [
    { label: 'At least 8 characters', met: form.newPass.length >= 8 },
    { label: 'Different from current password', met: form.newPass !== form.current && form.newPass.length > 0 },
    { label: 'Passwords match', met: form.newPass === form.confirm && form.confirm.length > 0 },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Icon */}
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed-outline" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.subtitle}>
              Create a strong password to keep your account secure
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Current Password"
              placeholder="Enter current password"
              value={form.current}
              onChangeText={set('current')}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.current}
            />
            <Input
              label="New Password"
              placeholder="Min 8 characters"
              value={form.newPass}
              onChangeText={set('newPass')}
              isPassword
              leftIcon="lock-open-outline"
              error={errors.newPass}
            />
            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={form.confirm}
              onChangeText={set('confirm')}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.confirm}
            />
          </View>

          {/* Requirements */}
          {form.newPass.length > 0 && (
            <View style={styles.requirements}>
              <Text style={styles.reqTitle}>Password Requirements</Text>
              {requirements.map(req => (
                <View key={req.label} style={styles.reqRow}>
                  <Ionicons
                    name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={req.met ? Colors.success : Colors.textMuted}
                  />
                  <Text style={[styles.reqText, req.met && styles.reqTextMet]}>
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Button label="Update Password" onPress={handleSend} loading={loading} />
          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  container: { padding: Spacing.xl, gap: Spacing.xl },
  iconSection: { alignItems: 'center', gap: Spacing.md },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', ...Shadows.md },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  form: { gap: Spacing.lg },
  requirements: { backgroundColor: Colors.bgInput, borderRadius: 12, padding: Spacing.lg, gap: Spacing.sm },
  reqTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textDark, marginBottom: 4 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reqText: { fontSize: FontSize.sm, color: Colors.textMuted },
  reqTextMet: { color: Colors.success },
});
