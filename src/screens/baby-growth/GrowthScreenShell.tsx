import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';
import { useTranslation } from '../../i18n/useTranslation';

type Props = {
  /** When set, shows a single back row with title centered (detail screens). */
  centerTitle?: string;
  scroll?: boolean;
  children: React.ReactNode;
};

export const GrowthScreenShell: React.FC<Props> = ({ centerTitle, scroll = true, children }) => {
  const navigation = useNavigation();
  const { t, isRTL } = useTranslation();
  const backIcon = (isRTL ? 'chevron-forward' : 'chevron-back') as keyof typeof Ionicons.glyphMap;

  const header = (
    <View style={[styles.headerRow, centerTitle ? styles.headerRowDetail : null]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('common.goBack')}
      >
        <Ionicons name={backIcon} size={22} color={Colors.textDark} />
      </TouchableOpacity>
      {centerTitle ? (
        <>
          <View style={styles.titleCenterWrap} pointerEvents="none">
            <Text style={styles.headerTitleCenter} numberOfLines={1}>
              {centerTitle}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </>
      ) : null}
    </View>
  );

  const body = (
    <>
      {header}
      {children}
    </>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#D6EAFB', '#E8F4FD', '#F0F7FC']} style={StyleSheet.absoluteFill} />
      <View style={styles.watermark} pointerEvents="none">
        <Text style={styles.watermarkText}>🌙</Text>
        <Text style={[styles.watermarkText, styles.wm2]}>🌙</Text>
        <Text style={[styles.watermarkText, styles.wm3]}>🌙</Text>
      </View>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {body}
          </ScrollView>
        ) : (
          <View style={styles.noScroll}>{body}</View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgMain },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxxl, paddingHorizontal: Spacing.xl },
  noScroll: { flex: 1, paddingHorizontal: Spacing.xl },
  watermark: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  watermarkText: {
    position: 'absolute',
    fontSize: 120,
    opacity: 0.06,
    top: '18%',
    left: '-5%',
  },
  wm2: { top: '45%', left: '55%', fontSize: 90 },
  wm3: { top: '72%', left: '10%', fontSize: 100 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 44,
  },
  headerRowDetail: { marginBottom: Spacing.lg },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
    zIndex: 2,
  },
  headerSpacer: { width: 40, height: 40 },
  titleCenterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerTitleCenter: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    textAlign: 'center',
  },
});
