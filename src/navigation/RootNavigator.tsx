import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppProvider from '../providers/AppProvider';
import TabNavigator from './TabNavigator';
import type { RootStackParamList } from './types';

// Screens
import ContainerDetailScreen from '../screens/ContainerDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import CreateContainerScreen from '../screens/CreateContainerScreen';
import EditContainerScreen from '../screens/EditContainerScreen';
import CreateItemScreen from '../screens/CreateItemScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Tema de navegación oscuro personalizado
// NOTA: no incluimos 'fonts' — causa crash en nueva arch Android
// porque fontWeight string no puede castearse a Double en el bridge nativo
const darkNavigationTheme = {
  dark: true,
  colors: {
    primary: '#6C63FF',
    background: '#0A0A0F',
    card: '#111118',
    text: '#F0F0F8',
    border: '#2A2A3A',
    notification: '#FF6584',
  },
};

export default function RootNavigator() {
  return (
    <AppProvider>
      <NavigationContainer theme={darkNavigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0A0A0F' },
            // Transición suave tipo iOS
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        >
          {/* Tabs principales */}
          <Stack.Screen name="MainTabs" component={TabNavigator} />

          {/* Detalle de contenedor */}
          <Stack.Screen
            name="ContainerDetail"
            component={ContainerDetailScreen}
            options={{
              gestureEnabled: true,
              cardStyleInterpolator: ({ current, layouts }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          />

          {/* Búsqueda global */}
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{
              gestureEnabled: true,
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  opacity: current.progress,
                },
              }),
            }}
          />

          {/* Formularios */}
          <Stack.Screen name="CreateContainer" component={CreateContainerScreen} />
          <Stack.Screen name="EditContainer" component={EditContainerScreen} />
          <Stack.Screen name="CreateItem" component={CreateItemScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
