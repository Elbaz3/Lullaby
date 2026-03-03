import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../../store/babyStore';
import { cryService } from '../../services/cry.service';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { CryReasonCard } from '../../components/CryReasonCard';
import { BabyAvatar } from '../../components/BabyAvatar';
import { SectionHeader } from '../../components/ui/Card';
import { CryEvent } from '../../types';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

// ── Pulse Animation ───────────────────────────

const PulseRing: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: color,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
        transform: [
          {
            scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }),
          },
        ],
      }}
    />
  );
};

// ── Main Screen ───────────────────────────────

export const CryDetectionScreen: React.FC = () => {
  const { activeBaby, activeBabyId, latestCryEvent } = useBabyStore();
  const [cryEvents, setCryEvents] = useState<CryEvent[]>([]);
  const [isListening, setIsListening] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const latestMeta = latestCryEvent
    ? cryService.getCryReasonMeta(latestCryEvent.reason)
    : null;

  // Determine listening state color
  const stateColor = latestCryEvent && isListening
    ? latestMeta?.color ?? Colors.primary
    : isListening
    ? Colors.success
    : Colors.textMuted;

  useEffect(() => {
    if (activeBabyId) loadEvents();
  }, [activeBabyId]);

  const loadEvents = async () => {
    if (!activeBabyId) return;
    setIsLoading(true);
    try {
      const res = await cryService.getCryEvents(activeBabyId);
      setCryEvents(res.items);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => setIsListening((v) => !v);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Cry Detection</Text>
            <Text style={styles.subtitle}>AI-powered cry analysis</Text>
          </View>
          <BabyAvatar baby={activeBaby ?? undefined} size={44} />
        </View>

        {/* Live Monitor Widget */}
        <View style={[styles.monitorCard, Shadows.lg]}>
          {/* Baby name */}
          <Text style={styles.monitorBabyName}>
            {activeBaby?.name ?? 'No baby selected'}
          </Text>

          {/* Pulse animation */}
          <View style={styles.pulseContainer}>
            {isListening && (
              <>
                <PulseRing color={stateColor} delay={0} />
                <PulseRing color={stateColor} delay={500} />
                <PulseRing color={stateColor} delay={1000} />
              </>
            )}
            <View style={[styles.centerCircle, { backgroundColor: stateColor + '20' }]}>
              <View style={[styles.innerCircle, { backgroundColor: stateColor }]}>
                <Ionicons
                  name={latestCryEvent && isListening ? 'ear' : isListening ? 'mic' : 'mic-off'}
                  size={36}
                  color={Colors.white}
                />
              </View>
            </View>
          </View>

          {/* Status Text */}
          {isListening ? (
            latestCryEvent && latestMeta ? (
              <View style={styles.detectedState}>
                <Text style={styles.detectedEmoji}>{latestMeta.emoji}</Text>
                <Text style={styles.detectedLabel}>
                  {latestMeta.label} detected
                </Text>
                <Text style={styles.detectedTime}>
                  {formatDistanceToNow(new Date(latestCryEvent.timestamp), { addSuffix: true })}
                </Text>
                <View style={[styles.confBar, { backgroundColor: latestMeta.color + '20' }]}>
                  <View
                    style={[
                      styles.confBarFill,
                      {
                        width: `${latestCryEvent.confidence}%` as any,
                        backgroundColor: latestMeta.color,
                      },
                    ]}
                  />
                  <Text style={[styles.confBarLabel, { color: latestMeta.color }]}>
                    {latestCryEvent.confidence}% confidence
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.listeningState}>
                <View style={styles.listeningDots}>
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      style={[styles.listeningDot, { backgroundColor: Colors.success }]}
                    />
                  ))}
                </View>
                <Text style={styles.listeningText}>Listening for baby sounds...</Text>
              </View>
            )
          ) : (
            <Text style={styles.pausedText}>Monitoring paused</Text>
          )}

          {/* Toggle Button */}
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              { backgroundColor: isListening ? Colors.dangerSoft : Colors.primarySoft },
            ]}
            onPress={toggleListening}
          >
            <Ionicons
              name={isListening ? 'pause-circle-outline' : 'play-circle-outline'}
              size={18}
              color={isListening ? Colors.danger : Colors.primary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: isListening ? Colors.danger : Colors.primary },
              ]}
            >
              {isListening ? 'Pause Monitoring' : 'Resume Monitoring'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Latest Cry Analysis */}
        {latestCryEvent && latestMeta && (
          <>
            <SectionHeader title="Latest Analysis" />
            <CryReasonCard event={latestCryEvent} meta={latestMeta} />
          </>
        )}

        {/* Cry History */}
        {cryEvents.length > 0 && (
          <>
            <SectionHeader title="Today's Cry Events" action="See All" />
            <View style={styles.historyList}>
              {cryEvents.slice(0, 5).map((event) => {
                const meta = cryService.getCryReasonMeta(event.reason);
                return (
                  <CryReasonCard
                    key={event.id}
                    event={event}
                    meta={meta}
                    compact
                  />
                );
              })}
            </View>
          </>
        )}

        {/* Cry Reasons Legend */}
        <SectionHeader title="Cry Types Reference" />
        <View style={styles.legend}>
          {cryService.getAllCryReasonsMeta().map((meta) => (
            <View key={meta.reason} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: meta.color }]} />
              <Text style={styles.legendEmoji}>{meta.emoji}</Text>
              <Text style={styles.legendLabel}>{meta.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  container: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  monitorCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  monitorBabyName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textDark,
  },
  pulseContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  centerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  detectedState: {
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  detectedEmoji: { fontSize: 36 },
  detectedLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
  },
  detectedTime: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  confBar: {
    width: '100%',
    height: 36,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: Radius.lg,
  },
  confBarLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    zIndex: 1,
  },
  listeningState: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listeningDots: {
    flexDirection: 'row',
    gap: 6,
  },
  listeningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  listeningText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  pausedText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  toggleBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  historyList: {
    gap: Spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendEmoji: { fontSize: 12 },
  legendLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textDark,
  },
});
