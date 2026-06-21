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
import { useTranslation } from '../../i18n/useTranslation'

// ── Translated Data ──────────────────────────────────────────────────

const POLICY_DATA = {
  en: {
    lastUpdated: 'June 1, 2025',
    introTitle: 'Your privacy matters to us',
    introText:
      'Lullaby is built for families. We are committed to being transparent about how we collect, use, and protect the data you trust us with. Please read this policy carefully.',
    footerText:
      'By using Lullaby you agree to this Privacy Policy. If you do not agree, please discontinue use and contact us to delete your account.',
    sections: [
      {
        icon: 'shield-checkmark-outline',
        title: 'Information We Collect',
        body: `We collect information you provide directly, such as your name, email address, and baby profiles (name, date of birth, gender, weight, and height). We also collect cry audio samples during active detection sessions — these are processed on-device and never stored on our servers.`
      },
      {
        icon: 'eye-outline',
        title: 'How We Use Your Information',
        body: `Your data is used to power growth charts, vaccination schedules, and cry-detection results. We do not sell your personal data to third parties, ever.`
      },
      {
        icon: 'lock-closed-outline',
        title: 'Data Security',
        body: `All data in transit is encrypted with TLS 1.3. Data at rest is encrypted using AES-256. Access is limited to staff who need it to provide support.`
      },
      {
        icon: 'person-outline',
        title: 'Your Rights',
        body: `You have the right to access, correct, or delete your data at any time from your Profile screen or by contacting us at privacy@lullaby.app.`
      }
    ]
  },
  ar: {
    lastUpdated: '١ يونيو ٢٠٢٥',
    introTitle: 'خصوصيتك تهمنا',
    introText:
      'تم بناء Lullaby من أجل العائلات. نحن ملتزمون بالشفافية حول كيفية جمع بياناتك واستخدامها وحمايتها. يرجى قراءة هذه السياسة بعناية.',
    footerText:
      'باستخدامك لـ Lullaby، فإنك توافق على سياسة الخصوصية هذه. إذا كنت لا توافق، يرجى التوقف عن الاستخدام والاتصال بنا لحذف حسابك.',
    sections: [
      {
        icon: 'shield-checkmark-outline',
        title: 'المعلومات التي نجمعها',
        body: `نجمع المعلومات التي تقدمها مباشرة، مثل اسمك وبريدك الإلكتروني وملفات تعريف الطفل (الاسم، تاريخ الميلاد، الجنس، الوزن، والطول). كما نجمع عينات صوت البكاء أثناء جلسات الكشف النشطة - يتم معالجة هذه العينات على الجهاز ولا يتم تخزينها أبدًا على خوادمنا.`
      },
      {
        icon: 'eye-outline',
        title: 'كيفية استخدام معلوماتك',
        body: `تُستخدم بياناتك لتشغيل مخططات النمو وجداول التطعيمات ونتائج تحليل البكاء. نحن لا نبيع بياناتك الشخصية لأطراف ثالثة أبدًا.`
      },
      {
        icon: 'lock-closed-outline',
        title: 'أمن البيانات',
        body: `يتم تشفير جميع البيانات أثناء النقل باستخدام TLS 1.3. البيانات المخزنة مشفرة باستخدام AES-256. يقتصر الوصول على الموظفين الذين يحتاجون إليها لتقديم الدعم.`
      },
      {
        icon: 'person-outline',
        title: 'حقوقك',
        body: `لديك الحق في الوصول إلى بياناتك أو تصحيحها أو حذفها في أي وقت من شاشة ملفك الشخصي أو عبر مراسلتنا على privacy@lullaby.app.`
      }
    ]
  }
}

// ── Sub-Component ────────────────────────────────────────────────────

const PolicySection: React.FC<{
  icon: string
  title: string
  body: string
  isRTL: boolean
}> = ({ icon, title, body, isRTL }) => (
  <View style={styles.policySection}>
    <View
      style={[
        styles.policySectionHeader,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}
    >
      <View style={styles.policyIcon}>
        <Ionicons name={icon as any} size={18} color="#C07792" />
      </View>
      <Text
        style={[
          styles.policySectionTitle,
          { textAlign: isRTL ? 'right' : 'left' }
        ]}
      >
        {title}
      </Text>
    </View>
    <Text
      style={[
        styles.policySectionBody,
        { textAlign: isRTL ? 'right' : 'left' }
      ]}
    >
      {body}
    </Text>
  </View>
)

// ── Main Screen ──────────────────────────────────────────────────────

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation()
  const { t, isRTL, locale } = useTranslation()

  const content = locale === 'ar' ? POLICY_DATA.ar : POLICY_DATA.en
  const rowDir = isRTL ? 'row-reverse' : 'row'
  const textAlign = isRTL ? 'right' : 'left'

  return (
    <LinearGradient
      colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { flexDirection: rowDir }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={22}
              color="#8E5E71"
            />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.privacyPolicy')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro banner */}
          <View
            style={[styles.introBanner, Shadows.sm, { flexDirection: rowDir }]}
          >
            <Ionicons name="shield-half-outline" size={28} color="#C07792" />
            <View
              style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}
            >
              <Text style={styles.introTitle}>{content.introTitle}</Text>
              <Text style={styles.introSub}>
                {isRTL ? 'آخر تحديث: ' : 'Last updated: '}
                {content.lastUpdated}
              </Text>
            </View>
          </View>

          <Text style={[styles.intro, { textAlign }]}>{content.introText}</Text>

          {/* Policy sections */}
          <View style={[styles.card, Shadows.sm]}>
            {content.sections.map((sec, idx) => (
              <View key={sec.title}>
                <PolicySection
                  icon={sec.icon}
                  title={sec.title}
                  body={sec.body}
                  isRTL={isRTL}
                />
                {idx < content.sections.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>

          {/* Footer note */}
          <View style={[styles.footerNote, Shadows.sm]}>
            <Text style={styles.footerText}>{content.footerText}</Text>
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
