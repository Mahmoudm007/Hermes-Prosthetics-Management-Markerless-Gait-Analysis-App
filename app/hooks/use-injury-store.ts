import { create } from 'zustand';

import type { Injury } from '@/types';

interface InjuryStore {
  selectedInjury: Injury | null;
  isInjuryDetailsSheetVisible: boolean;
  showInjuryDetails: (medicalCondition: Injury) => void;
  hideInjuryDetails: () => void;
  reset: () => void;
}

export const useInjuryStore = create<InjuryStore>((set) => ({
  selectedInjury: null,
  isInjuryDetailsSheetVisible: false,
  showInjuryDetails: (medicalCondition) => {
    set({
      selectedInjury: medicalCondition,
      isInjuryDetailsSheetVisible: true,
    });
  },
  hideInjuryDetails: () => {
    set({ isInjuryDetailsSheetVisible: false });
    setTimeout(() => {
      set({ selectedInjury: null });
    }, 300);
  },
  reset: () =>
    set({ selectedInjury: null, isInjuryDetailsSheetVisible: false }),
}));
