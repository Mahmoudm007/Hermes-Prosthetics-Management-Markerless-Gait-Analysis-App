import { create } from 'zustand';

import type { MedicalCondition } from '@/types';

interface MedicalConditionFormStore {
  selectedFormMedicalCondition: MedicalCondition | null;
  isMedicalConditionFormVisible: boolean;
  showMedicalConditionForm: (
    medicalCondition?: MedicalCondition | null
  ) => void;
  hideMedicalConditionForm: () => void;
  resetMedicalConditionForm: () => void;
}

export const useMedicalConditionFormStore = create<MedicalConditionFormStore>(
  (set) => ({
    isMedicalConditionFormVisible: false,
    selectedFormMedicalCondition: null,
    showMedicalConditionForm: (medicalCondition = null) => {
      set({
        isMedicalConditionFormVisible: true,
        selectedFormMedicalCondition: medicalCondition,
      });
    },
    hideMedicalConditionForm: () => {
      set({ isMedicalConditionFormVisible: false });
      setTimeout(() => {
        set({ selectedFormMedicalCondition: null });
      }, 300);
    },
    resetMedicalConditionForm: () =>
      set({
        isMedicalConditionFormVisible: false,
        selectedFormMedicalCondition: null,
      }),
  })
);
