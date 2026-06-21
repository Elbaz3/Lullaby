import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import { LinearGradient } from 'expo-linear-gradient'
import * as FileSystem from 'expo-file-system'
import * as DocumentPicker from 'expo-document-picker'

// Logic/Data Imports
import { tokenStorage, BASE_URL } from '../../services/api'
import { getLocale } from '../../store/localeStore'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadows
} from '../../constants/theme'
import { useTranslation } from '../../i18n/useTranslation'

const { width, height } = Dimensions.get('window')

// ── Visual Styles Mapping ──────────────────────────────────────────────────
const CRY_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  hungry: { icon: 'fast-food-outline', color: '#C07792', bg: '#FFF0F5' },
  pain: { icon: 'bandage-outline', color: '#E53935', bg: '#FFEBEE' },
  tired: { icon: 'bed-outline', color: '#7E57C2', bg: '#F3E5F5' },
  burping: { icon: 'wine-outline', color: '#26A69A', bg: '#E0F2F1' },
  lonely: { icon: 'people-outline', color: '#EC407A', bg: '#FCE4EC' },
  discomfort: { icon: 'thermometer-outline', color: '#FFA726', bg: '#FFF8E1' },
  belly_pain: { icon: 'fitness-outline', color: '#EF6C00', bg: '#FFF3E0' },
  unknown: { icon: 'help-circle-outline', color: '#78909C', bg: '#ECEFF1' }
}

function mapCryReasonKey(prediction: string): string {
  if (prediction === 'needs_attention') return 'lonely'
  if (CRY_STYLE[prediction]) return prediction
  return 'unknown'
}

type ScreenState = 'idle' | 'recording' | 'preview' | 'analyzing' | 'result'

// ── Animated Waveform Bar ──────────────────────────────────────────────────
const WaveBar: React.FC<{
  index: number
  isActive: boolean
  metering: number
}> = ({ index, isActive, metering }) => {
  const anim = useRef(new Animated.Value(0.15)).current
  useEffect(() => {
    if (isActive) {
      const target = Math.max(
        0.1,
        Math.min(1, (metering + 160) / 160 + Math.random() * 0.3)
      )
      Animated.spring(anim, {
        toValue: target,
        useNativeDriver: true,
        speed: 20,
        bounciness: 2
      }).start()
    } else {
      Animated.spring(anim, {
        toValue: 0.15,
        useNativeDriver: true,
        speed: 8
      }).start()
    }
  }, [isActive, metering])

  return (
    <Animated.View
      style={[
        styles.waveBar,
        { opacity: isActive ? 1 : 0.3, transform: [{ scaleY: anim }] }
      ]}
    />
  )
}

// ── Pulse Rings ─────────────────────────────────────────────────────────────
const PulseRing: React.FC<{ delay: number; size: number }> = ({
  delay,
  size
}) => {
  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [])
  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: anim.interpolate({
            inputRange: [0, 0.4, 1],
            outputRange: [0, 0.5, 0]
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1]
              })
            }
          ]
        }
      ]}
    />
  )
}

