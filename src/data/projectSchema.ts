import { z } from 'zod';
import type { SceneItem } from '../store/useSceneStore';

/**
 * Proje veri şeması (Faz 4).
 *
 * Bu şema hem YEREL KAYIT hem de JSON EXPORT formatıdır — tek kaynak.
 * `items` içindeki koordinat (metre) ve dönüş (derece) bilgisi, masaüstünde
 * metraj/liste üretmek için yeterlidir.
 */
export const SCHEMA_VERSION = '1.0';

const vec3 = z.tuple([z.number(), z.number(), z.number()]);

export const sceneItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  modelRef: z.string(),
  params: z.record(z.string(), z.union([z.number(), z.string()])),
  position: vec3, // metre, AR dünya koordinatı
  rotationEuler: vec3, // derece
  scale: vec3,
});

export const projectSchema = z.object({
  schemaVersion: z.string(),
  projectId: z.string(),
  name: z.string(),
  unit: z.literal('meter'),
  createdAt: z.string(), // ISO
  updatedAt: z.string(), // ISO
  items: z.array(sceneItemSchema),
});

export type Project = z.infer<typeof projectSchema>;

/** Projenin listede göstermeye yetecek özeti (dosyanın tamamını yüklemeden). */
export type ProjectSummary = {
  projectId: string;
  name: string;
  updatedAt: string;
  itemCount: number;
};

/** Store item'larından yeni bir Project nesnesi kur. */
export function buildProject(
  projectId: string,
  name: string,
  items: SceneItem[],
  createdAt?: string,
): Project {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    projectId,
    name,
    unit: 'meter',
    createdAt: createdAt ?? now,
    updatedAt: now,
    items,
  };
}
