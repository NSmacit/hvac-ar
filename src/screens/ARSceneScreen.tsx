import React from 'react';
import { StyleSheet } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARWorld from '../ar/ARWorld';

/**
 * AR sahnesini barındıran ekran.
 * ViroARSceneNavigator kamerayı açar ve ARWorld sahnesini yükler.
 */
export default function ARSceneScreen() {
  return (
    <ViroARSceneNavigator
      autofocus
      initialScene={{ scene: ARWorld as any }}
      style={styles.navigator}
    />
  );
}

const styles = StyleSheet.create({
  navigator: {
    flex: 1,
  },
});
