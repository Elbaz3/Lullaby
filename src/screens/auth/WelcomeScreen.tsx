import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  SafeAreaView
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../types'
import { useTranslation } from '../../i18n/useTranslation'

const { width, height } = Dimensions.get('window')

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation()

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Top Section: Oval Image (UI from Code 1) */}
      <View style={styles.heroContainer}>
        <View style={styles.ovalWrapper}>
          <Image
            source={require('../../../assets/baby.jpg')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 2. Bottom Section: Translated Text (Logic from Code 2) */}
      <View style={styles.content}>
        <View style={styles.textGroup}>
          <Text style={styles.headline}>
            <Text style={styles.welcomeText}>{t('welcome.welcomeTo')}</Text>
            <Text style={styles.brandText}>{t('welcome.brand')}</Text>
          </Text>

          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        </View>

        {/* Continue Button with Pink Theme */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>{t('welcome.continue')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  heroContainer: {
    height: height * 0.55,
    width: width,
    alignItems: 'center'
  },
  ovalWrapper: {
    // Layout specifics from UI Code 1
    width: width * 1.2,
    height: height * 0.62,
    marginTop: -height * 0.1,
    marginLeft: width * 0.05,
    borderRadius: (width * 1.15) / 2,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: 40
  },
  headline: {
    textAlign: 'center'
  },
  welcomeText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 26,
    color: '#2E2E2E'
  },
  brandText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 26,
    color: '#C07792' // Pink Theme
  },
  subtitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 14 * 1.5
  },
  button: {
    width: 180,
    height: 48,
    backgroundColor: '#C07792', // Pink Theme
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF'
  }
})
