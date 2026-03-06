// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   Image,
//   TouchableOpacity,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../constants/theme';
// import { Button } from '../../components/ui/Button';
// import { AuthStackParamList } from '../../types';

// const { width, height } = Dimensions.get('window');

// type Props = {
//   navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
// };

// const FEATURES = [
//   { emoji: '🎤', label: 'Cry Detection' },
//   { emoji: '💓', label: 'Heart Monitor' },
//   { emoji: '🌡️', label: 'Temperature' },
//   { emoji: '💨', label: 'Air Quality' },
// ];

// export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
//   return (
//     <View style={styles.container}>
//       {/* Hero Image Area */}
//       <View style={styles.heroArea}>
//         <LinearGradient
//           colors={[Colors.primarySoft, Colors.bgMain]}
//           style={styles.heroGradient}
//         >
//           <View style={styles.circleDecor} />
//           <View style={styles.heroImagePlaceholder}>
//             <Text style={styles.heroEmoji}>👶</Text>
//           </View>
//         </LinearGradient>
//       </View>

//       {/* Content */}
//       <View style={styles.content}>
//         {/* Feature Pills */}
//         <View style={styles.featureRow}>
//           {FEATURES.map((f) => (
//             <View key={f.label} style={styles.featurePill}>
//               <Text style={styles.featureEmoji}>{f.emoji}</Text>
//               <Text style={styles.featureLabel}>{f.label}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Headline */}
//         <View style={styles.textGroup}>
//           <Text style={styles.headline}>
//             Welcome to{' '}
//             <Text style={styles.brand}>Lullaby</Text>
//           </Text>
//           <Text style={styles.subtitle}>
//             Monitor your baby's health and understand their needs with ease — any time, from anywhere.
//           </Text>
//         </View>

//         {/* CTA Buttons */}
//         <View style={styles.actions}>
//           <Button
//             label="Get Started"
//             onPress={() => navigation.navigate('Register')}
//           />
//           <Button
//             label="I already have an account"
//             variant="ghost"
//             onPress={() => navigation.navigate('Login')}
//           />
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.bgMain,
//   },
//   heroArea: {
//     height: height * 0.45,
//     overflow: 'hidden',
//   },
//   heroGradient: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   circleDecor: {
//     position: 'absolute',
//     width: width * 0.75,
//     height: width * 0.75,
//     borderRadius: (width * 0.75) / 2,
//     backgroundColor: Colors.white,
//     opacity: 0.6,
//     bottom: -width * 0.2,
//   },
//   heroImagePlaceholder: {
//     width: 180,
//     height: 180,
//     borderRadius: 90,
//     backgroundColor: Colors.white,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.15,
//     shadowRadius: 24,
//     elevation: 8,
//     zIndex: 1,
//   },
//   heroEmoji: {
//     fontSize: 90,
//   },
//   content: {
//     flex: 1,
//     backgroundColor: Colors.white,
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     marginTop: -32,
//     padding: Spacing.xl,
//     paddingTop: Spacing.xxl,
//     gap: Spacing.xl,
//   },
//   featureRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: Spacing.sm,
//     justifyContent: 'center',
//   },
//   featurePill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: Colors.bgInput,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: Radius.full,
//   },
//   featureEmoji: {
//     fontSize: 14,
//   },
//   featureLabel: {
//     fontSize: FontSize.xs,
//     fontWeight: FontWeight.medium,
//     color: Colors.textMedium,
//   },
//   textGroup: {
//     gap: Spacing.sm,
//   },
//   headline: {
//     fontSize: FontSize.xxxl,
//     fontWeight: FontWeight.extrabold,
//     color: Colors.textDark,
//     textAlign: 'center',
//     lineHeight: 38,
//   },
//   brand: {
//     color: Colors.primary,
//   },
//   subtitle: {
//     fontSize: FontSize.md,
//     color: Colors.textMuted,
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   actions: {
//     gap: Spacing.sm,
//   },
// });


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Top Section: Oval Image (Mimicking Flutter's ClipOval) */}
      <View style={styles.heroContainer}>
        <View style={styles.ovalWrapper}>
          <Image
            source={require('../../../assets/baby.jpg')} // Ensure this path is correct
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 2. Bottom Section: Text and Buttons */}
      <View style={styles.content}>
        <View style={styles.textGroup}>
          {/* RichText equivalent */}
          <Text style={styles.headline}>
            <Text style={styles.welcomeText}>Welcome to </Text>
            <Text style={styles.brandText}>Lullaby</Text>
          </Text>

          <Text style={styles.subtitle}>
            Monitor your baby’s health and understand their needs with ease
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        
        {/* Spacer to match Flutter's bottom padding */}
        <View style={{ height: 40 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroContainer: {
    height: height * 0.55,
    width: width,
    alignItems: 'center',
    // We don't use overflow hidden here so the oval can bleed out
  },
  ovalWrapper: {
    // Mimicking the Flutter Positioned/Container logic
    width: width * 1.15,
    height: height * 0.6,
    marginTop: -height * 0.1,
    marginLeft: -width * 0.08, // Subtle offset like Flutter left: -width * 0.08
    borderRadius: (width * 1.15) / 2, // Large radius creates the oval shape
    overflow: 'hidden',
    backgroundColor: '#F0F0F0', // Placeholder color
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headline: {
    textAlign: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter', // Ensure Inter is loaded or use default
    fontWeight: '700',
    fontSize: 26,
    color: '#2E2E2E',
  },
  brandText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 26,
    color: '#4F9EC4',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 14 * 1.5, // height: 1.5 in Flutter
  },
  button: {
    width: 180,
    height: 48,
    backgroundColor: '#4F9EC4',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // Elevation/Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
});