import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_NOTIFICATIONS } from '../../constants/mockData';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ar as arLocale } from 'date-fns/locale';
import { useTranslation } from '../../i18n/useTranslation';

type Nav = NativeStackNavigationProp<any>;
type NotifType = 'cry' | 'sensor' | 'report' | 'vaccination' | 'system';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const NOTIF_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  cry:         { icon: 'ear-outline',           color: Colors.warning,  bg: Colors.warningSoft },
  sensor:      { icon: 'heart-outline',         color: Colors.danger,   bg: Colors.dangerSoft  },
  report:      { icon: 'bar-chart-outline',     color: Colors.primary,  bg: Colors.primarySoft },
  vaccination: { icon: 'medical-outline',       color: Colors.success,  bg: Colors.successSoft },
  system:      { icon: 'notifications-outline', color: Colors.info,     bg: Colors.infoSoft    },
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  ...(MOCK_NOTIFICATIONS as Notification[]),
  {
    id: 'notif_004', type: 'vaccination',
    title: 'Vaccination due soon',
    body: 'Hib (Dose 1) is overdue. Please schedule a visit.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: false,
  },
  {
    id: 'notif_005', type: 'sensor',
    title: 'Temperature normal',
    body: "Baby's temperature returned to normal range (36.7°C)",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), read: true,
  },
  {
    id: 'notif_006', type: 'report',
    title: 'Weekly summary ready',
    body: 'Your weekly health summary is available.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), read: true,
  },
];

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t, locale } = useTranslation();
  const dfLocale = locale === 'ar' ? arLocale : enUS;
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.read);

  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();
  const groups = [
    { key: 'today', label: t('notifications.today'), items: filtered.filter(n => new Date(n.timestamp).toDateString() === todayStr) },
    { key: 'yesterday', label: t('notifications.yesterday'), items: filtered.filter(n => new Date(n.timestamp).toDateString() === yesterdayStr) },
    { key: 'older', label: t('notifications.older'), items: filtered.filter(n => { const d = new Date(n.timestamp).toDateString(); return d !== todayStr && d !== yesterdayStr; }) },
  ].filter(g => g.items.length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'unread'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterPill, filter === f && styles.filterPillActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? t('notifications.all') : t('notifications.unread', { n: unreadCount })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>{t('notifications.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('notifications.emptySub', { filter: filter === 'unread' ? t('notifications.unreadWord') : '' })}
            </Text>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.key} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.items.map(notif => {
                const cfg = NOTIF_CONFIG[notif.type] ?? NOTIF_CONFIG.system;
                return (
                  <TouchableOpacity key={notif.id} style={[styles.notifCard, !notif.read && styles.notifCardUnread, Shadows.sm]} onPress={() => markRead(notif.id)} activeOpacity={0.85}>
                    <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      <Text style={styles.notifBody}>{notif.body}</Text>
                      <Text style={styles.notifTime}>{formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: dfLocale })}</Text>
                    </View>
                    <View style={styles.notifRight}>
                      {!notif.read && <View style={styles.unreadDot} />}
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNotif(notif.id)}>
                        <Ionicons name="close" size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  markAllText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textMedium },
  filterTextActive: { color: Colors.white },
  container: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  group: { gap: Spacing.sm },
  groupLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: Spacing.sm },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  notifIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, gap: 3 },
  notifTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textDark },
  notifBody: { fontSize: FontSize.sm, color: Colors.textMedium, lineHeight: 20 },
  notifTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  notifRight: { alignItems: 'center', gap: Spacing.sm },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  deleteBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textDark },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textMuted },
});
