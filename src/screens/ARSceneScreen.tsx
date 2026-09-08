import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARWorld from '../ar/ARWorld';
import ScanOverlay from '../components/ScanOverlay';
import MaterialPalette from '../components/MaterialPalette';
import TransformControls from '../components/TransformControls';
import ProjectBar from '../components/ProjectBar';
import { useSceneStore } from '../store/useSceneStore';

/**
 * AR sahnesini + RN kontrol katmanlarını (ScanOverlay, MaterialPalette) barındırır.
 *
 * Tarama durumu ve yerleştirme isteği burada tutulur, viroAppProps ile sahneye
 * geçirilir. Sahne, algıladığı düzlem sayısını geri bildirir.
 */
export default function ARSceneScreen() {
  const [scanning, setScanning] = useState(false);
  const [planeCount, setPlaneCount] = useState(0);
  const [placement, setPlacement] = useState<{ key: string; nonce: number } | null>(
    null,
  );

  const items = useSceneStore((s) => s.items);
  const clear = useSceneStore((s) => s.clear);

  const onPlaneCountChange = useCallback((n: number) => {
    setPlaneCount((prev) => (prev === n ? prev : n));
  }, []);

  const toggleScanning = useCallback(() => setScanning((p) => !p), []);

  const place = useCallback((key: string) => {
    setPlacement({ key, nonce: Date.now() });
  }, []);

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{ scene: ARWorld as any }}
        viroAppProps={{ scanning, onPlaneCountChange, placement }}
        style={styles.navigator}
      />

      {scanning && <MaterialPalette onPlace={place} />}

      <ScanOverlay
        scanning={scanning}
        planeCount={planeCount}
        itemCount={items.length}
        onToggle={toggleScanning}
        onClear={clear}
      />

      <TransformControls />

      <ProjectBar />
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
