// ─────────────────────────────────────────────
//  PROFILE SCREEN
//
//  - Loads profile from GET /api/my-profile on mount
//  - Editable fields: name, dateOfBirth, avatar
//  - PATCH /api/my-profile on save
//  - Avatar: multipart if new file, JSON otherwise
//  - DOB: stored as ISO, displayed as DD/MM/YYYY
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView }              from 'react-native-safe-area-context';
import { Ionicons }                  from '@expo/vector-icons';
import { useNavigation }             from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker              from 'expo-image-picker';
import { useAuthStore }              from '../../store/authStore';
import { Input }                     from '../../components/ui/Input';
import { DatePickerInput }           from '../../components/ui/DatePickerInput';
import { Button }                    from '../../components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';

type Nav = NativeStackNavigationProp<any>;

// ── DOB helpers ───────────────────────────────
const isoToDMY = (iso: string) => {
  const d = new Date(iso);
  return {
    day:   String(d.getUTCDate()).padStart(2, '0'),
    month: String(d.getUTCMonth() + 1).padStart(2, '0'),
    year:  String(d.getUTCFullYear()),
  };
};

const dmyToISO = (day: string, month: string, year: string): string | null => {
  const d = parseInt(day), m = parseInt(month), y = parseInt(year);
  if (!d || !m || !y || y < 1900 || y > new Date().getFullYear()) return null;
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
};

