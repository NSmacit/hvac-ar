import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSceneStore } from '../store/useSceneStore';
import {
  buildProject,
} from '../data/projectSchema';
import {
  saveProject,
  listProjects,
  loadProject,
} from '../data/projectRepository';
import { scale as s } from '../theme/responsive';

/**
 * Proje kaydet / son projeyi aç çubuğu (Faz 4).
 * Faz 5'te "Aç" tam bir proje listesi ekranına dönüşecek.
 */
export default function ProjectBar() {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const doSave = (name: string) => {
    const st = useSceneStore.getState();
    if (st.items.length === 0) {
      Alert.alert('Boş sahne', 'Önce en az bir parça yerleştir.');
      return;
    }
    try {
      const project = buildProject(
        st.projectId,
        name.trim() || st.projectName,
        st.items,
        st.createdAt,
      );
      saveProject(project);
      st.setProjectName(project.name);
      Alert.alert('Kaydedildi', `"${project.name}" · ${project.items.length} parça`);
    } catch (e: any) {
      Alert.alert('Kayıt hatası', String(e?.message ?? e));
    }
  };

  const onSave = () => {
    const current = useSceneStore.getState().projectName;
    if (Platform.OS === 'ios') {
      Alert.prompt('Projeyi kaydet', 'Proje adı:', doSave, 'plain-text', current);
    } else {
      doSave(current);
    }
  };

  const onOpenLast = async () => {
    setBusy(true);
    try {
      const list = await listProjects();
      if (list.length === 0) {
        Alert.alert('Kayıt yok', 'Henüz kaydedilmiş proje yok.');
        return;
      }
      const p = await loadProject(list[0].projectId);
      if (!p) {
        Alert.alert('Açılamadı', 'Proje dosyası okunamadı.');
        return;
      }
      useSceneStore.getState().loadScene({
        projectId: p.projectId,
        name: p.name,
        createdAt: p.createdAt,
        items: p.items,
      });
      Alert.alert('Açıldı', `"${p.name}" · ${p.items.length} parça yüklendi`);
    } catch (e: any) {
      Alert.alert('Açma hatası', String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, { top: insets.top + s(8), left: insets.left + s(10) }]}>
      <Pressable
        onPress={onSave}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={styles.txt}>💾 Kaydet</Text>
      </Pressable>
      <Pressable
        onPress={onOpenLast}
        disabled={busy}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={styles.txt}>📂 Son proje</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    gap: s(8),
  },
  btn: {
    backgroundColor: 'rgba(20,24,31,0.82)',
    paddingHorizontal: s(12),
    paddingVertical: s(9),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  pressed: { opacity: 0.7 },
  txt: { color: '#fff', fontSize: s(13), fontWeight: '600' },
});
