import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppProvider from './src/providers/AppProvider';

export default function App() {
  return (
    <AppProvider>
      <View style={styles.container}>
        <Text style={styles.text}>San Alejo</Text>
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#F0F0F8',
    fontSize: 24,
  },
});
