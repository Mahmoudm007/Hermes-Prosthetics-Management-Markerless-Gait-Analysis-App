import { create } from 'zustand';

import type { MedicalCondition } from '@/types';

interface MedicalConditionStore {
  selectedMedicalCondition: MedicalCondition | null;
  isMedicalConditionDetailsSheetVisible: boolean;
  showMedicalConditionDetails: (medicalCondition: MedicalCondition) => void;
  hideMedicalConditionDetails: () => void;
  reset: () => void;
}

export const useMedicalConditionStore = create<MedicalConditionStore>(
  (set) => ({
    selectedMedicalCondition: null,
    isMedicalConditionDetailsSheetVisible: false,
    showMedicalConditionDetails: (medicalCondition) => {
      set({
        selectedMedicalCondition: medicalCondition,
        isMedicalConditionDetailsSheetVisible: true,
      });
    },
    hideMedicalConditionDetails: () => {
      set({ isMedicalConditionDetailsSheetVisible: false });
      setTimeout(() => {
        set({ selectedMedicalCondition: null });
      }, 300);
    },
    reset: () =>
      set({
        selectedMedicalCondition: null,
        isMedicalConditionDetailsSheetVisible: false,
      }),
  })
);
