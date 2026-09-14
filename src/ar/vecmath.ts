import { Vec3 } from '../store/useSceneStore';

/** Basit 3B vektör yardımcıları (zincir/snap hesapları için). */
export function rotateY([x, y, z]: Vec3, deg: number): Vec3 {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [x * c + z * s, y, -x * s + z * c];
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function centroid(points: Vec3[]): Vec3 {
  if (points.length === 0) return [0, 0, 0];
  const s = points.reduce<Vec3>((acc, p) => add(acc, p), [0, 0, 0]);
  return [s[0] / points.length, s[1] / points.length, s[2] / points.length];
}
