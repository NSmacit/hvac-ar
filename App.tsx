import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Giriş noktası: Projeler listesiyle açılır; oradan AR'da oluştur veya
 * kayıtlı projeyi 3D olarak incele.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
