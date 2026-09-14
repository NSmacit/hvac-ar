import { Vec3 } from '../store/useSceneStore';

/**
 * Uç-uca (konektör) snap.
 *
 * Her parça tipinin YEREL uzayında bağlantı noktaları (port) vardır: konum + dış
 * yön (normal). İki parça birleşirken portlar KARŞI KARŞIYA gelmelidir; bu yüzden
 * snap yalnızca konumu değil, taşınan parçanın YAW açısını da ayarlar → gerçek
 * uç-uca, aynı hat üstünde birleşme (CAD/BIM konektör mantığı).
 *
 * NOT: Portlar bbox'a göre yaklaşık; cihazda kalibre edilebilir. Parçalar sadece
 * Y ekseninde döndüğü için yaw yeterli; portlar yatay düzlemde.
 */
type Port = { pos: Vec3; dir: Vec3 }; // dir: yatay birim normal

const PORTS: Record<string, Port[]> = {
  straight_duct: [
    { pos: [0, 0, 1.0], dir: [0, 0, 1] },
    { pos: [0, 0, -1.0], dir: [0, 0, -1] },
  ],
  elbow_90: [
    { pos: [0, 0, 0.2], dir: [0, 0, 1] },
    { pos: [-0.2, 0, 0], dir: [-1, 0, 0] },
  ],
  tee: [
    { pos: [0.25, 0, 0], dir: [1, 0, 0] },
    { pos: [-0.25, 0, 0], dir: [-1, 0, 0] },
    { pos: [0, 0, 0.2], dir: [0, 0, 1] },
  ],
  cross: [
    { pos: [0.25, 0, 0], dir: [1, 0, 0] },
    { pos: [-0.25, 0, 0], dir: [-1, 0, 0] },
    { pos: [0, 0, 0.25], dir: [0, 0, 1] },
    { pos: [0, 0, -0.25], dir: [0, 0, -1] },
  ],
  end_cap: [{ pos: [0, 0, 0.254], dir: [0, 0, 1] }],
  // outlet / roof_holder: bağlantı yok
};

const SNAP_THRESHOLD = 0.6; // m — parçanın bağlanmak için atacağı max mesafe

function rad(d: number) {
  return (d * Math.PI) / 180;
}
function headingDeg(x: number, z: number): number {
  return (Math.atan2(x, z) * 180) / Math.PI;
}
function rotateY([x, y, z]: Vec3, deg: number): Vec3 {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [x * c + z * s, y, -x * s + z * c];
}
function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function hasPorts(type: string): boolean {
  return (PORTS[type]?.length ?? 0) > 0;
}

export type OtherItem = { type: string; position: Vec3; yaw: number };
export type SnapResult = { position: Vec3; yaw: number };

/**
 * Taşınan parça için (konum + yaw) döndürür; uygun bağlantı yoksa null.
 * Portlar karşı karşıya gelecek şekilde hizalar.
 */
export function trySnapConnect(
  movingType: string,
  movingPos: Vec3,
  others: OtherItem[],
): SnapResult | null {
  const mPorts = PORTS[movingType] ?? [];
  if (mPorts.length === 0 || others.length === 0) return null;

  let best: SnapResult | null = null;
  let bestCost = SNAP_THRESHOLD;
  let globalMin = Infinity;

  for (const o of others) {
    const oPorts = PORTS[o.type] ?? [];
    for (const op of oPorts) {
      // hedef portun dünya konumu ve yönü
      const opWorldPos = add(rotateY(op.pos, o.yaw), o.position);
      const opWorldHeading = headingDeg(op.dir[0], op.dir[2]) + o.yaw;

      for (const mp of mPorts) {
        // taşınan portun world yönü hedefe TERS bakmalı
        const mpLocalHeading = headingDeg(mp.dir[0], mp.dir[2]);
        const yaw = opWorldHeading + 180 - mpLocalHeading;
        // bu yaw'da taşınan portu hedefe oturtacak parça konumu
        const rotatedMp = rotateY(mp.pos, yaw);
        const newPos: Vec3 = [
          opWorldPos[0] - rotatedMp[0],
          opWorldPos[1] - rotatedMp[1],
          opWorldPos[2] - rotatedMp[2],
        ];
        const cost = dist(newPos, movingPos); // ne kadar zıplayacak
        if (cost < globalMin) globalMin = cost;
        if (cost < bestCost) {
          bestCost = cost;
          best = { position: newPos, yaw };
        }
      }
    }
  }

  console.log(
    '[snap]',
    JSON.stringify({
      moving: movingType,
      others: others.length,
      minCost: +globalMin.toFixed(3),
      threshold: SNAP_THRESHOLD,
      snapped: !!best,
    }),
  );

  return best;
}
