// air_duct_kit.glb -> her parça ayrı, origine ortalı .glb
// Çalıştır: node scripts/split-kit.mjs
import { NodeIO, getBounds } from '@gltf-transform/core';
import { prune, dedup } from '@gltf-transform/functions';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'node:fs';

const SRC = 'assets/models/air_duct_kit.glb';
const OUT = 'assets/models/parts';

// katalog anahtarı -> kit içindeki node adı
const MAP = {
  straight_duct: 'duct_base_low_0',
  elbow_90: 'duct_90arc_low_1',
  cross: 'duct_crossSection_low_2',
  tee: 'duct_tSection_low_3',
  end_cap: 'duct_endPart_low_4',
  roof_holder: 'duct_roofHolder_low_5',
  outlet: 'duct_outlet_low_6',
};

fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);

for (const [key, nodeName] of Object.entries(MAP)) {
  const doc = await io.read(SRC);
  const root = doc.getRoot();
  const srn = root
    .listNodes()
    .find((n) => n.getName() === 'GLTF_SceneRootNode');
  const target = srn.listChildren().find((c) => c.getName() === nodeName);
  if (!target) {
    console.log(`!! ${key}: node bulunamadı (${nodeName})`);
    continue;
  }
  // hedef dışındaki tüm parçaları at
  for (const child of srn.listChildren()) {
    if (child !== target) child.dispose();
  }
  target.setTranslation([0, 0, 0]);
  await doc.transform(dedup(), prune());

  const scene = root.listScenes()[0];
  const b = getBounds(scene);
  const size = [
    b.max[0] - b.min[0],
    b.max[1] - b.min[1],
    b.max[2] - b.min[2],
  ];
  await io.write(`${OUT}/${key}.glb`, doc);
  const kb = (fs.statSync(`${OUT}/${key}.glb`).size / 1024).toFixed(0);
  console.log(
    `${key}.glb  ${kb}KB  size(m)=[${size.map((x) => x.toFixed(3)).join(', ')}]`,
  );
}
console.log('bitti');
