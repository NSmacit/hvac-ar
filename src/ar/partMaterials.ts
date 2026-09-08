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
      diffuseColor: '#ffd54a', // seçili: sarı vurgu
      shininess: 3.0,
    },
  });
});

export {};
