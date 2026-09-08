import { Project } from './projectSchema';

/**
 * JSON export + metraj (Faz 4 temeli, Faz 6'da UI'ye bağlanır).
 * Kayıt dosyası zaten export formatıyla aynı olduğundan, export = projenin
 * düzgün biçimlendirilmiş JSON'u.
 */

export function toPrettyJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export type MetrajRow = {
  type: string;
  label: string;
  count: number;
  /** Varsa toplam boy (mm) — düz kanallar için metraj */
  totalLengthMm?: number;
};

/**
 * Sahnedeki parçaları tip+etikete göre gruplayıp adet ve toplam boy çıkarır.
 * Masaüstünde okunacak metraj listesinin temelidir.
 */
export function buildMetraj(project: Project): MetrajRow[] {
  const map = new Map<string, MetrajRow>();
  for (const it of project.items) {
    const key = `${it.type}__${it.label}`;
    const row = map.get(key) ?? { type: it.type, label: it.label, count: 0 };
    row.count += 1;
    const len = it.params?.lengthMm;
    if (typeof len === 'number') {
      row.totalLengthMm = (row.totalLengthMm ?? 0) + len;
    }
    map.set(key, row);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}
