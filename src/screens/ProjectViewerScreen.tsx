import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Viro3DSceneNavigator,
  ViroScene,
  ViroNode,
  ViroBox,
  ViroOrbitCamera,
  ViroAmbientLight,
  ViroDirectionalLight,
} from '@reactvision/react-viro';
import { RootStackParamList } from '../navigation/types';
import { loadProject } from '../data/projectRepository';
import { SceneItem, Vec3 } from '../store/useSceneStore';
import { getCatalogItem } from '../catalog/catalog';
import '../ar/partMaterials';

type ViewerRoute = RouteProp<RootStackParamList, 'Viewer'>;

const ZOOM_STEP = 1.25;
const CAM_MIN = 0.5;
const CAM_MAX = 30;

/** Projeyi orijine ortalar ve uygun kamera mesafesini hesaplar. */
function recenter(items: SceneItem[]): { items: SceneItem[]; camDist: number } {
  if (items.length === 0) return { items, camDist: 2 };
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const it of items) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], it.position[a]);
      max[a] = Math.max(max[a], it.position[a]);
    }
  }
  const center: Vec3 = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ];
  const radius =
    Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2 + 0.6;
  const moved = items.map((it) => ({
    ...it,
    position: [
      it.position[0] - center[0],
      it.position[1] - center[1],
      it.position[2] - center[2],
    ] as Vec3,
  }));
  return { items: moved, camDist: Math.max(radius * 2.6, 1.6) };
}

type SceneProps = {
  sceneNavigator: { viroAppProps: { items: SceneItem[]; camDist: number } };
};

/** Orbit kameralı, düzenlemesiz 3D sahne. Zoom kamera mesafesiyle (butonlar). */
function ViewerScene(props: SceneProps) {
  const { items, camDist } = props.sceneNavigator.viroAppProps;
  return (
    <ViroScene>
      <ViroAmbientLight color="#ffffff" intensity={350} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0.2, -1, -0.3]}
        intensity={900}
      />
      <ViroOrbitCamera position={[0, 0, camDist]} focalPoint={[0, 0, 0]} active />
      {items.map((it) => {
        const size = getCatalogItem(it.type)?.size ?? [0.2, 0.2, 0.2];
        return (
          <ViroNode
            key={it.id}
            position={it.position}
            rotation={it.rotationEuler}
            scale={it.scale}
          >
            <ViroBox
              width={size[0]}
              height={size[1]}
              length={size[2]}
              materials={[`mat_${it.type}`]}
            />
          </ViroNode>
        );
      })}
    </ViroScene>
  );
}

export default function ProjectViewerScreen() {
  const route = useRoute<ViewerRoute>();
  const navigation = useNavigation<any>();
  const { projectId } = route.params;
  const [items, setItems] = useState<SceneItem[] | null>(null);
  const [camDist, setCamDist] = useState<number | null>(null);
  const fitDist = useRef(2);

  useEffect(() => {
    let alive = true;
    loadProject(projectId).then((p) => {
      if (alive) setItems(p?.items ?? []);
    });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const view = useMemo(() => (items ? recenter(items) : null), [items]);

  useEffect(() => {
    if (view) {
      fitDist.current = view.camDist;
      setCamDist(view.camDist);
    }
  }, [view]);

  const zoom = useCallback(
    (factor: number) =>
      setCamDist((d) =>
        Math.max(CAM_MIN, Math.min(CAM_MAX, (d ?? fitDist.current) * factor)),
      ),
    [],
  );
  const resetZoom = useCallback(() => setCamDist(fitDist.current), []);

  // Zoom kontrollerini başlık çubuğuna da koy (her zaman görünür, RN)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerBtns}>
          <Pressable onPress={() => zoom(1 / ZOOM_STEP)} hitSlop={8}>
            <Text style={styles.headerBtn}>＋</Text>
          </Pressable>
          <Pressable onPress={() => zoom(ZOOM_STEP)} hitSlop={8}>
            <Text style={styles.headerBtn}>－</Text>
          </Pressable>
          <Pressable onPress={resetZoom} hitSlop={8}>
            <Text style={styles.headerBtn}>⤢</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, zoom, resetZoom]);

  if (!view || camDist == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8a94a6" />
      </View>
    );
  }

  const Nav3D = Viro3DSceneNavigator as any;
  const hasItems = view.items.length > 0;

  return (
    <View style={styles.root}>
      <Nav3D
        initialScene={{ scene: ViewerScene as any }}
        viroAppProps={{ items: view.items, camDist }}
        style={styles.nav}
      />

      {hasItems ? (
        <>
          {/* Zoom kontrolleri (kamera mesafesi) */}
          <View style={styles.zoomBar}>
            <Pressable
              onPress={() => zoom(1 / ZOOM_STEP)}
              style={({ pressed }) => [styles.zoomBtn, pressed && styles.pressed]}
            >
              <Text style={styles.zoomText}>＋</Text>
            </Pressable>
            <Pressable
              onPress={() => zoom(ZOOM_STEP)}
              style={({ pressed }) => [styles.zoomBtn, pressed && styles.pressed]}
            >
              <Text style={styles.zoomText}>－</Text>
            </Pressable>
            <Pressable
              onPress={resetZoom}
              style={({ pressed }) => [styles.zoomBtn, pressed && styles.pressed]}
            >
              <Text style={styles.resetText}>⤢</Text>
            </Pressable>
          </View>

          <View style={styles.hint} pointerEvents="none">
            <Text style={styles.hintText}>
              Parmakla sürükle: döndür · ＋ / － : yakınlaştır
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>Bu projede parça yok</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e1116' },
  nav: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0e1116',
  },
  zoomBar: {
    position: 'absolute',
    right: 16,
    bottom: 70,
    gap: 10,
  },
  zoomBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(20,24,31,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  headerBtns: { flexDirection: 'row', gap: 18, paddingRight: 4 },
  headerBtn: { color: '#fff', fontSize: 22, fontWeight: '700' },
  zoomText: { color: '#fff', fontSize: 26, fontWeight: '700', lineHeight: 30 },
  resetText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: { color: '#8a94a6', fontSize: 16 },
  hint: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' },
  hintText: {
    color: '#fff',
    fontSize: 13,
    backgroundColor: 'rgba(20,24,31,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
