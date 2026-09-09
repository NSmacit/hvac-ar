import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { loadProject, projectFileUri } from '../data/projectRepository';
import { Project } from '../data/projectSchema';
import { buildMetraj, MetrajRow } from '../data/exportJson';

type MetrajRouteType = RouteProp<RootStackParamList, 'Metraj'>;

function metrajText(project: Project, rows: MetrajRow[]): string {
  const lines = [`METRAJ — ${project.name}`, ''];
  for (const r of rows) {
    const boy =
      r.totalLengthMm != null
        ? ` · toplam ${(r.totalLengthMm / 1000).toFixed(2)} m`
        : '';
    lines.push(`• ${r.label}: ${r.count} adet${boy}`);
  }
  const totalLenMm = rows.reduce((a, r) => a + (r.totalLengthMm ?? 0), 0);
  lines.push('', `Toplam parça: ${project.items.length}`);
  if (totalLenMm > 0) {
    lines.push(`Toplam boy: ${(totalLenMm / 1000).toFixed(2)} m`);
  }
  return lines.join('\n');
}

export default function MetrajScreen() {
  const route = useRoute<MetrajRouteType>();
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [rows, setRows] = useState<MetrajRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadProject(projectId).then((p) => {
      if (!alive) return;
      setProject(p);
      setRows(p ? buildMetraj(p) : []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const shareFile = async () => {
    const uri = projectFileUri(projectId);
    if (!uri) {
      Alert.alert('Dosya yok', 'Önce projeyi kaydet.');
      return;
    }
    try {
      await Share.share({ url: uri, title: `${project?.name}.json` });
    } catch (e: any) {
      Alert.alert('Paylaşılamadı', String(e?.message ?? e));
    }
  };

  const shareText = async () => {
    if (!project) return;
    try {
      await Share.share({ message: metrajText(project, rows) });
    } catch (e: any) {
      Alert.alert('Paylaşılamadı', String(e?.message ?? e));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8a94a6" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={styles.dim}>Proje bulunamadı.</Text>
      </View>
    );
  }

  const totalLenMm = rows.reduce((a, r) => a + (r.totalLengthMm ?? 0), 0);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tablo başlığı */}
        <View style={[styles.row, styles.headRow]}>
          <Text style={[styles.cell, styles.cellName, styles.head]}>Parça</Text>
          <Text style={[styles.cell, styles.cellNum, styles.head]}>Adet</Text>
          <Text style={[styles.cell, styles.cellLen, styles.head]}>Boy (m)</Text>
        </View>

        {rows.length === 0 ? (
          <Text style={styles.dim}>Bu projede parça yok.</Text>
        ) : (
          rows.map((r) => (
            <View key={`${r.type}__${r.label}`} style={styles.row}>
              <Text style={[styles.cell, styles.cellName]} numberOfLines={2}>
                {r.label}
              </Text>
              <Text style={[styles.cell, styles.cellNum]}>{r.count}</Text>
              <Text style={[styles.cell, styles.cellLen]}>
                {r.totalLengthMm != null
                  ? (r.totalLengthMm / 1000).toFixed(2)
                  : '—'}
              </Text>
            </View>
          ))
        )}

        {/* Toplam */}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={[styles.cell, styles.cellName, styles.total]}>
            Toplam
          </Text>
          <Text style={[styles.cell, styles.cellNum, styles.total]}>
            {project.items.length}
          </Text>
          <Text style={[styles.cell, styles.cellLen, styles.total]}>
            {totalLenMm > 0 ? (totalLenMm / 1000).toFixed(2) : '—'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          onPress={shareFile}
          style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>JSON dosyasını paylaş</Text>
        </Pressable>
        <Pressable
          onPress={shareText}
          style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>Metin olarak paylaş</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e1116' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0e1116',
  },
  dim: { color: '#8a94a6', fontSize: 15, textAlign: 'center', marginTop: 20 },
  content: { padding: 16, paddingBottom: 140 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headRow: { borderBottomColor: 'rgba(255,255,255,0.18)' },
  totalRow: { borderBottomWidth: 0, marginTop: 6 },
  cell: { color: '#e6e9ee', fontSize: 15 },
  cellName: { flex: 1, paddingRight: 8 },
  cellNum: { width: 56, textAlign: 'center' },
  cellLen: { width: 72, textAlign: 'right' },
  head: { color: '#8a94a6', fontSize: 13, fontWeight: '700' },
  total: { color: '#fff', fontWeight: '800' },
  actions: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    gap: 10,
  },
  btn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2f6bff' },
  btnGhost: {
    backgroundColor: 'rgba(20,24,31,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pressed: { opacity: 0.8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
