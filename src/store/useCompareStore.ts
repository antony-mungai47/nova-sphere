import { create } from "zustand";

type CompareItem = {
  id: string;
  name: string;
  image: string;
};

interface CompareStore {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

export const useCompareStore = create<CompareStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      if (state.items.find((i) => i.id === item.id)) return state;
      if (state.items.length >= 3) return state; // Max 3 items to compare
      return { items: [...state.items, item] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearItems: () => set({ items: [] }),
}));
