import { create } from 'zustand';

import type { Prosthetic } from '@/types';

interface ProstheticFormStore {
  selectedFormProsthetic: Prosthetic | null;
  isProstheticFormVisible: boolean;
  showProstheticForm: (prosthetic?: Prosthetic | null) => void;
  hideProstheticForm: () => void;
  resetProstheticForm: () => void;
}

export const useProstheticFormStore = create<ProstheticFormStore>((set) => ({
  isProstheticFormVisible: false,
  selectedFormProsthetic: null,
  showProstheticForm: (prosthetic = null) => {
    set({
      isProstheticFormVisible: true,
      selectedFormProsthetic: prosthetic,
    });
  },
  hideProstheticForm: () => {
    set({ isProstheticFormVisible: false });
    setTimeout(() => {
      set({ selectedFormProsthetic: null });
    }, 300);
  },
  resetProstheticForm: () =>
    set({
      isProstheticFormVisible: false,
      selectedFormProsthetic: null,
    }),
}));
