// ─────────────────────────────────────────────
//  ONBOARDING — CONNECT DEVICE SCREEN
//  UI only — no API yet
//  Shows Bluetooth scan animation
//  "Skip for now" → Home
// ─────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');
type Nav    = NativeStackNavigationProp<any>;
type Params = { OnboardingConnectDevice: { babyName: string; babyPhoto?: string | null } };

// Pulsing ring component
const PulseRing: React.FC<{ delay: number; size: number; color: string }> = ({ delay, size, color }) => {
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
      borderWidth: 2, borderColor: color,
      opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.3, 0] }),
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
    }} />
  );
};

export const OnboardingConnectDeviceScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<RouteProp<Params, 'OnboardingConnectDevice'>>();
  const { babyName } = route.params;
  const { completeOnboarding } = useAuthStore();

  const handleSkip = async () => {
    // Mark onboarding complete → RootNavigator auto-switches to App
    await completeOnboarding();
  };

  const handleConnect = async () => {
    // TODO: implement BLE device scan when backend is ready
    await completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Connect a Device</Text>
          <Text style={styles.subtitle}>
            Link a Lullaby sensor to monitor{'\n'}
            <Text style={styles.babyName}>{babyName}</Text>'s health in real time
          </Text>
        </View>

        {/* Progress dots */}
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        {/* Radar animation */}
        <View style={styles.radarSection}>
          <PulseRing delay={0}    size={width * 0.75} color={Colors.primary} />
          <PulseRing delay={600}  size={width * 0.55} color={Colors.primary} />
          <PulseRing delay={1200} size={width * 0.35} color={Colors.primary} />
          <View style={styles.radarCenter}>
            <View style={styles.deviceIcon}>
              <Ionicons name="bluetooth" size={36} color={Colors.white} />
            </View>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.steps}>
          {[
            { icon: 'power-outline',     text: 'Turn on your Lullaby device' },
            { icon: 'bluetooth-outline', text: 'Make sure Bluetooth is enabled' },
            { icon: 'wifi-outline',      text: 'Keep device within 10 meters' },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon as any} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Coming soon badge */}
        <View style={styles.comingSoonBadge}>
          <Ionicons name="construct-outline" size={14} color={Colors.warning} />
          <Text style={styles.comingSoonText}>Device pairing coming soon</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Scan for Devices"
            onPress={handleConnect}
            disabled
            size="lg"
          />
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.white },
  container:  { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl, gap: Spacing.lg },
  header:     { alignItems: 'center', gap: Spacing.sm },
  title:      { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:   { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  babyName:   { color: Colors.primary, fontWeight: FontWeight.bold },
  dots:       { flexDirection: 'row', gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive:  { width: 24, backgroundColor: Colors.primary },

  radarSection: {
    width: width * 0.75, height: width * 0.75,
    alignItems: 'center', justifyContent: 'center',
  },
  radarCenter: { alignItems: 'center', justifyContent: 'center' },
  deviceIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Shadows.lg,
  },

  steps:    { width: '100%', gap: Spacing.md },
  step:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  stepText: { fontSize: FontSize.sm, color: Colors.textMedium, flex: 1 },

  comingSoonBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.warningSoft, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  comingSoonText: { fontSize: FontSize.sm, color: Colors.warning, fontWeight: FontWeight.semibold },

  actions:  { width: '100%', marginTop: 'auto' as any, gap: Spacing.md, paddingBottom: Spacing.lg },
  skipBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Spacing.sm },
  skipText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.medium },
});