import { Side } from './injury.type';

export enum ProstheticType {
  Transtibial = 'Transtibial',
  Transfemoral = 'Transfemoral',
  PartialFoot = 'PartialFoot',
  Syme = 'Syme',
  KneeDisarticulation = 'KneeDisarticulation',
  HipDisarticulation = 'HipDisarticulation',
  Transhumeral = 'Transhumeral',
  Transradial = 'Transradial',
  Hand = 'Hand',
  ShoulderDisarticulation = 'ShoulderDisarticulation',
  Finger = 'Finger',
  Toe = 'Toe',
  Other = 'Other',
}

export const prostheticTypeLabels: Record<ProstheticType, string> = {
  [ProstheticType.Transtibial]: 'Transtibial',
  [ProstheticType.Transfemoral]: 'Transfemoral',
  [ProstheticType.PartialFoot]: 'Partial Foot',
  [ProstheticType.Syme]: 'Syme',
  [ProstheticType.KneeDisarticulation]: 'Knee Disarticulation',
  [ProstheticType.HipDisarticulation]: 'Hip Disarticulation',
  [ProstheticType.Transhumeral]: 'Transhumeral',
  [ProstheticType.Transradial]: 'Transradial',
  [ProstheticType.Hand]: 'Hand',
  [ProstheticType.ShoulderDisarticulation]: 'Shoulder Disarticulation',
  [ProstheticType.Finger]: 'Finger',
  [ProstheticType.Toe]: 'Toe',
  [ProstheticType.Other]: 'Other',
};

export enum Alignment {
  Static = 'Static',
  Dynamic = 'Dynamic',
  Other = 'Other',
}

export const alignmentLabels: Record<Alignment, string> = {
  [Alignment.Static]: 'Static',
  [Alignment.Dynamic]: 'Dynamic',
  [Alignment.Other]: 'Other',
};

export enum SuspensionSystem {
  Suction,
  VacuumAssisted,
  PinLock,
  Straps,
  Other,
}

export const suspensionSystemLabels: Record<SuspensionSystem, string> = {
  [SuspensionSystem.Suction]: 'Suction',
  [SuspensionSystem.VacuumAssisted]: 'Vacuum Assisted',
  [SuspensionSystem.PinLock]: 'Pin Lock',
  [SuspensionSystem.Straps]: 'Straps',
  [SuspensionSystem.Other]: 'Other',
};

export enum FootType {
  SACH = 'SACH',
  DynamicResponse = 'DynamicResponse',
  Multiaxial = 'Multiaxial',
  EnergyStoring = 'EnergyStoring',
  Microprocessor = 'Microprocessor',
  Other = 'Other',
}

export const footTypeLabels: Record<FootType, string> = {
  [FootType.SACH]: 'SACH',
  [FootType.DynamicResponse]: 'Dynamic Response',
  [FootType.Multiaxial]: 'Multiaxial',
  [FootType.EnergyStoring]: 'Energy Storing',
  [FootType.Microprocessor]: 'Microprocessor',
  [FootType.Other]: 'Other',
};

export enum KneeType {
  Mechanical = 'Mechanical',
  Hydraulic = 'Hydraulic',
  Pneumatic = 'Pneumatic',
  MicroprocessorControlled = 'Microprocessor Controlled',
  Other = 'Other',
}

export const kneeTypeLabels: Record<KneeType, string> = {
  [KneeType.Mechanical]: 'Mechanical',
  [KneeType.Hydraulic]: 'Hydraulic',
  [KneeType.Pneumatic]: 'Pneumatic',
  [KneeType.MicroprocessorControlled]: 'Microprocessor Controlled',
  [KneeType.Other]: 'Other',
};

export enum MaterialType {
  CarbonFiber = 'CarbonFiber',
  Titanium = 'Titanium',
  PlasticComposite = 'PlasticComposite',
  Aluminum = 'Aluminum',
  Other = 'Other',
}

export const materialTypeLabels: Record<MaterialType, string> = {
  [MaterialType.CarbonFiber]: 'Carbon Fiber',
  [MaterialType.Titanium]: 'Titanium',
  [MaterialType.PlasticComposite]: 'Plastic Composite',
  [MaterialType.Aluminum]: 'Aluminum',
  [MaterialType.Other]: 'Other',
};

export enum ControlSystem {
  Mechanical = 'Mechanical',
  Hybrid = 'Hybrid',
  MicroprocessorControlled = 'Microprocessor Controlled',
  Other = 'Other',
}

export const controlSystemLabels: Record<ControlSystem, string> = {
  [ControlSystem.Mechanical]: 'Mechanical',
  [ControlSystem.Hybrid]: 'Hybrid',
  [ControlSystem.MicroprocessorControlled]: 'Microprocessor Controlled',
  [ControlSystem.Other]: 'Other',
};

