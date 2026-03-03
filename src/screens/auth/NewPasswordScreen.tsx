import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

// ── New Password Screen ───────────────────────

type NewPasswordProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'NewPassword'>;
  route: RouteProp<AuthStackParamList, 'NewPassword'>;
};

export const NewPasswordScreen: React.FC<NewPasswordProps> = ({ navigation, route }) => {
  const { email, otp } = route.params;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const { resetPassword, isLoading } = useAuthStore();

  const validate = () => {
    const e: typeof errors = {};
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Min 8 characters';
    if (!confirm) e.confirm = 'Please confirm your password';
    else if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    try {
      await resetPassword({ email, otp, newPassword: password, confirmPassword: confirm });
      navigation.navigate('VerificationSuccess');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to reset password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-open-outline" size={38} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Secure Your Account</Text>
          <Text style={styles.subtitle}>
            Create a new strong password for your account
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="New Password"
            placeholder="Min 8 characters"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
          />
          <Input
            label="Confirm New Password"
            placeholder="Re-enter password"
            value={confirm}
            onChangeText={setConfirm}
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.confirm}
          />
        </View>

        <Button label="Reset Password" onPress={handleReset} loading={isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Verification Success Screen ───────────────

type SuccessProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerificationSuccess'>;
};

export const VerificationSuccessScreen: React.FC<SuccessProps> = ({ navigation }) => {
  return (
    <View style={successStyles.container}>
      <View style={successStyles.circle}>
        <Ionicons name="checkmark" size={60} color={Colors.white} />
      </View>
      <Text style={successStyles.title}>Success!</Text>
      <Text style={successStyles.subtitle}>
        Congratulations, you have successfully authenticated.
      </Text>
      <Button
        label="Continue"
        onPress={() => navigation.navigate('Login')}
        style={successStyles.btn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  container: {
    padding: Spacing.xl,
    paddingTop: Spacing.huge,
    gap: Spacing.xxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { alignItems: 'center', gap: Spacing.sm },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: { gap: Spacing.lg },
});

const successStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.xl,
  },
  btn: {
    marginTop: Spacing.lg,
  },
});
