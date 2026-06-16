import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAuthStore } from '../../store/authStore'
import { useLocaleStore } from '../../store/localeStore'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadows
} from '../../constants/theme'
import { BabyAvatar } from '../../components/BabyAvatar'
import { useTranslation } from '../../i18n/useTranslation'
import type { AppLocale } from '../../types/locale'

// ── Setting Row ───────────────────────────────

const SettingRow: React.FC<{
  icon: string
  label: string
  value?: string
  onPress?: () => void
  toggle?: boolean
  toggleValue?: boolean
  onToggle?: (val: boolean) => void
  danger?: boolean
  isRTL?: boolean
}> = ({
  icon,
  label,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  danger,
  isRTL
}) => (
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
        color={danger ? '#E53935' : '#C07792'}
      />
    </View>
    <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
      {label}
    </Text>
    {toggle ? (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: '#E8D0DC', true: '#FFF0F5' }}
        thumbColor={toggleValue ? '#C07792' : '#fff'}
      />
    ) : (
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {onPress && (
          <View style={isRTL ? styles.chevronFlip : undefined}>
            <Ionicons name="chevron-forward" size={16} color="#A97C8E" />
          </View>
        )}
      </View>
    )}
  </TouchableOpacity>
)

// ── Locale display map ────────────────────────

const localeDisplay: Record<
  AppLocale,
  'settings.langEnglish' | 'settings.langArabic'
> = {
  en: 'settings.langEnglish',
  ar: 'settings.langArabic'
}

// ── Main Screen ───────────────────────────────

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const { user, logout } = useAuthStore()
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const { t, isRTL } = useTranslation()
  const [notifications, setNotifications] = React.useState(true)
  const [cryAlerts, setCryAlerts] = React.useState(true)
  const [vitalAlerts, setVitalAlerts] = React.useState(true)

  const openLanguagePicker = () => {
    Alert.alert(t('settings.languagePickerTitle'), undefined, [
      { text: t('settings.langEnglish'), onPress: () => setLocale('en') },
      { text: t('settings.langArabic'), onPress: () => setLocale('ar') },
      { text: t('common.cancel'), style: 'cancel' }
    ])
  }

  const handleLogout = () => {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: () => logout()
      }
    ])
  }

  const sectionTitleStyle = [styles.sectionTitle, isRTL && styles.alignEnd]

  return (
    <LinearGradient
      colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, isRTL && styles.alignEnd]}>
            {t('settings.title')}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={[styles.profileCard, Shadows.md]}>
            <View style={styles.avatarWrap}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={28} color="#C07792" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isRTL && styles.alignEnd]}>
                {user?.name ?? t('common.user')}
              </Text>
              <Text style={[styles.profileEmail, isRTL && styles.alignEnd]}>
                {user?.email ?? ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="pencil-outline" size={16} color="#C07792" />
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>{t('settings.notifications')}</Text>
            <View style={styles.sectionCard}>
              <SettingRow
                icon="notifications-outline"
                label={t('settings.pushNotifications')}
                toggle
                toggleValue={notifications}
                onToggle={setNotifications}
                isRTL={isRTL}
              />
              <View style={styles.rowDivider} />
              <SettingRow
                icon="ear-outline"
                label={t('settings.cryAlerts')}
                toggle
                toggleValue={cryAlerts}
                onToggle={setCryAlerts}
                isRTL={isRTL}
              />
              <View style={styles.rowDivider} />
              <SettingRow
                icon="heart-outline"
                label={t('settings.vitalSignAlerts')}
                toggle
                toggleValue={vitalAlerts}
                onToggle={setVitalAlerts}
                isRTL={isRTL}
              />
            </View>
          </View>

          {/* Device */}
          {/* <View style={styles.section}>
            <Text style={sectionTitleStyle}>{t('settings.device')}</Text>
            <View style={styles.sectionCard}>
              <SettingRow
                icon="bluetooth-outline"
                label={t('settings.pairNewDevice')}
                onPress={() => {}}
                isRTL={isRTL}
              />
              <View style={styles.rowDivider} />
              <SettingRow
                icon="wifi-outline"
                label={t('settings.connectionStatus')}
                value={t('settings.connected')}
                onPress={() => {}}
                isRTL={isRTL}
              />
              <View style={styles.rowDivider} />
              <SettingRow
                icon="battery-half-outline"
                label={t('settings.deviceBattery')}
                value="82%"
                isRTL={isRTL}
              />
            </View>
          </View> */}

          {/* App */}
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>{t('settings.app')}</Text>
            <View style={styles.sectionCard}>
              <SettingRow
                icon="globe-outline"
                label={t('settings.language')}
                value={t(localeDisplay[locale])}
                onPress={openLanguagePicker}
                isRTL={isRTL}
              />
              <View style={styles.rowDivider} />
              {/* <SettingRow
                icon="moon-outline"
                label={t('settings.darkMode')}
                value={t('settings.system')}
                onPress={() => {}}
                isRTL={isRTL}
              /> */}
              <View style={styles.rowDivider} />
              <SettingRow
                icon="information-circle-outline"
                label={t('settings.appVersion')}
                value="1.0.0"
                isRTL={isRTL}
              />
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>{t('settings.support')}</Text>
            <View style={styles.sectionCard}>
              <SettingRow
                icon="help-circle-outline"
                label={t('settings.helpFaq')}
                onPress={() => navigation.navigate('HelpFaq')}
                isRTL={isRTL}
              />
              <View style={styles.rowDivider} />
              <SettingRow
                icon="mail-outline"
                label={t('settings.contactSupport')}
                onPress={() => navigation.navigate('ContactSupport')}
                isRTL={isRTL}
              />
              <View style={styles.rowDivider} />
              <SettingRow
                icon="document-text-outline"
                label={t('settings.privacyPolicy')}
                onPress={() => navigation.navigate('PrivacyPolicy')}
                isRTL={isRTL}
              />
            </View>
          </View>

          {/* Logout */}
          <View style={styles.section}>
            <View style={styles.sectionCard}>
              <SettingRow
                icon="log-out-outline"
                label={t('settings.logout')}
                onPress={handleLogout}
                danger
                isRTL={isRTL}
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ── Styles ────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#8E5E71'
  },
  alignEnd: { textAlign: 'right' },
  container: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 120 },

  // Profile card — frosted glass on gradient
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#8E5E71'
  },
  profileEmail: { fontSize: FontSize.sm, color: '#A97C8E', marginTop: 2 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Sections
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#A97C8E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.sm
  },
  sectionCard: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.sm
  },

  // Rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    minHeight: 52
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm + 2,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingIconDanger: { backgroundColor: '#FFEBEE' },
  settingLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: '#8E5E71'
  },
  settingLabelDanger: { color: '#E53935' },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  settingValue: { fontSize: FontSize.sm, color: '#A97C8E' },
  chevronFlip: { transform: [{ scaleX: -1 }] },
  rowDivider: {
    height: 1,
    backgroundColor: '#E8D0DC',
    marginLeft: 66
  }
})
