import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

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
import { HelpFaqScreen } from '../screens/settings/HelpFaqScreen'
import { ContactSupportScreen } from '../screens/settings/ContactSupportScreen'
import { PrivacyPolicyScreen } from '../screens/settings/PrivacyPolicyScreen'
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen'
import { AssistantScreen } from '../screens/assistant/AssistantScreen'
import { CryDetectionScreen } from '../screens/cry/CryDetectionScreen'
import { BabyRoutineScreen } from '../screens/baby-growth/BabyGrowthMenuScreen'
import { PhysicalGrowthScreen } from '../screens/baby-growth/PhysicalGrowthScreen'
import { MotorDevelopmentScreen } from '../screens/baby-growth/MotorDevelopmentScreen'
import { FeedingScreen } from '../screens/baby-growth/FeedingScreen'

import { Colors, Shadows } from '../constants/theme'

const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()
const BabiesStack = createNativeStackNavigator()
const SettingsStack = createNativeStackNavigator()

// ── Stacks ────────────────────────────────────

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Reports" component={ReportsScreen} />
    <HomeStack.Screen name="CryDetection" component={CryDetectionScreen} />
    <HomeStack.Screen name="Vaccination" component={VaccinationScreen} />
    <HomeStack.Screen name="BabyDetail" component={BabyDetailScreen} />
    <HomeStack.Screen name="BabyRoutine" component={BabyRoutineScreen} />
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

// ── Specialized Tab Components ────────────────

const TabIcon = ({ name, focused, isMaterial = false }: any) => (
  <View style={styles.iconWrap}>
    {isMaterial ? (
      <MaterialCommunityIcons
        name={name}
        size={26}
        color={focused ? '#C07792' : '#D1D1D1'}
      />
    ) : (
      <Ionicons name={name} size={24} color={focused ? '#C07792' : '#D1D1D1'} />
    )}
  </View>
)

const CenterTabIcon = ({ focused }: any) => (
  <View style={[styles.centerCircle, focused && styles.centerCircleActive]}>
    <Ionicons
      name={focused ? 'home' : 'home-outline'}
      size={26}
      color={focused ? '#C07792' : '#D1D1D1'}
    />
  </View>
)

// ── Main Navigator ───────────────────────────
// Tab order (left → right): Babies | Notifications | Home (center) | Assistant | Settings
// Home is defined first so it is the initial route on app launch.

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home" // ← entry point
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar
      }}
    >
      {/* Left side */}
      <Tab.Screen
        name="Babies"
        component={BabiesStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="baby-face-outline" focused={focused} isMaterial />
          )
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="notifications-outline" focused={focused} />
          )
        }}
      />

      {/* Center focal tab */}
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <CenterTabIcon focused={focused} />
        }}
      />

      {/* Right side */}
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="chatbubbles-outline" focused={focused} />
          )
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings-outline" focused={focused} />
          )
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    top: Platform.OS === 'ios' ? 15 : 0
  },
  centerCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    top: Platform.OS === 'ios' ? 5 : -5
  },
  centerCircleActive: {
    borderColor: '#F8C8DC',
    backgroundColor: '#FFF0F5'
  }
})
