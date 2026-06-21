import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager
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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

// ── Translated Data ──────────────────────────────────────────────────

const FAQ_DATA = {
  en: [
    {
      category: 'Getting Started',
      items: [
        {
          q: 'How do I add my baby?',
          a: "Tap the Babies tab at the bottom of the screen, then press the + button. Fill in your baby's name, date of birth, and gender."
        },
        {
          q: 'Can I track multiple babies?',
          a: 'Yes! Lullaby supports multiple babies in a single account. Each baby has their own profile, growth data, and vaccination record.'
        },
        {
          q: 'Is my data backed up?',
          a: 'All data is securely synced to the cloud automatically whenever you have an internet connection.'
        }
      ]
    },
    {
      category: 'Cry Detection',
      items: [
        {
          q: 'How does cry detection work?',
          a: 'Our AI model analyzes your baby\'s cry and classifies it into categories like hunger, discomfort, or pain. Tap "Start Listening" near your baby.'
        },
        {
          q: 'Does it work offline?',
          a: 'Yes, cry detection runs fully on-device and works without an internet connection.'
        }
      ]
    },
    {
      category: 'Vaccinations',
      items: [
        {
          q: 'Where does the schedule come from?',
          a: 'The schedule follows WHO recommendations. Your local schedule may differ — always confirm with your pediatrician.'
        }
      ]
    }
  ],
  ar: [
    {
      category: 'البداية',
      items: [
        {
          q: 'كيف يمكنني إضافة طفلي؟',
          a: 'اضغط على تبويب "الأطفال" أسفل الشاشة، ثم اضغط على زر +. أدخل اسم طفلك وتاريخ ميلاده وجنسه.'
        },
        {
          q: 'هل يمكنني تتبع أكثر من طفل؟',
          a: 'نعم! يدعم تطبيق Lullaby عدة أطفال في حساب واحد. كل طفل لديه ملفه الشخصي وبيانات نموه الخاصة.'
        },
        {
          q: 'هل بياناتي محفوظة؟',
          a: 'يتم مزامنة جميع البيانات بشكل آمن مع السحابة تلقائيًا عندما يكون لديك اتصال بالإنترنت.'
        }
      ]
    },
    {
      category: 'تحليل البكاء',
      items: [
        {
          q: 'كيف يعمل تحليل البكاء؟',
          a: 'يقوم نموذج الذكاء الاصطناعي لدينا بتحليل بكاء طفلك وتصنيفه إلى فئات مثل الجوع أو الانزعاج أو الألم.'
        },
        {
          q: 'هل يعمل بدون إنترنت؟',
          a: 'نعم، يعمل تحليل البكاء بالكامل على الجهاز ويعمل بدون اتصال بالإنترنت.'
        }
      ]
    },
    {
      category: 'التطعيمات',
      items: [
        {
          q: 'من أين يأتي جدول التطعيمات؟',
          a: 'يتبع الجدول توصيات منظمة الصحة العالمية (WHO). قد يختلف جدولك المحلي - تأكد دائمًا مع طبيب الأطفال الخاص بك.'
        }
      ]
    }
  ]
}

// ── Sub-Component ────────────────────────────────────────────────────

const AccordionItem: React.FC<{
  question: string
  answer: string
  isRTL: boolean
}> = ({ question, answer, isRTL }) => {
  const [open, setOpen] = useState(false)

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen((v) => !v)
  }

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity
        style={[
          styles.accordionHeader,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.accordionQuestion,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}
        >
          {question}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#A97C8E"
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.accordionBody}>
          <Text
            style={[
              styles.accordionAnswer,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}
          >
            {answer}
          </Text>
        </View>
      )}
    </View>
  )
}

// ── Main Screen ──────────────────────────────────────────────────────

export const HelpFaqScreen: React.FC = () => {
  const navigation = useNavigation()
  const { t, isRTL, locale } = useTranslation()

  // Select the correct data set based on current language
  const faqItems = locale === 'ar' ? FAQ_DATA.ar : FAQ_DATA.en

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
          <Text style={styles.title}>{t('settings.helpFaq')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Hint Card */}
          <View
            style={[styles.hintCard, Shadows.sm, { flexDirection: rowDir }]}
          >
            <Ionicons name="bulb-outline" size={20} color="#C07792" />
            <Text style={[styles.hintText, { textAlign }]}>
              {isRTL
                ? 'اضغط على أي سؤال لتوسيع الإجابة. هل ما زلت عالقاً؟ '
                : 'Tap any question to expand the answer. Still stuck? '}
              <Text
                style={styles.hintLink}
                onPress={() => navigation.navigate('ContactSupport' as never)}
              >
                {t('settings.contactSupport')}
              </Text>
            </Text>
          </View>

          {/* FAQ Sections */}
          {faqItems.map((section) => (
            <View key={section.category} style={styles.section}>
              <Text style={[styles.sectionTitle, { textAlign }]}>
                {section.category.toUpperCase()}
              </Text>
              <View style={[styles.card, Shadows.sm]}>
                {section.items.map((item, idx) => (
                  <View key={item.q}>
                    <AccordionItem
                      question={item.q}
                      answer={item.a}
                      isRTL={isRTL}
                    />
                    {idx < section.items.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ── Styles ───────────────────────────────────────────────────────────

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

  hintCard: {
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.lg,
    padding: Spacing.md
  },
  hintText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: '#8E5E71',
    lineHeight: 20
  },
  hintLink: { color: '#C07792', fontWeight: FontWeight.semibold },

  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#A97C8E',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.sm
  },
  card: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.xl,
    overflow: 'hidden'
  },

  accordionItem: { paddingHorizontal: Spacing.lg },
  accordionHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    gap: Spacing.sm
  },
  accordionQuestion: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: '#8E5E71'
  },
  accordionBody: { paddingBottom: Spacing.md },
  accordionAnswer: {
    fontSize: FontSize.sm,
    color: '#A97C8E',
    lineHeight: 22
  },
  divider: { height: 1, backgroundColor: '#E8D0DC' }
})
