import { ViroMaterials } from '@reactvision/react-viro';
import { CATALOG } from '../catalog/catalog';

/**
 * Katalog parçalarının materyalleri (galvaniz sac tonu + seçili vurgusu).
 * Hem AR (PlaceableItem) hem de 3D viewer (ViewerScene) tarafından kullanılır;
 * tek yerde bir kez kaydedilir.
 */
CATALOG.forEach((c) => {
  ViroMaterials.createMaterials({
    [`mat_${c.key}`]: {
      lightingModel: 'Blinn',
      diffuseColor: c.color,
      shininess: 3.0,
    },
    [`mat_${c.key}_sel`]: {
      lightingModel: 'Blinn',
      diffuseColor: '#ffd54a', // seçili: sarı vurgu (primitif fallback)
      shininess: 3.0,
    },
  });
});

// Seçili .glb parçası için yarı saydam sarı vurgu kutusu
ViroMaterials.createMaterials({
  sel_box: {
    lightingModel: 'Constant',
    diffuseColor: 'rgba(255, 213, 74, 0.28)',
    cullMode: 'None',
    blendMode: 'Alpha',
  },
});

export {};
