/**
 * Havalandırma parça kataloğu.
 *
 * ÖNEMLİ: Parçalar AR'da GERÇEK ÖLÇEKTE (1:1) çizilir. Viro'da 1 birim = 1 metre.
 * `size` = [genişlik, yükseklik, uzunluk] METRE cinsinden gerçek ölçüdür; parça
 * ekranda büyüyüp küçülmez, tavanda gerçekte nasıl duracaksa öyle görünür.
 *
 * `params` alanı JSON export/metraj içindir (Faz 4). Faz 6'da `modelRef` ile
 * gerçek .glb modeller (yuvarlak galvaniz, dirsek) yüklenecek.
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
  /** GERÇEK ölçü (metre): [genişlik, yükseklik, uzunluk] */
  size: [number, number, number];
  /** Primitif rengi (galvaniz sac tonları) */
  color: string;
};

export const CATALOG: CatalogItem[] = [
  {
    key: 'rect_duct_400x300',
    label: 'Dikdörtgen Kanal 400×300',
    short: 'Dikdörtgen',
    modelRef: 'rect_duct.glb',
    params: { widthMm: 400, heightMm: 300, lengthMm: 1000, material: 'galvanized_steel' },
    size: [0.4, 0.3, 1.0], // gerçek 40×30 cm kesit, 1 m boy
    color: '#c2cad6',
  },
  {
    key: 'round_duct_200',
    label: 'Yuvarlak Kanal Ø200',
    short: 'Yuvarlak',
    modelRef: 'round_duct.glb',
    params: { diameterMm: 200, lengthMm: 1000, material: 'galvanized_steel' },
    size: [0.2, 0.2, 1.0], // Ø200 mm, 1 m boy (primitif: kare kesit yaklaşımı)
    color: '#c8d0dc',
  },
  {
    key: 'elbow_90_200',
    label: 'Dirsek 90° Ø200',
    short: 'Dirsek',
    modelRef: 'elbow_90.glb',
    params: { diameterMm: 200, angleDeg: 90, material: 'galvanized_steel' },
    size: [0.2, 0.2, 0.2],
    color: '#aab4c2',
  },
  {
    key: 'reducer_200_160',
    label: 'Redüksiyon 200/160',
    short: 'Redüksiyon',
    modelRef: 'reducer.glb',
    params: { inMm: 200, outMm: 160, lengthMm: 300, material: 'galvanized_steel' },
    size: [0.2, 0.2, 0.3],
    color: '#b4bdc9',
  },
  {
    key: 'tee_200',
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
