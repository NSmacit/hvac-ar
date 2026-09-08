import React, { useEffect, useRef, useState } from 'react';
import {
  ViroARScene,
  ViroSphere,
  ViroMaterials,
  ViroText,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroTrackingStateConstants,
  ViroTrackingReason,
} from '@reactvision/react-viro';
import { useSceneStore, Vec3 } from '../store/useSceneStore';
import { getCatalogItem } from '../catalog/catalog';
import { arCursor } from './arCursor';
import PlaceableItem from './PlaceableItem';

/**
 * Faz 1: Tarama + düzlem algılama (görsel: sakin nişangâh).
 * Faz 2: Palet'ten seçilen parçayı baktığın gerçek yüzeye (hit-test) yerleştirme.
 * Faz 3: Dokun-seç + parmakla taşı.
 *
 * Titreyen renkli düzlem kaplamaları yerine, kameranın baktığı yüzeyde duran tek
 * bir nişangâh noktası gösterilir — parçanın nereye ineceğini net ve sakin gösterir.
 */

ViroMaterials.createMaterials({
  reticle: {
    lightingModel: 'Constant',
    diffuseColor: 'rgba(120, 220, 255, 0.95)',
  },
});

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

/** Kamera ışını sonuçlarından bir yüzey (plane) isabetini seç. */
function pickPlaneResult(results: any): any | null {
  const arr: any[] = Array.isArray(results)
    ? results
    : results?.hitTestResults ?? [];
  if (!arr.length) return null;
  const plane = arr.find((r) =>
    String(r?.type ?? '').toLowerCase().includes('plane'),
  );
  return plane ?? null;
}

export default function ARWorld(props: ViroSceneProps) {
  const appProps = props.sceneNavigator?.viroAppProps ?? {};
  const scanning = appProps.scanning ?? false;
  const onPlaneCountChange = appProps.onPlaneCountChange ?? noop;
  const placement = (appProps.placement ?? null) as PlacementRequest;

  const items = useSceneStore((s) => s.items);
  const selectedId = useSceneStore((s) => s.selectedId);
  const addItem = useSceneStore((s) => s.addItem);

  const [tracking, setTracking] = useState(false);
  const [planeCount, setPlaneCount] = useState(0);
  const [reticle, setReticle] = useState<Vec3 | null>(null);

  const planeIds = useRef<Set<string>>(new Set());
  const cameraRef = useRef<CameraTransform | null>(null);
  const lastReticleUpdate = useRef(0);
  const lastNonce = useRef(0);

  useEffect(() => {
    onPlaneCountChange(planeCount);
  }, [planeCount, onPlaneCountChange]);

  // Nişangâh geçersizken (yüzey yokken) gizle
  useEffect(() => {
    if (!scanning) setReticle(null);
  }, [scanning]);

  // Palet'ten yerleştirme isteği → parçayı baktığın yüzeye (veya önüne) koy
  useEffect(() => {
    if (!placement || placement.nonce === lastNonce.current) return;
    lastNonce.current = placement.nonce;

    const cat = getCatalogItem(placement.key);
    if (!cat) return;

    let pos: Vec3 | null = arCursor.valid ? arCursor.position : null;
    const cam = cameraRef.current;
    if (!pos && cam) {
      const d = 1.2;
      pos = [
        cam.position[0] + cam.forward[0] * d,
        cam.position[1] + cam.forward[1] * d,
        cam.position[2] + cam.forward[2] * d,
      ];
    }
    if (!pos) return;

    const yaw = cam?.rotation?.[1] ?? 0;
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
    if (c && c.position && c.forward) cameraRef.current = c;
  }

  // Kameranın baktığı yüzeydeki nokta → arCursor + (throttle'lı) nişangâh
  function onCameraARHitTest(results: any) {
    const res = pickPlaneResult(results);
    if (!res || !res.transform?.position) {
      arCursor.valid = false;
      return;
    }
    const pos = res.transform.position as Vec3;
    arCursor.position = pos;
    arCursor.rotation = (res.transform.rotation ?? [0, 0, 0]) as Vec3;
    arCursor.valid = true;

    if (!scanning) return;
    const now = Date.now();
    if (now - lastReticleUpdate.current > 66) {
      lastReticleUpdate.current = now;
      setReticle(pos);
    }
  }

  function onAnchorFound(anchor: any) {
    if (anchor?.type !== 'plane') return;
    planeIds.current.add(anchor.anchorId);
    setPlaneCount(planeIds.current.size);
  }

  function onAnchorRemoved(anchor: any) {
    if (anchor?.type !== 'plane') return;
    if (planeIds.current.delete(anchor.anchorId)) {
      setPlaneCount(planeIds.current.size);
    }
  }

  return (
    <ViroARScene
      onTrackingUpdated={onTrackingUpdated}
      onCameraTransformUpdate={onCameraTransformUpdate}
      onCameraARHitTest={onCameraARHitTest}
      anchorDetectionTypes={
        scanning ? ['PlanesHorizontal', 'PlanesVertical'] : 'None'
      }
      onAnchorFound={onAnchorFound}
      onAnchorRemoved={onAnchorRemoved}
    >
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.2]}
        intensity={900}
      />

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

      {/* Nişangâh: baktığın yüzeyde parçanın ineceği nokta */}
      {scanning && reticle && (
        <ViroSphere
          position={reticle}
          radius={0.025}
          materials={['reticle']}
        />
      )}

      {/* Yerleştirilmiş parçalar (gerçek ölçekte) */}
      {items.map((it) => (
        <PlaceableItem key={it.id} item={it} selected={it.id === selectedId} />
      ))}
    </ViroARScene>
  );
}
