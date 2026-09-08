import { Dimensions, ScaledSize } from 'react-native';

/**
 * Telefon ↔ tablet arası basit responsive ölçekleme.
 * İleride tablet + donanım paketi hedefi için UI'nin esnek kalmasını sağlar.
 */
const BASE_WIDTH = 390; // iPhone referans genişliği

export function isTablet(win: ScaledSize = Dimensions.get('window')): boolean {
  const min = Math.min(win.width, win.height);
  return min >= 600;
}

/** Referans genişliğe göre ölçekle, tablette bir miktar büyüt. */
export function scale(size: number): number {
  const win = Dimensions.get('window');
  const factor = win.width / BASE_WIDTH;
  const clamped = Math.max(0.85, Math.min(factor, isTablet(win) ? 1.6 : 1.15));
  return Math.round(size * clamped);
}
