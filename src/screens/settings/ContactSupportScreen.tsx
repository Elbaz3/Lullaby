import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform
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

export const ContactSupportScreen: React.FC = () => {
  const navigation = useNavigation()
  const { t, isRTL } = useTranslation()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  // ── Localized Data ──────────────────────────────────────────────────

  const CONTACT_CHANNELS = [
    {
      icon: 'mail-outline',
      label: t('profile.email'),
      value: 'support@lullaby.app',
      sub: isRTL ? 'نرد خلال 24 ساعة' : 'We reply within 24 hours',
      onPress: () => Linking.openURL('mailto:support@lullaby.app')
    },
    {
      icon: 'logo-whatsapp',
      label: 'WhatsApp',
      value: '+20 101 123 4567',
      sub: isRTL ? 'السبت – الخميس، 9 ص – 6 م' : 'Sat – Thu, 9 AM – 6 PM',
      onPress: () => Linking.openURL('https://wa.me/201011234567')
    },
    {
      icon: 'chatbubble-ellipses-outline',
      label: t('tabs.assistant'),
      value: isRTL ? 'افتح المساعد الذكي' : 'Open AI Assistant',
      sub: isRTL ? 'متاح دائماً للمساعدة' : 'Always available to help',
      onPress: () => navigation.navigate('Assistant' as never)
    }
  ]

  // ── Logic ───────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(
        isRTL ? 'معلومات ناقصة' : 'Missing info',
        isRTL
          ? 'يرجى ملء كل من الموضوع ورسالتك.'
          : 'Please fill in both the subject and your message.'
      )
      return
    }
    setSending(true)
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200))
    setSending(false)
    setSubject('')
    setMessage('')
    Alert.alert(
      isRTL ? 'تم الإرسال ✓' : 'Message sent ✓',
      isRTL
        ? 'سنرد عليك في أقرب وقت ممكن.'
        : "We'll get back to you as soon as possible."
    )
  }

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
          <Text style={styles.title}>{t('settings.contactSupport')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick channels */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {isRTL ? 'تواصل معنا مباشرة' : 'REACH US DIRECTLY'}
            </Text>
            <View style={[styles.card, Shadows.sm]}>
              {CONTACT_CHANNELS.map((ch, idx) => (
                <View key={ch.label}>
                  <TouchableOpacity
                    style={[styles.channelRow, { flexDirection: rowDir }]}
                    onPress={ch.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.channelIcon}>
                      <Ionicons
                        name={ch.icon as any}
                        size={20}
                        color="#C07792"
                      />
                    </View>
                    <View
                      style={[
                        styles.channelInfo,
                        { alignItems: isRTL ? 'flex-end' : 'flex-start' }
                      ]}
                    >
                      <Text style={styles.channelLabel}>{ch.label}</Text>
                      <Text style={styles.channelValue}>{ch.value}</Text>
                      <Text style={styles.channelSub}>{ch.sub}</Text>
                    </View>
                    <Ionicons
                      name={isRTL ? 'chevron-back' : 'chevron-forward'}
                      size={16}
                      color="#A97C8E"
                    />
                  </TouchableOpacity>
                  {idx < CONTACT_CHANNELS.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        isRTL ? { marginRight: 72 } : { marginLeft: 72 }
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Message form */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {isRTL ? 'أرسل رسالة' : 'SEND A MESSAGE'}
            </Text>
            <View style={[styles.card, styles.formCard, Shadows.sm]}>
              <Text style={[styles.inputLabel, { textAlign }]}>
                {isRTL ? 'الموضوع' : 'Subject'}
              </Text>
              <TextInput
                style={[styles.input, { textAlign }]}
                placeholder={
                  isRTL
                    ? 'مثال: مشكلة في مخطط النمو'
                    : 'e.g. Growth chart issue'
                }
                placeholderTextColor="#C4A0B0"
                value={subject}
                onChangeText={setSubject}
                returnKeyType="next"
              />
              <View style={styles.inputDivider} />
              <Text
                style={[
                  styles.inputLabel,
                  { marginTop: Spacing.md, textAlign }
                ]}
              >
                {isRTL ? 'الرسالة' : 'Message'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { textAlign }]}
                placeholder={
                  isRTL
                    ? 'يرجى وصف المشكلة بالتفصيل...'
                    : 'Describe your issue in detail…'
                }
                placeholderTextColor="#C4A0B0"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                sending && styles.sendBtnDisabled,
                { flexDirection: rowDir }
              ]}
              onPress={handleSend}
              disabled={sending}
              activeOpacity={0.8}
            >
              <Ionicons
                name="send-outline"
                size={18}
                color="#fff"
                style={isRTL ? { transform: [{ scaleX: -1 }] } : {}}
              />
              <Text style={styles.sendBtnText}>
                {sending
                  ? isRTL
                    ? 'جاري الإرسال...'
                    : 'Sending…'
                  : isRTL
                    ? 'إرسال الرسالة'
                    : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Response time note */}
          <View
            style={[styles.noteCard, Shadows.sm, { flexDirection: rowDir }]}
          >
            <Ionicons name="time-outline" size={18} color="#C07792" />
            <Text style={[styles.noteText, { textAlign }]}>
              {isRTL
                ? 'فريق الدعم متاح من السبت إلى الخميس، 9 صباحاً – 6 مساءً (GMT+2). نهدف للرد على جميع الرسائل خلال يوم عمل واحد.'
                : 'Our support team is available Saturday to Thursday, 9 AM – 6 PM (GMT+2). We aim to respond to all messages within one business day.'}
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
  formCard: { padding: Spacing.lg },

  // Channels
  channelRow: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  channelInfo: { flex: 1 },
  channelLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#8E5E71'
  },
  channelValue: { fontSize: FontSize.sm, color: '#C07792', marginTop: 1 },
  channelSub: { fontSize: FontSize.xs, color: '#A97C8E', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#E8D0DC' },

  // Form
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#A97C8E',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs
  },
  input: {
    fontSize: FontSize.md,
    color: '#8E5E71',
    paddingVertical: Spacing.sm
  },
  textArea: { minHeight: 100 },
  inputDivider: { height: 1, backgroundColor: '#E8D0DC' },

  sendBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#C07792',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md + 2,
    ...Shadows.sm
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#fff'
  },

  noteCard: {
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.lg,
    padding: Spacing.md
  },
  noteText: { flex: 1, fontSize: FontSize.sm, color: '#A97C8E', lineHeight: 20 }
})
