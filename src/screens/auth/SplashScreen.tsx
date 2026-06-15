import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, FontWeight } from '../../constants/theme';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'>;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize auth and navigate
    const bootstrap = async () => {
      await initialize();
      setTimeout(() => {
        if (isAuthenticated) {
          // Navigate to App — handled by RootNavigator
        } else {
          navigation.replace('Welcome');
        }
      }, 1800);
    };

    bootstrap();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌙</Text>
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.logoText}>
            Lull<Text style={styles.logoTextAccent}>aby</Text>
          </Text>
          <Text style={styles.tagline}>{t('splash.tagline')}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.dots, { opacity: fadeAnim }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 16,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 50,
  },
  textGroup: {
    alignItems: 'center',
    gap: 4,
  },
  logoText: {
    fontSize: 38,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  logoTextAccent: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
});
