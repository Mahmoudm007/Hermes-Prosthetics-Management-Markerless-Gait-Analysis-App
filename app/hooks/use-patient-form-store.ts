import { create } from 'zustand';

interface PatientFormStore {
  selectedFormPatientId: number | null;
  isPatientFormVisible: boolean;
  showPatientForm: (patientId?: number | null) => void;
  hidePatientForm: () => void;
  resetPatientForm: () => void;
}

export const usePatientFormStore = create<PatientFormStore>((set) => ({
  isPatientFormVisible: false,
  selectedFormPatientId: null,
  showPatientForm: (patientId = null) => {
    set({
      isPatientFormVisible: true,
      selectedFormPatientId: patientId,
    });
  },
  hidePatientForm: () => {
    set({ isPatientFormVisible: false });
    setTimeout(() => {
      set({ selectedFormPatientId: null });
    }, 300);
  },
  resetPatientForm: () =>
    set({
      isPatientFormVisible: false,
      selectedFormPatientId: null,
    }),
}));
