export enum AnalysisStatus {
  Initial = 'Initial',
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Error = 'Error',
}

export const analysisStatusLabels: Record<AnalysisStatus, string> = {
  [AnalysisStatus.Initial]: 'Initial',
  [AnalysisStatus.Pending]: 'Pending for Analysis',
  [AnalysisStatus.InProgress]: 'Analysis In Progress',
  [AnalysisStatus.Completed]: 'Analysis Completed',
  [AnalysisStatus.Error]: 'Analysis Error',
};

export const analysisStatusColors: Record<AnalysisStatus, string> = {
  [AnalysisStatus.Initial]: '#9E9E9E',
  [AnalysisStatus.Pending]: '#FFC107',
  [AnalysisStatus.InProgress]: '#2196F3',
  [AnalysisStatus.Completed]: '#4CAF50',
  [AnalysisStatus.Error]: '#F44336',
};

export type GaitMetric = {
  id: number;
  gaitSessionId: number;
  measurementIndex: number;
  stanceTimeLeft: number | null;
  stanceTimeRight: number | null;
  swingTimeLeft: number | null;
  swingTimeRight: number | null;
  stepTimeLeft: number | null;
  stepTimeRight: number | null;
  doubleSupportTimeLeft: number | null;
  doubleSupportTimeRight: number | null;
  createdAt: string;
  updatedAt: string;
};

export type GaitPlotData = {
  id: number;
  gaitSessionId: number;
  frameNumber: number;
  distLeftFiltered: number | null;
  distRightFiltered: number | null;
  isPeakLeft: boolean;
  isPeakRight: boolean;
  isMinimaLeft: boolean;
  isMinimaRight: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GaitSessionBase = {
  patientId: number;
  videoUrl: string;
  sessionDate: string | null;
  analysisStatus: AnalysisStatus;
  patient: {
    firstName: string;
    lastName: string;
    imageUrl: string | null;
  };
  title: string | null;
  description: string | null;
  notes: string | null;
};

export type GaitSessionListItem = GaitSessionBase & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type GaitSession = GaitSessionListItem & {
  annotatedVideoUrl: string | null;
  frameRate: number | null;
  summarizedAiAnalysis: string | null;
  detailedAiAnalysis: string | null;
  recommendations: string[];
  possibleAbnormalities: string[];
  recommendedExercises: string[];
  longTermRisks: string[];
  analysisStatus: AnalysisStatus;
  gaitMetrics: GaitMetric[];
  gaitPlotData: GaitPlotData[];
};
