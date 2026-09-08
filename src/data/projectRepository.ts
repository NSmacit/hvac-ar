import { Directory, File, Paths } from 'expo-file-system';
import {
  Project,
  ProjectSummary,
  projectSchema,
} from './projectSchema';

/**
 * Projelerin cihazda kalıcı olarak saklanması (Faz 4).
 * Her proje `documentDirectory/projects/<projectId>.json` olarak tutulur.
 * Kayıt formatı = export formatı (projectSchema).
 */
const PROJECTS_DIRNAME = 'projects';

function projectsDir(): Directory {
  return new Directory(Paths.document, PROJECTS_DIRNAME);
}

function ensureDir(): Directory {
  const dir = projectsDir();
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function fileFor(projectId: string): File {
  return new File(projectsDir(), `${projectId}.json`);
}

/** Projeyi kaydet/üzerine yaz. */
export function saveProject(project: Project): void {
  ensureDir();
  const file = fileFor(project.projectId);
  if (!file.exists) file.create();
  file.write(JSON.stringify(project, null, 2));
}

/** Kayıtlı projeleri (özet olarak, updatedAt'e göre yeni→eski) listele. */
export async function listProjects(): Promise<ProjectSummary[]> {
  const dir = projectsDir();
  if (!dir.exists) return [];
  const entries = dir.list();
  const summaries: ProjectSummary[] = [];
  for (const entry of entries) {
    if (!(entry instanceof File) || !entry.name.endsWith('.json')) continue;
    try {
      const parsed = projectSchema.safeParse(JSON.parse(await entry.text()));
      if (parsed.success) {
        summaries.push({
          projectId: parsed.data.projectId,
          name: parsed.data.name,
          updatedAt: parsed.data.updatedAt,
          itemCount: parsed.data.items.length,
        });
      }
    } catch {
      // bozuk dosyayı atla
    }
  }
  return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Tek projeyi yükle ve şemayla doğrula. */
export async function loadProject(projectId: string): Promise<Project | null> {
  const file = fileFor(projectId);
  if (!file.exists) return null;
  try {
    const parsed = projectSchema.safeParse(JSON.parse(await file.text()));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Projeyi sil. */
export function deleteProject(projectId: string): void {
  const file = fileFor(projectId);
  if (file.exists) file.delete();
}
