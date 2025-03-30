import type { MedicalCondition } from './medical-condition.type';
import type { Injury } from './injury.type';
import type { Prosthetic } from './prosthetic.type';

export enum Sex {
  Male = 'Male',
  Female = 'Female',
  Unknown = 'Unknown',
}

export const sexLabels: Record<Sex, string> = {
  [Sex.Male]: 'Male',
  [Sex.Female]: 'Female',
  [Sex.Unknown]: 'Unknown',
};

export const sexIcons: Record<Sex, string> = {
  [Sex.Male]: 'mars',
  [Sex.Female]: 'venus',
  [Sex.Unknown]: 'question',
};

export enum LimbDominance {
  Left = 'Left',
  Right = 'Right',
  Ambidextrous = 'Ambidextrous',
  Unknown = 'Unknown',
}

export const limbDominanceIcons: Record<LimbDominance, string> = {
  [LimbDominance.Left]: 'hand-point-left',
  [LimbDominance.Right]: 'hand-point-right',
  [LimbDominance.Ambidextrous]: 'hands-holding',
  [LimbDominance.Unknown]: 'question',
};

export const limbDominanceLabels: Record<LimbDominance, string> = {
  [LimbDominance.Left]: 'Left',
  [LimbDominance.Right]: 'Right',
  [LimbDominance.Ambidextrous]: 'Ambidextrous',
  [LimbDominance.Unknown]: 'Unknown',
};

type PatientBase = {
  firstName: string;
  lastName: string;
  ssn: string | null;
  email: string | null;
  phoneNumber: string | null;
  sex: Sex;
  birthDate: string | null;
  age: number | null;
  height: number;
  weight: number;
  limbDominance: LimbDominance;
};

export type PatientListItem = PatientBase & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type Patient = PatientListItem & {
  medicalConditions: MedicalCondition[];
  injuries: Injury[];
  prosthetics: Prosthetic[];
};
