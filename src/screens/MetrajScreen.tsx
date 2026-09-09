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
import { File, Paths } from 'expo-file-system';
import * as XLSX from 'xlsx';
import { RootStackParamList } from '../navigation/types';
import { loadProject, projectFileUri } from '../data/projectRepository';
import { Project } from '../data/projectSchema';
import { buildMetraj, MetrajRow } from '../data/exportJson';

/** Proje adını güvenli bir dosya adına çevir. */
function safeFileName(name: string): string {
  return (
    name
      .replace(/[^\p{L}\p{N}\-_ ]/gu, '')
      .trim()
      .replace(/\s+/g, '_') || 'metraj'
  );
}

/** Metraj özeti + parça detayından bir .xlsx (base64) üret. */
function buildXlsxBase64(project: Project, rows: MetrajRow[]): string {
  // Sayfa 1: Metraj özeti
  const summary: (string | number)[][] = [
    ['Parça', 'Tip', 'Adet', 'Toplam Boy (m)'],
  ];
  for (const r of rows) {
    summary.push([
      r.label,
      r.type,
      r.count,
      r.totalLengthMm != null ? +(r.totalLengthMm / 1000).toFixed(3) : '',
    ]);
  }
  const totalLenMm = rows.reduce((a, r) => a + (r.totalLengthMm ?? 0), 0);
  summary.push([]);
  summary.push([
    'TOPLAM',
    '',
    project.items.length,
    totalLenMm > 0 ? +(totalLenMm / 1000).toFixed(3) : '',
  ]);

  // Sayfa 2: Parça detayı (koordinat/açı/parametre)
  const detail: (string | number)[][] = [
    ['#', 'Tip', 'Etiket', 'X (m)', 'Y (m)', 'Z (m)', 'Dönüş Y (°)', 'Parametreler'],
  ];
  project.items.forEach((it, i) => {
    detail.push([
      i + 1,
      it.type,
      it.label,
      +it.position[0].toFixed(3),
      +it.position[1].toFixed(3),
      +it.position[2].toFixed(3),
      +it.rotationEuler[1].toFixed(1),
      Object.entries(it.params)
        .map(([k, v]) => `${k}=${v}`)
        .join(', '),
    ]);
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Metraj');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detail), 'Parçalar');
  return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
}

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

  const shareExcel = async () => {
    if (!project) return;
    try {
      const b64 = buildXlsxBase64(project, rows);
      const file = new File(Paths.cache, `${safeFileName(project.name)}.xlsx`);
      if (file.exists) file.delete();
      file.create();
      file.write(b64, { encoding: 'base64' });
      await Share.share({ url: file.uri, title: `${project.name}.xlsx` });
    } catch (e: any) {
      Alert.alert('Excel hatası', String(e?.message ?? e));
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
          onPress={shareExcel}
          style={({ pressed }) => [styles.btn, styles.btnExcel, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>📊 Excel (.xlsx) paylaş</Text>
        </Pressable>
        <View style={styles.rowBtns}>
          <Pressable
            onPress={shareFile}
            style={({ pressed }) => [styles.btn, styles.flex, styles.btnPrimary, pressed && styles.pressed]}
          >
            <Text style={styles.btnText}>JSON</Text>
          </Pressable>
          <Pressable
            onPress={shareText}
            style={({ pressed }) => [styles.btn, styles.flex, styles.btnGhost, pressed && styles.pressed]}
          >
            <Text style={styles.btnText}>Metin</Text>
          </Pressable>
        </View>
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
  rowBtns: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  btnExcel: { backgroundColor: '#1e8e5a' },
  btnPrimary: { backgroundColor: '#2f6bff' },
  btnGhost: {
    backgroundColor: 'rgba(20,24,31,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pressed: { opacity: 0.8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
