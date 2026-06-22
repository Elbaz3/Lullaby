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
  Animated,
  Alert,
  ActivityIndicator
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

// Logic & Store Imports
import { assistantService } from '../../services/assistant.service'
import { AssistantMessage } from '../../constants/mockData'
import { Shadows } from '../../constants/theme'
import { useBabyStore } from '../../store/babyStore'
import { useTranslation } from '../../i18n/useTranslation'

// ── Typing Indicator Component ────────────────
const TypingIndicator: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
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
    <View
      style={[
        typingStyles.container,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}
    >
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
  const insets = useSafeAreaInsets()
  const { activeBaby } = useBabyStore()
  const { t, isRTL } = useTranslation()
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isClearingMemory, setIsClearingMemory] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    setMessages([])
  }, [])

  // ── Send message → POST /api/chatbot/ask ──
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
      const reply = await assistantService.sendMessage(content)
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString()
        }
      ])
    } catch (err: any) {
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

  // ── Clear chat → DELETE /api/chatbot/memory ──
  const handleClearMemory = () => {
    Alert.alert(
      t('assistant.clearTitle') || 'Clear Chat',
      t('assistant.clearConfirm') ||
        'This will clear the conversation and reset memory on the server.',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: isRTL
            ? t('assistant.clearTitle') || 'Clear'
            : t('assistant.clearTitle') || 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearingMemory(true)
            try {
              await assistantService.clearMemory()
              setMessages([])
            } catch {
              // Memory clear failed silently — still clear local messages
              setMessages([])
            } finally {
              setIsClearingMemory(false)
            }
          }
        }
      ]
    )
  }

  // RTL Helpers
  const textAlign = isRTL ? 'right' : 'left'
  const rowDirection = isRTL ? 'row-reverse' : 'row'

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FDF2F4', '#F9E7ED', '#E8B7D4']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.watermarkLayer} pointerEvents="none">
        {[...Array(15)].map((_, i) => (
          <MaterialCommunityIcons
            key={i}
            name="face-woman-outline"
            size={80}
            color="#C07792"
            style={styles.watermarkIcon}
          />
        ))}
      </View>

      {/* Header */}
      <View style={[styles.headerFlat, { paddingTop: insets.top + 10 }]}>
        <View style={[styles.headerContent, { flexDirection: rowDirection }]}>
          <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
            <Text style={styles.headerTitle}>{t('assistant.title')}</Text>
            <Text style={styles.headerSub}>{t('assistant.online')}</Text>
          </View>

          {/* Trash / clear button */}
          <TouchableOpacity
            onPress={handleClearMemory}
            disabled={isClearingMemory || messages.length === 0}
            style={{ opacity: messages.length === 0 ? 0.4 : 1 }}
          >
            {isClearingMemory ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="trash-outline" size={22} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>
                {t('welcome.welcomeTo')} {t('assistant.title')} ! 👶
              </Text>
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeHeadline}>
                  {t('assistant.welcomeMsg').split('\n\n')[0]}
                </Text>
                <Text style={styles.welcomeSub}>
                  {t('assistant.welcomeMsg').split('\n\n')[1]}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.startBadge}
                onPress={() => setInput(isRTL ? 'مرحباً!' : 'Hi!')}
              >
                <Text style={styles.startBadgeText}>
                  {t('assistant.tryAsking')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.dateSeparator}>
                {t('notifications.today')}
              </Text>
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.msgRow,
                    msg.role === 'user'
                      ? styles.msgRowUser
                      : styles.msgRowAssistant,
                    isRTL &&
                      (msg.role === 'user'
                        ? { alignItems: 'flex-start' }
                        : { alignItems: 'flex-end' })
                  ]}
                >
                  <View
                    style={[
                      styles.msgBubble,
                      msg.role === 'user'
                        ? styles.msgBubbleUser
                        : styles.msgBubbleAssistant,
                      isRTL &&
                        (msg.role === 'user'
                          ? {
                              borderBottomRightRadius: 18,
                              borderBottomLeftRadius: 2
                            }
                          : {
                              borderBottomLeftRadius: 18,
                              borderBottomRightRadius: 2
                            })
                    ]}
                  >
                    <Text
                      style={[
                        styles.msgText,
                        msg.role === 'user'
                          ? styles.msgTextUser
                          : styles.msgTextAssistant,
                        { textAlign }
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}
              {isTyping && (
                <View
                  style={[
                    styles.msgRowAssistant,
                    isRTL && { alignItems: 'flex-end' }
                  ]}
                >
                  <View style={[styles.msgBubble, styles.msgBubbleAssistant]}>
                    <TypingIndicator isRTL={isRTL} />
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={[styles.inputRow, { flexDirection: rowDirection }]}>
            <TextInput
              style={[styles.input, { textAlign }]}
              placeholder={t('assistant.inputPh')}
              placeholderTextColor="#A97C8E"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { transform: [{ scaleX: isRTL ? -1 : 1 }] }
              ]}
              onPress={() => sendMessage()}
              disabled={!input.trim() || isTyping}
            >
              <MaterialCommunityIcons
                name="chat-plus"
                size={26}
                color={!input.trim() || isTyping ? '#D1A8B8' : '#C07792'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const typingStyles = StyleSheet.create({
  container: { gap: 4, padding: 8, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A97C8E' }
})

const styles = StyleSheet.create({
  root: { flex: 1 },
  watermarkLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    opacity: 0.04,
    paddingTop: 120
  },
  watermarkIcon: { margin: 25 },
  headerFlat: {
    backgroundColor: '#C07792',
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    ...Shadows.md,
    zIndex: 10
  },
  headerContent: { justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  messageList: { padding: 20, flexGrow: 1, paddingBottom: 40 },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C07792',
    textAlign: 'center'
  },
  welcomeContent: { alignItems: 'center', marginVertical: 30 },
  welcomeHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3B40',
    textAlign: 'center'
  },
  welcomeSub: {
    fontSize: 14,
    color: '#8E5E71',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40
  },
  startBadge: {
    backgroundColor: 'rgba(192, 119, 146, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C07792'
  },
  startBadgeText: { color: '#8E5E71', fontWeight: '600' },
  dateSeparator: {
    textAlign: 'center',
    color: '#8E5E71',
    fontSize: 14,
    marginBottom: 20,
    fontWeight: '600',
    opacity: 0.7
  },
  msgRow: { marginVertical: 6, width: '100%' },
  msgRowUser: { alignItems: 'flex-end' },
  msgRowAssistant: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '80%', padding: 15, borderRadius: 18 },
  msgBubbleUser: { backgroundColor: '#C07792', borderBottomRightRadius: 2 },
  msgBubbleAssistant: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 2,
    ...Shadows.sm
  },
  msgText: { fontSize: 15, lineHeight: 20 },
  msgTextUser: { color: '#FFF' },
  msgTextAssistant: { color: '#4A3B40' },
  inputArea: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 15
  },
  inputRow: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: '#F0D5E0'
  },
  input: {
    flex: 1,
    color: '#4A3B40',
    fontSize: 15,
    paddingHorizontal: 10,
    maxHeight: 100
  },
  sendBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
