import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { listProjects, loadProject, deleteProject } from '../data/projectRepository';
import { ProjectSummary } from '../data/projectSchema';
import { useSceneStore } from '../store/useSceneStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Projects'>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function ProjectsScreen() {
  const navigation = useNavigation<Nav>();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await listProjects());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onNew = () => {
    useSceneStore.getState().newProject();
    navigation.navigate('ARScene', { mode: 'new' });
  };

  const onOpenViewer = (p: ProjectSummary) => {
    navigation.navigate('Viewer', { projectId: p.projectId, name: p.name });
  };

  const onEditInAR = async (p: ProjectSummary) => {
    const full = await loadProject(p.projectId);
    if (!full) {
      Alert.alert('Açılamadı', 'Proje dosyası okunamadı.');
      return;
    }
    useSceneStore.getState().loadScene({
      projectId: full.projectId,
      name: full.name,
      createdAt: full.createdAt,
      items: full.items,
    });
    navigation.navigate('ARScene', { mode: 'edit' });
  };

  const onDelete = (p: ProjectSummary) => {
    Alert.alert('Projeyi sil', `"${p.name}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          deleteProject(p.projectId);
          refresh();
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={projects}
        keyExtractor={(p) => p.projectId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#8a94a6"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Henüz proje yok</Text>
              <Text style={styles.emptySub}>
                Aşağıdan yeni bir AR projesi oluştur.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpenViewer(item)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardMeta}>
                {item.itemCount} parça · {formatDate(item.updatedAt)}
              </Text>
            </View>
            <Pressable
              onPress={() => onEditInAR(item)}
              hitSlop={8}
              style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
            >
              <Text style={styles.smallBtnText}>AR</Text>
            </Pressable>
            <Pressable
              onPress={() => onDelete(item)}
              hitSlop={8}
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
            >
              <Text style={styles.deleteText}>Sil</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <Pressable
        onPress={onNew}
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Text style={styles.fabText}>＋ Yeni AR Projesi</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e1116' },
  listContent: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 24 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#8a94a6', fontSize: 14, marginTop: 6, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181d26',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardPressed: { opacity: 0.85 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardMeta: { color: '#8a94a6', fontSize: 13, marginTop: 4 },
  smallBtn: {
    backgroundColor: '#2f6bff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  smallBtnText: { color: '#fff', fontWeight: '700' },
  deleteBtn: {
    backgroundColor: 'rgba(229,72,77,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  deleteText: { color: '#e5484d', fontWeight: '700' },
  pressed: { opacity: 0.7 },
  fab: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: '#2f6bff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
