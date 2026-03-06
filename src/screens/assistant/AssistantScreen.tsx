import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { assistantService } from '../../services/assistant.service';
import { SUGGESTED_QUESTIONS, AssistantMessage } from '../../constants/mockData';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useBabyStore } from '../../store/babyStore';

const TypingIndicator: React.FC = () => {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={typingStyles.container}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={[typingStyles.dot, { transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]} />
      ))}
    </View>
  );
};

const typingStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4, padding: Spacing.md, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
});

const INITIAL_MESSAGES: AssistantMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "👋 Hi! I'm your Baby Care Assistant.\n\nI can help you with feeding schedules, sleep tips, cry interpretation, vaccination info, and general baby health questions.\n\nWhat would you like to know?",
    timestamp: new Date().toISOString(),
  },
];

export const AssistantScreen: React.FC = () => {
  const { activeBaby } = useBabyStore();
  const [messages, setMessages] = useState<AssistantMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput('');

    const userMsg: AssistantMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const reply = await assistantService.sendMessage(content, messages);
      const assistantMsg: AssistantMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => setMessages(INITIAL_MESSAGES);

  const showSuggestions = messages.length <= 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Baby Care Assistant</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Always available</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={clearChat}>
          <Ionicons name="refresh-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Active baby context */}
      {activeBaby && (
        <View style={styles.contextBanner}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
          <Text style={styles.contextText}>
            Answering for <Text style={styles.contextBabyName}>{activeBaby.name}</Text>
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(msg => (
            <View key={msg.id} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
              {msg.role === 'assistant' && (
                <View style={styles.msgAvatar}>
                  <Text style={{ fontSize: 16 }}>🤖</Text>
                </View>
              )}
              <View style={[
                styles.msgBubble,
                msg.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleAssistant,
              ]}>
                <Text style={[
                  styles.msgText,
                  msg.role === 'user' ? styles.msgTextUser : styles.msgTextAssistant,
                ]}>
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
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              <View style={styles.suggestionPills}>
                {SUGGESTED_QUESTIONS.map(q => (
                  <TouchableOpacity
                    key={q}
                    style={styles.suggestionPill}
                    onPress={() => sendMessage(q)}
                  >
                    <Text style={styles.suggestionPillText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: Spacing.lg }} />
        </ScrollView>

        {/* Input */}
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask about your baby..."
              placeholderTextColor={Colors.textLight}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
              onPress={() => sendMessage()}
              disabled={!input.trim() || isTyping}
            >
              {isTyping
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <Ionicons name="send" size={18} color={Colors.white} />
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, ...Shadows.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  botAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  botAvatarEmoji: { fontSize: 22 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textDark },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  onlineText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.medium },
  clearBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  contextBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primarySoft, paddingHorizontal: Spacing.xl, paddingVertical: 8,
  },
  contextText: { fontSize: FontSize.xs, color: Colors.textMedium },
  contextBabyName: { fontWeight: FontWeight.bold, color: Colors.primary },
  messageList: { padding: Spacing.lg, gap: Spacing.md },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  msgBubble: { maxWidth: '75%', borderRadius: Radius.xl, padding: Spacing.md },
  msgBubbleAssistant: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, ...Shadows.sm },
  msgBubbleUser: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  msgText: { fontSize: FontSize.md, lineHeight: 22 },
  msgTextAssistant: { color: Colors.textDark },
  msgTextUser: { color: Colors.white },
  suggestions: { marginTop: Spacing.md, gap: Spacing.md },
  suggestionsTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted, textAlign: 'center' },
  suggestionPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  suggestionPill: {
    backgroundColor: Colors.white, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadows.sm,
  },
  suggestionPillText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  inputArea: { backgroundColor: Colors.white, padding: Spacing.md, ...Shadows.md },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  input: {
    flex: 1, backgroundColor: Colors.bgInput, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSize.md, color: Colors.textDark, maxHeight: 100,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
