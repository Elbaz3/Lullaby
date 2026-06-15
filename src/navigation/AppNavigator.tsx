import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/home/HomeScreen';
import { BabiesScreen } from '../screens/babies/BabiesScreen';
import { AddBabyScreen } from '../screens/babies/AddBabyScreen';
import { BabyDetailScreen } from '../screens/babies/BabyDetailScreen';
import { VaccinationScreen } from '../screens/babies/VaccinationScreen';
import { CryDetectionScreen } from '../screens/cry/CryDetectionScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { ChangePasswordScreen } from '../screens/settings/ChangePasswordScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { AssistantScreen } from '../screens/assistant/AssistantScreen';
import { BabyGrowthMenuScreen } from '../screens/baby-growth/BabyGrowthMenuScreen';
import { PhysicalGrowthScreen } from '../screens/baby-growth/PhysicalGrowthScreen';
import { MotorDevelopmentScreen } from '../screens/baby-growth/MotorDevelopmentScreen';
import { FeedingScreen } from '../screens/baby-growth/FeedingScreen';

import { Colors, FontWeight, Shadows } from '../constants/theme';
import { useTranslation } from '../i18n/useTranslation';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BabiesStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    <HomeStack.Screen name="BabyGrowthMenu" component={BabyGrowthMenuScreen} />
    <HomeStack.Screen name="PhysicalGrowth" component={PhysicalGrowthScreen} />
    <HomeStack.Screen name="MotorDevelopment" component={MotorDevelopmentScreen} />
    <HomeStack.Screen name="Feeding" component={FeedingScreen} />
  </HomeStack.Navigator>
);

const BabiesStackNavigator = () => (
  <BabiesStack.Navigator screenOptions={{ headerShown: false }}>
    <BabiesStack.Screen name="BabyList" component={BabiesScreen} />
    <BabiesStack.Screen name="AddBaby" component={AddBabyScreen} options={{ presentation: 'modal' }} />
    <BabiesStack.Screen name="BabyDetail" component={BabyDetailScreen} />
    <BabiesStack.Screen name="Vaccination" component={VaccinationScreen} />
  </BabiesStack.Navigator>
);

const SettingsStackNavigator = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
    <SettingsStack.Screen name="Profile" component={ProfileScreen} />
    <SettingsStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </SettingsStack.Navigator>
);

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  nameFocused: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
}

const TabIcon: React.FC<TabIconProps> = ({ name, nameFocused, focused, label }) => (
  <View style={tabStyles.wrap}>
    <View style={focused ? tabStyles.activeIndicator : undefined}>
      <Ionicons name={focused ? nameFocused : name} size={22} color={focused ? Colors.tabActive : Colors.tabInactive} />
    </View>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  </View>
);

const CryTabIcon: React.FC<{ focused: boolean; label: string }> = ({ focused, label }) => (
  <View style={cryStyles.wrap}>
    <View style={[cryStyles.btn, focused && cryStyles.btnActive]}>
      <Ionicons name="ear" size={24} color={Colors.white} />
    </View>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  </View>
);

const AppTabs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: Colors.tabBg,
          borderTopWidth: 0,
          ...Shadows.md,
          paddingBottom: Platform.OS === 'ios' ? 12 : 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-outline" nameFocused="home" focused={focused} label={t('tabs.home')} />
          ),
        }}
      />
      <Tab.Screen
        name="Babies"
        component={BabiesStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="people-outline" nameFocused="people" focused={focused} label={t('tabs.babies')} />
          ),
        }}
      />
      <Tab.Screen
        name="CryDetection"
        component={CryDetectionScreen}
        options={{
          tabBarIcon: ({ focused }) => <CryTabIcon focused={focused} label={t('tabs.cryAi')} />,
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="chatbubble-ellipses-outline"
              nameFocused="chatbubble-ellipses"
              focused={focused}
              label={t('tabs.assistant')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bar-chart-outline" nameFocused="bar-chart" focused={focused} label={t('tabs.reports')} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings-outline" nameFocused="settings" focused={focused} label={t('tabs.settings')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => <AppTabs />;

const tabStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 4 },
  activeIndicator: { backgroundColor: Colors.primarySoft, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  label: { fontSize: 10, fontWeight: FontWeight.medium, color: Colors.tabInactive },
  labelActive: { color: Colors.tabActive, fontWeight: FontWeight.semibold },
});

const cryStyles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2, marginTop: -20 },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  btnActive: { backgroundColor: Colors.primaryDark },
});
