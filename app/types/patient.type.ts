export enum Sex {
  Male = 'Male',
  Female = 'Female',
  Unknown = 'Unknown',
}

export enum LimbDominance {
  Left = 'Left',
  Right = 'Right',
  Ambidextrous = 'Ambidextrous',
  Unknown = 'Unknown',
}

type PatientBase = {
  firstName: string;
  lastName: string;
  ssn?: string;
  email?: string;
  phoneNumber?: string;
  sex?: Sex;
  birthDate?: string;
  age?: number;
  height: number;
  weight: number;
  limbDominance?: LimbDominance;
};

export type PatientListItem = PatientBase & {
  id: number;
  createdAt: string;
  updatedAt: string;
};
