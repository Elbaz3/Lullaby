// ─────────────────────────────────────────────
//  CRY DETECTION SCREEN — Complete Refactor
//
//  States:
//  1. IDLE       — pulsing mic, tap to record
//  2. RECORDING  — waveform + timer (max 10s)
//  3. PREVIEW    — playback bar, send / re-record
//  4. ANALYZING  — spinner while waiting for API
//  5. RESULT     — animates in with prediction card
//
//  Audio: expo-av records in WAV, mono, 16kHz
//         compressed to stay under 1MB
// ─────────────────────────────────────────────

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { tokenStorage, BASE_URL } from '../../services/api';
import { getLocale } from '../../store/localeStore';
import * as FileSystem from 'expo-file-system';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useTranslation } from '../../i18n/useTranslation';

const { width, height } = Dimensions.get('window');

// Visual-only metadata; copy comes from `cry.reasons.*` in translations.
const CRY_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  hungry:     { icon: 'restaurant-outline', color: '#FF7043', bg: '#FFF3F0' },
  pain:       { icon: 'medical-outline',    color: '#E53935', bg: '#FFEBEE' },
  tired:      { icon: 'moon-outline',       color: '#7E57C2', bg: '#F3E5F5' },
  burping:    { icon: 'water-outline',      color: '#26A69A', bg: '#E0F2F1' },
  lonely:     { icon: 'heart-outline',      color: '#EC407A', bg: '#FCE4EC' },
  discomfort: { icon: 'thermometer-outline', color: '#FFA726', bg: '#FFF8E1' },
  belly_pain: { icon: 'fitness-outline',    color: '#EF6C00', bg: '#FFF3E0' },
  unknown:    { icon: 'help-circle-outline', color: '#78909C', bg: '#ECEFF1' },
};

function mapCryReasonKey(prediction: string): string {
  if (prediction === 'needs_attention') return 'lonely';
  if (CRY_STYLE[prediction]) return prediction;
  return 'unknown';
}

// ── Screen States ─────────────────────────────
type ScreenState = 'idle' | 'recording' | 'preview' | 'analyzing' | 'result';

// ── Waveform Bar ──────────────────────────────
const WaveBar: React.FC<{ index: number; isActive: boolean; metering: number }> = ({
  index, isActive, metering,
}) => {
  const anim = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    if (isActive) {
      // Animate height based on metering + random variation
      const target = Math.max(0.1, Math.min(1, (metering + 160) / 160 + Math.random() * 0.3));
      Animated.spring(anim, {
        toValue: target,
        useNativeDriver: true,
        speed: 20,
        bounciness: 2,
      }).start();
    } else {
      Animated.spring(anim, {
        toValue: 0.15,
        useNativeDriver: true,
        speed: 8,
      }).start();
    }
  }, [isActive, metering]);

  const BAR_HEIGHT = 80;
  return (
    <Animated.View
      style={{
        width: 3,
        height: BAR_HEIGHT,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        opacity: isActive ? 1 : 0.3,
        transform: [{ scaleY: anim }],
      }}
    />
  );
};

// ── Pulse Rings ───────────────────────────────
const PulseRing: React.FC<{ delay: number; size: number }> = ({ delay, size }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.5,
      borderColor: Colors.primary,
      opacity: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.5, 0] }),
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
    }} />
  );
};

