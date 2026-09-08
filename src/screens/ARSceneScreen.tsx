import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARWorld from '../ar/ARWorld';
import ScanOverlay from '../components/ScanOverlay';

/**
 * AR sahnesini + RN kontrol katmanını (ScanOverlay) barındıran ekran.
 *
 * Tarama durumu burada (RN tarafında) tutulur ve viroAppProps ile AR sahnesine
 * geçirilir. Sahne, algıladığı düzlem sayısını onPlaneCountChange ile geri bildirir.
 */
export default function ARSceneScreen() {
  const [scanning, setScanning] = useState(false);
  const [planeCount, setPlaneCount] = useState(0);

  const onPlaneCountChange = useCallback((n: number) => {
    setPlaneCount((prev) => (prev === n ? prev : n));
  }, []);

  const toggleScanning = useCallback(() => {
    setScanning((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{ scene: ARWorld as any }}
        viroAppProps={{ scanning, onPlaneCountChange }}
        style={styles.navigator}
      />
      <ScanOverlay
        scanning={scanning}
        planeCount={planeCount}
        onToggle={toggleScanning}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigator: {
    flex: 1,
  },
});
