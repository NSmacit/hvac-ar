import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';

const MODEL_URL =
  'https://sketchfab.com/3d-models/air-duct-kit-hvac-pipes-air-conditioning-499f1dfa825d4505828ee6454bc63cb2';

/**
 * Krediler / Lisanslar (Faz 6c).
 * Kullanılan 3D modelin atfı — lisans (CC-BY / Free Standard) gereği ZORUNLU.
 */
export default function CreditsScreen() {
  const openUrl = (url: string) =>
    Linking.openURL(url).catch(() =>
      Alert.alert('Açılamadı', 'Bağlantı açılamadı.'),
    );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>HVAC AR</Text>
      <Text style={styles.sub}>
        Havalandırma için sürükle-bırak 3D/AR ölçü ve projelendirme aracı.
      </Text>

      <View style={styles.card}>
        <Text style={styles.section}>3D Modeller</Text>
        <Text style={styles.itemTitle}>
          Air Duct Kit — HVAC / Pipes / Air Conditioning
        </Text>
        <Text style={styles.itemMeta}>Yazar: gerulf.doesinger</Text>
        <Text style={styles.itemMeta}>Kaynak: Sketchfab</Text>
        <Text style={styles.itemMeta}>
          Lisans: Creative Commons Attribution (CC-BY)
        </Text>
        <Text style={styles.note}>
          Bu model CC-BY lisansı altında kullanılmaktadır; ticari kullanım
          serbesttir, atıf zorunludur. Model üzerinde parçalara ayırma ve ölçek
          değişiklikleri yapılmıştır.
        </Text>
        <Pressable
          onPress={() => openUrl(MODEL_URL)}
          style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
        >
          <Text style={styles.linkText}>Sketchfab'da modeli aç</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Yazılım</Text>
        <Text style={styles.itemMeta}>• ReactVision ViroReact (AR/3D)</Text>
        <Text style={styles.itemMeta}>• Expo / React Native</Text>
        <Text style={styles.itemMeta}>• SheetJS (Excel export)</Text>
      </View>

      <Text style={styles.footer}>© 2026 HVAC AR</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e1116' },
  content: { padding: 20, paddingBottom: 48 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '800' },
  sub: { color: '#8a94a6', fontSize: 14, marginTop: 6, marginBottom: 20 },
  card: {
    backgroundColor: '#181d26',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  section: {
    color: '#8a94a6',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  itemMeta: { color: '#c7cdd6', fontSize: 14, lineHeight: 22 },
  note: {
    color: '#8a94a6',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  linkBtn: {
    marginTop: 14,
    backgroundColor: '#2f6bff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  footer: {
    color: '#5a6472',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
