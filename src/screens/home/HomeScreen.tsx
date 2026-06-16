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

// Store & Service Imports
import { useAuthStore } from '../../store/authStore'
import { useBabyStore } from '../../store/babyStore'
import { cryService } from '../../services/cry.service'
import { Shadows } from '../../constants/theme'

// Asset Imports (Based on your second code)
import BreathIcon from '../../../assets/icons/breath.png'
import TempIcon from '../../../assets/icons/temp.png'
import HeartIcon from '../../../assets/icons/heart.png'
import BabyIcon from '../../../assets/icons/baby.png'
import AlarmIcon from '../../../assets/icons/alarm.png'
import NewBornIcon from '../../../assets/icons/new-born.png'
import RateIcon from '../../../assets/icons/rate.png'

const { width } = Dimensions.get('window')
const COLUMN_WIDTH = (width - 45) / 2

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
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

  // Logic: Calculate Age (Months/Weeks style)
  const formatAge = (iso: string) => {
    if (!iso) return ''
    const birth = new Date(iso)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birth.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 7) return `${diffDays} Days`
    const weeks = Math.floor(diffDays / 7)
    const months = Math.floor(diffDays / 30.44)

    if (months === 0) return `${weeks} Weeks`
    return `${months} Months, ${weeks % 4} Weeks`
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
      const interval = setInterval(() => fetchLiveData(activeBabyId), 30000)
      return () => clearInterval(interval)
    }
  }, [activeBabyId, fetchLiveData])

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    if (activeBabyId) await fetchLiveData(activeBabyId)
    setRefreshing(false)
  }

  const firstName = (user?.name ?? user?.fullName ?? 'Parent').split(' ')[0]
  const latestCryMeta = latestCryEvent
    ? cryService.getCryReasonMeta(latestCryEvent.reason)
    : null

  return (
    <LinearGradient
      colors={['#FDF2F4', '#F9E7ED', '#FDF2F4']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C07792"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeBack}>Hello,</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#C07792"
              />
              <View style={styles.notifBadge} />
            </TouchableOpacity>
          </View>

          {/* Baby Card */}
          {activeBaby && (
            <View style={[styles.topBabyCard, Shadows.sm]}>
              {activeBaby.avatar ? (
                <Image
                  source={{ uri: activeBaby.avatar }}
                  style={styles.profileImg}
                />
              ) : (
                <View
                  style={[
                    styles.profileImg,
                    {
                      backgroundColor: '#FFE5EC',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }
                  ]}
                >
                  <MaterialCommunityIcons
                    name="baby-face-outline"
                    size={40}
                    color="#C07792"
                  />
                </View>
              )}
              <View style={styles.babyInfo}>
                <Text style={styles.babyName}>{activeBaby.name}</Text>
                <Text style={styles.babyAge}>
                  {formatAge(activeBaby.dateBirth)} old
                </Text>
                <TouchableOpacity
                  style={styles.profileBtn}
                  onPress={() =>
                    navigation.navigate('BabyDetail', {
                      babyId: activeBaby._id
                    })
                  }
                >
                  <Text style={styles.profileBtnText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Staggered Grid */}
          <View style={styles.grid}>
            {/* LEFT COLUMN */}
            <View style={styles.column}>
              {/* Temperature */}
              <TouchableOpacity
                style={[styles.card, { backgroundColor: '#5DADE2' }]}
                activeOpacity={0.8}
              >
                <Text style={styles.cardLabel}>Temperature</Text>
                <View style={styles.cardRow}>
                  <Image source={TempIcon} style={styles.cardIconSmall} />
                  <Text style={styles.cardValue}>
                    {latestReading?.temperature.toFixed(1) ?? '--'}°C
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Breathing */}
              <TouchableOpacity
                style={[styles.card, { backgroundColor: '#D2B4DE' }]}
                activeOpacity={0.8}
              >
                <Text style={styles.cardLabel}>Breathing</Text>
                <View style={styles.cardRow}>
                  <Image source={BreathIcon} style={styles.cardIconSmall} />
                  <Text style={styles.cardValue}>
                    {latestReading?.breathingRate ?? '--'} rpm
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Vaccinations (Tall) */}
              <TouchableOpacity
                style={[
                  styles.card,
                  styles.tallCard,
                  { backgroundColor: '#AED6F1' }
                ]}
                onPress={() => navigation.navigate('Vaccination')}
              >
                <Image source={AlarmIcon} style={styles.cardIconSmall} />
                <Text style={styles.tallCardTitle}>Vaccines</Text>
                <Text style={styles.tallCardSub}>
                  Schedule and upcoming dates.
                </Text>
                <View style={styles.circleBtn}>
                  <Ionicons name="chevron-forward" size={16} color="#3498DB" />
                </View>
              </TouchableOpacity>
            </View>

            {/* RIGHT COLUMN */}
            <View style={styles.column}>
              {/* Heart Rate */}
              <TouchableOpacity
                style={[styles.card, { backgroundColor: '#EBADBD' }]}
                activeOpacity={0.8}
              >
                <Text style={styles.cardLabel}>Heart Rate</Text>
                <View style={styles.cardRow}>
                  <Image source={HeartIcon} style={styles.cardIconSmall} />
                  <Text style={styles.cardValue}>
                    {latestReading?.heartRate ?? '--'} bpm
                  </Text>
                </View>
                <Image source={RateIcon} style={styles.pulseGraph} />
              </TouchableOpacity>

              {/* Child's Routine (Tall) */}
              <TouchableOpacity
                style={[
                  styles.card,
                  styles.tallCard,
                  { backgroundColor: '#F5CBA7' }
                ]}
                onPress={() => navigation.navigate('BabyRoutine')}
              >
                <Image source={BabyIcon} style={styles.cardIconSmall} />
                <Text style={styles.tallCardTitle}>Routine</Text>
                <Text style={styles.tallCardSub}>
                  Daily habits & growth support.
                </Text>
                <View style={styles.circleBtn}>
                  <Ionicons name="chevron-forward" size={16} color="#E67E22" />
                </View>
              </TouchableOpacity>

              {/* Crying Detection */}
              <TouchableOpacity
                style={[styles.card, { backgroundColor: '#F1948A' }]}
                onPress={() => navigation.navigate('CryDetection')}
              >
                <View style={styles.cryHeader}>
                  <Text style={styles.cardLabel}>Cry Analysis</Text>
                  <Image source={NewBornIcon} style={styles.cardIconSmall} />
                </View>
                <Text style={styles.smallSub}>
                  {latestCryMeta
                    ? `Likely ${latestCryMeta.label}`
                    : 'Monitoring...'}
                </Text>
                <View style={styles.circleBtn}>
                  <Ionicons name="mic" size={14} color="#F1948A" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Air Quality (Full Width Bottom Card) */}
          {latestReading?.airQuality && (
            <View style={styles.airSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Room Environment</Text>
                <View
                  style={[
                    styles.aqiBadge,
                    {
                      backgroundColor:
                        latestReading.airQuality.aqi < 50
                          ? '#E8F5E9'
                          : '#FFF3E0'
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.aqiBadgeText,
                      {
                        color:
                          latestReading.airQuality.aqi < 50
                            ? '#4CAF50'
                            : '#FF9800'
                      }
                    ]}
                  >
                    {latestReading.airQuality.status?.toUpperCase() || 'GOOD'}
                  </Text>
                </View>
              </View>

              <View style={[styles.airCard, Shadows.sm]}>
                <View style={styles.airMain}>
                  <Text style={styles.aqiValue}>
                    {latestReading.airQuality.aqi}
                  </Text>
                  <Text style={styles.aqiLabel}>Air Quality Index</Text>
                </View>
                <View style={styles.airDivider} />
                <View style={styles.airMetricsRow}>
                  <AirMetric
                    icon="water-outline"
                    label="Humidity"
                    value={`${latestReading.airQuality.humidity}%`}
                  />
                  <AirMetric
                    icon="thermometer-outline"
                    label="Room Temp"
                    value={`${latestReading.airQuality.temperature}°C`}
                  />
                  <AirMetric
                    icon="cloud-outline"
                    label="CO2"
                    value={`${latestReading.airQuality.co2}ppm`}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const AirMetric = ({ icon, label, value }: any) => (
  <View style={styles.airMetricItem}>
    <Ionicons name={icon} size={18} color="#C07792" />
    <Text style={styles.airMetricValue}>{value}</Text>
    <Text style={styles.airMetricLabel}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: { padding: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  welcomeBack: { color: '#9E7A8A', fontSize: 16, fontWeight: '500' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#4A3B40' },
  notifBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 15,
    elevation: 2
  },
  notifBadge: {
    position: 'absolute',
    top: 11,
    right: 13,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C07792',
    borderWidth: 1,
    borderColor: '#fff'
  },

  topBabyCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  profileImg: { width: 85, height: 85, borderRadius: 42.5, overflow: 'hidden' },
  babyInfo: { marginLeft: 15, flex: 1 },
  babyName: { fontSize: 20, fontWeight: 'bold', color: '#4A3B40' },
  babyAge: { fontSize: 14, color: '#9E7A8A', marginVertical: 4 },
  profileBtn: {
    backgroundColor: '#C07792',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginTop: 5
  },
  profileBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: COLUMN_WIDTH, gap: 15 },
  card: {
    borderRadius: 25,
    padding: 18,
    minHeight: 120,
    justifyContent: 'center'
  },
  tallCard: { height: 210 },
  cardIconSmall: { width: 35, height: 35, resizeMode: 'contain' },
  cardLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  pulseGraph: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginTop: 10
  },
  tallCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12
  },
  tallCardSub: { fontSize: 12, color: '#FFF', marginTop: 5, opacity: 0.9 },
  cryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  smallSub: { fontSize: 12, color: '#FFF', marginTop: 5, fontStyle: 'italic' },
  circleBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 15,
    right: 15
  },

  airSection: { marginTop: 25 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B40' },
  aqiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  aqiBadgeText: { fontSize: 11, fontWeight: '800' },
  airCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20 },
  airMain: { alignItems: 'center', marginBottom: 15 },
  aqiValue: { fontSize: 40, fontWeight: 'bold', color: '#4A3B40' },
  aqiLabel: { fontSize: 12, color: '#9E7A8A' },
  airDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },
  airMetricsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  airMetricItem: { alignItems: 'center' },
  airMetricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A3B40',
    marginTop: 5
  },
  airMetricLabel: { fontSize: 10, color: '#9E7A8A' }
})
