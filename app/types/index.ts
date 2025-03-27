import { LimbDominance, type PatientListItem, Sex } from './patient.type';

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  count: number;
  totalPages: number;
  hasNextPage: boolean;
};

export { PatientListItem, LimbDominance, Sex };
