import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import AppProvider from '../providers/AppProvider';

import HomeScreen from '../screens/HomeScreen';
import ContainerDetailScreen from '../screens/ContainerDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import CreateContainerScreen from '../screens/CreateContainerScreen';
import EditContainerScreen from '../screens/EditContainerScreen';
import CreateItemScreen from '../screens/CreateItemScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TabNavigator from './TabNavigator';

// ─── Tipos de rutas ───────────────────────────────────────────────────────────
export type RouteName =
  | 'MainTabs'
  | 'ContainerDetail'
  | 'Search'
  | 'CreateContainer'
  | 'EditContainer'
  | 'CreateItem'
  | 'Dashboard';

export type RouteParams = {
  containerId?: string;
  parentContainerId?: string;
  locationId?: string;
  itemId?: string;
};

export interface NavigationState {
  route: RouteName;
  params?: RouteParams;
}

// ─── Contexto de navegación ───────────────────────────────────────────────────
export const NavigationContext = React.createContext<{
  navigate: (route: RouteName, params?: RouteParams) => void;
  goBack: () => void;
  currentRoute: RouteName;
  params?: RouteParams;
}>({
  navigate: () => {},
  goBack: () => {},
  currentRoute: 'MainTabs',
  params: undefined,
});

export function useAppNavigation() {
  return React.useContext(NavigationContext);
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function RootNavigator() {
  const [history, setHistory] = useState<NavigationState[]>([
    { route: 'MainTabs' },
  ]);

  const current = history[history.length - 1];

  const navigate = useCallback((route: RouteName, params?: RouteParams) => {
    setHistory((prev) => [...prev, { route, params }]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const renderScreen = () => {
    switch (current.route) {
      case 'MainTabs':
        return <TabNavigator />;
      case 'ContainerDetail':
        return <ContainerDetailScreen />;
      case 'Search':
        return <SearchScreen />;
      case 'CreateContainer':
        return <CreateContainerScreen />;
      case 'EditContainer':
        return <EditContainerScreen />;
      case 'CreateItem':
        return <CreateItemScreen />;
      case 'Dashboard':
        return <DashboardScreen />;
      default:
        return <TabNavigator />;
    }
  };

  return (
    <AppProvider>
      <NavigationContext.Provider
        value={{
          navigate,
          goBack,
          currentRoute: current.route,
          params: current.params,
        }}
      >
        <View style={styles.container}>
          {renderScreen()}
        </View>
      </NavigationContext.Provider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
});
