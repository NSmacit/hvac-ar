/**
 * Havalandırma parça kataloğu.
 *
 * Faz 2'de her parça, ölçüleri `size` ile verilen bir primitif (ViroBox) olarak
 * çizilir. Faz 6'da `modelRef` ile gerçek .glb modeller yüklenecek.
 * `params` alanı JSON export/metraj için kullanılacak (Faz 4).
 */
export type CatalogItem = {
  /** Katalog anahtarı — JSON `type` alanı */
  key: string;
  /** Palette ve etikette görünen ad */
  label: string;
  /** Kısa etiket (palet kartı) */
  short: string;
  /** İleride yüklenecek gerçek model dosyası */
  modelRef: string;
  /** Metraj/parametre bilgisi (JSON export) */
  params: Record<string, number | string>;
  /** Faz 2 primitif ölçüleri (metre) — [genişlik, yükseklik, uzunluk] */
  size: [number, number, number];
  /** Primitif rengi (galvaniz sac tonları) */
  color: string;
};

export const CATALOG: CatalogItem[] = [
  {
    key: 'round_duct',
    label: 'Yuvarlak Kanal Ø200',
    short: 'Kanal',
    modelRef: 'round_duct.glb',
    params: { diameterMm: 200, lengthMm: 1000, material: 'galvanized_steel' },
    size: [0.2, 0.2, 1.0],
    color: '#c2cad6',
  },
  {
    key: 'elbow_90',
    label: 'Dirsek 90° Ø200',
    short: 'Dirsek',
    modelRef: 'elbow_90.glb',
    params: { diameterMm: 200, angleDeg: 90, material: 'galvanized_steel' },
    size: [0.25, 0.25, 0.25],
    color: '#aab4c2',
  },
  {
    key: 'reducer',
    label: 'Redüksiyon 200/160',
    short: 'Redüksiyon',
    modelRef: 'reducer.glb',
    params: { inMm: 200, outMm: 160, lengthMm: 300, material: 'galvanized_steel' },
    size: [0.2, 0.2, 0.3],
    color: '#b4bdc9',
  },
  {
    key: 'tee',
    label: 'T Parçası Ø200',
    short: 'T Parça',
    modelRef: 'tee.glb',
    params: { diameterMm: 200, material: 'galvanized_steel' },
    size: [0.2, 0.2, 0.4],
    color: '#9fa9b7',
  },
];

export function getCatalogItem(key: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.key === key);
}
