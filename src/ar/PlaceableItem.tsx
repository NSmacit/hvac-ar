import React from 'react';
import { ViroNode, ViroBox, Viro3DObject } from '@reactvision/react-viro';
import { getCatalogItem } from '../catalog/catalog';
import { SceneItem, useSceneStore, Vec3 } from '../store/useSceneStore';
import { partModel } from './partModels';
import './partMaterials';

/**
 * Sahneye yerleştirilmiş tek bir parça (gerçek .glb, fallback ViroBox).
 * Zincir modeli: parçalar birbirine bağlı; herhangi birini sürüklemek TÜM
 * bağlı hattı birlikte öteler (translateAll). Dokun = seç.
 */
type Props = {
  item: SceneItem;
  selected: boolean;
};

export default function PlaceableItem({ item, selected }: Props) {
  const select = useSceneStore((s) => s.select);

  const cat = getCatalogItem(item.type);
  const size = cat?.size ?? [0.2, 0.2, 0.2];
  const model = partModel(item.type);

  return (
    <ViroNode
      position={item.position}
      rotation={item.rotationEuler}
      scale={item.scale}
      dragType="FixedDistance"
      onDrag={(pos: number[]) => {
        const raw = pos as Vec3;
        const st = useSceneStore.getState();
        const me = st.items.find((i) => i.id === item.id);
        if (!me) return;
        // Bu parçanın hareketini tüm hatta uygula (rijit taşıma)
        const delta: Vec3 = [
          raw[0] - me.position[0],
          raw[1] - me.position[1],
          raw[2] - me.position[2],
        ];
        st.translateAll(delta);
      }}
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
