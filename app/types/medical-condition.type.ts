export enum Severity {
  Mild = 'Mild',
  Moderate = 'Moderate',
  Severe = 'Severe',
  Unknown = 'Unknown',
}

export const severityLabels: Record<Severity, string> = {
  [Severity.Mild]: 'Mild',
  [Severity.Moderate]: 'Moderate',
  [Severity.Severe]: 'Severe',
  [Severity.Unknown]: 'Unknown',
};

export enum TreatmentStatus {
  Ongoing = 'Ongoing',
  UnderControl = 'UnderControl',
  Recovered = 'Recovered',
  Untreated = 'Untreated',
  Unknown = 'Unknown',
}

export const treatmentStatusLabels: Record<TreatmentStatus, string> = {
  [TreatmentStatus.Ongoing]: 'Ongoing',
  [TreatmentStatus.UnderControl]: 'Under Control',
  [TreatmentStatus.Recovered]: 'Recovered',
  [TreatmentStatus.Untreated]: 'Untreated',
  [TreatmentStatus.Unknown]: 'Unknown',
};

export type MedicalCondition = {
  id: number;
  patientId: number;
  medicalConditionName: string;
  diagnosisDate: string | number;
  diagnosisYear: number | number;
  severity: Severity;
  treatmentStatus: TreatmentStatus;
  details: string | null;
  createdAt: string;
  updatedAt: string;
};
