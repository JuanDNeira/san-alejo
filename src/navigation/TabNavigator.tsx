import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontFamily, FontSize } from '../theme';
import type { TabParamList } from './types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof TabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'cube', inactive: 'cube-outline' },
  Dashboard: { active: 'bar-chart', inactive: 'bar-chart-outline' },
};

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Home: 'Inicio',
  Dashboard: 'Panel',
};

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: tabBarHeight,
          backgroundColor: Colors.backgroundSecondary,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: insets.bottom,
          paddingTop: Spacing[2],
          elevation: 16,
        },
        tabBarBackground: () => (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: Colors.backgroundSecondary }]}
            />
          ),
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name as keyof TabParamList];
          return (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={22}
                color={color}
              />
            </View>
          );
        },
        tabBarLabel: TAB_LABELS[route.name as keyof TabParamList],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: 10,
    padding: 4,
  },
  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
