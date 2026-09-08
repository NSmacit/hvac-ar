import { create } from 'zustand';

/**
 * Sahnedeki yerleştirilmiş parçaların tek kaynağı (single source of truth).
 *
 * SceneItem yapısı, Faz 4'teki JSON export/yerel kayıt şemasıyla birebir aynıdır:
 * kaydetme formatı = export formatı.
 */
export type Vec3 = [number, number, number];

export type SceneItem = {
  id: string;
  type: string; // katalog anahtarı
  label: string;
  modelRef: string;
  params: Record<string, number | string>;
  position: Vec3; // metre, AR dünya koordinatı
  rotationEuler: Vec3; // derece
  scale: Vec3;
};

type SceneState = {
  items: SceneItem[];
  selectedId: string | null;
  /** Açık projenin kimliği (kaydedince bu id'ye yazılır) */
  projectId: string;
  /** Açık projenin adı */
  projectName: string;
  /** Açık projenin oluşturulma zamanı (ISO) — kaydederken korunur */
  createdAt: string;
  addItem: (item: Omit<SceneItem, 'id'>) => string;
  updateItem: (id: string, patch: Partial<Omit<SceneItem, 'id'>>) => void;
  removeItem: (id: string) => void;
  select: (id: string | null) => void;
  clear: () => void;
  setProjectName: (name: string) => void;
  /** Yeni boş proje başlat (yeni id, boş sahne) */
  newProject: () => void;
  /** Kayıtlı bir projeyi sahneye yükle */
  loadScene: (p: {
    projectId: string;
    name: string;
    createdAt: string;
    items: SceneItem[];
  }) => void;
};

let counter = 0;
function nextId(prefix = 'it'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

function defaultName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `Proje ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const useSceneStore = create<SceneState>((set) => ({
  items: [],
  selectedId: null,
  projectId: nextId('prj'),
  projectName: defaultName(),
  createdAt: new Date().toISOString(),
  addItem: (item) => {
    const id = nextId();
    set((s) => ({ items: [...s.items, { ...item, id }], selectedId: id }));
    return id;
  },
  updateItem: (id, patch) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    })),
  removeItem: (id) =>
    set((s) => ({
      items: s.items.filter((it) => it.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  select: (id) => set({ selectedId: id }),
  clear: () => set({ items: [], selectedId: null }),
  setProjectName: (name) => set({ projectName: name }),
  newProject: () =>
    set({
      items: [],
      selectedId: null,
      projectId: nextId('prj'),
      projectName: defaultName(),
      createdAt: new Date().toISOString(),
    }),
  loadScene: (p) =>
    set({
      items: p.items,
      selectedId: null,
      projectId: p.projectId,
      projectName: p.name,
      createdAt: p.createdAt,
    }),
}));
