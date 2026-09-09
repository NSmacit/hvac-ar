/**
 * Katalog anahtarı -> paketlenmiş .glb modeli (Metro require).
 * require() statik literal olmalı; bu yüzden burada elle eşlenir.
 * Kaynak: assets/models/parts/ (air_duct_kit.glb'den bölündü).
 */
export const PART_MODELS: Record<string, number> = {
  straight_duct: require('../../assets/models/parts/straight_duct.glb'),
  elbow_90: require('../../assets/models/parts/elbow_90.glb'),
  tee: require('../../assets/models/parts/tee.glb'),
  cross: require('../../assets/models/parts/cross.glb'),
  end_cap: require('../../assets/models/parts/end_cap.glb'),
  outlet: require('../../assets/models/parts/outlet.glb'),
  roof_holder: require('../../assets/models/parts/roof_holder.glb'),
};

export function partModel(type: string): number | undefined {
  return PART_MODELS[type];
}
