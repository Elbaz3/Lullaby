import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  RefreshControl
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

// Logic & Store Imports
import { assistantService } from '../../services/assistant.service'
import { AssistantMessage } from '../../constants/mockData'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadows
} from '../../constants/theme'
import { useBabyStore } from '../../store/babyStore'
import { useTranslation } from '../../i18n/useTranslation'

const SUGGESTION_KEYS = [
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'q6',
  'q7',
  'q8'
] as const

// ── Typing Indicator Component ────────────────
const TypingIndicator: React.FC = () => {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ]

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.delay(600)
        ])
      )
    )
    animations.forEach((a) => a.start())
    return () => animations.forEach((a) => a.stop())
  }, [])

  return (
    <View style={typingStyles.container}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            typingStyles.dot,
            {
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6]
                  })
                }
              ]
            }
          ]}
        />
      ))}
    </View>
  )
}

export const AssistantScreen: React.FC = () => {
  const { activeBaby } = useBabyStore()
  const { t } = useTranslation()

  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  // Initialize Welcome Message with Translations
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: t('assistant.welcomeMsg'),
        timestamp: new Date().toISOString()
      }
    ])
  }, [t])

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const onRefresh = () => {
    setRefreshing(true)
    clearChat()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content) return
    setInput('')

    const userMsg: AssistantMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const reply = await assistantService.sendMessage(content, messages)
      const assistantMsg: AssistantMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString()
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: t('assistant.errorMsg'),
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () =>
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: t('assistant.welcomeMsg'),
        timestamp: new Date().toISOString()
      }
    ])

  const showSuggestions = messages.length <= 1

  return (
    <LinearGradient
      colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarEmoji}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>{t('assistant.title')}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>{t('assistant.online')}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={clearChat}>
            <Ionicons name="refresh-outline" size={18} color="#8E5E71" />
          </TouchableOpacity>
        </View>

        {/* Active baby context */}
        {activeBaby && (
          <View style={styles.contextBanner}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#C07792"
            />
            <Text style={styles.contextText}>
              {t('assistant.contextPrefix')}{' '}
              <Text style={styles.contextBabyName}>{activeBaby.name}</Text>
            </Text>
          </View>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#C07792"
              />
            }
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  msg.role === 'user' && styles.msgRowUser
                ]}
              >
                {msg.role === 'assistant' && (
                  <View style={styles.msgAvatar}>
                    <Text style={{ fontSize: 16 }}>🤖</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.msgBubble,
                    msg.role === 'user'
                      ? styles.msgBubbleUser
                      : styles.msgBubbleAssistant
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      msg.role === 'user'
                        ? styles.msgTextUser
                        : styles.msgTextAssistant
                    ]}
                  >
                    {msg.content}
                  </Text>
                </View>
              </View>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <View style={styles.msgRow}>
                <View style={styles.msgAvatar}>
                  <Text style={{ fontSize: 16 }}>🤖</Text>
                </View>
                <View style={styles.msgBubbleAssistant}>
                  <TypingIndicator />
                </View>
              </View>
            )}

            {/* Suggested questions */}
            {showSuggestions && !isTyping && (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>
                  {t('assistant.tryAsking')}
                </Text>
                <View style={styles.suggestionPills}>
                  {SUGGESTION_KEYS.map((k) => {
                    const q = t(`assistant.${k}`)
                    return (
                      <TouchableOpacity
                        key={k}
                        style={styles.suggestionPill}
                        onPress={() => sendMessage(q)}
                      >
                        <Text style={styles.suggestionPillText}>{q}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Input Area - Adjusted for floating Tab Bar */}
          <View style={styles.inputArea}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={t('assistant.inputPh')}
                placeholderTextColor="#A97C8E"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
                onSubmitEditing={() => sendMessage()}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!input.trim() || isTyping) && styles.sendBtnDisabled
                ]}
                onPress={() => sendMessage()}
                disabled={!input.trim() || isTyping}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const typingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    padding: Spacing.md,
    alignItems: 'center'
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A97C8E' }
})

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFFCC',
    ...Shadows.sm
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  botAvatarEmoji: { fontSize: 22 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#8E5E71'
  },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50'
  },
  onlineText: {
    fontSize: FontSize.xs,
    color: '#4CAF50',
    fontWeight: FontWeight.medium
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0D5E0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 8
  },
  contextText: { fontSize: FontSize.xs, color: '#8E5E71' },
  contextBabyName: { fontWeight: FontWeight.bold, color: '#C07792' },
  messageList: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 20 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  msgBubble: { maxWidth: '75%', borderRadius: Radius.xl, padding: Spacing.md },
  msgBubbleAssistant: {
    backgroundColor: '#FFFFFFCC',
    borderBottomLeftRadius: 4,
    ...Shadows.sm
  },
  msgBubbleUser: { backgroundColor: '#C07792', borderBottomRightRadius: 4 },
  msgText: { fontSize: FontSize.md, lineHeight: 22 },
  msgTextAssistant: { color: '#8E5E71' },
  msgTextUser: { color: '#fff' },
  suggestions: { marginTop: Spacing.md, gap: Spacing.md },
  suggestionsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#A97C8E',
    textAlign: 'center'
  },
  suggestionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center'
  },
  suggestionPill: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#E8D0DC',
    ...Shadows.sm
  },
  suggestionPillText: {
    fontSize: FontSize.sm,
    color: '#C07792',
    fontWeight: FontWeight.medium
  },
  inputArea: {
    backgroundColor: '#FFFFFFCC',
    padding: Spacing.md,
    ...Shadows.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    marginBottom: 100 // Raised to clear the floating bottom tab bar
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  input: {
    flex: 1,
    backgroundColor: '#FDF8FA',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: '#8E5E71',
    maxHeight: 80
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C07792',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBtnDisabled: { opacity: 0.5 }
})
