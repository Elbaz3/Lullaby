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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I add my baby?',
        a: "Tap the Babies tab at the bottom of the screen, then press the + button. Fill in your baby's name, date of birth, and gender. You can also add a photo."
      },
      {
        q: 'Can I track multiple babies?',
        a: 'Yes! BabyBloom supports multiple babies in a single account. Each baby has their own profile, growth data, and vaccination record.'
      },
      {
        q: 'Is my data backed up?',
        a: 'All data is securely synced to the cloud automatically whenever you have an internet connection. Your records are safe even if you change or lose your phone.'
      }
    ]
  },
  {
    category: 'Cry Detection',
    items: [
      {
        q: 'How does cry detection work?',
        a: 'Our AI model listens to your baby\'s cry and classifies it into categories like hunger, discomfort, tiredness, or pain. Hold the phone near your baby and tap "Start Listening."'
      },
      {
        q: 'How accurate is the cry detection?',
        a: 'The model is accurate for most common cry types. However, every baby is unique — over time it learns patterns specific to your baby for better results.'
      },
      {
        q: 'Does it work offline?',
        a: 'Yes, cry detection runs fully on-device and works without an internet connection.'
      }
    ]
  },
  {
    category: 'Growth & Development',
    items: [
      {
        q: 'What do the growth charts mean?',
        a: "Growth charts compare your baby's weight, height, and head circumference to WHO standards for their age and gender. The shaded bands represent the normal range."
      },
      {
        q: 'How often should I log measurements?',
        a: 'We recommend logging at each pediatric visit. For newborns this is typically weekly; for older babies, monthly is enough.'
      }
    ]
  },
  {
    category: 'Vaccinations',
    items: [
      {
        q: 'Where does the vaccination schedule come from?',
        a: 'The schedule follows the WHO Expanded Programme on Immunization (EPI) recommendations. Your local schedule may differ — always confirm with your pediatrician.'
      },
      {
        q: 'Can I mark a vaccine as done after the due date?',
        a: 'Yes. Tap any vaccine row and choose "Mark as given." You can set the actual date it was administered.'
      }
    ]
  }
]

const AccordionItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer
}) => {
  const [open, setOpen] = useState(false)

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen((v) => !v)
  }

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionQuestion}>{question}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#A97C8E"
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.accordionBody}>
          <Text style={styles.accordionAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  )
}

export const HelpFaqScreen: React.FC = () => {
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
          <Text style={styles.title}>Help & FAQ</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero hint */}
          <View style={[styles.hintCard, Shadows.sm]}>
            <Ionicons name="bulb-outline" size={20} color="#C07792" />
            <Text style={styles.hintText}>
              Tap any question to expand the answer. Still stuck?{' '}
              <Text style={styles.hintLink}>Contact Support</Text>
            </Text>
          </View>

          {FAQ_ITEMS.map((section) => (
            <View key={section.category} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {section.category.toUpperCase()}
              </Text>
              <View style={[styles.card, Shadows.sm]}>
                {section.items.map((item, idx) => (
                  <View key={item.q}>
                    <AccordionItem question={item.q} answer={item.a} />
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

  hintCard: {
    flexDirection: 'row',
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
    flexDirection: 'row',
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
