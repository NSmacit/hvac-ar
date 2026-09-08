import React, { useState } from 'react';
import {
  ViroARScene,
  ViroText,
  ViroTrackingStateConstants,
  ViroTrackingReason,
} from '@reactvision/react-viro';

/**
 * Faz 0: Boş AR sahnesi.
 * Amaç sadece AR takibinin (tracking) cihazda çalıştığını doğrulamak.
 * Sonraki fazlarda buraya plane detection, malzeme paleti ve
 * yerleştirilen parçalar eklenecek.
 */
export default function ARWorld() {
  const [ready, setReady] = useState(false);

  function onTrackingUpdated(
    state: ViroTrackingStateConstants,
    _reason: ViroTrackingReason,
  ) {
    setReady(state === ViroTrackingStateConstants.TRACKING_NORMAL);
  }

  return (
    <ViroARScene onTrackingUpdated={onTrackingUpdated}>
      <ViroText
        text={ready ? 'AR hazır ✓' : 'Ortamı tara: telefonu yavaşça gezdir'}
        position={[0, 0, -1.5]}
        scale={[0.4, 0.4, 0.4]}
        style={{
          fontFamily: 'System',
          fontSize: 28,
          color: ready ? '#38d39f' : '#ffffff',
          textAlignVertical: 'center',
          textAlign: 'center',
        }}
      />
    </ViroARScene>
  );
}
