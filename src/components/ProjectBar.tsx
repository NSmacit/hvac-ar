import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSceneStore } from '../store/useSceneStore';
import { buildProject } from '../data/projectSchema';
import { saveProject } from '../data/projectRepository';
import { scale as s } from '../theme/responsive';

/**
 * AR ekranındaki proje çubuğu (Faz 5):
 * - 💾 Kaydet (ad sorar, cihazda JSON'a yazar)
 * - ‹ Projeler (listeye geri döner)
 */
export default function ProjectBar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

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

  const onBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Projects');
  };

  return (
    <View style={[styles.wrap, { top: insets.top + s(8), left: insets.left + s(10) }]}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={styles.txt}>‹ Projeler</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={styles.txt}>💾 Kaydet</Text>
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
