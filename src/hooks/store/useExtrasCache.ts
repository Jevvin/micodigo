import { create } from "zustand";

interface ExtraGroup {
  id: number;
  name: string;
  description: string;
  ruleType: string;
  isRequired: boolean;
  isIncluded: boolean;
  maxSelections: number;
  minSelections: number;
  extras: any[];
  sortOrder: number;
}

interface ExtrasCacheState {
  extrasMap: Record<number, ExtraGroup[]>;
  setExtrasForProduct: (productId: number, groups: ExtraGroup[]) => void;
  getExtrasForProduct: (productId: number) => ExtraGroup[] | undefined;
}

export const useExtrasCache = create<ExtrasCacheState>((set, get) => ({
  extrasMap: {},

  setExtrasForProduct: (productId, groups) => {
    set((state) => ({
      extrasMap: {
        ...state.extrasMap,
        [productId]: groups,
      },
    }));
  },

  getExtrasForProduct: (productId) => {
    return get().extrasMap[productId];
  },
}));
