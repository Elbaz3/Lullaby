import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { AuthStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const FEATURES = [
  { emoji: '🎤', label: 'Cry Detection' },
  { emoji: '💓', label: 'Heart Monitor' },
  { emoji: '🌡️', label: 'Temperature' },
  { emoji: '💨', label: 'Air Quality' },
];

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Hero Image Area */}
      <View style={styles.heroArea}>
        <LinearGradient
          colors={[Colors.primarySoft, Colors.bgMain]}
          style={styles.heroGradient}
        >
          <View style={styles.circleDecor} />
          <View style={styles.heroImagePlaceholder}>
            <Text style={styles.heroEmoji}>👶</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Feature Pills */}
        <View style={styles.featureRow}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featurePill}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Headline */}
        <View style={styles.textGroup}>
          <Text style={styles.headline}>
            Welcome to{' '}
            <Text style={styles.brand}>Lullaby</Text>
          </Text>
          <Text style={styles.subtitle}>
            Monitor your baby's health and understand their needs with ease — any time, from anywhere.
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.actions}>
          <Button
            label="Get Started"
            onPress={() => navigation.navigate('Register')}
          />
          <Button
            label="I already have an account"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  heroArea: {
    height: height * 0.45,
    overflow: 'hidden',
  },
  heroGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDecor: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: Colors.white,
    opacity: 0.6,
    bottom: -width * 0.2,
  },
  heroImagePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 1,
  },
  heroEmoji: {
    fontSize: 90,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  featureEmoji: {
    fontSize: 14,
  },
  featureLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMedium,
  },
  textGroup: {
    gap: Spacing.sm,
  },
  headline: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 38,
  },
  brand: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: Spacing.sm,
  },
});
