/**
 * Havalandırma parça kataloğu — gerçek .glb modelleri (air_duct_kit'ten bölündü).
 *
 * ÖNEMLİ: Parçalar AR'da GERÇEK ÖLÇEKTE (1:1) çizilir. Viro'da 1 birim = 1 metre.
 * `size` = modelin gerçek bounding-box'ı (metre) — seçim kutusu/fallback için.
 * `modelRef` partModels.ts'teki require anahtarıyla eşleşir (= `key`).
 * `params` alanı JSON export/metraj içindir.
 */
export type CatalogItem = {
  key: string;
  label: string;
  short: string;
  modelRef: string;
  params: Record<string, number | string>;
  size: [number, number, number]; // gerçek bbox (m)
  color: string; // primitif fallback rengi
};

export const CATALOG: CatalogItem[] = [
  {
    key: 'straight_duct',
    label: 'Düz Kanal Ø300 · 2 m',
    short: 'Düz Kanal',
    modelRef: 'straight_duct',
    params: { diameterMm: 300, lengthMm: 2000, material: 'galvanized_steel' },
    size: [0.315, 0.315, 2.0],
    color: '#c8d0dc',
  },
  {
    key: 'elbow_90',
    label: 'Dirsek 90° Ø300',
    short: 'Dirsek',
    modelRef: 'elbow_90',
    params: { diameterMm: 300, angleDeg: 90, material: 'galvanized_steel' },
    size: [0.4, 0.312, 0.4],
    color: '#aab4c2',
  },
  {
    key: 'tee',
    label: 'T Parçası Ø300',
    short: 'T Parça',
    modelRef: 'tee',
    params: { diameterMm: 300, material: 'galvanized_steel' },
    size: [0.5, 0.3, 0.4],
    color: '#9fa9b7',
  },
  {
    key: 'cross',
    label: 'Artı (+) Parça Ø300',
    short: 'Artı',
    modelRef: 'cross',
    params: { diameterMm: 300, material: 'galvanized_steel' },
    size: [0.5, 0.3, 0.5],
    color: '#a7b2bf',
  },
  {
    key: 'end_cap',
    label: 'Kapak / Uç Ø300',
    short: 'Kapak',
    modelRef: 'end_cap',
    params: { diameterMm: 300, material: 'galvanized_steel' },
    size: [0.324, 0.324, 0.508],
    color: '#b4bdc9',
  },
  {
    key: 'outlet',
    label: 'Menfez / Çıkış',
    short: 'Menfez',
    modelRef: 'outlet',
    params: { widthMm: 480, heightMm: 115, material: 'galvanized_steel' },
    size: [0.04, 0.115, 0.48],
    color: '#9aa6b2',
  },
  {
    key: 'roof_holder',
    label: 'Tavan Askısı',
    short: 'Askı',
    modelRef: 'roof_holder',
    params: { material: 'galvanized_steel' },
    size: [0.314, 0.659, 0.025],
    color: '#8f99a7',
  },
];

export function getCatalogItem(key: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.key === key);
}
