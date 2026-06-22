import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

// Store & Theme Imports
import { useAuthStore } from '../../store/authStore'
import { useBabyStore } from '../../store/babyStore'
import { cryService } from '../../services/cry.service'
import { Shadows, Radius, Colors as ThemeColors } from '../../constants/theme'
import { useTranslation } from '../../i18n/useTranslation' // <-- Import hook

// Assets
import BreathIcon from '../../../assets/icons/breath.png'
import TempIcon from '../../../assets/icons/temp.png'
import HeartIcon from '../../../assets/icons/heart.png'
import BabyIcon from '../../../assets/icons/baby.png'
import AlarmIcon from '../../../assets/icons/alarm.png'
import NewBornIcon from '../../../assets/icons/new-born.png'
import RateIcon from '../../../assets/icons/rate.png'

const { width } = Dimensions.get('window')
const COLUMN_WIDTH = (width - 50) / 2
const CARD_GRADIENT = ['#D4A5B0', '#F3D1DC']

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const { t, isRTL } = useTranslation() // <-- Initialize translation
  const { user } = useAuthStore()
  const {
    activeBaby,
    activeBabyId,
    fetchBabies,
    fetchLiveData,
    latestReading,
    latestCryEvent
  } = useBabyStore()
  const [refreshing, setRefreshing] = React.useState(false)

  // Add this effect to watch the data
  useEffect(() => {
    console.log('==== DEBUG: HOME DATA ====')
    console.log('Active Baby ID:', activeBabyId)
    console.log('Active Baby Name:', activeBaby?.name)
    console.log('Latest Reading:', JSON.stringify(latestReading, null, 2))
    console.log('Latest Cry Event:', latestCryEvent)
    console.log('==========================')
  }, [latestReading, activeBaby, activeBabyId, latestCryEvent])

  // 1. Updated Age Formatting to use Translation Keys
  const formatAge = (iso: string) => {
    if (!iso) return ''
    const birth = new Date(iso)
    const now = new Date()

    let months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth())
    let days = now.getDate() - birth.getDate()

    if (days < 0) {
      months -= 1
      days += 30
    }
    const weeks = Math.floor(days / 7)

    if (months === 0 && weeks === 0) return t('home.ageNewborn')
    if (months === 0) return t('home.ageWeeks', { n: weeks })
    if (weeks === 0) return t('home.ageMonths', { n: months })

    return t('home.ageMonthsWeeks', { m: months, w: weeks })
  }

  const load = useCallback(async () => {
    await fetchBabies()
  }, [fetchBabies])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (activeBabyId) {
      fetchLiveData(activeBabyId)
      // The socket handles real-time updates now,
      // but we keep a slow refresh as a fallback.
      const interval = setInterval(() => fetchLiveData(activeBabyId), 60000)
      return () => clearInterval(interval)
    }
  }, [activeBabyId])

  const firstName = (user?.name ?? user?.fullName ?? t('home.parent')).split(
    ' '
  )[0]
  const latestCryMeta = latestCryEvent
    ? cryService.getCryReasonMeta(latestCryEvent.reason)
    : null

  // Reusable RTL Alignment Style
  const textAlign = isRTL ? 'right' : 'left'
  const rowDirection = isRTL ? 'row-reverse' : 'row'

  return (
    <LinearGradient
      colors={['#FDF2F4', '#F9E7ED', '#E8B7D4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={load}
              tintColor="#C07792"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { flexDirection: rowDirection }]}>
            <Text style={styles.headerGreeting}>
              {t('home.hi')}
              {firstName}
            </Text>
            <TouchableOpacity
              style={styles.notifCircle}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#C07792"
              />
            </TouchableOpacity>
          </View>

          {/* Baby Card */}
          {activeBaby && (
            <View
              style={[
                styles.topBabyCard,
                styles.cardBorder,
                Shadows.sm,
                { flexDirection: rowDirection }
              ]}
            >
              <View
                style={[
                  styles.babyCardContent,
                  { flexDirection: rowDirection, flex: 1 }
                ]}
              >
                <View style={styles.avatarBorder}>
                  {activeBaby.avatar ? (
                    <Image
                      source={{ uri: activeBaby.avatar }}
                      style={styles.profileImg}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="baby-face-outline"
                      size={40}
                      color="#EBADBD"
                    />
                  )}
                </View>
                <View
                  style={[
                    styles.babyInfo,
                    { alignItems: isRTL ? 'flex-end' : 'flex-start' }
                  ]}
                >
                  <Text style={styles.babyName}>{activeBaby.name}</Text>
                  <Text style={styles.babyAge}>
                    {formatAge(activeBaby.dateBirth)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewProfileBtn}
                onPress={() => navigation.navigate('Babies')}
              >
                <Text style={styles.viewProfileText}>
                  {t('home.viewProfile')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Data Grid */}
          <View style={[styles.grid, { flexDirection: rowDirection }]}>
            <View style={styles.column}>
              <SensorCard
                title={t('home.bodyTemp')}
                // Matches "temperature" from ESP32 log
                value={`${latestReading?.temperature?.toFixed(1) ?? '36.8'} °C`}
                icon={TempIcon}
                isRTL={isRTL}
              />
              <SensorCard
                title={t('home.breathing')}
                // Matches "spo2" from ESP32 log
                value={`${latestReading?.spo2?.toFixed(1) ?? '98.0'}%`}
                icon={BreathIcon}
                isRTL={isRTL}
              />
              <ActionCard
                title={t('home.vaccines')}
                subtitle={t('growth.feedingDesc')}
                icon={AlarmIcon}
                onPress={() => navigation.navigate('Vaccination')}
                isRTL={isRTL}
              />
            </View>

            <View style={styles.column}>
              <SensorCard
                title={t('home.heartRate')}
                // Matches "heartRate" from ESP32 log
                value={`${latestReading?.heartRate?.toFixed(0) ?? '80'} bpm`}
                icon={HeartIcon}
                showGraph
                isRTL={isRTL}
              />
              <ActionCard
                title={t('home.routine')}
                subtitle={t('growth.motorDesc')}
                icon={BabyIcon}
                onPress={() => navigation.navigate('BabyRoutine')}
                isRTL={isRTL}
              />

              <TouchableOpacity
                style={[styles.featureCardSmall, Shadows.sm]}
                onPress={() => navigation.navigate('CryDetection')}
              >
                <LinearGradient
                  colors={CARD_GRADIENT}
                  style={[styles.cardGradient, styles.cardBorder]}
                >
                  <Image
                    source={NewBornIcon}
                    style={[
                      styles.cryIllustrationAbsolute,
                      isRTL ? { left: 8, right: undefined } : { right: 8 }
                    ]}
                  />
                  <View
                    style={[
                      styles.cryTextBlock,
                      { alignItems: isRTL ? 'flex-end' : 'flex-start' }
                    ]}
                  >
                    <Text style={styles.featureTitle}>{t('tabs.cryAi')}?</Text>
                    <Text style={[styles.featureSubSmall, { textAlign }]}>
                      {latestCryMeta
                        ? t('home.cryMightBe', { reason: latestCryMeta.label })
                        : t('cry.analysisSub')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.circleMic,
                      isRTL ? { left: 10, right: undefined } : { right: 10 }
                    ]}
                  >
                    <Ionicons name="mic" size={14} color="#C07792" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Air Quality Section */}
          <View style={styles.airSection}>
            <View
              style={[styles.sectionHeader, { flexDirection: rowDirection }]}
            >
              <Text style={styles.sectionTitle}>{t('home.airQuality')}</Text>
              <View style={[styles.aqiStatus, { flexDirection: rowDirection }]}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: '#4CAF50',
                      [isRTL ? 'marginLeft' : 'marginRight']: 6
                    }
                  ]}
                />
                <Text style={styles.aqiStatusText}>{t('home.optimal')}</Text>
              </View>
            </View>

            <View style={[styles.airCard, styles.cardBorder, Shadows.sm]}>
              <View style={[styles.airMain, { flexDirection: rowDirection }]}>
                <View style={styles.aqiCircle}>
                  <Text style={styles.aqiValue}>
                    {latestReading?.airQuality?.aqi ?? '24'}
                  </Text>
                  <Text style={styles.aqiUnit}>{t('home.overallAqi')}</Text>
                </View>
                <View style={styles.airDividerV} />
                <View
                  style={[styles.airMetrics, { flexDirection: rowDirection }]}
                >
                  <AirItem
                    icon="water-outline"
                    label={t('home.humidity')}
                    value={`${latestReading?.airQuality?.humidity ?? 45}%`}
                    isRTL={isRTL}
                  />
                  <AirItem
                    icon="thermometer-outline"
                    label={t('home.roomTemp')}
                    value={`${latestReading?.airQuality?.temperature ?? 22}°C`}
                    isRTL={isRTL}
                  />
                  <AirItem
                    icon="cloud-outline"
                    label={t('home.co2')}
                    value={`${latestReading?.airQuality?.co2 ?? 410}ppm`}
                    isRTL={isRTL}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

