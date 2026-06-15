// ─────────────────────────────────────────────
//  ONBOARDING WELCOME SCREEN
//  Shown after OTP verification (new users only)
// ─────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../i18n/useTranslation';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<any>;

export const OnboardingWelcomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* Hero image */}
        <View style={styles.heroSection}>
          <View style={styles.imageWrap}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🍼</Text>
          </View>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.title}>{t('onboarding.welcomeTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.welcomeSubtitle')}
          </Text>
        </View>

        {/* Progress dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* CTA */}
        <View style={styles.actions}>
          <Button
            label={t('onboarding.addBabyCta')}
            onPress={() => navigation.navigate('OnboardingAddBaby')}
            size="lg"
          />
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bgMain },
  container:  { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl, gap: Spacing.xl },
  heroSection:{ alignItems: 'center', marginTop: Spacing.xxl },
  imageWrap:  {
    width: width * 0.55, height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    overflow: 'hidden', backgroundColor: Colors.white,
    ...Shadows.lg, borderWidth: 4, borderColor: Colors.white,
  },
  heroImage:  { width: '100%', height: '100%' },
  badge:      {
    position: 'absolute', bottom: 8, right: 8,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white, ...Shadows.md,
  },
  badgeEmoji: { fontSize: 20 },
  textSection:{ alignItems: 'center', gap: Spacing.md },
  title:      { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:   { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 24 },
  dots:       { flexDirection: 'row', gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive:  { width: 24, backgroundColor: Colors.primary },
  actions:    { width: '100%', marginTop: 'auto' as any, paddingBottom: Spacing.lg },
});