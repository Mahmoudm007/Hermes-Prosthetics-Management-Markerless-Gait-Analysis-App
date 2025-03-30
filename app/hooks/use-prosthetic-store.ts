import { create } from 'zustand';

import type { Prosthetic } from '@/types';

interface ProstheticStore {
  selectedProsthetic: Prosthetic | null;
  isProstheticDetailsSheetVisible: boolean;
  showProstheticDetails: (medicalCondition: Prosthetic) => void;
  hideProstheticDetails: () => void;
  reset: () => void;
}

export const useProstheticStore = create<ProstheticStore>((set) => ({
  selectedProsthetic: null,
  isProstheticDetailsSheetVisible: false,
  showProstheticDetails: (medicalCondition) => {
    set({
      selectedProsthetic: medicalCondition,
      isProstheticDetailsSheetVisible: true,
    });
  },
  hideProstheticDetails: () => {
    set({ isProstheticDetailsSheetVisible: false });
    setTimeout(() => {
      set({ selectedProsthetic: null });
    }, 300);
  },
  reset: () =>
    set({ selectedProsthetic: null, isProstheticDetailsSheetVisible: false }),
}));
