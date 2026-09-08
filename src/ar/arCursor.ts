import { Vec3 } from '../store/useSceneStore';

/**
 * Kameranın merkez ışınının gerçek bir yüzeye (tavan/duvar/zemin) değdiği nokta.
 * onCameraARHitTest her karede buraya yazar; re-render tetiklememek için React
 * state değil, modül seviyesinde paylaşımlı bir ref'tir.
 *
 * - Yerleştirme (ARWorld) parçayı buraya koyar → parça baktığın yüzeye iner.
 * - "Yüzeye taşı" (TransformControls) seçili parçayı buraya taşır.
 */
export const arCursor: {
  position: Vec3 | null;
  rotation: Vec3 | null;
  valid: boolean;
} = {
  position: null,
  rotation: null,
  valid: false,
};
