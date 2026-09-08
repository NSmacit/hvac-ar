import React, { useEffect, useRef, useState } from 'react';
import {
  ViroARScene,
  ViroNode,
  ViroQuad,
  ViroMaterials,
  ViroText,
  ViroTrackingStateConstants,
  ViroTrackingReason,
} from '@reactvision/react-viro';

/**
 * Faz 1: Tarama + düzlem (plane) algılama.
 *
 * Kullanıcı "Taramayı Başlat"a basınca (ScanOverlay -> viroAppProps.scanning=true)
 * yatay (tavan/zemin) ve dikey (duvar) düzlemler algılanır ve yarı saydam
 * ızgara-benzeri quad'larla görselleştirilir.
 *
 * Overlay UI (buton, sayaç, ipuçları) RN katmanında ARSceneScreen'de durur;
 * bu sahne yalnızca AR dünyasını çizer. İletişim viroAppProps üzerinden.
 */

// Düzlem yüzeyleri için materyaller (yatay = yeşil, dikey = mavi tonları)
ViroMaterials.createMaterials({
  plane_h: {
    lightingModel: 'Constant',
    diffuseColor: 'rgba(56, 211, 159, 0.55)', // yeşil - tavan/zemin
    cullMode: 'None', // çift taraflı: yüzeye her açıdan bakınca görünür
    blendMode: 'Alpha',
  },
  plane_v: {
    lightingModel: 'Constant',
    diffuseColor: 'rgba(90, 160, 255, 0.50)', // mavi - duvar
    cullMode: 'None',
    blendMode: 'Alpha',
  },
});

type PlaneInfo = {
  position: [number, number, number];
  rotation: [number, number, number];
  center: [number, number, number];
  width: number;
  height: number;
  horizontal: boolean;
};

type ViroAppProps = {
  scanning: boolean;
  onPlaneCountChange: (n: number) => void;
};

type ViroSceneProps = {
  sceneNavigator?: {
    viroAppProps?: Partial<ViroAppProps>;
  };
};

const noop = () => {};

export default function ARWorld(props: ViroSceneProps) {
  const appProps = props.sceneNavigator?.viroAppProps ?? {};
  const scanning = appProps.scanning ?? false;
  const onPlaneCountChange = appProps.onPlaneCountChange ?? noop;

  const [tracking, setTracking] = useState(false);
  const [planes, setPlanes] = useState<Record<string, PlaneInfo>>({});
  const scanningRef = useRef(scanning);
  scanningRef.current = scanning;

  // Algılanan düzlem sayısını RN katmanına bildir
  useEffect(() => {
    onPlaneCountChange(Object.keys(planes).length);
  }, [planes, onPlaneCountChange]);

  function onTrackingUpdated(
    state: ViroTrackingStateConstants,
    _reason: ViroTrackingReason,
  ) {
    setTracking(state === ViroTrackingStateConstants.TRACKING_NORMAL);
  }

  function toPlaneInfo(anchor: any): PlaneInfo {
    const alignment: string = anchor.alignment ?? '';
    return {
      position: anchor.position ?? [0, 0, 0],
      rotation: anchor.rotation ?? [0, 0, 0],
      center: anchor.center ?? [0, 0, 0],
      width: anchor.width ?? 0.5,
      height: anchor.height ?? 0.5,
      horizontal: alignment.toLowerCase().includes('horizontal'),
    };
  }

  function onAnchorFound(anchor: any) {
    if (!scanningRef.current || anchor?.type !== 'plane') return;
    setPlanes((prev) => ({ ...prev, [anchor.anchorId]: toPlaneInfo(anchor) }));
  }

  function onAnchorUpdated(anchor: any) {
    if (anchor?.type !== 'plane') return;
    setPlanes((prev) =>
      prev[anchor.anchorId]
        ? { ...prev, [anchor.anchorId]: toPlaneInfo(anchor) }
        : prev,
    );
  }

  function onAnchorRemoved(anchor: any) {
    if (anchor?.type !== 'plane') return;
    setPlanes((prev) => {
      if (!prev[anchor.anchorId]) return prev;
      const next = { ...prev };
      delete next[anchor.anchorId];
      return next;
    });
  }

  return (
    <ViroARScene
      onTrackingUpdated={onTrackingUpdated}
      anchorDetectionTypes={
        scanning ? ['PlanesHorizontal', 'PlanesVertical'] : 'None'
      }
      onAnchorFound={onAnchorFound}
      onAnchorUpdated={onAnchorUpdated}
      onAnchorRemoved={onAnchorRemoved}
    >
      {/* Takip başlamadan küçük bir ipucu (overlay ayrıca yönlendiriyor) */}
      {!tracking && (
        <ViroText
          text="Ortamı tara: telefonu yavaşça gezdir"
          position={[0, 0, -1.5]}
          scale={[0.4, 0.4, 0.4]}
          style={{
            fontFamily: 'System',
            fontSize: 26,
            color: '#ffffff',
            textAlign: 'center',
            textAlignVertical: 'center',
          }}
        />
      )}

      {/* Algılanan düzlemleri çiz */}
      {Object.entries(planes).map(([id, p]) => (
        <ViroNode key={id} position={p.position} rotation={p.rotation}>
          <ViroQuad
            position={p.center}
            rotation={[-90, 0, 0]}
            width={p.width}
            height={p.height}
            materials={[p.horizontal ? 'plane_h' : 'plane_v']}
          />
        </ViroNode>
      ))}
    </ViroARScene>
  );
}
