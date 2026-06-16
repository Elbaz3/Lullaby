import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking
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

const CONTACT_CHANNELS = [
  {
    icon: 'mail-outline',
    label: 'Email Us',
    value: 'support@babybloom.app',
    sub: 'We reply within 24 hours',
    onPress: () => Linking.openURL('mailto:support@babybloom.app')
  },
  {
    icon: 'logo-whatsapp',
    label: 'WhatsApp',
    value: '+1 (800) 123-4567',
    sub: 'Mon – Fri, 9 AM – 6 PM',
    onPress: () => Linking.openURL('https://wa.me/18001234567')
  },
  {
    icon: 'chatbubble-ellipses-outline',
    label: 'Live Chat',
    value: 'Open in app',
    sub: 'Average wait: under 5 min',
    onPress: () =>
      Alert.alert(
        'Coming soon',
        'Live chat will be available in the next update.'
      )
  }
]

export const ContactSupportScreen: React.FC = () => {
  const navigation = useNavigation()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(
        'Missing info',
        'Please fill in both the subject and your message.'
      )
      return
    }
    setSending(true)
    // Simulate network delay — replace with real API call
    await new Promise((r) => setTimeout(r, 1200))
    setSending(false)
    setSubject('')
    setMessage('')
    Alert.alert('Message sent ✓', "We'll get back to you within 24 hours.")
  }

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
          <Text style={styles.title}>Contact Support</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick channels */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REACH US DIRECTLY</Text>
            <View style={[styles.card, Shadows.sm]}>
              {CONTACT_CHANNELS.map((ch, idx) => (
                <View key={ch.label}>
                  <TouchableOpacity
                    style={styles.channelRow}
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
                    <View style={styles.channelInfo}>
                      <Text style={styles.channelLabel}>{ch.label}</Text>
                      <Text style={styles.channelValue}>{ch.value}</Text>
                      <Text style={styles.channelSub}>{ch.sub}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#A97C8E"
                    />
                  </TouchableOpacity>
                  {idx < CONTACT_CHANNELS.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Message form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEND A MESSAGE</Text>
            <View style={[styles.card, styles.formCard, Shadows.sm]}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Growth chart not loading"
                placeholderTextColor="#C4A0B0"
                value={subject}
                onChangeText={setSubject}
                returnKeyType="next"
              />
              <View style={styles.inputDivider} />
              <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
                Message
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue in as much detail as you can…"
                placeholderTextColor="#C4A0B0"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending}
              activeOpacity={0.8}
            >
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={styles.sendBtnText}>
                {sending ? 'Sending…' : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Response time note */}
          <View style={[styles.noteCard, Shadows.sm]}>
            <Ionicons name="time-outline" size={18} color="#C07792" />
            <Text style={styles.noteText}>
              Our support team is available Monday to Friday, 9 AM – 6 PM
              (GMT+2). We aim to respond to all messages within one business
              day.
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
    flexDirection: 'row',
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
  divider: { height: 1, backgroundColor: '#E8D0DC', marginLeft: 72 },

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
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.lg,
    padding: Spacing.md
  },
  noteText: { flex: 1, fontSize: FontSize.sm, color: '#A97C8E', lineHeight: 20 }
})
