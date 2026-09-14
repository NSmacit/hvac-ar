import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSceneStore } from '../store/useSceneStore';
import { scale as s } from '../theme/responsive';

const ROTATE_STEP = 15; // derece

/**
 * Seçili parça için manipülasyon çubuğu.
 * Zincir modeli: döndürme TÜM bağlı hattı merkezine göre çevirir (rotateAll);
 * taşıma parmakla sürükleyerek yapılır (tüm hat birlikte). Sil/seçimi bırak.
 * Hiçbir parça seçili değilse kendini gizler.
 */
export default function TransformControls() {
  const insets = useSafeAreaInsets();
  const selectedId = useSceneStore((st) => st.selectedId);
  const item = useSceneStore((st) =>
    st.items.find((it) => it.id === st.selectedId),
  );
  const rotateAll = useSceneStore((st) => st.rotateAll);
  const removeItem = useSceneStore((st) => st.removeItem);
  const select = useSceneStore((st) => st.select);

  if (!selectedId || !item) return null;

  const rotateBy = (deg: number) => rotateAll(deg);

  return (
    <View style={[styles.wrap, { top: insets.top + s(52) }]}>
      <Text style={styles.label} numberOfLines={1}>
        {item.label}
      </Text>
      <View style={styles.row}>
        <Btn text="⟲ 15°" onPress={() => rotateBy(-ROTATE_STEP)} />
        <Btn text="15° ⟳" onPress={() => rotateBy(ROTATE_STEP)} />
        <Btn text="Sil" danger onPress={() => removeItem(item.id)} />
        <Btn text="Bitti" primary onPress={() => select(null)} />
      </View>
    </View>
  );
}

function Btn({
  text,
  onPress,
  danger,
  primary,
}: {
  text: string;
  onPress: () => void;
  danger?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        danger && styles.btnDanger,
        primary && styles.btnPrimary,
        pressed && styles.btnPressed,
      ]}
    >
      <Text style={styles.btnText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: s(10),
    right: s(10),
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: s(13),
    fontWeight: '600',
    marginBottom: s(6),
    backgroundColor: 'rgba(20,24,31,0.6)',
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderRadius: 999,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: s(6),
    backgroundColor: 'rgba(20,24,31,0.82)',
    padding: s(6),
    borderRadius: s(14),
  },
  btn: {
    minWidth: s(48),
    paddingVertical: s(9),
    paddingHorizontal: s(11),
    borderRadius: s(10),
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
  },
  btnDanger: {
    backgroundColor: '#e5484d',
  },
  btnPrimary: {
    backgroundColor: '#2f6bff',
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: s(15),
    fontWeight: '700',
  },
});
