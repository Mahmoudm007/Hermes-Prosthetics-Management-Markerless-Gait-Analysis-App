export enum Side {
  Left = 'Left',
  Right = 'Right',
  Bilateral = 'Bilateral',
  Unknown = 'Unknown',
}

export const sideLabels: Record<Side, string> = {
  [Side.Left]: 'Left',
  [Side.Right]: 'Right',
  [Side.Bilateral]: 'Bilateral',
  [Side.Unknown]: 'Unknown',
};

export type Injury = {
  id: number;
  patientId: number;
  injuryType: string;
  injuryDate: string | null;
  injuryYear: number | null;
  treated: boolean | null;
  treatmentMethod: string | null;
  currentImpact: string | null;
  side: Side;
  createdAt: string;
  updatedAt: string;
};
