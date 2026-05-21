import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontFamily, FontSize } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';

type TabName = 'Home' | 'Dashboard';

const TABS: { name: TabName; label: string; icon: string; iconActive: string }[] = [
  { name: 'Home', label: 'Inicio', icon: 'cube-outline', iconActive: 'cube' },
  { name: 'Dashboard', label: 'Panel', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
];

export default function TabNavigator() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Contenido */}
      <View style={styles.content}>
        {activeTab === 'Home' && <HomeScreen />}
        {activeTab === 'Dashboard' && <DashboardScreen />}
      </View>

      {/* Tab Bar manual */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom || Spacing[2] }]}>
        {TABS.map((tab) => {
          const focused = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.name)}
              activeOpacity={0.7}
            >
              <View style={focused ? styles.activeIcon : styles.inactiveIcon}>
                <Ionicons
                  name={(focused ? tab.iconActive : tab.icon) as React.ComponentProps<typeof Ionicons>['name']}
                  size={22}
                  color={focused ? Colors.primary : Colors.textTertiary}
                />
              </View>
              <Text style={[styles.tabLabel, { color: focused ? Colors.primary : Colors.textTertiary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[2],
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[1],
  },
  activeIcon: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: 10,
    padding: 4,
  },
  inactiveIcon: {
    padding: 4,
  },
  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