export enum SocketFit {
  Perfect = 'Perfect',
  SlightDiscomfort = 'SlightDiscomfort',
  Loose = 'Loose',
  Painful = 'Painful',
  Unknown = 'Unknown',
}

export const socketFitLabels: Record<SocketFit, string> = {
  [SocketFit.Perfect]: 'Perfect',
  [SocketFit.SlightDiscomfort]: 'Slight Discomfort',
  [SocketFit.Loose]: 'Loose',
  [SocketFit.Painful]: 'Painful',
  [SocketFit.Unknown]: 'Unknown',
};

export enum UserAdaptation {
  Poor = 'Poor',
  Moderate = 'Moderate',
  Good = 'Good',
  Excellent = 'Excellent',
  Unknown = 'Unknown',
}

export const userAdaptationLabels: Record<UserAdaptation, string> = {
  [UserAdaptation.Poor]: 'Poor',
  [UserAdaptation.Moderate]: 'Moderate',
  [UserAdaptation.Good]: 'Good',
  [UserAdaptation.Excellent]: 'Excellent',
  [UserAdaptation.Unknown]: 'Unknown',
};

export enum ActivityLevel {
  Low = 'Low',
  Moderate = 'Moderate',
  High = 'High',
  Athletic = 'Athletic',
  Other = 'Other',
}

export const activityLevelLabels: Record<ActivityLevel, string> = {
  [ActivityLevel.Low]: 'Low',
  [ActivityLevel.Moderate]: 'Moderate',
  [ActivityLevel.High]: 'High',
  [ActivityLevel.Athletic]: 'Athletic',
  [ActivityLevel.Other]: 'Other',
};

export enum PelvicSocket {
  Rigid = 'Rigid',
  Flexible = 'Flexible',
  Adjustable = 'Adjustable',
  VacuumAssisted = 'VacuumAssisted',
  Other = 'Other',
}

export const pelvicSocketLabels: Record<PelvicSocket, string> = {
  [PelvicSocket.Rigid]: 'Rigid',
  [PelvicSocket.Flexible]: 'Flexible',
  [PelvicSocket.Adjustable]: 'Adjustable',
  [PelvicSocket.VacuumAssisted]: 'Vacuum Assisted',
  [PelvicSocket.Other]: 'Other',
};

export enum FingerPosition {
  Thumb = 'Thumb',
  Index = 'Index',
  Middle = 'Middle',
  Ring = 'Ring',
  Pinky = 'Pinky',
}

export const fingerPositionLabels: Record<FingerPosition, string> = {
  [FingerPosition.Thumb]: 'Thumb',
  [FingerPosition.Index]: 'Index',
  [FingerPosition.Middle]: 'Middle',
  [FingerPosition.Ring]: 'Ring',
  [FingerPosition.Pinky]: 'Pinky',
};

export enum ToePosition {
  BigToe = 'BigToe',
  SecondToe = 'SecondToe',
  MiddleToe = 'MiddleToe',
  FourthToe = 'FourthToe',
  LittleToe = 'LittleToe',
}

export const toePositionLabels: Record<ToePosition, string> = {
  [ToePosition.BigToe]: 'Big Toe',
  [ToePosition.SecondToe]: 'Second Toe',
  [ToePosition.MiddleToe]: 'Middle Toe',
  [ToePosition.FourthToe]: 'Fourth Toe',
  [ToePosition.LittleToe]: 'Little Toe',
};

export type Prosthetic = {
  id: number;
  patientId: number;
  weight: number | null;
  length: number | null;
  usageDuration: number | null;
  installationDate: string | null;
  installationYear: number | null;
  type: ProstheticType;
  otherType: string | null;
  side: Side;
  alignment: Alignment | null;
  otherAlignment: string | null;
  suspensionSystem: SuspensionSystem | null;
  otherSuspensionSystem: string | null;
  footType: FootType | null;
  otherFootType: string | null;
  kneeType: KneeType | null;
  otherKneeType: string | null;
  pelvicSocket: PelvicSocket | null;
  otherPelvicSocket: string | null;
  fingerPosition: FingerPosition | null;
  toePosition: ToePosition | null;
  material: MaterialType;
  otherMaterial: string | null;
  controlSystem: ControlSystem | null;
  otherControlSystem: string | null;
  activityLevel: ActivityLevel | null;
  otherActivityLevel: string | null;
  userAdaptation: UserAdaptation;
  socketFit: SocketFit | null;
  stiffness: number | null;
  residualLimbLength: number | null;
  gripStrength: number | null;
  rangeOfMotionMin: number | null;
  rangeOfMotionMax: number | null;
  shockAbsorptionEnergy: number | null;
  manufacturer: string | null;
  model: string | null;
  details: string | null;
  createdAt: string;
  updatedAt: string;
};