// ── Result Card ──────────────────────────────────────────────────────────────
const ResultCard: React.FC<{
  prediction: string
  confidence: number
  onReset: () => void
}> = ({ prediction, confidence, onReset }) => {
  const { t } = useTranslation()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const barAnim = useRef(new Animated.Value(0)).current

  const key = mapCryReasonKey(prediction)
  const meta = CRY_STYLE[key] || CRY_STYLE.unknown
  const pct = Math.round(confidence * 100)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start()
    Animated.timing(barAnim, {
      toValue: pct / 100,
      duration: 1000,
      delay: 300,
      useNativeDriver: false
    }).start()
  }, [prediction])

  return (
    <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
      <View style={[styles.resultIconWrap, { backgroundColor: meta.bg }]}>
        <View
          style={[styles.resultIconCircle, { backgroundColor: meta.color }]}
        >
          <Ionicons name={meta.icon as any} size={42} color="#fff" />
        </View>
      </View>

      <Text style={styles.resultLabel}>{t(`cry.reasons.${key}.label`)}</Text>
      <Text style={styles.resultDescription}>
        {t(`cry.reasons.${key}.description`)}
      </Text>

      <View style={styles.confSection}>
        <View style={styles.confLabelRow}>
          <Text style={styles.confTitle}>{t('cry.confidence')}</Text>
          <Text style={[styles.confPct, { color: meta.color }]}>{pct}%</Text>
        </View>
        <View style={styles.confTrack}>
          <Animated.View
            style={[
              styles.confFill,
              {
                backgroundColor: meta.color,
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }) as any
              }
            ]}
          />
        </View>
      </View>

      <View style={[styles.tipCard, { borderLeftColor: meta.color }]}>
        <View style={styles.tipHeader}>
          <Ionicons name="bulb-outline" size={16} color={meta.color} />
          <Text style={[styles.tipTitle, { color: meta.color }]}>
            {t('cry.whatToDo')}
          </Text>
        </View>
        <Text style={styles.tipText}>{t(`cry.reasons.${key}.tip`)}</Text>
      </View>

      <TouchableOpacity style={styles.recordAgainBtn} onPress={onReset}>
        <Ionicons name="refresh-outline" size={18} color="#C07792" />
        <Text style={styles.recordAgainText}>{t('cry.recordAgain')}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export const CryDetectionScreen: React.FC = () => {
  const { t } = useTranslation()
  const [state, setState] = useState<ScreenState>('idle')
  const [timer, setTimer] = useState(0)
  const [metering, setMetering] = useState(-160)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioName, setAudioName] = useState<string>('cry.wav')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playPos, setPlayPos] = useState(0)
  const [prediction, setPrediction] = useState<string>('')
  const [confidence, setConfidence] = useState<number>(0)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [permission, setPermission] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const recordingRef = useRef<Audio.Recording | null>(null)
  const soundRef = useRef<Audio.Sound | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const meteringRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const MAX_SECONDS = 10
  const IS_EMULATOR = __DEV__ && Platform.OS === 'android'

  useEffect(() => {
    ;(async () => {
      const { granted } = await Audio.requestPermissionsAsync()
      setPermission(granted)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      })
    })()
    return () => cleanup()
  }, [])

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (meteringRef.current) clearInterval(meteringRef.current)
    soundRef.current?.unloadAsync()
  }

  // ── Record ────────────────────────────────────────────────────────────────

  const startRecording = async () => {
    if (!permission) return
    if (IS_EMULATOR) {
      setState('recording')
      setTimer(0)
      timerRef.current = setInterval(
        () =>
          setTimer((p) =>
            p >= MAX_SECONDS ? (stopRecordingMock(), MAX_SECONDS) : p + 1
          ),
        1000
      )
      meteringRef.current = setInterval(
        () => setMetering(-80 + Math.sin(Date.now() / 200) * 40),
        80
      )
      return
    }
    try {
      const rec = new Audio.Recording()
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await rec.startAsync()
      recordingRef.current = rec
      setState('recording')
      setTimer(0)
      timerRef.current = setInterval(
        () =>
          setTimer((p) =>
            p >= MAX_SECONDS ? (stopRecording(), MAX_SECONDS) : p + 1
          ),
        1000
      )
      meteringRef.current = setInterval(async () => {
        const status = await rec.getStatusAsync()
        if (status.isRecording && status.metering != null)
          setMetering(status.metering)
      }, 80)
    } catch (e) {
      console.error(e)
    }
  }

  const stopRecordingMock = async () => {
    cleanup()
    const mockUri = FileSystem.cacheDirectory + 'mock_cry.wav'
    await FileSystem.writeAsStringAsync(
      mockUri,
      'UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=',
      { encoding: FileSystem.EncodingType.Base64 }
    )
    setAudioUri(mockUri)
    setAudioName('cry.wav')
    setState('preview')
  }

  const stopRecording = async () => {
    if (IS_EMULATOR) return stopRecordingMock()
    if (!recordingRef.current) return
    cleanup()
    try {
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      setAudioUri(uri)
      setAudioName('cry.wav')
      setState('preview')
    } catch (e) {
      console.error(e)
    }
  }

  // ── Upload from device ────────────────────────────────────────────────────

  const pickAudioFile = async () => {
    setIsUploading(true)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'], // any audio format
        copyToCacheDirectory: true
      })

      // User cancelled
      if (result.canceled || !result.assets?.length) return

      const file = result.assets[0]
      setAudioUri(file.uri)
      setAudioName(file.name ?? 'audio_upload')
      setAnalyzeError(null)
      setState('preview')
    } catch (e) {
      console.error('File pick error:', e)
    } finally {
      setIsUploading(false)
    }
  }

  // ── Analyze ───────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!audioUri) return
    setState('analyzing')
    try {
      const token = await tokenStorage.get()
      const formData = new FormData()

      // Infer MIME type from file name extension
      const ext = audioName.split('.').pop()?.toLowerCase() ?? 'wav'
      const mimeType =
        ext === 'mp3'
          ? 'audio/mpeg'
          : ext === 'm4a'
            ? 'audio/mp4'
            : ext === 'ogg'
              ? 'audio/ogg'
              : 'audio/wav'

      formData.append('file', {
        uri: audioUri,
        name: audioName,
        type: mimeType
      } as any)

      const response = await fetch(`${BASE_URL}/ai-predictions/predict`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          lang: getLocale(),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.message)
      setPrediction(json.prediction)
      setConfidence(json.confidence)
      setState('result')
    } catch (e: any) {
      setAnalyzeError(e.message || t('cry.analyzeFailed'))
      setState('preview')
    }
  }

  // ── Playback ──────────────────────────────────────────────────────────────

  const playPreview = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri! },
      { shouldPlay: true },
      (s) => {
        if (s.isLoaded) {
          setPlayPos(s.positionMillis / (s.durationMillis || 1))
          if (s.didJustFinish) setIsPlaying(false)
        }
      }
    )
    soundRef.current = sound
    setIsPlaying(true)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LinearGradient
      colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('cry.analysisTitle')}</Text>
            <Text style={styles.headerSub}>{t('cry.analysisSub')}</Text>
          </View>

          <View style={[styles.mainCard, Shadows.lg]}>
            {/* ── IDLE ── */}
            {state === 'idle' && (
              <View style={styles.centerContent}>
                <Text style={styles.instructionText}>
                  {t('cry.idleInstruction')}
                </Text>

                {/* Mic button with pulse rings */}
                <View style={styles.pulseWrap}>
                  <PulseRing delay={0} size={220} />
                  <PulseRing delay={600} size={180} />
                  <TouchableOpacity
                    style={styles.micBtn}
                    onPress={startRecording}
                  >
                    <Ionicons name="mic" size={44} color="#fff" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.idleHint}>{t('cry.tapStart')}</Text>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Upload from device */}
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={pickAudioFile}
                  disabled={isUploading}
                  activeOpacity={0.8}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#C07792" />
                  ) : (
                    <>
                      <View style={styles.uploadIconBox}>
                        <Ionicons
                          name="folder-open-outline"
                          size={20}
                          color="#C07792"
                        />
                      </View>
                      <Text style={styles.uploadBtnText}>
                        Upload from device
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#C07792"
                        style={{ opacity: 0.6 }}
                      />
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.uploadHint}>
                  Supports WAV, MP3, M4A, OGG
                </Text>
              </View>
            )}

            {/* ── RECORDING ── */}
            {state === 'recording' && (
              <View style={styles.centerContent}>
                <Text style={styles.recordingLabel}>{t('cry.recording')}</Text>
                <View style={styles.waveformWrap}>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <WaveBar
                      key={i}
                      index={i}
                      isActive={true}
                      metering={metering}
                    />
                  ))}
                </View>
                <Text style={styles.timerText}>
                  00:00:{timer.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.stopBtn}
                  onPress={stopRecording}
                >
                  <View style={styles.stopSquare} />
                </TouchableOpacity>
              </View>
            )}

            {/* ── PREVIEW ── */}
            {state === 'preview' && (
              <View style={styles.centerContent}>
                <Ionicons name="checkmark-circle" size={52} color="#4CAF50" />
                <Text style={styles.previewTitle}>{t('cry.previewTitle')}</Text>

                {/* Show file name if uploaded */}
                {audioName !== 'cry.wav' && (
                  <View style={styles.fileNameRow}>
                    <Ionicons
                      name="document-outline"
                      size={14}
                      color="#A97C8E"
                    />
                    <Text
                      style={styles.fileNameText}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {audioName}
                    </Text>
                  </View>
                )}

                {analyzeError && (
                  <Text style={styles.errorText}>{analyzeError}</Text>
                )}

                <View style={styles.playbackRow}>
                  <TouchableOpacity
                    style={styles.playBtn}
                    onPress={
                      isPlaying
                        ? () => soundRef.current?.pauseAsync()
                        : playPreview
                    }
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  <View style={styles.playTrack}>
                    <View
                      style={[styles.playFill, { width: `${playPos * 100}%` }]}
                    />
                  </View>
                </View>

                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.rerecordBtn}
                    onPress={() => setState('idle')}
                  >
                    <Text>{t('cry.rerecord')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                    <Text style={{ color: '#fff' }}>{t('cry.analyze')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── ANALYZING ── */}
            {state === 'analyzing' && (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#C07792" />
                <Text style={styles.analyzingTitle}>
                  {t('cry.analyzingTitle')}
                </Text>
              </View>
            )}

            {/* ── RESULT ── */}
            {state === 'result' && (
              <ResultCard
                prediction={prediction}
                confidence={confidence}
                onReset={() => setState('idle')}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#8E5E71' },
  headerSub: { fontSize: 14, color: '#A97C8E' },
  mainCard: {
    backgroundColor: '#FFFFFFCC',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    minHeight: 450,
    justifyContent: 'center'
  },
  centerContent: { alignItems: 'center', width: '100%', gap: 20 },
  instructionText: {
    fontSize: 15,
    color: '#8E5E71',
    textAlign: 'center',
    lineHeight: 22
  },

  /* pulse / mic */
  pulseWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center'
  },
  micBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#C07792',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md
  },
  pulseRing: { position: 'absolute', borderWidth: 1.5, borderColor: '#C07792' },
  idleHint: { fontSize: 13, color: '#A97C8E' },

  /* divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    gap: 10
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D0DC' },
  dividerText: { fontSize: 12, color: '#A97C8E', fontWeight: '600' },

  /* upload button */
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0D5E0',
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: '100%',
    minHeight: 52,
    justifyContent: 'center'
  },
  uploadIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm
  },
  uploadBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#8E5E71'
  },
  uploadHint: { fontSize: 11, color: '#C4A0B0', marginTop: -10 },

  /* recording */
  recordingLabel: { fontSize: 18, fontWeight: '600', color: '#C07792' },
  waveformWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 80
  },
  waveBar: {
    width: 3,
    height: 80,
    borderRadius: 2,
    backgroundColor: '#C07792'
  },
  timerText: { fontSize: 24, fontWeight: '700', color: '#8E5E71' },
  stopBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E53935'
  },
  stopSquare: {
    width: 20,
    height: 20,
    backgroundColor: '#E53935',
    borderRadius: 4
  },

  /* preview */
  previewTitle: { fontSize: 22, fontWeight: '700', color: '#8E5E71' },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '90%'
  },
  fileNameText: { fontSize: 12, color: '#A97C8E', flex: 1 },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    width: '100%',
    marginTop: 10
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C07792',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0D5E0',
    borderRadius: 3
  },
  playFill: { height: '100%', backgroundColor: '#C07792', borderRadius: 3 },
  previewActions: { flexDirection: 'row', gap: 15, width: '100%' },
  rerecordBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#C07792',
    alignItems: 'center'
  },
  sendBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#C07792',
    alignItems: 'center'
  },

  /* result */
  resultIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  resultIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md
  },
  resultLabel: { fontSize: 26, fontWeight: '700', color: '#8E5E71' },
  resultDescription: {
    fontSize: 14,
    color: '#A97C8E',
    textAlign: 'center',
    marginVertical: 10
  },
  confSection: { width: '100%', marginVertical: 15 },
  confLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  confTitle: { fontSize: 13, color: '#8E5E71' },
  confPct: { fontWeight: 'bold' },
  confTrack: { height: 8, backgroundColor: '#F0D5E0', borderRadius: 4 },
  confFill: { height: '100%', borderRadius: 4 },
  tipCard: {
    padding: 15,
    backgroundColor: '#FDF8FA',
    borderRadius: 15,
    borderLeftWidth: 4,
    width: '100%'
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5
  },
  tipTitle: { fontWeight: 'bold', fontSize: 13 },
  tipText: { fontSize: 12, color: '#8E5E71' },
  recordAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20
  },
  recordAgainText: { color: '#C07792', fontWeight: 'bold' },
  errorText: { color: '#E53935', fontSize: 12, marginBottom: 10 },
  analyzingTitle: { marginTop: 20, fontSize: 18, color: '#C07792' }
})
