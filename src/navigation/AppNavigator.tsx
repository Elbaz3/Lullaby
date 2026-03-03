import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/home/HomeScreen';
import { BabiesScreen } from '../screens/babies/BabiesScreen';
import { AddBabyScreen } from '../screens/babies/AddBabyScreen';
import { CryDetectionScreen } from '../screens/cry/CryDetectionScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

import { Colors, FontSize, FontWeight, Shadows } from '../constants/theme';
import { AppTabParamList } from '../types';

const Tab = createBottomTabNavigator<AppTabParamList>();
const BabiesStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

// ── Nested Stacks ─────────────────────────────

const BabiesStackNavigator: React.FC = () => (
  <BabiesStack.Navigator screenOptions={{ headerShown: false }}>
    <BabiesStack.Screen name="BabyList" component={BabiesScreen} />
    <BabiesStack.Screen
      name="AddBaby"
      component={AddBabyScreen}
      options={{ presentation: 'modal' }}
    />
  </BabiesStack.Navigator>
);

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
  </HomeStack.Navigator>
);

// ── Custom Tab Bar Icon ───────────────────────

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  nameFocused: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
  badge?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, nameFocused, focused, label, badge }) => (
  <View style={tabStyles.iconWrap}>
    <View style={focused ? tabStyles.activeIndicator : null}>
      <Ionicons
        name={focused ? nameFocused : name}
        size={24}
        color={focused ? Colors.tabActive : Colors.tabInactive}
      />
    </View>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    {badge ? (
      <View style={tabStyles.badge}>
        <Text style={tabStyles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
      </View>
    ) : null}
  </View>
);

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: Colors.tabInactive,
  },
  labelActive: {
    color: Colors.tabActive,
    fontWeight: FontWeight.semibold,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 4,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
});

// ── CRY Center Button ─────────────────────────

// Special floating center button for Cry Detection

// ── Tab Navigator ─────────────────────────────

export const AppNavigator: React.FC = () => (
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
          <TabIcon
            name="home-outline"
            nameFocused="home"
            focused={focused}
            label="Home"
          />
        ),
      }}
    />
    <Tab.Screen
      name="Babies"
      component={BabiesStackNavigator}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon
            name="people-outline"
            nameFocused="people"
            focused={focused}
            label="Babies"
          />
        ),
      }}
    />
    <Tab.Screen
      name="CryDetection"
      component={CryDetectionScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={cryTabStyles.container}>
            <View style={[cryTabStyles.btn, focused && cryTabStyles.btnActive]}>
              <Ionicons name="ear" size={26} color={Colors.white} />
            </View>
            <Text style={[cryTabStyles.label, focused && cryTabStyles.labelActive]}>
              Cry AI
            </Text>
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Reports"
      component={ReportsScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon
            name="bar-chart-outline"
            nameFocused="bar-chart"
            focused={focused}
            label="Reports"
          />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon
            name="settings-outline"
            nameFocused="settings"
            focused={focused}
            label="Settings"
          />
        ),
      }}
    />
  </Tab.Navigator>
);

const cryTabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
    marginTop: -20,
  },
  btn: {
    width: 58,
    height: 58,
    borderRadius: 29,
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
  btnActive: {
    backgroundColor: Colors.primaryDark,
  },
  label: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: Colors.tabInactive,
  },
  labelActive: {
    color: Colors.tabActive,
    fontWeight: FontWeight.semibold,
  },
});
