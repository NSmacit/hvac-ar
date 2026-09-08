import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ARSceneScreen from './src/screens/ARSceneScreen';

/**
 * Faz 0 giriş noktası: doğrudan AR sahnesini açar.
 * Faz 5'te burası React Navigation ile Home / Projeler / AR / Viewer
 * ekranlarını içeren bir navigator'a dönüşecek.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ARSceneScreen />
    </SafeAreaProvider>
  );
}
