import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type Nav = NativeStackNavigationProp<any>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // mock save
    setSaving(false);
    setIsEditing(false);
    Alert.alert('Saved!', 'Your profile has been updated.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.editToggle}
            onPress={() => setIsEditing(e => !e)}
          >
            <Ionicons name={isEditing ? 'close-outline' : 'pencil-outline'} size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoBtn}>
                <Ionicons name="camera-outline" size={16} color={Colors.primary} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
            {!isEditing && (
              <>
                <Text style={styles.profileName}>{user?.fullName}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </>
            )}
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              editable={isEditing}
              leftIcon="person-outline"
              style={!isEditing ? styles.disabledInput : undefined}
            />
            <Input
              label="Email Address"
              value={email}
              editable={false}
              leftIcon="mail-outline"
              style={styles.disabledInput}
              hint="Email cannot be changed"
            />
          </View>

          {/* Change Password */}
          <TouchableOpacity
            style={[styles.changePassBtn, Shadows.sm]}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.changePassLeft}>
              <View style={styles.changePassIcon}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.changePassTitle}>Change Password</Text>
                <Text style={styles.changePassSub}>Update your account password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Account Info */}
          <View style={[styles.infoCard, Shadows.sm]}>
            <Text style={styles.infoCardTitle}>Account Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Status</Text>
              <View style={styles.activeTag}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          </View>

          {isEditing && (
            <Button label="Save Changes" onPress={handleSave} loading={saving} />
          )}

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  editToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  container: { padding: Spacing.xl, gap: Spacing.xl },
  avatarSection: { alignItems: 'center', gap: Spacing.md },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', ...Shadows.md },
  avatarEmoji: { fontSize: 50 },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primarySoft, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  changePhotoText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  profileName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  profileEmail: { fontSize: FontSize.md, color: Colors.textMuted },
  form: { gap: Spacing.lg },
  disabledInput: { color: Colors.textMuted },
  changePassBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  changePassLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  changePassIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  changePassTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textDark },
  changePassSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  infoCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.sm },
  infoCardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textDark, marginBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textDark },
  rowDivider: { height: 1, backgroundColor: Colors.divider },
  activeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.successSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  activeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.success },
});
