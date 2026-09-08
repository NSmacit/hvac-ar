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
  addItem: (item: Omit<SceneItem, 'id'>) => string;
  updateItem: (id: string, patch: Partial<Omit<SceneItem, 'id'>>) => void;
  removeItem: (id: string) => void;
  select: (id: string | null) => void;
  clear: () => void;
};

let counter = 0;
function nextId(): string {
  counter += 1;
  return `it_${Date.now().toString(36)}_${counter}`;
}

export const useSceneStore = create<SceneState>((set) => ({
  items: [],
  selectedId: null,
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
}));
