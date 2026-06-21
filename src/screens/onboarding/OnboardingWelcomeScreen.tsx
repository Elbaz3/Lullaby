import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

// Logic & Theme Imports from the "Dynamicity" file
import { Colors, FontSize, FontWeight, Shadows } from '../../constants/theme'
import { useTranslation } from '../../i18n/useTranslation'

const { width, height } = Dimensions.get('window')
type Nav = NativeStackNavigationProp<any>

export const OnboardingWelcomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()

  return (
    <View style={styles.mainContainer}>
      {/* Visual Background - Ellipse 208 from UI version */}
      <View style={styles.whiteEllipse} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Dynamic Title - Translated */}
          <Text style={styles.title}>{t('onboarding.welcomeTitle')}</Text>

          {/* Central Hero Image */}
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* Dynamic Subtitle - Translated */}
          <Text style={styles.subtitle}>{t('onboarding.welcomeSubtitle')}</Text>

          {/* Dynamic CTA Button - Translated & Shadowed */}
          <TouchableOpacity
            style={[styles.buttonFrame, Shadows.md]}
            onPress={() => navigation.navigate('OnboardingAddBaby')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('onboarding.addBabyCta')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#C07792', // #C07792
    overflow: 'hidden'
  },
  whiteEllipse: {
    position: 'absolute',
    width: width * 1.6, // Making it slightly responsive but keeping UI shape
    height: height * 0.85,
    top: height * 0.33,
    left: -width * 0.3,
    borderRadius: 400,
    backgroundColor: Colors.white,
    opacity: 1
  },
  safe: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    position: 'absolute',
    top: height * 0.12,
    width: '100%',
    fontWeight: FontWeight.bold,
    fontSize: 28,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 35
  },
  heroImage: {
    position: 'absolute',
    width: 144,
    height: 144,
    top: height * 0.18
    // Aligning logic from UI version
  },
  subtitle: {
    position: 'absolute',
    width: 295,
    top: height * 0.48, // Responsive adjustment to sit inside the ellipse
    fontWeight: FontWeight.regular,
    fontSize: 20,
    lineHeight: 30,
    color: '#797979',
    textAlign: 'center'
  },
  buttonFrame: {
    position: 'absolute',
    width: 333,
    height: 48,
    bottom: height * 0.1, // Using bottom instead of top for better multi-device support
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  buttonText: {
    fontWeight: FontWeight.bold,
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center'
  }
})