/* --- Refactored Sub-Components to support RTL --- */

const SensorCard = ({ title, value, icon, showGraph = true, isRTL }: any) => (
  <View style={[styles.sensorCardWrap, Shadows.sm]}>
    <LinearGradient
      colors={CARD_GRADIENT}
      style={[styles.cardGradient, styles.cardBorder]}
    >
      <Text style={styles.cardLabel}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <View
        style={[
          styles.cardRow,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}
      >
        <Image source={icon} style={styles.cardIllustration} />
        {showGraph && (
          <Image
            source={RateIcon}
            style={[
              styles.wavyGraphSmall,
              { transform: [{ scaleX: isRTL ? -1 : 1 }] }
            ]}
          />
        )}
      </View>
    </LinearGradient>
  </View>
)

const ActionCard = ({ title, subtitle, icon, onPress, isRTL }: any) => (
  <TouchableOpacity
    style={[styles.featureCardTall, Shadows.sm]}
    onPress={onPress}
  >
    <LinearGradient
      colors={CARD_GRADIENT}
      style={[styles.cardGradient, styles.cardBorder]}
    >
      <Image
        source={icon}
        style={[
          styles.actionIconAbsolute,
          isRTL ? { left: 12, right: undefined } : { right: 12 }
        ]}
      />
      <View
        style={[
          styles.actionTextBlock,
          { alignItems: isRTL ? 'flex-end' : 'flex-start' }
        ]}
      >
        <Text style={styles.featureTitle}>{title}</Text>
        <Text
          style={[styles.featureSub, { textAlign: isRTL ? 'right' : 'left' }]}
        >
          {subtitle}
        </Text>
      </View>
      <View
        style={[
          styles.circleArrow,
          isRTL ? { left: 12, right: undefined } : { right: 12 }
        ]}
      >
        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={16}
          color="#C07792"
        />
      </View>
    </LinearGradient>
  </TouchableOpacity>
)

const AirItem = ({ icon, label, value, isRTL }: any) => (
  <View
    style={[styles.airItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
  >
    <Ionicons name={icon} size={16} color="#A97C8E" />
    <View style={isRTL ? { marginRight: 6 } : { marginLeft: 6 }}>
      <Text
        style={[styles.airItemVal, { textAlign: isRTL ? 'right' : 'left' }]}
      >
        {value}
      </Text>
      <Text
        style={[styles.airItemLbl, { textAlign: isRTL ? 'right' : 'left' }]}
      >
        {label}
      </Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25
  },
  headerGreeting: { fontSize: 24, fontWeight: '700', color: '#936174' },
  notifCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm
  },

  topBabyCard: {
    backgroundColor: '#FFF5F7', // Solid pale pink (no transparency)
    borderRadius: 22,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FCE7F3', // Very light solid pink border
    // Optional: add a very subtle shadow
    shadowColor: '#C07792',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  babyCardContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarBorder: {
    width: 68,
    height: 66,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFFFFF', // Pure white border around the photo
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImg: {
    width: '100%',
    height: '100%'
  },
  babyInfo: {
    marginHorizontal: 15,
    flex: 1
  },
  babyName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000' // Darker text for name
  },
  babyAge: {
    fontSize: 14,
    color: '#8E8E8E', // Grayish color for age
    marginTop: 4
  },
  viewProfileBtn: {
    backgroundColor: '#C07792',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginTop: -5 // Pulls the button up to align with the design
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  },

  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: COLUMN_WIDTH, gap: 15 },

  sensorCardWrap: { height: 140, borderRadius: 20 },
  cardGradient: { flex: 1, padding: 15, borderRadius: 20 },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A3F52',
    textAlign: 'center'
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D2B34',
    textAlign: 'center',
    marginTop: 4
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 'auto'
  },
  cardIllustration: { width: 40, height: 40, resizeMode: 'contain' },
  wavyGraphSmall: {
    width: 70,
    height: 40,
    resizeMode: 'contain',
    opacity: 0.9
  },

  featureCardTall: { height: 230, borderRadius: 20 },
  featureCardSmall: { height: 110, borderRadius: 20 },
  actionIconAbsolute: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    position: 'absolute',
    top: 12,
    right: 12
  },
  actionTextBlock: { flex: 1, justifyContent: 'flex-end', paddingBottom: 35 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: '#4A3B40' },
  featureSub: { fontSize: 11, color: '#7A5566', marginTop: 6, lineHeight: 15 },
  featureSubSmall: { fontSize: 10, color: '#7A5566', fontStyle: 'italic' },
  cryIllustrationAbsolute: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    position: 'absolute',
    top: 8,
    right: 8
  },
  cryTextBlock: { flex: 1, justifyContent: 'flex-end', paddingBottom: 5 },
  circleArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 12,
    right: 12
  },
  circleMic: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10
  },

  airSection: { marginTop: 30 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#936174' },
  aqiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  aqiStatusText: { fontSize: 11, color: '#4CAF50', fontWeight: '800' },
  airCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20 },
  airMain: { flexDirection: 'row', alignItems: 'center' },
  aqiCircle: { alignItems: 'center', justifyContent: 'center', width: 60 },
  aqiValue: { fontSize: 24, fontWeight: '800', color: '#4A3B40' },
  aqiUnit: { fontSize: 10, color: '#A97C8E', fontWeight: '700' },
  airDividerV: {
    width: 1,
    height: 40,
    backgroundColor: '#F0D5E0',
    marginHorizontal: 15
  },
  airMetrics: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  airItem: { flexDirection: 'row', alignItems: 'center' },
  airItemVal: { fontSize: 14, fontWeight: '700', color: '#4A3B40' },
  airItemLbl: { fontSize: 9, color: '#A97C8E' }
})
