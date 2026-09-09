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
  PanResponder,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Viro3DSceneNavigator,
  ViroScene,
  ViroNode,
  ViroBox,
  ViroCamera,
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
const CAM_MIN = 0.4;
const CAM_MAX = 40;
const ROT_SPEED = 0.4;

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
  sceneNavigator: {
    viroAppProps: {
      items: SceneItem[];
      camDist: number;
      rotX: number;
      rotY: number;
    };
  };
};

/**
 * Sabit kamera + döndürülebilir model düğümü.
 * Kamera origin'e bakar; parçalar bir düğümde döndürülür (orbit hissi).
 */
function ViewerScene(props: SceneProps) {
  const { items, camDist, rotX, rotY } = props.sceneNavigator.viroAppProps;
  return (
    <ViroScene>
      <ViroAmbientLight color="#ffffff" intensity={400} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0.3, -1, -0.4]}
        intensity={1000}
      />
      <ViroCamera position={[0, 0, camDist]} active />
      <ViroNode rotation={[rotX, rotY, 0]}>
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
      </ViroNode>
    </ViroScene>
  );
}

export default function ProjectViewerScreen() {
  const route = useRoute<ViewerRoute>();
  const navigation = useNavigation<any>();
  const { projectId, name } = route.params;
  const [items, setItems] = useState<SceneItem[] | null>(null);
  const [camDist, setCamDist] = useState<number | null>(null);
  const [rot, setRot] = useState({ x: -15, y: 0 });
  const fitDist = useRef(2);
  const rotRef = useRef({ x: -15, y: 0 });
  const lastPan = useRef({ dx: 0, dy: 0 });

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
  const resetView = useCallback(() => {
    setCamDist(fitDist.current);
    rotRef.current = { x: -15, y: 0 };
    setRot({ x: -15, y: 0 });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      // Döndürme sürüklemesi geri-git jestini tetiklemesin
      gestureEnabled: false,
      fullScreenGestureEnabled: false,
      headerRight: () => (
        <View style={styles.headerBtns}>
          <Pressable onPress={() => zoom(1 / ZOOM_STEP)} hitSlop={8}>
            <Text style={styles.headerBtn}>＋</Text>
          </Pressable>
          <Pressable onPress={() => zoom(ZOOM_STEP)} hitSlop={8}>
            <Text style={styles.headerBtn}>－</Text>
          </Pressable>
          <Pressable onPress={resetView} hitSlop={8}>
            <Text style={styles.headerBtn}>⤢</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, zoom, resetView]);

  // Tek parmak sürükle → modeli döndür
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastPan.current = { dx: 0, dy: 0 };
      },
      onPanResponderMove: (_e, g) => {
        const ddx = g.dx - lastPan.current.dx;
        const ddy = g.dy - lastPan.current.dy;
        lastPan.current = { dx: g.dx, dy: g.dy };
        const y = rotRef.current.y + ddx * ROT_SPEED;
        const x = Math.max(
          -85,
          Math.min(85, rotRef.current.x + ddy * ROT_SPEED),
        );
        rotRef.current = { x, y };
        setRot({ x, y });
      },
    }),
  ).current;

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
        viroAppProps={{ items: view.items, camDist, rotX: rot.x, rotY: rot.y }}
        style={styles.nav}
      />

      {/* Döndürme için tek-parmak yakalayıcı (viewer'da başka jest yok) */}
      {hasItems && (
        <View style={styles.gesture} {...responder.panHandlers} />
      )}

      {/* Metraj/Export butonu (jest katmanının ÜSTÜNDE) */}
      {hasItems && (
        <Pressable
          onPress={() => navigation.navigate('Metraj', { projectId, name })}
          style={({ pressed }) => [styles.metrajBtn, pressed && styles.pressed]}
        >
          <Text style={styles.metrajText}>📋 Metraj</Text>
        </Pressable>
      )}

      {hasItems ? (
        <View style={styles.hint} pointerEvents="none">
          <Text style={styles.hintText}>
            Parmakla sürükle: döndür · ＋ / － : yakınlaştır
          </Text>
        </View>
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
  gesture: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0e1116',
  },
  headerBtns: { flexDirection: 'row', gap: 18, paddingRight: 4 },
  headerBtn: { color: '#fff', fontSize: 22, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  metrajBtn: {
    position: 'absolute',
    left: 16,
    bottom: 24,
    backgroundColor: '#2f6bff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  metrajText: { color: '#fff', fontSize: 15, fontWeight: '700' },
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
