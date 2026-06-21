import React from 'react'
import { View, StyleSheet, Platform, Image } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Screen Imports
import { HomeScreen } from '../screens/home/HomeScreen'
import { BabiesScreen } from '../screens/babies/BabiesScreen'
import { AddBabyScreen } from '../screens/babies/AddBabyScreen'
import { BabyDetailScreen } from '../screens/babies/BabyDetailScreen'
import { VaccinationScreen } from '../screens/vaccination/VaccinationScreen'
import { ReportsScreen } from '../screens/reports/ReportsScreen'
import { SettingsScreen } from '../screens/settings/SettingsScreen'
import { ProfileScreen } from '../screens/settings/ProfileScreen'
import { ChangePasswordScreen } from '../screens/settings/ChangePasswordScreen'
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen'
import { AssistantScreen } from '../screens/assistant/AssistantScreen'
import { CryDetectionScreen } from '../screens/cry/CryDetectionScreen'
import { BabyRoutineScreen as BabyGrowthMenuScreen } from '../screens/baby-growth/BabyGrowthMenuScreen'
import { PhysicalGrowthScreen } from '../screens/baby-growth/PhysicalGrowthScreen'
import { MotorDevelopmentScreen } from '../screens/baby-growth/MotorDevelopmentScreen'
import { FeedingScreen } from '../screens/baby-growth/FeedingScreen'
import { HelpFaqScreen } from '../screens/settings/HelpFaqScreen'
import { ContactSupportScreen } from '../screens/settings/ContactSupportScreen'
import { PrivacyPolicyScreen } from '../screens/settings/PrivacyPolicyScreen'

// ── NEW: Baby Routine (Recommendation) Screen ──
import { BabyRoutineScreen } from '../screens/babyRoutine/BabyRoutineScreen'

import { Shadows } from '../constants/theme'

const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()
const BabiesStack = createNativeStackNavigator()
const SettingsStack = createNativeStackNavigator()

// ── Stack Definitions ─────────────────────────

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    <HomeStack.Screen name="CryDetection" component={CryDetectionScreen} />
    <HomeStack.Screen name="BabyRoutine" component={BabyGrowthMenuScreen} />
    <HomeStack.Screen name="Vaccination" component={VaccinationScreen} />
    <HomeStack.Screen name="PhysicalGrowth" component={PhysicalGrowthScreen} />
    <HomeStack.Screen
      name="MotorDevelopment"
      component={MotorDevelopmentScreen}
    />
    <HomeStack.Screen name="Feeding" component={FeedingScreen} />
  </HomeStack.Navigator>
)

const BabiesStackNavigator = () => (
  <BabiesStack.Navigator screenOptions={{ headerShown: false }}>
    <BabiesStack.Screen name="BabyList" component={BabiesScreen} />
    <BabiesStack.Screen
      name="AddBaby"
      component={AddBabyScreen}
      options={{ presentation: 'modal' }}
    />
    <BabiesStack.Screen name="BabyDetail" component={BabyDetailScreen} />
    <BabiesStack.Screen name="Vaccination" component={VaccinationScreen} />
    {/* ── NEW ── */}
    <BabiesStack.Screen name="BabyRoutine" component={BabyRoutineScreen} />
  </BabiesStack.Navigator>
)

const SettingsStackNavigator = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
    <SettingsStack.Screen name="Profile" component={ProfileScreen} />
    <SettingsStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
    />
    <SettingsStack.Screen name="HelpFaq" component={HelpFaqScreen} />
    <SettingsStack.Screen
      name="ContactSupport"
      component={ContactSupportScreen}
    />
    <SettingsStack.Screen
      name="PrivacyPolicy"
      component={PrivacyPolicyScreen}
    />
  </SettingsStack.Navigator>
)

// ── Custom Tab Icon ───────────────────────────

const NavIcon = ({ source, focused }: any) => (
  <View style={styles.tabItemContainer}>
    <Image
      source={source}
      style={[styles.iconImage, { tintColor: focused ? '#C07792' : '#D1D1D1' }]}
      resizeMode="contain"
    />
    {focused && <View style={styles.activeIndicator} />}
  </View>
)

// ── Main Tab Navigator ────────────────────────

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar
      }}
    >
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon
              source={require('../../assets/navigator/settings.png')}
              focused={focused}
            />
          )
        }}
      />

      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon
              source={require('../../assets/navigator/report.png')}
              focused={focused}
            />
          )
        }}
      />

      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon
              source={require('../../assets/navigator/home.png')}
              focused={focused}
            />
          )
        }}
      />

      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon
              source={require('../../assets/navigator/chat.png')}
              focused={focused}
            />
          )
        }}
      />

      <Tab.Screen
        name="Babies"
        component={BabiesStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon
              source={require('../../assets/navigator/profile.png')}
              focused={focused}
            />
          )
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 90 : 75,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
    paddingBottom: Platform.OS === 'ios' ? 25 : 0
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 60,
    paddingTop: 10
  },
  iconImage: {
    width: 28,
    height: 28
  },
  activeIndicator: {
    width: 35,
    height: 3,
    backgroundColor: '#C07792',
    borderRadius: 2,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 5 : 2
  }
})
