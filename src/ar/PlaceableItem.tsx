import React from 'react';
import { ViroNode, ViroBox, ViroMaterials } from '@reactvision/react-viro';
import { CATALOG, getCatalogItem } from '../catalog/catalog';
import { SceneItem } from '../store/useSceneStore';

/**
 * Sahneye yerleştirilmiş tek bir parça (Faz 2: primitif ViroBox).
 * Faz 6'da ViroBox yerine item.modelRef ile Viro3DObject (.glb) gelecek.
 *
 * Her katalog parçası için bir materyal (galvaniz sac tonu) modül yüklenirken
 * bir kez oluşturulur.
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
      diffuseColor: c.color,
      shininess: 3.0,
    },
  });
});

type Props = {
  item: SceneItem;
  selected: boolean;
};

export default function PlaceableItem({ item, selected }: Props) {
  const cat = getCatalogItem(item.type);
  const size = cat?.size ?? [0.2, 0.2, 0.2];

  return (
    <ViroNode
      position={item.position}
      rotation={item.rotationEuler}
      scale={item.scale}
    >
      <ViroBox
        width={size[0]}
        height={size[1]}
        length={size[2]}
        materials={[selected ? `mat_${item.type}_sel` : `mat_${item.type}`]}
        // Seçili parçada hafif büyütme ile vurgulama (Faz 3'te gizmo eklenecek)
        scale={selected ? [1.04, 1.04, 1.04] : [1, 1, 1]}
      />
    </ViroNode>
  );
}