// ── Result Card (animates in) ─────────────────
const ResultCard: React.FC<{
  prediction: string;
  confidence: number;
  onReset: () => void;
}> = ({ prediction, confidence, onReset }) => {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const key  = mapCryReasonKey(prediction);
  const meta = CRY_STYLE[key] ?? CRY_STYLE.unknown;
  const label = t(`cry.reasons.${key}.label`);
  const description = t(`cry.reasons.${key}.description`);
  const tip = t(`cry.reasons.${key}.tip`);
  const pct  = Math.round(confidence * 100);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 4 }),
    ]).start();
  }, []);

  // Confidence bar width animation
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct / 100,
      duration: 900,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      width: '100%',
    }}>
      {/* Icon circle */}
      <View style={[styles.resultIconWrap, { backgroundColor: meta.bg }]}>
        <View style={[styles.resultIconCircle, { backgroundColor: meta.color }]}>
          <Ionicons name={meta.icon as any} size={40} color="#fff" />
        </View>
      </View>

      {/* Label */}
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultDescription}>{description}</Text>

      {/* Confidence bar */}
      <View style={styles.confSection}>
        <View style={styles.confLabelRow}>
          <Text style={styles.confTitle}>{t('cry.confidence')}</Text>
          <Text style={[styles.confPct, { color: meta.color }]}>{pct}%</Text>
        </View>
        <View style={styles.confTrack}>
          <Animated.View style={[
            styles.confFill,
            {
              backgroundColor: meta.color,
              width: barAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }) as any,
            },
          ]} />
        </View>
        <Text style={styles.confNote}>
          {pct >= 75 ? t('cry.confHigh') : pct >= 50 ? t('cry.confModerate') : t('cry.confLow')}
        </Text>
      </View>

      {/* Tip card */}
      <View style={[styles.tipCard, { borderLeftColor: meta.color }]}>
        <View style={styles.tipHeader}>
          <Ionicons name="bulb-outline" size={16} color={meta.color} />
          <Text style={[styles.tipTitle, { color: meta.color }]}>{t('cry.whatToDo')}</Text>
        </View>
        <Text style={styles.tipText}>{tip}</Text>
      </View>

      {/* Record again */}
      <TouchableOpacity style={styles.recordAgainBtn} onPress={onReset}>
        <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
        <Text style={styles.recordAgainText}>{t('cry.recordAgain')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
//  MAIN SCREEN
// ─────────────────────────────────────────────
export const CryDetectionScreen: React.FC = () => {
  const { t } = useTranslation();
  const [state,       setState]       = useState<ScreenState>('idle');
  const [timer,       setTimer]       = useState(0);      // seconds elapsed
  const [metering,    setMetering]    = useState(-160);   // dB
  const [audioUri,    setAudioUri]    = useState<string | null>(null);
  const [fileSize,    setFileSize]    = useState<number | null>(null); // DEBUG — remove later
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [playPos,     setPlayPos]     = useState(0);      // 0-1
  const [prediction,  setPrediction]  = useState<string>('hungry');
  const [confidence,  setConfidence]  = useState<number>(0);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [permission,  setPermission]  = useState(false);

  const recordingRef  = useRef<Audio.Recording | null>(null);
  const soundRef      = useRef<Audio.Sound | null>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const meteringRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const MAX_SECONDS = 10;
  const BAR_COUNT   = 40;

  // ── Permissions ───────────────────────────
  useEffect(() => {
    (async () => {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermission(granted);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
    return () => { cleanup(); };
  }, []);

  const cleanup = () => {
    if (timerRef.current)   clearInterval(timerRef.current);
    if (meteringRef.current) clearInterval(meteringRef.current);
    soundRef.current?.unloadAsync();
  };

  // ── Emulator detection ───────────────────
  // Android emulator has no mic — use a mock silent WAV for testing
  // Remove __DEV__ check in production
  const IS_EMULATOR = __DEV__ && Platform.OS === 'android';

  // ── START RECORDING ───────────────────────
  const startRecording = async () => {
    if (!permission) return;

    // ── EMULATOR MOCK — remove in production ──
    if (IS_EMULATOR) {
      setState('recording');
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev + 1 >= MAX_SECONDS) { stopRecordingMock(); return MAX_SECONDS; }
          return prev + 1;
        });
      }, 1000);
      meteringRef.current = setInterval(() => {
        // Fake metering oscillation for waveform animation
        setMetering(-80 + Math.sin(Date.now() / 200) * 40);
      }, 80);
      return;
    }
    // ── END EMULATOR MOCK ──

    try {
      // WAV format, mono, 16kHz — stays well under 1MB at 10s
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        android: {
          extension:          '.wav',
          outputFormat:       Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder:       Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate:         16000,
          numberOfChannels:   1,
          bitRate:            128000,
        },
        ios: {
          extension:          '.wav',
          outputFormat:       Audio.IOSOutputFormat.LINEARPCM,
          audioQuality:       Audio.IOSAudioQuality.MEDIUM,
          sampleRate:         16000,
          numberOfChannels:   1,
          bitRate:            128000,
          linearPCMBitDepth:  16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat:   false,
        },
        web: {},
      });
      await rec.startAsync();
      recordingRef.current = rec;
      setState('recording');
      setTimer(0);

      // Timer — auto-stop at MAX_SECONDS
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);

      // Metering
      meteringRef.current = setInterval(async () => {
        const status = await rec.getStatusAsync();
        if (status.isRecording && status.metering != null) {
          setMetering(status.metering);
        }
      }, 80);

    } catch (e) {
      console.error('Recording error:', e);
    }
  };

  // ── STOP RECORDING (emulator mock) ────────
  const stopRecordingMock = useCallback(async () => {
    if (timerRef.current)    clearInterval(timerRef.current);
    if (meteringRef.current) clearInterval(meteringRef.current);
    // Create a minimal valid WAV file (44 bytes header + silence)
    // so playback and send flow can be tested end to end
    const silentWavBase64 =
      'UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';
    const mockUri = FileSystem.cacheDirectory + 'mock_cry.wav';
    await FileSystem.writeAsStringAsync(mockUri, silentWavBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    setAudioUri(mockUri);
    setFileSize(44); // header only — silent WAV
    setState('preview');
  }, []);

  // ── STOP RECORDING ────────────────────────
  const stopRecording = useCallback(async () => {
    // Emulator has no real recording
    if (IS_EMULATOR) { stopRecordingMock(); return; }
    if (!recordingRef.current) return;
    if (timerRef.current)    clearInterval(timerRef.current);
    if (meteringRef.current) clearInterval(meteringRef.current);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) {
        setAudioUri(uri);
        // DEBUG — get file size, remove later
        try {
          const info = await FileSystem.getInfoAsync(uri, { size: true });
          setFileSize((info as any).size ?? null);
        } catch { setFileSize(null); }
        setState('preview');
      }
    } catch (e) {
      console.error('Stop error:', e);
    }
  }, []);

  // ── PLAY PREVIEW ──────────────────────────
  const playPreview = async () => {
    if (!audioUri) return;
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded) {
          const pos = status.durationMillis
            ? status.positionMillis / status.durationMillis
            : 0;
          setPlayPos(pos);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlayPos(0);
          }
        }
      }
    );
    soundRef.current = sound;
    setIsPlaying(true);
  };

  const stopPreview = async () => {
    await soundRef.current?.stopAsync();
    setIsPlaying(false);
    setPlayPos(0);
  };

  // ── SEND TO BACKEND ───────────────────────
  // POST /api/ai-predictions/predict
  // multipart/form-data — field: "file"
  // Auth: Bearer token from SecureStore
  const handleSend = async () => {
    if (!audioUri) return;
    setState('analyzing');

    try {
      // Get JWT token
      const token = await tokenStorage.get();

      // Build multipart form
      const formData = new FormData();
      formData.append('file', {
        uri:  audioUri,
        name: 'cry.wav',
        type: 'audio/wav',
      } as any);

      const response = await fetch(`${BASE_URL}/ai-predictions/predict`, {
        method:  'POST',
        headers: {
          'Accept':        'application/json',
          lang:            getLocale(),
          // ⚠️ Do NOT set Content-Type manually — fetch sets it automatically
          // with the correct boundary for multipart/form-data
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.message ?? `Server error ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message ?? t('cry.predictionFailed'));
      }

      setPrediction(json.prediction);   // e.g. "belly_pain"
      setConfidence(json.confidence);   // e.g. 0.9999
      setState('result');

    } catch (e: any) {
      console.error('Send error:', e);
      setAnalyzeError(e?.message ?? t('cry.analyzeFailed'));
      setState('preview');
    }
  };

  // ── RESET ─────────────────────────────────
  const handleReset = () => {
    cleanup();
    setAudioUri(null);
    setFileSize(null);
    setAnalyzeError(null);
    setTimer(0);
    setMetering(-160);
    setIsPlaying(false);
    setPlayPos(0);
    setState('idle');
  };

  // ── TIMER FORMAT ──────────────────────────
  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `00:${m}:${sec}`;
  };

  const timerProgress = timer / MAX_SECONDS;

  // ─────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('cry.analysisTitle')}</Text>
          <Text style={styles.headerSub}>{t('cry.analysisSub')}</Text>
        </View>

        {/* ── Main Card ── */}
        <View style={[styles.mainCard, Shadows.lg]}>

          {/* ── IDLE STATE ── */}
          {state === 'idle' && (
            <View style={styles.centerContent}>
              <Text style={styles.instructionText}>
                {t('cry.idleInstruction')}
              </Text>
              <View style={styles.pulseWrap}>
                <PulseRing delay={0}    size={220} />
                <PulseRing delay={600}  size={180} />
                <PulseRing delay={1200} size={140} />
                <TouchableOpacity
                  style={styles.micBtn}
                  onPress={startRecording}
                  activeOpacity={0.85}
                  disabled={!permission}
                >
                  <Ionicons name="mic" size={44} color={Colors.white} />
                </TouchableOpacity>
              </View>
              {!permission && (
                <Text style={styles.permText}>{t('cry.permRequired')}</Text>
              )}
              <Text style={styles.idleHint}>{t('cry.tapStart')}</Text>
            </View>
          )}

          {/* ── RECORDING STATE ── */}
          {state === 'recording' && (
            <View style={styles.centerContent}>
              <Text style={styles.recordingLabel}>{t('cry.recording')}</Text>

              {/* Waveform */}
              <View style={styles.waveformWrap}>
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <WaveBar
                    key={i}
                    index={i}
                    isActive={true}
                    metering={metering + (Math.sin(i * 0.5) * 20)}
                  />
                ))}
              </View>

              {/* Timer ring */}
              <View style={styles.timerSection}>
                <Text style={styles.timerText}>{formatTimer(timer)}</Text>
                <View style={styles.timerTrack}>
                  <View style={[styles.timerFill, { width: `${timerProgress * 100}%` as any }]} />
                </View>
                <Text style={styles.timerHint}>{t('cry.remaining', { n: MAX_SECONDS - timer })}</Text>
              </View>

              {/* Stop button */}
              <TouchableOpacity style={styles.stopBtn} onPress={stopRecording} activeOpacity={0.8}>
                <View style={styles.stopSquare} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── PREVIEW STATE ── */}
          {state === 'preview' && (
            <View style={styles.centerContent}>
              <View style={styles.previewIconWrap}>
                <Ionicons name="checkmark-circle" size={52} color={Colors.success} />
              </View>
              <Text style={styles.previewTitle}>{t('cry.previewTitle')}</Text>
              <Text style={styles.previewSub}>{t('cry.previewSub', { n: timer })}</Text>
              {/* DEBUG INFO — remove this View when done testing */}
              <View style={styles.debugBox}>
                <Text style={styles.debugText}>
                  📁 {audioUri ? audioUri.split('/').pop() : '—'}
                </Text>
                <Text style={styles.debugText}>
                  📦 {fileSize != null ? `${(fileSize / 1024).toFixed(1)} KB` : '—'} · .wav
                </Text>
                <Text style={styles.debugText}>
                  🕐 {timer}s · {IS_EMULATOR ? 'EMULATOR MOCK' : 'REAL DEVICE'}
                </Text>
              </View>
              {/* END DEBUG INFO */}
              {/* API Error Banner */}
              {analyzeError && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
                  <Text style={styles.errorBannerText}>{analyzeError}</Text>
                </View>
              )}

              {/* Playback bar */}
              <View style={styles.playbackRow}>
                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={isPlaying ? stopPreview : playPreview}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={22}
                    color={Colors.white}
                  />
                </TouchableOpacity>
                <View style={styles.playTrack}>
                  <View style={[styles.playFill, { width: `${playPos * 100}%` as any }]} />
                </View>
              </View>

              {/* Actions */}
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.rerecordBtn} onPress={handleReset}>
                  <Ionicons name="refresh-outline" size={18} color={Colors.textMuted} />
                  <Text style={styles.rerecordText}>{t('cry.rerecord')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                  <Ionicons name="paper-plane-outline" size={18} color={Colors.white} />
                  <Text style={styles.sendText}>{t('cry.analyze')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── ANALYZING STATE ── */}
          {state === 'analyzing' && (
            <View style={styles.centerContent}>
              <View style={styles.analyzingWrap}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <View style={styles.analyzingPulse} />
              </View>
              <Text style={styles.analyzingTitle}>{t('cry.analyzingTitle')}</Text>
              <Text style={styles.analyzingText}>
                {t('cry.analyzingText')}
              </Text>
            </View>
          )}

          {/* ── RESULT STATE ── */}
          {state === 'result' && (
            <ResultCard
              prediction={prediction}
              confidence={confidence}
              onReset={handleReset}
            />
          )}

        </View>

        {/* ── Quick Reference ── */}
        {(state === 'idle' || state === 'recording') && (
          <View style={styles.referenceSection}>
            <Text style={styles.referenceTitle}>{t('cry.referenceTitle')}</Text>
            <View style={styles.referenceGrid}>
              {Object.keys(CRY_STYLE)
                .filter(k => k !== 'unknown')
                .map(key => {
                  const meta = CRY_STYLE[key];
                  return (
                    <View key={key} style={[styles.refChip, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon as any} size={14} color={meta.color} />
                      <Text style={[styles.refChipText, { color: meta.color }]}>{t(`cry.reasons.${key}.label`)}</Text>
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bgMain },
  scroll: { padding: Spacing.xl, gap: Spacing.xl },

  // Header
  header:     { gap: 4 },
  headerTitle:{ fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  headerSub:  { fontSize: FontSize.md, color: Colors.textMuted },

  // Main card
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    minHeight: height * 0.52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: { alignItems: 'center', gap: Spacing.xl, width: '100%' },

  // IDLE
  instructionText: {
    fontSize: FontSize.md, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  pulseWrap: {
    width: 220, height: 220,
    alignItems: 'center', justifyContent: 'center',
  },
  micBtn: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.lg,
  },
  idleHint:  { fontSize: FontSize.sm, color: Colors.textMuted },
  permText:  { fontSize: FontSize.sm, color: Colors.danger, textAlign: 'center' },

  // RECORDING
  recordingLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.danger },
  waveformWrap:   {
    flexDirection: 'row', alignItems: 'center',
    gap: 3, height: 80, width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  timerSection: { alignItems: 'center', gap: Spacing.sm, width: '100%' },
  timerText:    { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark, fontVariant: ['tabular-nums'] },
  timerTrack:   { width: '100%', height: 4, backgroundColor: Colors.bgInput, borderRadius: 2, overflow: 'hidden' },
  timerFill:    { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  timerHint:    { fontSize: FontSize.xs, color: Colors.textMuted },
  stopBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.dangerSoft,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.danger,
  },
  stopSquare: {
    width: 22, height: 22,
    backgroundColor: Colors.danger, borderRadius: 4,
  },

  // PREVIEW
  previewIconWrap: { marginBottom: -Spacing.sm },
  previewTitle:    { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  previewSub:      { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: -Spacing.md },
  playbackRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.md, width: '100%',
  },
  playBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  playTrack:  { flex: 1, height: 6, backgroundColor: Colors.bgInput, borderRadius: 3, overflow: 'hidden' },
  playFill:   { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  previewActions: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  rerecordBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
    borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border,
  },
  rerecordText:{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  sendBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
    borderRadius: Radius.xl, backgroundColor: Colors.primary,
    ...Shadows.md,
  },
  sendText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.white },

  // ANALYZING
  analyzingWrap:  { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  analyzingPulse: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primarySoft },
  analyzingTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  analyzingText:  { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg },

  // RESULT
  resultIconWrap: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: Spacing.md,
  },
  resultIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.lg,
  },
  resultLabel:      { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark, textAlign: 'center' },
  resultDescription:{ fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.sm },

  confSection:  { width: '100%', gap: Spacing.sm },
  confLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confTitle:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMedium },
  confPct:      { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  confTrack:    { height: 10, backgroundColor: Colors.bgInput, borderRadius: 5, overflow: 'hidden' },
  confFill:     { height: '100%', borderRadius: 5 },
  confNote:     { fontSize: FontSize.xs, color: Colors.textMuted },

  tipCard: {
    width: '100%', padding: Spacing.lg,
    backgroundColor: Colors.bgInput, borderRadius: Radius.xl,
    borderLeftWidth: 4, gap: Spacing.sm,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipTitle:  { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  tipText:   { fontSize: FontSize.sm, color: Colors.textMedium, lineHeight: 20 },

  recordAgainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg, width: '100%',
    borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.primarySoft,
    marginTop: Spacing.sm,
  },
  recordAgainText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },

  // Quick Reference
  referenceSection: { gap: Spacing.md },
  referenceTitle:   { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textDark },
  referenceGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  refChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  refChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.dangerSoft, borderRadius: Radius.md,
    padding: Spacing.md, width: '100%',
    borderLeftWidth: 3, borderLeftColor: Colors.danger,
  },
  errorBannerText: { flex: 1, fontSize: FontSize.xs, color: Colors.danger, fontWeight: FontWeight.medium },

  // DEBUG STYLES — remove with debug block
  debugBox: {
    width: '100%', backgroundColor: '#1A2B4A', borderRadius: Radius.md,
    padding: Spacing.md, gap: 4,
  },
  debugText: { fontSize: 11, color: '#7BB8EC', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  // END DEBUG STYLES
});