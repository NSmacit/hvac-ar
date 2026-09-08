import React, { useEffect, useRef, useState } from 'react';
import {
  ViroARScene,
  ViroNode,
  ViroQuad,
  ViroMaterials,
  ViroText,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroTrackingStateConstants,
  ViroTrackingReason,
} from '@reactvision/react-viro';
import { useSceneStore, Vec3 } from '../store/useSceneStore';
import { getCatalogItem } from '../catalog/catalog';
import PlaceableItem from './PlaceableItem';

/**
 * Faz 1: Tarama + düzlem algılama.
 * Faz 2: Malzeme paletinden seçilen parçayı kameranın önüne yerleştirme.
 *
 * Overlay UI (buton, palet, sayaç) RN katmanında (ARSceneScreen) durur; bu sahne
 * yalnızca AR dünyasını çizer. İletişim viroAppProps üzerinden.
 */

// Algılanan düzlem yüzeyleri için materyaller (yatay = yeşil, dikey = mavi)
ViroMaterials.createMaterials({
  plane_h: {
    lightingModel: 'Constant',
    diffuseColor: 'rgba(56, 211, 159, 0.55)',
    cullMode: 'None',
    blendMode: 'Alpha',
  },
  plane_v: {
    lightingModel: 'Constant',
    diffuseColor: 'rgba(90, 160, 255, 0.50)',
    cullMode: 'None',
    blendMode: 'Alpha',
  },
});

type PlaneInfo = {
  position: Vec3;
  rotation: Vec3;
  center: Vec3;
  width: number;
  height: number;
  horizontal: boolean;
};

type CameraTransform = {
  position: number[];
  rotation: number[];
  forward: number[];
  up: number[];
};

type PlacementRequest = { key: string; nonce: number } | null;

type ViroAppProps = {
  scanning: boolean;
  onPlaneCountChange: (n: number) => void;
  placement: PlacementRequest;
};

type ViroSceneProps = {
  sceneNavigator?: { viroAppProps?: Partial<ViroAppProps> };
};

const noop = () => {};

export default function ARWorld(props: ViroSceneProps) {
  const appProps = props.sceneNavigator?.viroAppProps ?? {};
  const scanning = appProps.scanning ?? false;
  const onPlaneCountChange = appProps.onPlaneCountChange ?? noop;
  const placement = (appProps.placement ?? null) as PlacementRequest;

  const items = useSceneStore((s) => s.items);
  const selectedId = useSceneStore((s) => s.selectedId);
  const addItem = useSceneStore((s) => s.addItem);

  const [tracking, setTracking] = useState(false);
  const [planes, setPlanes] = useState<Record<string, PlaneInfo>>({});
  const scanningRef = useRef(scanning);
  scanningRef.current = scanning;

  const cameraRef = useRef<CameraTransform | null>(null);
  const lastNonce = useRef<number>(0);

  // Algılanan düzlem sayısını RN katmanına bildir
  useEffect(() => {
    onPlaneCountChange(Object.keys(planes).length);
  }, [planes, onPlaneCountChange]);

  // Palet'ten yerleştirme isteği geldiğinde kameranın önüne parça koy
  useEffect(() => {
    if (!placement || placement.nonce === lastNonce.current) return;
    lastNonce.current = placement.nonce;

    const cat = getCatalogItem(placement.key);
    const cam = cameraRef.current;
    if (!cat || !cam) return;

    const dist = 1.2; // kameranın 1.2 m önüne
    const pos: Vec3 = [
      cam.position[0] + cam.forward[0] * dist,
      cam.position[1] + cam.forward[1] * dist,
      cam.position[2] + cam.forward[2] * dist,
    ];
    const yaw = cam.rotation?.[1] ?? 0;

    addItem({
      type: cat.key,
      label: cat.label,
      modelRef: cat.modelRef,
      params: cat.params,
      position: pos,
      rotationEuler: [0, yaw, 0],
      scale: [1, 1, 1],
    });
  }, [placement, addItem]);

  function onTrackingUpdated(
    state: ViroTrackingStateConstants,
    _reason: ViroTrackingReason,
  ) {
    setTracking(state === ViroTrackingStateConstants.TRACKING_NORMAL);
  }

  function onCameraTransformUpdate(t: any) {
    const c: CameraTransform | undefined = t?.cameraTransform ?? t;
    if (c && c.position && c.forward) {
      cameraRef.current = c;
    }
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
      onCameraTransformUpdate={onCameraTransformUpdate}
      anchorDetectionTypes={
        scanning ? ['PlanesHorizontal', 'PlanesVertical'] : 'None'
      }
      onAnchorFound={onAnchorFound}
      onAnchorUpdated={onAnchorUpdated}
      onAnchorRemoved={onAnchorRemoved}
    >
      {/* Parçaların metal yüzeyini aydınlatmak için ışıklar */}
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.2]}
        intensity={900}
      />

      {/* Takip başlamadan ipucu */}
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

      {/* Algılanan düzlemler */}
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

      {/* Yerleştirilmiş parçalar */}
      {items.map((it) => (
        <PlaceableItem key={it.id} item={it} selected={it.id === selectedId} />
      ))}
    </ViroARScene>
  );
}
