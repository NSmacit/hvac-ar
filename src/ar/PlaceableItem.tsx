import React from 'react';
import { ViroNode, ViroBox } from '@reactvision/react-viro';
import { getCatalogItem } from '../catalog/catalog';
import { SceneItem, useSceneStore, Vec3 } from '../store/useSceneStore';
import './partMaterials';

/**
 * Sahneye yerleştirilmiş tek bir parça (Faz 2: primitif ViroBox).
 * Faz 3: dokunarak seçme + parmakla sürükleyerek taşıma.
 * Faz 6'da ViroBox yerine item.modelRef ile Viro3DObject (.glb) gelecek.
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

  return (
    <ViroNode
      position={item.position}
      rotation={item.rotationEuler}
      scale={item.scale}
      dragType="FixedDistance"
      onDrag={(pos: number[]) =>
        updateItem(item.id, { position: pos as Vec3 })
      }
    >
      {/* Gerçek ölçekte kutu — seçim yalnızca renkle vurgulanır (boyut değişmez) */}
      <ViroBox
        width={size[0]}
        height={size[1]}
        length={size[2]}
        materials={[selected ? `mat_${item.type}_sel` : `mat_${item.type}`]}
        onClick={() => select(item.id)}
      />
    </ViroNode>
  );
}
