import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import {
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadows
} from '../../constants/theme'

const LAST_UPDATED = 'June 1, 2025'

const SECTIONS = [
  {
    icon: 'shield-checkmark-outline',
    title: 'Information We Collect',
    body: `We collect information you provide directly, such as your name, email address, and baby profiles (name, date of birth, gender, weight, and height). We also collect cry audio samples during active detection sessions — these are processed on-device and never stored on our servers.\n\nWe automatically collect basic usage data (feature interactions, crash reports) to improve the app.`
  },
  {
    icon: 'eye-outline',
    title: 'How We Use Your Information',
    body: `Your data is used to:\n• Power growth charts, vaccination schedules, and cry-detection results\n• Send you reminders and alerts you have enabled\n• Improve our AI models in aggregate, anonymised form\n• Respond to your support requests\n\nWe do not sell your personal data to third parties, ever.`
  },
  {
    icon: 'lock-closed-outline',
    title: 'Data Security',
    body: `All data in transit is encrypted with TLS 1.3. Data at rest is encrypted using AES-256. We conduct regular third-party security audits and follow OWASP mobile security guidelines.\n\nAccess to personal data within our team is limited to staff who need it to provide support or improve the service.`
  },
  {
    icon: 'share-social-outline',
    title: 'Sharing Your Data',
    body: `We share data only in the following limited circumstances:\n• With cloud infrastructure providers (AWS, encrypted) who process data on our behalf\n• With analytics providers (anonymised, aggregated only)\n• When required by law or to protect the safety of our users\n\nWe will always notify you if a legal request seeks access to your identifiable data, unless prohibited from doing so.`
  },
  {
    icon: 'person-outline',
    title: 'Your Rights',
    body: `You have the right to:\n• Access all personal data we hold about you\n• Correct inaccurate data at any time from your Profile screen\n• Delete your account and all associated data permanently\n• Export your data in a portable format\n• Withdraw consent for optional data processing at any time\n\nTo exercise any of these rights, contact us at privacy@babybloom.app.`
  },
  {
    icon: 'people-outline',
    title: "Children's Privacy",
    body: `BabyBloom is designed for parents and caregivers. The app accounts registered by users must belong to adults (18+). We do not knowingly collect personal data directly from children. Baby profile data entered by a parent or caregiver is protected under the same policies as adult user data.`
  },
  {
    icon: 'notifications-outline',
    title: 'Cookies & Tracking',
    body: `Our mobile app does not use browser cookies. We use a minimal set of first-party analytics events to understand feature usage. You can opt out of analytics at any time in Settings → App → Analytics.`
  },
  {
    icon: 'refresh-outline',
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you via push notification and display the updated date at the top of this page. Continued use of the app after notification constitutes acceptance.`
  },
  {
    icon: 'mail-outline',
    title: 'Contact',
    body: `For privacy-specific questions or requests:\n\nEmail: privacy@babybloom.app\nMailing address: BabyBloom Inc., 123 Bloom Street, Cairo, Egypt\n\nFor general support, visit the Contact Support page.`
  }
]

const PolicySection: React.FC<{
  icon: string
  title: string
  body: string
}> = ({ icon, title, body }) => (
  <View style={styles.policySection}>
    <View style={styles.policySectionHeader}>
      <View style={styles.policyIcon}>
        <Ionicons name={icon as any} size={18} color="#C07792" />
      </View>
      <Text style={styles.policySectionTitle}>{title}</Text>
    </View>
    <Text style={styles.policySectionBody}>{body}</Text>
  </View>
)

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation()

  return (
    <LinearGradient
      colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#8E5E71" />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy Policy</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro banner */}
          <View style={[styles.introBanner, Shadows.sm]}>
            <Ionicons name="shield-half-outline" size={28} color="#C07792" />
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>Your privacy matters to us</Text>
              <Text style={styles.introSub}>Last updated: {LAST_UPDATED}</Text>
            </View>
          </View>

          <Text style={styles.intro}>
            BabyBloom is built for families. We are committed to being
            transparent about how we collect, use, and protect the data you
            trust us with. Please read this policy carefully.
          </Text>

          {/* Policy sections */}
          <View style={[styles.card, Shadows.sm]}>
            {SECTIONS.map((sec, idx) => (
              <View key={sec.title}>
                <PolicySection
                  icon={sec.icon}
                  title={sec.title}
                  body={sec.body}
                />
                {idx < SECTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Footer note */}
          <View style={[styles.footerNote, Shadows.sm]}>
            <Text style={styles.footerText}>
              By using BabyBloom you agree to this Privacy Policy. If you do not
              agree, please discontinue use and contact us to delete your
              account.
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF88',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#8E5E71'
  },
  container: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 120 },

  introBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.xl,
    padding: Spacing.lg
  },
  introTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#8E5E71'
  },
  introSub: { fontSize: FontSize.xs, color: '#A97C8E', marginTop: 2 },

  intro: {
    fontSize: FontSize.sm,
    color: '#8E5E71',
    lineHeight: 22,
    paddingHorizontal: Spacing.xs
  },

  card: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.xl,
    overflow: 'hidden'
  },

  policySection: { padding: Spacing.lg },
  policySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm
  },
  policyIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm + 2,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  policySectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#8E5E71',
    flex: 1
  },
  policySectionBody: {
    fontSize: FontSize.sm,
    color: '#A97C8E',
    lineHeight: 22
  },
  divider: {
    height: 1,
    backgroundColor: '#E8D0DC',
    marginHorizontal: Spacing.lg
  },

  footerNote: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.lg,
    padding: Spacing.md
  },
  footerText: {
    fontSize: FontSize.xs,
    color: '#A97C8E',
    lineHeight: 18,
    textAlign: 'center'
  }
})
