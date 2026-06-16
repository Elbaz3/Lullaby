import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ar as arLocale } from 'date-fns/locale'

// Theme & Logic Imports
import { MOCK_NOTIFICATIONS } from '../../constants/mockData'
import { Colors, Shadows } from '../../constants/theme'
import { useTranslation } from '../../i18n/useTranslation'

type Nav = NativeStackNavigationProp<any>

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t, locale } = useTranslation()
  const dfLocale = locale === 'ar' ? arLocale : enUS

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState('All')

  // Filter labels from UI 1, mapped for translation if available
  const filters = [
    'All',
    'Temperature',
    'Heart Rate',
    'breathing',
    'Crying',
    'Vaccinations'
  ]

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  const filtered =
    filter === 'All'
      ? notifications
      : notifications.filter((n) =>
          n.type.toLowerCase().includes(filter.toLowerCase())
        )

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'temperature':
        return 'thermometer-alert'
      case 'crying':
        return 'baby-face-outline'
      case 'vaccinations':
        return 'needle'
      case 'heart rate':
        return 'heart-pulse'
      case 'breathing':
        return 'air-filter'
      default:
        return 'bell-outline'
    }
  }

  return (
    <View style={styles.flex}>
      {/* Dynamic Background Gradient */}
      <LinearGradient
        colors={['#FFE5EC', '#F8C8DC', '#E8B7D4']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color="#787777" />
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.headerFrame}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={28}
              color="#936174"
            />
            <Text style={styles.titleText}>{t('notifications.title')}</Text>
          </View>
          <Text style={styles.subtitleText}>
            {t('notifications.subtitle') ||
              'We gently keep you informed about your baby.'}
          </Text>
        </View>

        {/* Filters Row */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filters.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterPillBase,
                  filter === f
                    ? styles.filterPillActive
                    : styles.filterPillInactive
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: filter === f ? '#FFFFFF' : '#936174' }
                  ]}
                >
                  {f === 'All' ? t('notifications.all') : f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('notifications.emptyTitle')}
              </Text>
            </View>
          ) : (
            filtered.map((notif) => (
              <View
                key={notif.id}
                style={[
                  styles.notifOuterFrame,
                  !notif.read && styles.unreadBorder
                ]}
              >
                <View style={styles.notifWhiteCard}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons
                      name={getIcon(notif.type)}
                      size={28}
                      color="#936174"
                    />
                  </View>
                  <View style={styles.notifTextContent}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.notifTypeTitle}>{notif.type}</Text>
                      <Text style={styles.timeText}>
                        {formatDistanceToNow(new Date(notif.timestamp), {
                          addSuffix: true,
                          locale: dfLocale
                        })}
                      </Text>
                    </View>
                    <Text style={styles.notifMainMsg}>{notif.title}</Text>
                    <Text style={styles.notifSubMsg}>{notif.body}</Text>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.askAssistantBtn}
                    onPress={() => navigation.navigate('AssistantScreen')}
                  >
                    <Text style={styles.askBtnText}>
                      {t('notifications.askAssistant') ||
                        'Ask Baby Care Assistant'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.markSeenBtn,
                      notif.read && styles.seenBtnActive
                    ]}
                    onPress={() => toggleRead(notif.id)}
                  >
                    <MaterialCommunityIcons
                      name={notif.read ? 'eye-check' : 'eye-outline'}
                      size={15}
                      color="#936174"
                    />
                    <Text style={styles.seenBtnText}>
                      {notif.read
                        ? t('notifications.seen')
                        : t('notifications.markAsSeen')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 150 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 35,
    height: 35,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8DADC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99
  },
  headerFrame: {
    marginTop: 110,
    paddingHorizontal: 30
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  titleText: {
    fontWeight: '600',
    fontSize: 22,
    color: '#936174'
  },
  subtitleText: {
    fontWeight: '500',
    fontSize: 13,
    color: '#737373',
    lineHeight: 18
  },
  filterContainer: { marginTop: 25, height: 40 },
  filterScroll: { paddingHorizontal: 30, gap: 10 },
  filterPillBase: {
    paddingHorizontal: 20,
    height: 37,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterPillActive: { backgroundColor: '#C07792' },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C07792'
  },
  filterPillText: { fontSize: 14, fontWeight: '500' },

  mainScroll: { marginTop: 20, flex: 1 },
  mainScrollContent: { paddingHorizontal: 21, gap: 18 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#936174',
    opacity: 0.6
  },

  notifOuterFrame: {
    width: '100%',
    borderRadius: 20,
    padding: 9,
    backgroundColor: '#C0779244', // Semi-transparent pink
    gap: 12
  },
  unreadBorder: {
    backgroundColor: '#C0779288' // Darker when unread
  },
  notifWhiteCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 18,
    flexDirection: 'row',
    gap: 12
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FDF2F5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notifTextContent: { flex: 1, gap: 4 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  notifTypeTitle: {
    fontWeight: '700',
    fontSize: 13,
    color: '#936174',
    textTransform: 'uppercase'
  },
  timeText: { fontSize: 10, color: '#9E7A8A' },
  notifMainMsg: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000000',
    marginTop: 2
  },
  notifSubMsg: {
    fontWeight: '400',
    fontSize: 12,
    color: '#666',
    lineHeight: 16
  },

  actionButtonsRow: { flexDirection: 'row', gap: 8 },
  askAssistantBtn: {
    flex: 1.4,
    height: 37,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm
  },
  askBtnText: { fontSize: 10, fontWeight: '600', color: '#936174' },
  markSeenBtn: {
    flex: 1,
    height: 37,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    ...Shadows.sm
  },
  seenBtnActive: { backgroundColor: '#FFFFFFA6', opacity: 0.7 },
  seenBtnText: { fontSize: 10, fontWeight: '600', color: '#936174' }
})
