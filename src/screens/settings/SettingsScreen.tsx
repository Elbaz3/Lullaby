import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../../store/authStore";
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { BabyAvatar } from '../../components/BabyAvatar';

const SettingRow: React.FC<{
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  danger?: boolean;
}> = ({ icon, label, value, onPress, toggle, toggleValue, onToggle, danger }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={toggle || !onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
      <Ionicons
        name={icon as any}
        size={18}
        color={danger ? Colors.danger : Colors.primary}
      />
    </View>
    <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
      {label}
    </Text>
    {toggle ? (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={toggleValue ? Colors.primary : Colors.white}
      />
    ) : (
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        )}
      </View>
    )}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = React.useState(true);
  const [cryAlerts, setCryAlerts] = React.useState(true);
  const [vitalAlerts, setVitalAlerts] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, Shadows.md]}>
          <View style={styles.avatarWrap}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={28} color={Colors.primary} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="notifications-outline"
              label="Push Notifications"
              toggle
              toggleValue={notifications}
              onToggle={setNotifications}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="ear-outline"
              label="Cry Alerts"
              toggle
              toggleValue={cryAlerts}
              onToggle={setCryAlerts}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="heart-outline"
              label="Vital Sign Alerts"
              toggle
              toggleValue={vitalAlerts}
              onToggle={setVitalAlerts}
            />
          </View>
        </View>

        {/* Device */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="bluetooth-outline"
              label="Pair New Device"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="wifi-outline"
              label="Connection Status"
              value="Connected"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="battery-half-outline"
              label="Device Battery"
              value="82%"
            />
          </View>
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="globe-outline"
              label="Language"
              value="English"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="moon-outline"
              label="Dark Mode"
              value="System"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="information-circle-outline"
              label="App Version"
              value="1.0.0"
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="help-circle-outline"
              label="Help & FAQ"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="mail-outline"
              label="Contact Support"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="document-text-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="log-out-outline"
              label="Logout"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  container: { padding: Spacing.xl, gap: Spacing.lg },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    minHeight: 52,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm + 2,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconDanger: {
    backgroundColor: Colors.dangerSoft,
  },
  settingLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textDark,
  },
  settingLabelDanger: {
    color: Colors.danger,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 66,
  },
});
