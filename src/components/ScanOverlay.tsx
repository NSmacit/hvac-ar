import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from '../theme/responsive';

type Props = {
  scanning: boolean;
  planeCount: number;
  itemCount: number;
  onToggle: () => void;
  onClear: () => void;
};

/**
 * AR görüntüsünün üzerine binen RN kontrol katmanı.
 * - Üstte durum bilgisi (yüzey + parça sayısı)
 * - Altta "Taramayı Başlat/Durdur" ve (parça varsa) "Temizle" butonları
 */
export default function ScanOverlay({
  scanning,
  planeCount,
  itemCount,
  onToggle,
  onClear,
}: Props) {
  const insets = useSafeAreaInsets();

  const parts: string[] = [];
  if (scanning) {
    parts.push(planeCount === 0 ? 'Yüzey aranıyor…' : `${planeCount} yüzey`);
  } else {
    parts.push('Taramaya hazır');
  }
  if (itemCount > 0) parts.push(`${itemCount} parça`);
  const statusText = parts.join('  ·  ');

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* Üst durum çubuğu */}
      <View
        style={[styles.topBar, { top: insets.top + scale(8) }]}
        pointerEvents="none"
      >
        <View style={styles.pill}>
          {scanning && planeCount === 0 && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginRight: 8 }}
            />
          )}
          <View
            style={[
              styles.dot,
              { backgroundColor: scanning ? '#38d39f' : '#8a94a6' },
            ]}
          />
          <Text style={styles.pillText}>{statusText}</Text>
        </View>
      </View>

      {/* Tarama sırasında, henüz yüzey yokken ipucu */}
      {scanning && planeCount === 0 && (
        <View style={styles.hintWrap} pointerEvents="none">
          <Text style={styles.hintText}>
            Telefonu yavaşça tavana ve zemine doğru gezdir
          </Text>
        </View>
      )}

      {/* Alt aksiyon butonları */}
      <View style={[styles.bottomBar, { bottom: insets.bottom + scale(20) }]}>
        <Pressable
          onPress={onToggle}
          style={({ pressed }) => [
            styles.button,
            scanning ? styles.buttonStop : styles.buttonStart,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {scanning ? 'Taramayı Durdur' : 'Taramayı Başlat'}
          </Text>
        </Pressable>

        {itemCount > 0 && (
          <Pressable
            onPress={onClear}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.clearText}>Temizle</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,24,31,0.72)',
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: 999,
  },
  dot: {
    width: scale(9),
    height: scale(9),
    borderRadius: 999,
    marginRight: scale(8),
  },
  pillText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: '600',
  },
  hintWrap: {
    position: 'absolute',
    left: scale(24),
    right: scale(24),
    top: '46%',
    alignItems: 'center',
  },
  hintText: {
    color: '#fff',
    fontSize: scale(15),
    textAlign: 'center',
    backgroundColor: 'rgba(20,24,31,0.55)',
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(12),
  },
  button: {
    minWidth: scale(200),
    paddingVertical: scale(15),
    paddingHorizontal: scale(24),
    borderRadius: scale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  buttonStart: {
    backgroundColor: '#2f6bff',
  },
  buttonStop: {
    backgroundColor: '#e5484d',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: scale(17),
    fontWeight: '700',
  },
  clearButton: {
    paddingVertical: scale(14),
    paddingHorizontal: scale(18),
    borderRadius: scale(16),
    backgroundColor: 'rgba(20,24,31,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  clearText: {
    color: '#fff',
    fontSize: scale(15),
    fontWeight: '600',
  },
});
