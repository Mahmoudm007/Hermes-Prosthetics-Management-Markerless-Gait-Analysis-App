import { create } from 'zustand';

import type { Injury } from '@/types';

interface InjuryFormStore {
  selectedFormInjury: Injury | null;
  isInjuryFormVisible: boolean;
  showInjuryForm: (injury?: Injury | null) => void;
  hideInjuryForm: () => void;
  resetInjuryForm: () => void;
}

export const useInjuryFormStore = create<InjuryFormStore>((set) => ({
  isInjuryFormVisible: false,
  selectedFormInjury: null,
  showInjuryForm: (injury = null) => {
    set({
      isInjuryFormVisible: true,
      selectedFormInjury: injury,
    });
  },
  hideInjuryForm: () => {
    set({ isInjuryFormVisible: false });
    setTimeout(() => {
      set({ selectedFormInjury: null });
    }, 300);
  },
  resetInjuryForm: () =>
    set({
      isInjuryFormVisible: false,
      selectedFormInjury: null,
    }),
}));
