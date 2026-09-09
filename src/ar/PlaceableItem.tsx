import React from 'react';
import { ViroNode, ViroBox, Viro3DObject } from '@reactvision/react-viro';
import { getCatalogItem } from '../catalog/catalog';
import { SceneItem, useSceneStore, Vec3 } from '../store/useSceneStore';
import { partModel } from './partModels';
import './partMaterials';

/**
 * Sahneye yerleştirilmiş tek bir parça.
 * Faz 6: gerçek .glb (Viro3DObject); model yoksa primitif ViroBox'a düşer.
 * Dokun = seç, parmakla sürükle = taşı. Seçili parçada yarı saydam sarı kutu.
 */
type Props = {
  item: SceneItem;
  selected: boolean;
};

export default function PlaceableItem({ item, selected }: Props) {
  const select = useSceneStore((s) => s.select);
  const updateItem = useSceneStore((s) => s.updateItem);

  const cat = getCatalogItem(item.type);
  const size = cat?.size ?? [0.2, 0.2, 0.2];
  const model = partModel(item.type);

  return (
    <ViroNode
      position={item.position}
      rotation={item.rotationEuler}
      scale={item.scale}
      dragType="FixedDistance"
      onDrag={(pos: number[]) => updateItem(item.id, { position: pos as Vec3 })}
    >
      {model ? (
        <Viro3DObject
          source={model}
          type="GLB"
          onClick={() => select(item.id)}
        />
      ) : (
        <ViroBox
          width={size[0]}
          height={size[1]}
          length={size[2]}
          materials={[selected ? `mat_${item.type}_sel` : `mat_${item.type}`]}
          onClick={() => select(item.id)}
        />
      )}

      {/* Seçim vurgusu (gerçek modelde renk değiştirmek zor) */}
      {selected && (
        <ViroBox
          width={size[0] * 1.06}
          height={size[1] * 1.06}
          length={size[2] * 1.06}
          materials={['sel_box']}
        />
      )}
    </ViroNode>
  );
}