const formatDOB = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, fetchProfile, updateProfile, isLoading, error, clearError } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [fetching,  setFetching]  = useState(true);

  // Form state
  const [name,   setName]   = useState('');
  const [dobISO, setDobISO] = useState<string | null>(null);
  const [photo,  setPhoto]  = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load fresh profile on mount — silently falls back to cached user on error
  useEffect(() => {
    (async () => {
      setFetching(true);
      try { await fetchProfile(); } catch { /* use cached user */ }
      setFetching(false);
    })();
  }, []);

  // Pre-fill form when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhoto(user.avatar ?? null);
      setDobISO(user.dateOfBirth ?? null);
    }
  }, [user?.id]);

  // ── Photo picker ─────────────────────────
  const pickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  // ── Validate ─────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ─────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    clearError();
    try {
      const dateOfBirth = dobISO ?? undefined;
      const newPhoto    = photo?.startsWith('file://') ? photo : null;

      await updateProfile(
        { name: name.trim(), dateOfBirth },
        newPhoto,
      );

      setIsEditing(false);
    } catch {
      // error shown from store
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    // Reset to current user data
    if (user) {
      setName(user.name ?? '');
      setPhoto(user.avatar ?? null);
      setDobISO(user.dateOfBirth ?? null);
    }
    setErrors({});
    clearError();
    setIsEditing(false);
  };

  const isNewPhoto = photo?.startsWith('file://');

  if (fetching) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            style={[styles.editToggle, isEditing && styles.editToggleActive]}
            onPress={() => isEditing ? cancelEdit() : setIsEditing(true)}
          >
            <Ionicons
              name={isEditing ? 'close-outline' : 'pencil-outline'}
              size={20}
              color={isEditing ? Colors.danger : Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={isEditing ? pickPhoto : undefined}
              activeOpacity={isEditing ? 0.8 : 1}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={44} color={Colors.primary} />
                </View>
              )}
              {isEditing && (
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={14} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>

            {!isEditing && (
              <>
                <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
                <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
                {user?.dateOfBirth && (
                  <View style={styles.dobBadge}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
                    <Text style={styles.dobBadgeText}>{formatDOB(user.dateOfBirth)}</Text>
                  </View>
                )}
              </>
            )}

            {isEditing && isNewPhoto && (
              <Text style={styles.photoHint}>New photo selected — will be uploaded on save</Text>
            )}
            {isEditing && photo && !isNewPhoto && (
              <Text style={styles.photoHint}>Tap avatar to change photo</Text>
            )}
          </View>

          {/* Error banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={(v) => { setName(v); clearError(); }}
              editable={isEditing}
              leftIcon="person-outline"
              error={errors.name}
              style={!isEditing ? styles.readOnly : undefined}
            />

            <Input
              label="Email Address"
              value={user?.email ?? ''}
              editable={false}
              leftIcon="mail-outline"
              style={styles.readOnly}
              hint="Email cannot be changed"
            />

            <Input
              label="Phone Number"
              value={user?.phone ?? ''}
              editable={false}
              leftIcon="call-outline"
              style={styles.readOnly}
              hint="Phone cannot be changed"
            />

            {/* Date of Birth */}
            {isEditing ? (
              <DatePickerInput
                label="Date of Birth (optional)"
                value={dobISO}
                onChange={setDobISO}
                maxDate={new Date()}
                minDate={new Date(1900, 0, 1)}
                error={errors.dob}
              />
            ) : (
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} />
                  <View>
                    <Text style={styles.infoRowLabel}>Date of Birth</Text>
                    <Text style={styles.infoRowValue}>{formatDOB(user?.dateOfBirth)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Save button */}
          {isEditing && (
            <Button
              label="Save Changes"
              onPress={handleSave}
              loading={saving || isLoading}
              size="lg"
            />
          )}

          {/* Non-edit actions */}
          {!isEditing && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionRow, Shadows.sm]}
                onPress={() => navigation.navigate('ChangePassword')}
              >
                <View style={[styles.actionIcon, { backgroundColor: Colors.primarySoft }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Change Password</Text>
                  <Text style={styles.actionSub}>Update your account password</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              {/* Account info card */}
              <View style={[styles.infoCard, Shadows.sm]}>
                <Text style={styles.infoCardTitle}>Account Info</Text>
                <View style={styles.infoCardRow}>
                  <Text style={styles.infoCardLabel}>Member Since</Text>
                  <Text style={styles.infoCardValue}>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                      : '—'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoCardRow}>
                  <Text style={styles.infoCardLabel}>Account Status</Text>
                  <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bgMain },
  loadingWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText:  { fontSize: FontSize.md, color: Colors.textMuted },

  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  headerTitle:  { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  editToggle:   { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  editToggleActive: { backgroundColor: Colors.dangerSoft },

  container:    { padding: Spacing.xl, gap: Spacing.xl },

  avatarSection:{ alignItems: 'center', gap: Spacing.md },
  avatarWrap:   { position: 'relative' },
  avatarImg:    { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', ...Shadows.md },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  profileName:  { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  profileEmail: { fontSize: FontSize.md, color: Colors.textMuted },
  dobBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primarySoft, paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full },
  dobBadgeText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  photoHint:    { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },

  errorBanner:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.dangerSoft, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.danger },
  errorText:    { flex: 1, fontSize: FontSize.sm, color: Colors.danger },

  form:         { gap: Spacing.lg },
  readOnly:     { color: Colors.textMuted },

  dobSection:   { gap: Spacing.sm },
  dobLabel:     { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textDark },
  optional:     { fontWeight: FontWeight.regular, color: Colors.textMuted },
  dobRow:       { flexDirection: 'row', gap: Spacing.sm },
  dobInput:     { flex: 1 },
  dobInputYear: { flex: 2 },
  dobError:     { fontSize: FontSize.xs, color: Colors.danger },

  infoRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadows.sm },
  infoRowLeft:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  infoRowLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  infoRowValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textDark, marginTop: 2 },

  actions:      { gap: Spacing.md },
  actionRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  actionIcon:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionInfo:   { flex: 1 },
  actionTitle:  { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textDark },
  actionSub:    { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  infoCard:     { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.sm },
  infoCardTitle:{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textDark, marginBottom: Spacing.sm },
  infoCardRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  infoCardLabel:{ fontSize: FontSize.sm, color: Colors.textMuted },
  infoCardValue:{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textDark },
  divider:      { height: 1, backgroundColor: Colors.divider },
  activeBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.successSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  activeDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  activeText:   { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.success },
});