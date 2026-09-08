import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATALOG } from '../catalog/catalog';
import { scale } from '../theme/responsive';

type Props = {
  /** Bir katalog parçasını sahneye (kameranın önüne) yerleştir */
  onPlace: (key: string) => void;
};

/**
 * Alt malzeme paleti (Faz 2). Bir karta dokunmak parçayı kameranın önüne
 * yerleştirir. Tablette kartlar responsive olarak büyür.
 */
export default function MaterialPalette({ onPlace }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { bottom: insets.bottom + scale(84) }]}
      pointerEvents="box-none"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {CATALOG.map((c) => (
          <Pressable
            key={c.key}
            onPress={() => onPlace(c.key)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={[styles.swatch, { backgroundColor: c.color }]} />
            <Text style={styles.cardTitle} numberOfLines={1}>
              {c.short}
            </Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  row: {
    paddingHorizontal: scale(12),
    gap: scale(10),
  },
  card: {
    width: scale(104),
    backgroundColor: 'rgba(20,24,31,0.82)',
    borderRadius: scale(14),
    padding: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardPressed: {
    opacity: 0.7,
    borderColor: '#2f6bff',
  },
  swatch: {
    height: scale(34),
    borderRadius: scale(8),
    marginBottom: scale(8),
  },
  cardTitle: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: '700',
  },
  cardSub: {
    color: '#aeb6c2',
    fontSize: scale(11),
    marginTop: 2,
  },
});
