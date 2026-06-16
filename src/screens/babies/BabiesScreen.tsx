import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

// Logic & Theme Imports
import { useBabyStore } from '../../store/babyStore'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadows
} from '../../constants/theme'
import { Baby } from '../../types'
import { useTranslation } from '../../i18n/useTranslation'
import { formatListBabyAge } from '../../utils/babyAge'

const { width } = Dimensions.get('window')
type Nav = NativeStackNavigationProp<any>

// ── Baby Card (UI 1 Layout + Logic 2 Dynamicity) ─────────────────────────────
const BabyCard: React.FC<{
  baby: Baby
  onPress: () => void
  t: any
}> = ({ baby, onPress, t }) => {
  const age = formatListBabyAge(baby.dateBirth, t)

  return (
    <View style={[styles.babyCard, Shadows.md]}>
      <View style={styles.babyLeft}>
        <View style={styles.avatarWrapper}>
          {baby.avatar ? (
            <Image source={{ uri: baby.avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor:
                    baby.gender === 'male' ? '#DBEAFE' : '#FFE5EC'
                }
              ]}
            >
              <Text style={{ fontSize: 28 }}>
                {baby.gender === 'male' ? '👦' : '👧'}
              </Text>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.babyName}>{baby.name}</Text>
          <Text style={styles.babyAge}>
            {age} {t('common.old') || 'old'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.profileBtn}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.profileBtnText}>{t('babies.viewProfile')}</Text>
      </TouchableOpacity>
    </View>
  )
}

// ── Main Screen (UI 1 Gradient + Logic 2 Fetching) ───────────────────────────
export const BabiesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()
  const { babies, fetchBabies } = useBabyStore()

  useEffect(() => {
    fetchBabies()
  }, [])

  return (
    <LinearGradient
      colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('babies.myBabies')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Baby cards */}
          {babies.map((baby) => (
            <BabyCard
              key={baby.id}
              baby={baby}
              t={t}
              onPress={() =>
                navigation.navigate('BabyDetail', { babyId: baby.id })
              }
            />
          ))}

          {/* Add more children — With "Coming Soon" Dynamicity */}
          <TouchableOpacity
            style={styles.addMoreBtn}
            disabled
            activeOpacity={1}
          >
            <View style={styles.addMoreLeft}>
              <View style={styles.addMoreIcon}>
                <Ionicons name="add" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addMoreTitle}>
                  {t('babies.addAnother')}
                </Text>
                <Text style={styles.addMoreSub}>
                  {t('babies.addAnotherSub')}
                </Text>
              </View>
            </View>
            <View style={styles.comingSoonTag}>
              <Text style={styles.comingSoonText}>
                {t('common.comingSoon')}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 25,
    paddingVertical: 20
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: '#936174'
  },
  container: { padding: 20, gap: 15 },

  // Baby Card Styling (Refined Pink UI)
  babyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F3',
    padding: 15,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#FFD1DC',
    alignItems: 'center'
  },
  babyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#C07792'
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  babyName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#4A3B40'
  },
  babyAge: { fontSize: FontSize.sm, color: '#9E7A8A' },
  profileBtn: {
    backgroundColor: '#C07792',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    justifyContent: 'center'
  },
  profileBtnText: {
    color: '#fff',
    fontWeight: FontWeight.semibold,
    fontSize: 13
  },

  // Add More Styling
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#C07792',
    borderStyle: 'dashed',
    marginTop: 10
  },
  addMoreLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  addMoreIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C07792B2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addMoreTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#4A3B40'
  },
  addMoreSub: { fontSize: 11, color: '#7E5D6A', marginTop: 2 },
  comingSoonTag: {
    backgroundColor: '#FFFFFF88',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#936174',
    textTransform: 'uppercase'
  }
})
