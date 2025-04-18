import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Keyboard, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

import FormField from '@/components/ui/form/form-field';
import SelectOption from '@/components/ui/form/select-option';
import SelectOptionsWithOther from '@/components/ui/form/select-options-with-other';
import DateNumberSelector from '../ui/form/date-number-selector';
import FormInput from '@/components/ui/form/form-input';
import NumberInput from '@/components/ui/form/number-input';
import ToggleSwitch from '@/components/ui/form/toggle-switch';
import FormSheetFooter from './form-sheet-footer';

import { axiosClient } from '@/lib/axios';
import { Colors } from '@/constants/Colors';
import { formSheetStyles } from '@/constants/form-sheet-styles';

import {
  type Prosthetic,
  ProstheticType,
  prostheticTypeLabels,
  Side,
  Alignment,
  alignmentLabels,
  SuspensionSystem,
  suspensionSystemLabels,
  FootType,
  footTypeLabels,
  KneeType,
  kneeTypeLabels,
  MaterialType,
  materialTypeLabels,
  ControlSystem,
  controlSystemLabels,
  ActivityLevel,
  activityLevelLabels,
  UserAdaptation,
  userAdaptationLabels,
  SocketFit,
  socketFitLabels,
  PelvicSocket,
  pelvicSocketLabels,
  FingerPosition,
  fingerPositionLabels,
  ToePosition,
  toePositionLabels,
} from '@/types';

const currentYear = new Date().getFullYear();

const formSchema = z
  .object({
    weight: z.number().positive().nullable().optional(),
    length: z.number().positive().nullable().optional(),
    usageDuration: z.number().nonnegative().nullable().optional(),
    installationDate: z.date().nullable().optional(),
    installationYear: z
      .number()
      .min(1900, 'Year must be after 1900')
      .max(currentYear, `Year cannot be after ${currentYear}`)
      .nullable()
      .optional(),
    type: z.nativeEnum(ProstheticType),
    otherType: z.string().nullable().optional(),
    side: z.nativeEnum(Side),
    alignment: z.nativeEnum(Alignment).nullable().optional(),
    otherAlignment: z.string().nullable().optional(),
    suspensionSystem: z.nativeEnum(SuspensionSystem).nullable().optional(),
    otherSuspensionSystem: z.string().nullable().optional(),
    footType: z.nativeEnum(FootType).nullable().optional(),
    otherFootType: z.string().nullable().optional(),
    kneeType: z.nativeEnum(KneeType).nullable().optional(),
    otherKneeType: z.string().nullable().optional(),
    pelvicSocket: z.nativeEnum(PelvicSocket).nullable().optional(),
    otherPelvicSocket: z.string().nullable().optional(),
    fingerPosition: z.nativeEnum(FingerPosition).nullable().optional(),
    toePosition: z.nativeEnum(ToePosition).nullable().optional(),
    material: z.nativeEnum(MaterialType),
    otherMaterial: z.string().nullable().optional(),
    controlSystem: z.nativeEnum(ControlSystem).nullable().optional(),
    otherControlSystem: z.string().nullable().optional(),
    activityLevel: z.nativeEnum(ActivityLevel).nullable().optional(),
    otherActivityLevel: z.string().nullable().optional(),
    userAdaptation: z.nativeEnum(UserAdaptation).nullable().optional(),
    socketFit: z.nativeEnum(SocketFit).nullable().optional(),
    stiffness: z.number().nonnegative().nullable().optional(),
    residualLimbLength: z.number().positive().nullable().optional(),
    gripStrength: z.number().nonnegative().nullable().optional(),
    rangeOfMotionMin: z
      .number()
      .min(-90, 'Minimum range must be at least -90°')
      .max(150, 'Maximum range must be at most 150°')
      .nullable()
      .optional(),
    rangeOfMotionMax: z
      .number()
      .min(-90, 'Minimum range must be at least -90°')
      .max(150, 'Maximum range must be at most 150°')
      .nullable()
      .optional(),
    shockAbsorptionEnergy: z.number().nonnegative().nullable().optional(),
    manufacturer: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    details: z.string().nullable().optional(),
    patientId: z.number(),
    isActive: z.boolean().default(true),
    deactivationDate: z.date().nullable().optional(),
    deactivationYear: z
      .number()
      .min(1900, 'Year must be after 1900')
      .max(currentYear, `Year cannot be after ${currentYear}`)
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === ProstheticType.Other &&
      (!data.otherType || data.otherType.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom prosthetic type',
        path: ['otherType'],
      });
    }

    if (
      data.material === MaterialType.Other &&
      (!data.otherMaterial || data.otherMaterial.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom material',
        path: ['otherMaterial'],
      });
    }

    if (
      data.alignment === Alignment.Other &&
      (!data.otherAlignment || data.otherAlignment.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom alignment',
        path: ['otherAlignment'],
      });
    }

    if (
      data.suspensionSystem === SuspensionSystem.Other &&
      (!data.otherSuspensionSystem || data.otherSuspensionSystem.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom suspension system',
        path: ['otherSuspensionSystem'],
      });
    }

    if (
      data.footType === FootType.Other &&
      (!data.otherFootType || data.otherFootType.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom foot type',
        path: ['otherFootType'],
      });
    }

    if (
      data.kneeType === KneeType.Other &&
      (!data.otherKneeType || data.otherKneeType.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom knee type',
        path: ['otherKneeType'],
      });
    }

    if (
      data.pelvicSocket === PelvicSocket.Other &&
      (!data.otherPelvicSocket || data.otherPelvicSocket.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom pelvic socket type',
        path: ['otherPelvicSocket'],
      });
    }

    if (
      data.controlSystem === ControlSystem.Other &&
      (!data.otherControlSystem || data.otherControlSystem.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom control system',
        path: ['otherControlSystem'],
      });
    }

    if (
      data.activityLevel === ActivityLevel.Other &&
      (!data.otherActivityLevel || data.otherActivityLevel.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a custom activity level',
        path: ['otherActivityLevel'],
      });
    }

    // Validate range of motion
    if (data.rangeOfMotionMin !== null && data.rangeOfMotionMax === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum range must be provided if minimum range is set',
        path: ['rangeOfMotionMax'],
      });
    }

    if (data.rangeOfMotionMax !== null && data.rangeOfMotionMin === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimum range must be provided if maximum range is set',
        path: ['rangeOfMotionMin'],
      });
    }

    if (
      data.rangeOfMotionMin !== null &&
      data.rangeOfMotionMin !== undefined &&
      data.rangeOfMotionMax !== null &&
      data.rangeOfMotionMax !== undefined &&
      data.rangeOfMotionMin >= data.rangeOfMotionMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum range must be greater than minimum range',
        path: ['rangeOfMotionMax'],
      });
    }

    // Validate finger position is required for Finger type (but optional for Other type)
    if (data.type === ProstheticType.Finger && !data.fingerPosition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Finger position is required for Finger type prosthetics',
        path: ['fingerPosition'],
      });
    }

    // Validate toe position is required for Toe type (but optional for Other type)
    if (data.type === ProstheticType.Toe && !data.toePosition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Toe position is required for Toe type prosthetics',
        path: ['toePosition'],
      });
    }

    // Validate that deactivation date and year are not both provided
    if (data.deactivationDate && data.deactivationYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot provide both deactivation date and deactivation year',
        path: ['deactivationYear'],
      });
    }

    // Validate that installation date and year are not both provided
    if (data.installationDate && data.installationYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot provide both installation date and installation year',
        path: ['installationYear'],
      });
    }
  });

interface ProstheticFormSheetProps {
  isVisible: boolean;
  onClose: () => void;
  patientId: number;
  prosthetic?: Prosthetic | null;
  patientProsthetics: Prosthetic[];
}

const isRelevantProperty = (
  property: string,
  type: ProstheticType | undefined
): boolean => {
  if (!type) return false;

  const relevantProperties: Record<ProstheticType, string[]> = {
    [ProstheticType.Transtibial]: [
      'residualLimbLength',
      'footType',
      'suspensionSystem',
      'alignment',
      'socketFit',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'stiffness',
      'shockAbsorptionEnergy',
    ],
    [ProstheticType.Transfemoral]: [
      'residualLimbLength',
      'kneeType',
      'footType',
      'suspensionSystem',
      'controlSystem',
      'alignment',
      'socketFit',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'stiffness',
      'shockAbsorptionEnergy',
    ],
    [ProstheticType.PartialFoot]: [
      'footType',
      'suspensionSystem',
      'alignment',
      'socketFit',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'stiffness',
    ],
    [ProstheticType.Syme]: [
      'residualLimbLength',
      'footType',
      'suspensionSystem',
      'alignment',
      'socketFit',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'stiffness',
      'shockAbsorptionEnergy',
    ],
    [ProstheticType.KneeDisarticulation]: [
      'residualLimbLength',
      'kneeType',
      'footType',
      'suspensionSystem',
      'controlSystem',
      'alignment',
      'socketFit',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'stiffness',
      'shockAbsorptionEnergy',
    ],
    [ProstheticType.HipDisarticulation]: [
      'pelvicSocket',
      'kneeType',
      'footType',
      'suspensionSystem',
      'controlSystem',
      'alignment',
      'socketFit',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'stiffness',
      'shockAbsorptionEnergy',
    ],
    [ProstheticType.Transhumeral]: [
      'residualLimbLength',
      'controlSystem',
      'suspensionSystem',
      'alignment',
      'socketFit',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'stiffness',
    ],
    [ProstheticType.Transradial]: [
      'residualLimbLength',
      'controlSystem',
      'suspensionSystem',
      'alignment',
      'socketFit',
      'gripStrength',
    ],
    [ProstheticType.Hand]: [
      'controlSystem',
      'suspensionSystem',
      'alignment',
      'socketFit',
      'gripStrength',
    ],
    [ProstheticType.ShoulderDisarticulation]: [
      'controlSystem',
      'suspensionSystem',
      'alignment',
      'socketFit',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'stiffness',
    ],
    [ProstheticType.Finger]: [
      'residualLimbLength',
      'alignment',
      'gripStrength',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
    ],
    [ProstheticType.Toe]: ['residualLimbLength', 'alignment'],
    [ProstheticType.Other]: [], // All properties could be relevant for "Other"
  };

  // For "Other" type, consider all properties as relevant
  if (type === ProstheticType.Other) return true;

  const properties = relevantProperties[type] || [];
  return properties.indexOf(property) !== -1;
};

export default function ProstheticFormSheet({
  isVisible,
  onClose,
  patientId,
  prosthetic,
  patientProsthetics,
}: ProstheticFormSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const queryClient = useQueryClient();
  const [previousType, setPreviousType] = useState<ProstheticType | null>(null);
  const [availableSides, setAvailableSides] = useState<Side[]>([
    Side.Left,
    Side.Right,
    Side.Bilateral,
  ]);
  const [previousIsActive, setPreviousIsActive] = useState<boolean>(true);
  const [previousFingerPosition, setPreviousFingerPosition] =
    useState<FingerPosition | null>(null);
  const [previousToePosition, setPreviousToePosition] =
    useState<ToePosition | null>(null);

  const isEditMode = !!prosthetic;

  const snapPoints = useMemo(() => ['95%'], []);

  const {
    prostheticTypeAvailability,
    fingerPositionAvailability,
    toePositionAvailability,
  } = useMemo(() => {
    // Create a map to track prosthetic type usage by side
    const typeUsage = new Map<ProstheticType, Set<Side>>();

    // Create sets to track used finger and toe positions (regardless of side)
    const usedFingerPositions = new Set<FingerPosition>();
    const usedToePositions = new Set<ToePosition>();

    // Create maps to track finger and toe position usage by side (for detailed tracking)
    const fingerPositionUsage = new Map<FingerPosition, Set<Side>>();
    const toePositionUsage = new Map<ToePosition, Set<Side>>();

    // Initialize the finger position map
    Object.values(FingerPosition).forEach((position) => {
      fingerPositionUsage.set(position, new Set<Side>());
    });

    // Initialize the toe position map
    Object.values(ToePosition).forEach((position) => {
      toePositionUsage.set(position, new Set<Side>());
    });

    // Track active prosthetics only, excluding the current prosthetic if in edit mode
    const activeProsthetics = patientProsthetics.filter(
      (p) => p.isActive !== false && (!isEditMode || p.id !== prosthetic?.id)
    );

    // Initialize the map with all prosthetic types
    Object.values(ProstheticType).forEach((type) => {
      typeUsage.set(type, new Set<Side>());
    });

    // Fill the maps with used prosthetic types, sides, and positions
    activeProsthetics.forEach((p) => {
      const usedSides = typeUsage.get(p.type) || new Set<Side>();
      usedSides.add(p.side);
      typeUsage.set(p.type, usedSides);

      // Track finger positions - add to both detailed map and simple set
      if (p.type === ProstheticType.Finger && p.fingerPosition) {
        // Add to the set of used positions (regardless of side)
        usedFingerPositions.add(p.fingerPosition);

        // Also track by side for detailed information
        const usedSidesForFinger =
          fingerPositionUsage.get(p.fingerPosition) || new Set<Side>();
        usedSidesForFinger.add(p.side);
        fingerPositionUsage.set(p.fingerPosition, usedSidesForFinger);
      }

      // Track toe positions - add to both detailed map and simple set
      if (p.type === ProstheticType.Toe && p.toePosition) {
        // Add to the set of used positions (regardless of side)
        usedToePositions.add(p.toePosition);

        // Also track by side for detailed information
        const usedSidesForToe =
          toePositionUsage.get(p.toePosition) || new Set<Side>();
        usedSidesForToe.add(p.side);
        toePositionUsage.set(p.toePosition, usedSidesForToe);
      }
    });

    // Create availability map for prosthetic types
    const availability = Object.values(ProstheticType).reduce((acc, type) => {
      const usedSides = typeUsage.get(type) || new Set<Side>();

      // Check if all sides are used for this type
      const allSidesUsed =
        (usedSides.has(Side.Left) && usedSides.has(Side.Right)) ||
        usedSides.has(Side.Bilateral);

      // For Finger type - check if at least one position has available sides
      let hasAvailableFingerPosition = false;
      if (type === ProstheticType.Finger) {
        // Check if any finger position has available sides
        hasAvailableFingerPosition = Object.values(FingerPosition).some(
          (position) => {
            const usedSidesForPosition =
              fingerPositionUsage.get(position) || new Set<Side>();

            // Count how many sides are still available for this position
            const availableSides = new Set([
              Side.Left,
              Side.Right,
              Side.Bilateral,
            ]);

            if (
              usedSidesForPosition.has(Side.Left) ||
              usedSidesForPosition.has(Side.Bilateral)
            ) {
              availableSides.delete(Side.Left);
              availableSides.delete(Side.Bilateral);
            }

            if (
              usedSidesForPosition.has(Side.Right) ||
              usedSidesForPosition.has(Side.Bilateral)
            ) {
              availableSides.delete(Side.Right);
              availableSides.delete(Side.Bilateral);
            }

            return availableSides.size > 0;
          }
        );
      }

      // For Toe type - check if at least one position has available sides
      let hasAvailableToePosition = false;
      if (type === ProstheticType.Toe) {
        // Check if any toe position has available sides
        hasAvailableToePosition = Object.values(ToePosition).some(
          (position) => {
            const usedSidesForPosition =
              toePositionUsage.get(position) || new Set<Side>();

            // Count how many sides are still available for this position
            const availableSides = new Set([
              Side.Left,
              Side.Right,
              Side.Bilateral,
            ]);

            if (
              usedSidesForPosition.has(Side.Left) ||
              usedSidesForPosition.has(Side.Bilateral)
            ) {
              availableSides.delete(Side.Left);
              availableSides.delete(Side.Bilateral);
            }

            if (
              usedSidesForPosition.has(Side.Right) ||
              usedSidesForPosition.has(Side.Bilateral)
            ) {
              availableSides.delete(Side.Right);
              availableSides.delete(Side.Bilateral);
            }

            return availableSides.size > 0;
          }
        );
      }

      // Determine if the type is available
      let isAvailable;

      if (type === ProstheticType.Other) {
        // Other type is always available
        isAvailable = true;
      } else if (type === ProstheticType.Finger) {
        // Finger type is available if at least one position has available sides
        isAvailable = hasAvailableFingerPosition;
      } else if (type === ProstheticType.Toe) {
        // Toe type is available if at least one position has available sides
        isAvailable = hasAvailableToePosition;
      } else {
        // Regular types are available if not all sides are used
        isAvailable = !allSidesUsed;
      }

      // For "Other" type, always make all sides available
      if (type === ProstheticType.Other) {
        acc[type] = {
          isAvailable: true,
          availableSides: [Side.Left, Side.Right, Side.Bilateral],
        };
        return acc;
      }

      // Calculate available sides for this type
      const availableSidesForType = new Set<Side>([
        Side.Left,
        Side.Right,
        Side.Bilateral,
      ]);

      // Remove sides that are already used
      if (usedSides.has(Side.Left) || usedSides.has(Side.Bilateral)) {
        availableSidesForType.delete(Side.Left);
        availableSidesForType.delete(Side.Bilateral);
      }

      if (usedSides.has(Side.Right) || usedSides.has(Side.Bilateral)) {
        availableSidesForType.delete(Side.Right);
        availableSidesForType.delete(Side.Bilateral);
      }

      acc[type] = {
        isAvailable,
        availableSides: Array.from(availableSidesForType),
      };

      return acc;
    }, {} as Record<ProstheticType, { isAvailable: boolean; availableSides: Side[] }>);

    // Create availability map for finger positions
    const fingerAvailability = Object.values(FingerPosition).reduce(
      (acc, position) => {
        // For detailed side tracking
        const usedSides = fingerPositionUsage.get(position) || new Set<Side>();

        // Calculate available sides for this finger position
        const availableSidesForPosition = new Set<Side>([
          Side.Left,
          Side.Right,
          Side.Bilateral,
        ]);

        // Remove sides that are already used
        if (usedSides.has(Side.Left) || usedSides.has(Side.Bilateral)) {
          availableSidesForPosition.delete(Side.Left);
          availableSidesForPosition.delete(Side.Bilateral);
        }

        if (usedSides.has(Side.Right) || usedSides.has(Side.Bilateral)) {
          availableSidesForPosition.delete(Side.Right);
          availableSidesForPosition.delete(Side.Bilateral);
        }

        // A position is available if there are still sides available for it
        const isAvailable = availableSidesForPosition.size > 0;

        acc[position] = {
          isAvailable,
          availableSides: Array.from(availableSidesForPosition),
        };

        return acc;
      },
      {} as Record<
        FingerPosition,
        { isAvailable: boolean; availableSides: Side[] }
      >
    );

    // Create availability map for toe positions
    const toeAvailability = Object.values(ToePosition).reduce(
      (acc, position) => {
        // For detailed side tracking
        const usedSides = toePositionUsage.get(position) || new Set<Side>();

        // Calculate available sides for this toe position
        const availableSidesForPosition = new Set<Side>([
          Side.Left,
          Side.Right,
          Side.Bilateral,
        ]);

        // Remove sides that are already used
        if (usedSides.has(Side.Left) || usedSides.has(Side.Bilateral)) {
          availableSidesForPosition.delete(Side.Left);
          availableSidesForPosition.delete(Side.Bilateral);
        }

        if (usedSides.has(Side.Right) || usedSides.has(Side.Bilateral)) {
          availableSidesForPosition.delete(Side.Right);
          availableSidesForPosition.delete(Side.Bilateral);
        }

        // A position is available if there are still sides available for it
        const isAvailable = availableSidesForPosition.size > 0;

        acc[position] = {
          isAvailable,
          availableSides: Array.from(availableSidesForPosition),
        };

        return acc;
      },
      {} as Record<
        ToePosition,
        { isAvailable: boolean; availableSides: Side[] }
      >
    );

    return {
      prostheticTypeAvailability: availability,
      fingerPositionAvailability: fingerAvailability,
      toePositionAvailability: toeAvailability,
    };
  }, [patientProsthetics, isEditMode, prosthetic?.id]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const installationDate = watch('installationDate');
  const installationYear = watch('installationYear');
  const prostheticType = watch('type');
  const selectedSide = watch('side');
  const isActiveWatch = watch('isActive');
  const deactivationDate = watch('deactivationDate');
  const deactivationYear = watch('deactivationYear');
  const selectedFingerPosition = watch('fingerPosition');
  const selectedToePosition = watch('toePosition');

  // Update available sides when prosthetic type, position, or active status changes
  useEffect(() => {
    if (!prostheticType) return;

    // For "Other" type, all sides are always available
    if (prostheticType === ProstheticType.Other) {
      setAvailableSides([Side.Left, Side.Right, Side.Bilateral]);
      return;
    }

    // If inactive and in creation mode, all sides are available
    if (!isActiveWatch && !isEditMode) {
      setAvailableSides([Side.Left, Side.Right, Side.Bilateral]);
      return;
    }

    // Handle finger prosthetics
    if (prostheticType === ProstheticType.Finger) {
      if (!selectedFingerPosition) {
        // If no finger position is selected, disable all sides
        setAvailableSides([]);
        return;
      }

      // Get available sides for this finger position
      let availableSidesForPosition =
        fingerPositionAvailability[selectedFingerPosition]?.availableSides ||
        [];

      // In edit mode, always include the current side if it's the original combination
      if (
        isEditMode &&
        prosthetic?.type === ProstheticType.Finger &&
        prosthetic?.fingerPosition === selectedFingerPosition &&
        prosthetic?.side
      ) {
        availableSidesForPosition = Array.from(
          new Set([...availableSidesForPosition, prosthetic.side])
        );
      }

      setAvailableSides(availableSidesForPosition);
      return;
    }

    // Handle toe prosthetics
    if (prostheticType === ProstheticType.Toe) {
      if (!selectedToePosition) {
        // If no toe position is selected, disable all sides
        setAvailableSides([]);
        return;
      }

      // Get available sides for this toe position
      let availableSidesForPosition =
        toePositionAvailability[selectedToePosition]?.availableSides || [];

      // In edit mode, always include the current side if it's the original combination
      if (
        isEditMode &&
        prosthetic?.type === ProstheticType.Toe &&
        prosthetic?.toePosition === selectedToePosition &&
        prosthetic?.side
      ) {
        availableSidesForPosition = Array.from(
          new Set([...availableSidesForPosition, prosthetic.side])
        );
      }

      setAvailableSides(availableSidesForPosition);
      return;
    }

    // For other prosthetic types, use the standard availability logic
    let availableSidesForType =
      prostheticTypeAvailability[prostheticType]?.availableSides || [];

    // In edit mode, always include the current side
    if (isEditMode && prosthetic?.side) {
      availableSidesForType = Array.from(
        new Set([...availableSidesForType, prosthetic.side])
      );
    }

    setAvailableSides(
      availableSidesForType.length > 0
        ? availableSidesForType
        : [Side.Left, Side.Right, Side.Bilateral]
    );
  }, [
    prostheticType,
    prostheticTypeAvailability,
    isActiveWatch,
    isEditMode,
    prosthetic?.side,
    prosthetic?.type,
    selectedFingerPosition,
    selectedToePosition,
    fingerPositionAvailability,
    toePositionAvailability,
    prosthetic?.fingerPosition,
    prosthetic?.toePosition,
  ]);

  const detectConflictsOnActivation = () => {
    // Skip if not changing from inactive to active
    if (!(!previousIsActive && isActiveWatch)) return null;

    // Type "Other" is always available
    if (prostheticType === ProstheticType.Other) return null;

    // For Finger type
    if (prostheticType === ProstheticType.Finger) {
      // If no finger position selected, no conflict to check yet
      if (!selectedFingerPosition) return null;

      // Check if this finger position is already used by any active prosthetic
      const conflictingProsthetics = patientProsthetics.filter(
        (p) =>
          p.id !== prosthetic?.id && // Exclude current prosthetic
          p.isActive &&
          p.type === ProstheticType.Finger &&
          p.fingerPosition === selectedFingerPosition &&
          (p.side === selectedSide ||
            p.side === Side.Bilateral ||
            selectedSide === Side.Bilateral)
      );

      if (conflictingProsthetics.length > 0) {
        return {
          action: 'prevent_activation',
          message: `Cannot activate this prosthetic because there is already an active ${fingerPositionLabels[selectedFingerPosition]} prosthetic on the ${selectedSide} side.`,
        };
      }

      return null;
    }

    // For Toe type
    if (prostheticType === ProstheticType.Toe) {
      // If no toe position selected, no conflict to check yet
      if (!selectedToePosition) return null;

      // Check if this toe position is already used by any active prosthetic
      const conflictingProsthetics = patientProsthetics.filter(
        (p) =>
          p.id !== prosthetic?.id && // Exclude current prosthetic
          p.isActive &&
          p.type === ProstheticType.Toe &&
          p.toePosition === selectedToePosition &&
          (p.side === selectedSide ||
            p.side === Side.Bilateral ||
            selectedSide === Side.Bilateral)
      );

      if (conflictingProsthetics.length > 0) {
        return {
          action: 'prevent_activation',
          message: `Cannot activate this prosthetic because there is already an active ${toePositionLabels[selectedToePosition]} prosthetic on the ${selectedSide} side.`,
        };
      }

      return null;
    }

    // For regular prosthetic types
    // Check if this type and side is already used by any active prosthetic
    const conflictingProsthetics = patientProsthetics.filter(
      (p) =>
        p.id !== prosthetic?.id && // Exclude current prosthetic
        p.isActive &&
        p.type === prostheticType &&
        (p.side === selectedSide ||
          p.side === Side.Bilateral ||
          selectedSide === Side.Bilateral)
    );

    if (conflictingProsthetics.length > 0) {
      return {
        action: 'prevent_activation',
        message: `Cannot activate this prosthetic because there is already an active prosthetic of the same type on the ${selectedSide} side.`,
      };
    }

    return null;
  };

  // Handle changes to active status
  useEffect(() => {
    // Skip on initial render
    if (previousIsActive === isActiveWatch) return;

    // If changing from inactive to active
    if (!previousIsActive && isActiveWatch) {
      const conflict = detectConflictsOnActivation();

      if (conflict) {
        if (conflict.action === 'prevent_activation') {
          // Revert the toggle back to inactive
          setValue('isActive', false);
          // Show toast with conflict message
          toast.warning(conflict.message);
        }
      }
    }

    // If changing from active to inactive, clear deactivation date/year
    if (previousIsActive && !isActiveWatch) {
      // Reset deactivation fields when deactivating
      setValue('deactivationDate', null);
      setValue('deactivationYear', null);
    }

    setPreviousIsActive(isActiveWatch);
  }, [
    isActiveWatch,
    selectedSide,
    prostheticType,
    prostheticTypeAvailability,
    setValue,
    isEditMode,
    prosthetic?.side,
    previousIsActive,
    selectedFingerPosition,
    selectedToePosition,
    fingerPositionAvailability,
    toePositionAvailability,
    prosthetic?.type,
    prosthetic?.fingerPosition,
    prosthetic?.toePosition,
    patientProsthetics,
  ]);

  // Clear irrelevant fields when prosthetic type changes
  useEffect(() => {
    if (previousType !== null && previousType !== prostheticType) {
      // List of all type-specific fields
      const allTypeSpecificFields = [
        'residualLimbLength',
        'footType',
        'otherFootType',
        'kneeType',
        'otherKneeType',
        'pelvicSocket',
        'otherPelvicSocket',
        'suspensionSystem',
        'otherSuspensionSystem',
        'controlSystem',
        'otherControlSystem',
        'alignment',
        'otherAlignment',
        'socketFit',
        'stiffness',
        'gripStrength',
        'rangeOfMotionMin',
        'rangeOfMotionMax',
        'shockAbsorptionEnergy',
      ];

      // Clear fields that are not relevant for the new type
      allTypeSpecificFields.forEach((field) => {
        if (!isRelevantProperty(field, prostheticType)) {
          // Clear the field
          setValue(field as any, null);

          // Also clear any associated "other" field
          const otherField = `other${
            field.charAt(0).toUpperCase() + field.slice(1)
          }` as any;
          if (
            field.includes('Type') ||
            field.includes('System') ||
            field === 'alignment' ||
            field === 'pelvicSocket'
          ) {
            setValue(otherField, null);
          }
        }
      });

      // Handle finger/toe position fields separately
      if (prostheticType !== ProstheticType.Finger) {
        setValue('fingerPosition', null as unknown as FingerPosition);
      }
      if (prostheticType !== ProstheticType.Toe) {
        setValue('toePosition', null as unknown as ToePosition);
      }

      // Clear side when changing to Finger or Toe type
      if (
        prostheticType === ProstheticType.Finger ||
        prostheticType === ProstheticType.Toe
      ) {
        setValue('side', null as unknown as Side);
      }
    }

    setPreviousType(prostheticType);
  }, [prostheticType, previousType, setValue]);

  // Update side when finger position changes
  useEffect(() => {
    if (prostheticType !== ProstheticType.Finger) return;
    if (previousFingerPosition === selectedFingerPosition) return;

    // Skip validation for inactive prosthetics
    if (!isActiveWatch) {
      setAvailableSides([Side.Left, Side.Right, Side.Bilateral]);
      return;
    }

    if (selectedFingerPosition) {
      // Check if this position is already used by any active prosthetic
      const isPositionAvailable =
        fingerPositionAvailability[selectedFingerPosition]?.isAvailable;

      // In edit mode, if this is the original position, it's always available
      const isOriginalPosition =
        isEditMode &&
        prosthetic?.type === ProstheticType.Finger &&
        prosthetic?.fingerPosition === selectedFingerPosition;

      if (!isPositionAvailable && !isOriginalPosition) {
        // This position is already used and not the original position
        setAvailableSides([]);
        return;
      }

      // Get available sides for this finger position
      let availableSidesForPosition =
        fingerPositionAvailability[selectedFingerPosition]?.availableSides ||
        [];

      // In edit mode, always include the current side if it's the original combination
      if (isOriginalPosition && prosthetic?.side) {
        availableSidesForPosition = Array.from(
          new Set([...availableSidesForPosition, prosthetic.side])
        );
      }

      // If the current side is not valid for the new position, reset it
      if (
        selectedSide &&
        availableSidesForPosition.indexOf(selectedSide) === -1
      ) {
        if (availableSidesForPosition.length > 0) {
          setValue('side', availableSidesForPosition[0]);
        } else {
          setValue('side', null as unknown as Side);
        }
      }

      setAvailableSides(availableSidesForPosition);
    } else {
      // If no finger position is selected, disable all sides
      setAvailableSides([]);
      setValue('side', null as unknown as Side);
    }

    if (selectedFingerPosition) {
      setPreviousFingerPosition(selectedFingerPosition);
    }
  }, [
    selectedFingerPosition,
    previousFingerPosition,
    prostheticType,
    fingerPositionAvailability,
    selectedSide,
    setValue,
    isEditMode,
    prosthetic?.type,
    prosthetic?.fingerPosition,
    prosthetic?.side,
    isActiveWatch,
  ]);

  // Update side when toe position changes
  useEffect(() => {
    if (prostheticType !== ProstheticType.Toe) return;
    if (previousToePosition === selectedToePosition) return;

    // Skip validation for inactive prosthetics
    if (!isActiveWatch) {
      setAvailableSides([Side.Left, Side.Right, Side.Bilateral]);
      return;
    }

    if (selectedToePosition) {
      // Check if this position is already used by any active prosthetic
      const isPositionAvailable =
        toePositionAvailability[selectedToePosition]?.isAvailable;

      // In edit mode, if this is the original position, it's always available
      const isOriginalPosition =
        isEditMode &&
        prosthetic?.type === ProstheticType.Toe &&
        prosthetic?.toePosition === selectedToePosition;

      if (!isPositionAvailable && !isOriginalPosition) {
        // This position is already used and not the original position
        setAvailableSides([]);
        return;
      }

      // Get available sides for this toe position
      let availableSidesForPosition =
        toePositionAvailability[selectedToePosition]?.availableSides || [];

      // In edit mode, always include the current side if it's the original combination
      if (isOriginalPosition && prosthetic?.side) {
        availableSidesForPosition = Array.from(
          new Set([...availableSidesForPosition, prosthetic.side])
        );
      }

      // If the current side is not valid for the new position, reset it
      if (
        selectedSide &&
        availableSidesForPosition.indexOf(selectedSide) === -1
      ) {
        if (availableSidesForPosition.length > 0) {
          setValue('side', availableSidesForPosition[0]);
        } else {
          setValue('side', null as unknown as Side);
        }
      }

      setAvailableSides(availableSidesForPosition);
    } else {
      // If no toe position is selected, disable all sides
      setAvailableSides([]);
      setValue('side', null as unknown as Side);
    }

    if (selectedToePosition) {
      setPreviousToePosition(selectedToePosition);
    }
  }, [
    selectedToePosition,
    previousToePosition,
    prostheticType,
    toePositionAvailability,
    selectedSide,
    setValue,
    isEditMode,
    prosthetic?.type,
    prosthetic?.toePosition,
    prosthetic?.side,
    isActiveWatch,
  ]);

  const handleReset = () => {
    if (prosthetic) {
      reset({
        weight: prosthetic.weight,
        length: prosthetic.length,
        usageDuration: prosthetic.usageDuration,
        installationDate: prosthetic.installationDate
          ? new Date(prosthetic.installationDate)
          : null,
        installationYear: prosthetic.installationYear,
        type: prosthetic.type,
        otherType: prosthetic.otherType,
        side: prosthetic.side,
        alignment: prosthetic.alignment,
        otherAlignment: prosthetic.otherAlignment,
        suspensionSystem: prosthetic.suspensionSystem,
        otherSuspensionSystem: prosthetic.otherSuspensionSystem,
        footType: prosthetic.footType,
        otherFootType: prosthetic.otherFootType,
        kneeType: prosthetic.kneeType,
        otherKneeType: prosthetic.otherKneeType,
        pelvicSocket: prosthetic.pelvicSocket,
        otherPelvicSocket: prosthetic.otherPelvicSocket,
        fingerPosition: prosthetic.fingerPosition,
        toePosition: prosthetic.toePosition,
        material: prosthetic.material,
        otherMaterial: prosthetic.otherMaterial,
        controlSystem: prosthetic.controlSystem,
        otherControlSystem: prosthetic.otherControlSystem,
        activityLevel: prosthetic.activityLevel,
        otherActivityLevel: prosthetic.otherActivityLevel,
        userAdaptation: prosthetic.userAdaptation,
        socketFit: prosthetic.socketFit,
        stiffness: prosthetic.stiffness,
        residualLimbLength: prosthetic.residualLimbLength,
        gripStrength: prosthetic.gripStrength,
        rangeOfMotionMin: prosthetic.rangeOfMotionMin,
        rangeOfMotionMax: prosthetic.rangeOfMotionMax,
        shockAbsorptionEnergy: prosthetic.shockAbsorptionEnergy,
        manufacturer: prosthetic.manufacturer,
        model: prosthetic.model,
        details: prosthetic.details,
        patientId: prosthetic.patientId,
        isActive: prosthetic.isActive !== false,
        deactivationDate: prosthetic.deactivationDate
          ? new Date(prosthetic.deactivationDate)
          : null,
        deactivationYear: prosthetic.deactivationYear,
      });
      setPreviousType(prosthetic.type);
      setPreviousIsActive(prosthetic.isActive !== false);
      setPreviousFingerPosition(prosthetic.fingerPosition);
      setPreviousToePosition(prosthetic.toePosition);
    } else {
      reset({
        weight: null,
        length: null,
        usageDuration: null,
        installationDate: null,
        installationYear: null,
        type: undefined,
        otherType: null,
        side: undefined,
        alignment: null,
        otherAlignment: null,
        suspensionSystem: null,
        otherSuspensionSystem: null,
        footType: null,
        otherFootType: null,
        kneeType: null,
        otherKneeType: null,
        pelvicSocket: null,
        otherPelvicSocket: null,
        fingerPosition: null,
        toePosition: null,
        material: undefined,
        otherMaterial: null,
        controlSystem: null,
        otherControlSystem: null,
        activityLevel: null,
        otherActivityLevel: null,
        userAdaptation: null,
        socketFit: null,
        stiffness: null,
        residualLimbLength: null,
        gripStrength: null,
        rangeOfMotionMin: null,
        rangeOfMotionMax: null,
        shockAbsorptionEnergy: null,
        manufacturer: null,
        model: null,
        details: null,
        patientId,
        isActive: true,
        deactivationDate: null,
        deactivationYear: null,
      });
      setPreviousType(null);
      setPreviousIsActive(true);
      setPreviousFingerPosition(null);
      setPreviousToePosition(null);
    }
  };

  useEffect(() => {
    if (isVisible) {
      handleReset();
    }
  }, [isVisible, prosthetic, patientId, reset]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={() => {
          Keyboard.dismiss();
          bottomSheetRef.current?.close();
        }}
      />
    ),
    []
  );

  const processFormData = (data: z.infer<typeof formSchema>) => {
    const processedData = { ...data };

    // List of all type-specific fields
    const allTypeSpecificFields = [
      'residualLimbLength',
      'footType',
      'otherFootType',
      'kneeType',
      'otherKneeType',
      'pelvicSocket',
      'otherPelvicSocket',
      'suspensionSystem',
      'otherSuspensionSystem',
      'controlSystem',
      'otherControlSystem',
      'alignment',
      'otherAlignment',
      'socketFit',
      'stiffness',
      'gripStrength',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
      'shockAbsorptionEnergy',
    ];

    // Process each field
    allTypeSpecificFields.forEach((field) => {
      // Check if this is an "other" field
      if (field.startsWith('other')) {
        // Get the corresponding main field
        const mainField =
          field.replace('other', '').charAt(0).toLowerCase() +
          field.replace('other', '').slice(1);

        // If the main field is relevant and set to "Other", preserve this field
        if (
          isRelevantProperty(mainField, data.type) &&
          (processedData as any)[mainField] === 'Other'
        ) {
          // Keep the "other" field value
        } else {
          // Otherwise, clear it
          (processedData as any)[field] = null;
        }
      }
      // For main fields
      else if (!isRelevantProperty(field, data.type)) {
        // Clear irrelevant main fields
        (processedData as any)[field] = null;
      }
    });

    // Handle finger/toe position fields based on type
    if (data.type !== ProstheticType.Finger) {
      processedData.fingerPosition = null as unknown as FingerPosition;
    }
    if (data.type !== ProstheticType.Toe) {
      processedData.toePosition = null as unknown as ToePosition;
    }

    // If prosthetic is active, clear deactivation date/year
    if (processedData.isActive) {
      processedData.deactivationDate = null;
      processedData.deactivationYear = null;
    }

    return processedData;
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const processedData = processFormData(data);

      // Convert undefined values to null for API
      Object.keys(processedData).forEach((key) => {
        if (processedData[key as keyof typeof processedData] === undefined) {
          (processedData as any)[key] = null;
        }
      });

      return await axiosClient.post<Prosthetic>('prosthetics', {
        ...processedData,
        installationDate: processedData.installationDate
          ? new Date(processedData.installationDate).toISOString().split('T')[0]
          : null,
        deactivationDate: processedData.deactivationDate
          ? new Date(processedData.deactivationDate).toISOString().split('T')[0]
          : null,
      });
    },
    onError: (error) => {
      console.log(error);
      return toast.error('Failed to create prosthetic record');
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: [`patient_${patientId}`],
        });
      }
      bottomSheetRef.current?.close();
      onClose();
      return toast.success('Prosthetic record created successfully');
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!prosthetic) return null;

      const processedData = processFormData(data);

      Object.keys(processedData).forEach((key) => {
        if (processedData[key as keyof typeof processedData] === undefined) {
          (processedData as any)[key] = null;
        }
      });

      return await axiosClient.patch<Prosthetic>(
        `prosthetics/${prosthetic.id}`,
        {
          ...processedData,
          installationDate: processedData.installationDate
            ? new Date(processedData.installationDate)
                .toISOString()
                .split('T')[0]
            : null,
          deactivationDate: processedData.deactivationDate
            ? new Date(processedData.deactivationDate)
                .toISOString()
                .split('T')[0]
            : null,
          patientId: undefined,
        }
      );
    },
    onError: (error) => {
      console.log(error);
      return toast.error('Failed to update prosthetic record');
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: [`patient_${patientId}`],
        });
      }
      bottomSheetRef.current?.close();
      onClose();
      return toast.success('Prosthetic record updated successfully');
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditMode) {
      update(data);
    } else {
      create(data);
    }
  };

  // Render header section
  const renderHeader = () => (
    <View style={formSheetStyles.header}>
      <MaterialIcons name='device-hub' size={28} color={Colors.primary} />
      <Text style={formSheetStyles.title}>
        {isEditMode ? 'Update Prosthetic' : 'Add Prosthetic'}
      </Text>
    </View>
  );

  // Render basic information section
  const renderBasicInformation = () => (
    <View style={formSheetStyles.sectionContainer}>
      <Text style={formSheetStyles.sectionTitle}>Basic Information</Text>

      {/* Prosthetic Type */}
      <Controller
        control={control}
        name='type'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='Prosthetic Type'
            required
            error={errors.type?.message || errors.otherType?.message}
            info='Select the type of prosthetic device'
          >
            <View style={formSheetStyles.selectContainer}>
              {Object.entries(ProstheticType).map(([key, val]) => {
                // If inactive and in creation mode, all types are available
                const isAvailable = isEditMode
                  ? value === val
                  : !isActiveWatch || // Make all types available if inactive
                    val === ProstheticType.Other ||
                    prostheticTypeAvailability[val]?.isAvailable;

                return (
                  <SelectOption
                    key={key}
                    label={prostheticTypeLabels[val]}
                    selected={value === val}
                    onSelect={() => (isEditMode ? null : onChange(val))}
                    disabled={isEditMode || !isAvailable}
                  />
                );
              })}
            </View>
            {value === ProstheticType.Other && (
              <Controller
                control={control}
                name='otherType'
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    style={{ marginTop: 8 }}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ''}
                    placeholder='Enter custom prosthetic type'
                    hasError={!!errors.otherType}
                  />
                )}
              />
            )}
          </FormField>
        )}
      />
      {/* Finger Position - only show for Finger type in basic info */}
      {prostheticType === ProstheticType.Finger && (
        <Controller
          control={control}
          name='fingerPosition'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Finger Position'
              required
              error={errors.fingerPosition?.message}
              info='Which finger is being replaced'
            >
              <View style={formSheetStyles.selectContainer}>
                {Object.entries(FingerPosition).map(([key, val]) => {
                  // In edit mode, only show the current position as selectable
                  const isAvailable = isEditMode
                    ? value === val
                    : fingerPositionAvailability[val]?.isAvailable ||
                      !isActiveWatch;

                  return (
                    <SelectOption
                      key={key}
                      label={fingerPositionLabels[val]}
                      selected={value === val}
                      onSelect={() =>
                        isEditMode || isAvailable ? onChange(val) : null
                      }
                      onClear={
                        !isEditMode && value === val
                          ? () => onChange(null)
                          : undefined
                      }
                      disabled={isEditMode ? value !== val : !isAvailable}
                    />
                  );
                })}
              </View>
            </FormField>
          )}
        />
      )}

      {/* Toe Position - only show for Toe type in basic info */}
      {prostheticType === ProstheticType.Toe && (
        <Controller
          control={control}
          name='toePosition'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Toe Position'
              required
              error={errors.toePosition?.message}
              info='Which toe is being replaced'
            >
              <View style={formSheetStyles.selectContainer}>
                {Object.entries(ToePosition).map(([key, val]) => {
                  // In edit mode, only show the current position as selectable
                  const isAvailable = isEditMode
                    ? value === val
                    : toePositionAvailability[val]?.isAvailable ||
                      !isActiveWatch;

                  return (
                    <SelectOption
                      key={key}
                      label={toePositionLabels[val]}
                      selected={value === val}
                      onSelect={() =>
                        isEditMode || isAvailable ? onChange(val) : null
                      }
                      onClear={
                        !isEditMode && value === val
                          ? () => onChange(null)
                          : undefined
                      }
                      disabled={isEditMode ? value !== val : !isAvailable}
                    />
                  );
                })}
              </View>
            </FormField>
          )}
        />
      )}

      {/* Side */}
      <Controller
        control={control}
        name='side'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='Side'
            required
            error={errors.side?.message}
            info='Which side of the body the prosthetic is for'
          >
            <View style={formSheetStyles.selectContainer}>
              {Object.entries(Side)
                .slice(0, 3)
                .map(([key, val]) => {
                  // In edit mode, always enable the current side
                  // For inactive prosthetics, all sides are available
                  // Check if type is selected or not
                  const isAvailable =
                    prostheticType !== undefined &&
                    ((isEditMode && prosthetic?.side === val) ||
                      !isActiveWatch ||
                      availableSides.indexOf(val) !== -1);

                  return (
                    <SelectOption
                      key={key}
                      label={key}
                      selected={value === val}
                      onSelect={() => (isAvailable ? onChange(val) : null)}
                      disabled={!isAvailable}
                    />
                  );
                })}
            </View>
          </FormField>
        )}
      />

      {/* Is Active */}
      <Controller
        control={control}
        name='isActive'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='Currently Active'
            error={errors.isActive?.message}
            info='Is the patient currently using this prosthetic?'
          >
            <ToggleSwitch value={value} onValueChange={onChange} />
          </FormField>
        )}
      />
      {/* Deactivation Date/Year - only show if isActive is false */}
      {!isActiveWatch && (
        <DateNumberSelector
          date={deactivationDate || null}
          number={deactivationYear || null}
          onDateChange={(date) => setValue('deactivationDate', date)}
          onNumberChange={(number) => setValue('deactivationYear', number)}
          label='Deactivation Date'
          hint='When was the prosthetic deactivated?'
          error={
            errors.deactivationDate?.message || errors.deactivationYear?.message
          }
          numberButtonLabel='Select Year'
          minNumber={1900}
          maxNumber={currentYear}
        />
      )}

      {/* Material */}
      <Controller
        control={control}
        name='material'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='Material'
            required
            error={errors.material?.message || errors.otherMaterial?.message}
            info='Primary material used in the prosthetic'
          >
            <SelectOptionsWithOther
              options={MaterialType}
              labels={materialTypeLabels}
              selectedValue={value}
              otherValue={watch('otherMaterial')}
              onValueChange={onChange}
              onOtherValueChange={(val) => setValue('otherMaterial', val)}
              placeholder='Enter custom material'
              hasError={!!errors.otherMaterial}
              disableClear
            />
          </FormField>
        )}
      />

      {/* Installation Date/Year */}
      <DateNumberSelector
        date={installationDate || null}
        number={installationYear || null}
        onDateChange={(date) => setValue('installationDate', date)}
        onNumberChange={(number) => setValue('installationYear', number)}
        label='Installation Date'
        hint='When was the prosthetic installed?'
        error={
          errors.installationDate?.message || errors.installationYear?.message
        }
        numberButtonLabel='Select Year'
        minNumber={1900}
        maxNumber={currentYear}
      />

      {/* Manufacturer */}
      <Controller
        control={control}
        name='manufacturer'
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label='Manufacturer'
            error={errors.manufacturer?.message}
            info='Company that manufactured the prosthetic'
          >
            <FormInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ''}
              placeholder='Enter manufacturer name'
              hasError={!!errors.manufacturer}
            />
          </FormField>
        )}
      />

      {/* Model */}
      <Controller
        control={control}
        name='model'
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label='Model'
            error={errors.model?.message}
            info='Model name or number of the prosthetic'
          >
            <FormInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ''}
              placeholder='Enter model name'
              hasError={!!errors.model}
            />
          </FormField>
        )}
      />

      {/* Weight */}
      <Controller
        control={control}
        name='weight'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='Weight'
            error={errors.weight?.message}
            info='Weight of the prosthetic in grams'
          >
            <NumberInput
              value={value}
              onChangeText={(text) =>
                onChange(text ? Number.parseFloat(text) : null)
              }
              placeholder='Enter weight'
              unit='gm'
              hasError={!!errors.weight}
            />
          </FormField>
        )}
      />

      {/* Length */}
      <Controller
        control={control}
        name='length'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='Length'
            error={errors.length?.message}
            info='Length of the prosthetic in centimeters'
          >
            <NumberInput
              value={value}
              onChangeText={(text) =>
                onChange(text ? Number.parseFloat(text) : null)
              }
              placeholder='Enter length'
              unit='cm'
              hasError={!!errors.length}
            />
          </FormField>
        )}
      />

      {/* Usage Duration */}
      <Controller
        control={control}
        name='usageDuration'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='Usage Duration'
            error={errors.usageDuration?.message}
            info='Average daily usage in hours'
          >
            <NumberInput
              value={value}
              onChangeText={(text) =>
                onChange(text ? Number.parseFloat(text) : null)
              }
              placeholder='Enter usage duration'
              unit='hours/day'
              hasError={!!errors.usageDuration}
            />
          </FormField>
        )}
      />
    </View>
  );

  // Render type-specific properties section
  const renderTypeSpecificProperties = () => (
    <View style={formSheetStyles.sectionContainer}>
      <Text style={formSheetStyles.sectionTitle}>Type-Specific Properties</Text>

      {/* Finger Position - for Other type */}
      {prostheticType === ProstheticType.Other && (
        <Controller
          control={control}
          name='fingerPosition'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Finger Position'
              error={errors.fingerPosition?.message}
              info='Which finger is being replaced (if applicable)'
            >
              <View style={formSheetStyles.selectContainer}>
                {Object.entries(FingerPosition).map(([key, val]) => {
                  return (
                    <SelectOption
                      key={key}
                      label={fingerPositionLabels[val]}
                      selected={value === val}
                      onSelect={() => onChange(val)}
                      onClear={value === val ? () => onChange(null) : undefined}
                    />
                  );
                })}
              </View>
            </FormField>
          )}
        />
      )}

      {/* Toe Position - for Other type */}
      {prostheticType === ProstheticType.Other && (
        <Controller
          control={control}
          name='toePosition'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Toe Position'
              error={errors.toePosition?.message}
              info='Which toe is being replaced (if applicable)'
            >
              <View style={formSheetStyles.selectContainer}>
                {Object.entries(ToePosition).map(([key, val]) => {
                  return (
                    <SelectOption
                      key={key}
                      label={toePositionLabels[val]}
                      selected={value === val}
                      onSelect={() => onChange(val)}
                      onClear={value === val ? () => onChange(null) : undefined}
                    />
                  );
                })}
              </View>
            </FormField>
          )}
        />
      )}

      {/* Residual Limb Length - conditional */}
      {isRelevantProperty('residualLimbLength', prostheticType) && (
        <Controller
          control={control}
          name='residualLimbLength'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Residual Limb Length'
              error={errors.residualLimbLength?.message}
              info='Length of the residual limb in centimeters'
            >
              <NumberInput
                value={value}
                onChangeText={(text) =>
                  onChange(text ? Number.parseFloat(text) : null)
                }
                placeholder='Enter residual limb length'
                unit='cm'
                hasError={!!errors.residualLimbLength}
              />
            </FormField>
          )}
        />
      )}

      {/* Foot Type - conditional */}
      {isRelevantProperty('footType', prostheticType) && (
        <Controller
          control={control}
          name='footType'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Foot Type'
              error={errors.footType?.message || errors.otherFootType?.message}
              info='Type of prosthetic foot'
            >
              <SelectOptionsWithOther
                options={FootType}
                labels={footTypeLabels}
                selectedValue={value}
                otherValue={watch('otherFootType')}
                onValueChange={onChange}
                onOtherValueChange={(val) => setValue('otherFootType', val)}
                placeholder='Enter custom foot type'
                hasError={!!errors.otherFootType}
              />
            </FormField>
          )}
        />
      )}

      {/* Knee Type - conditional */}
      {isRelevantProperty('kneeType', prostheticType) && (
        <Controller
          control={control}
          name='kneeType'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Knee Type'
              error={errors.kneeType?.message || errors.otherKneeType?.message}
              info='Type of prosthetic knee joint'
            >
              <SelectOptionsWithOther
                options={KneeType}
                labels={kneeTypeLabels}
                selectedValue={value}
                otherValue={watch('otherKneeType')}
                onValueChange={onChange}
                onOtherValueChange={(val) => setValue('otherKneeType', val)}
                placeholder='Enter custom knee type'
                hasError={!!errors.otherKneeType}
              />
            </FormField>
          )}
        />
      )}

      {/* Pelvic Socket - conditional */}
      {isRelevantProperty('pelvicSocket', prostheticType) && (
        <Controller
          control={control}
          name='pelvicSocket'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Pelvic Socket'
              error={
                errors.pelvicSocket?.message ||
                errors.otherPelvicSocket?.message
              }
              info='Type of pelvic socket for hip disarticulation'
            >
              <SelectOptionsWithOther
                options={PelvicSocket}
                labels={pelvicSocketLabels}
                selectedValue={value}
                otherValue={watch('otherPelvicSocket')}
                onValueChange={onChange}
                onOtherValueChange={(val) => setValue('otherPelvicSocket', val)}
                placeholder='Enter custom pelvic socket type'
                hasError={!!errors.otherPelvicSocket}
              />
            </FormField>
          )}
        />
      )}

      {/* Suspension System - conditional */}
      {isRelevantProperty('suspensionSystem', prostheticType) && (
        <Controller
          control={control}
          name='suspensionSystem'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Suspension System'
              error={
                errors.suspensionSystem?.message ||
                errors.otherSuspensionSystem?.message
              }
              info='System used to attach the prosthetic to the body'
            >
              <SelectOptionsWithOther
                options={SuspensionSystem}
                labels={suspensionSystemLabels}
                selectedValue={value}
                otherValue={watch('otherSuspensionSystem')}
                onValueChange={onChange}
                onOtherValueChange={(val) =>
                  setValue('otherSuspensionSystem', val)
                }
                placeholder='Enter custom suspension system'
                hasError={!!errors.otherSuspensionSystem}
              />
            </FormField>
          )}
        />
      )}

      {/* Control System - conditional */}
      {isRelevantProperty('controlSystem', prostheticType) && (
        <Controller
          control={control}
          name='controlSystem'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Control System'
              error={
                errors.controlSystem?.message ||
                errors.otherControlSystem?.message
              }
              info='System used to control the prosthetic'
            >
              <SelectOptionsWithOther
                options={ControlSystem}
                labels={controlSystemLabels}
                selectedValue={value}
                otherValue={watch('otherControlSystem')}
                onValueChange={onChange}
                onOtherValueChange={(val) =>
                  setValue('otherControlSystem', val)
                }
                placeholder='Enter custom control system'
                hasError={!!errors.otherControlSystem}
              />
            </FormField>
          )}
        />
      )}

      {/* Alignment - conditional */}
      {isRelevantProperty('alignment', prostheticType) && (
        <Controller
          control={control}
          name='alignment'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Alignment'
              error={
                errors.alignment?.message || errors.otherAlignment?.message
              }
              info='Alignment type for prosthetic positioning'
            >
              <SelectOptionsWithOther
                options={Alignment}
                labels={alignmentLabels}
                selectedValue={value}
                otherValue={watch('otherAlignment')}
                onValueChange={onChange}
                onOtherValueChange={(val) => setValue('otherAlignment', val)}
                placeholder='Enter custom alignment'
                hasError={!!errors.otherAlignment}
              />
            </FormField>
          )}
        />
      )}

      {/* Socket Fit - conditional */}
      {isRelevantProperty('socketFit', prostheticType) && (
        <Controller
          control={control}
          name='socketFit'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Socket Fit'
              error={errors.socketFit?.message}
              info='Quality of the socket fit'
            >
              <View style={formSheetStyles.selectContainer}>
                {Object.entries(SocketFit).map(([key, val]) => (
                  <SelectOption
                    key={key}
                    label={socketFitLabels[val]}
                    selected={value === val}
                    onSelect={() => onChange(val)}
                    onClear={
                      value === val && val !== SocketFit.Unknown
                        ? () => onChange(SocketFit.Unknown)
                        : undefined
                    }
                  />
                ))}
              </View>
            </FormField>
          )}
        />
      )}

      {/* Range of Motion - conditional */}
      {(isRelevantProperty('rangeOfMotionMin', prostheticType) ||
        isRelevantProperty('rangeOfMotionMax', prostheticType)) && (
        <FormField
          label='Range of Motion'
          error={
            errors.rangeOfMotionMin?.message || errors.rangeOfMotionMax?.message
          }
          info='Minimum and maximum angles of motion in degrees'
        >
          <View style={styles.rangeVerticalContainer}>
            <Controller
              control={control}
              name='rangeOfMotionMin'
              render={({ field: { onChange, value } }) => (
                <NumberInput
                  value={value}
                  onChangeText={(text) =>
                    onChange(text ? Number.parseFloat(text) : null)
                  }
                  placeholder='Minimum angle'
                  unit='°'
                  hasError={!!errors.rangeOfMotionMin}
                />
              )}
            />
            <View style={styles.rangeSeparatorContainer}>
              <View style={styles.rangeLine} />
              <Text style={styles.rangeSeparatorText}>to</Text>
              <View style={styles.rangeLine} />
            </View>
            <Controller
              control={control}
              name='rangeOfMotionMax'
              render={({ field: { onChange, value } }) => (
                <NumberInput
                  value={value}
                  onChangeText={(text) =>
                    onChange(text ? Number.parseFloat(text) : null)
                  }
                  placeholder='Maximum angle'
                  unit='°'
                  hasError={!!errors.rangeOfMotionMax}
                />
              )}
            />
          </View>
        </FormField>
      )}

      {/* Stiffness - conditional */}
      {isRelevantProperty('stiffness', prostheticType) && (
        <Controller
          control={control}
          name='stiffness'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Stiffness'
              error={errors.stiffness?.message}
              info='Stiffness of the prosthetic component'
            >
              <NumberInput
                value={value}
                onChangeText={(text) =>
                  onChange(text ? Number.parseFloat(text) : null)
                }
                placeholder='Enter stiffness'
                unit={
                  [
                    ProstheticType.Transfemoral,
                    ProstheticType.KneeDisarticulation,
                    ProstheticType.HipDisarticulation,
                  ].includes(prostheticType)
                    ? 'Nm/°'
                    : 'N/m'
                }
                hasError={!!errors.stiffness}
              />
            </FormField>
          )}
        />
      )}

      {/* Grip Strength - conditional */}
      {isRelevantProperty('gripStrength', prostheticType) && (
        <Controller
          control={control}
          name='gripStrength'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Grip Strength'
              error={errors.gripStrength?.message}
              info='Maximum grip strength in newtons'
            >
              <NumberInput
                value={value}
                onChangeText={(text) =>
                  onChange(text ? Number.parseFloat(text) : null)
                }
                placeholder='Enter grip strength'
                unit='N'
                hasError={!!errors.gripStrength}
              />
            </FormField>
          )}
        />
      )}

      {/* Shock Absorption Energy - conditional */}
      {isRelevantProperty('shockAbsorptionEnergy', prostheticType) && (
        <Controller
          control={control}
          name='shockAbsorptionEnergy'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Shock Absorption Energy'
              error={errors.shockAbsorptionEnergy?.message}
              info='Energy absorption capacity in joules'
            >
              <NumberInput
                value={value}
                onChangeText={(text) =>
                  onChange(text ? Number.parseFloat(text) : null)
                }
                placeholder='Enter shock absorption'
                unit='J'
                hasError={!!errors.shockAbsorptionEnergy}
              />
            </FormField>
          )}
        />
      )}
    </View>
  );

  // Render additional information section
  const renderAdditionalInformation = () => (
    <View style={formSheetStyles.sectionContainer}>
      <Text style={formSheetStyles.sectionTitle}>Additional Information</Text>

      {/* Activity Level */}
      <Controller
        control={control}
        name='activityLevel'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='Activity Level'
            error={
              errors.activityLevel?.message ||
              errors.otherActivityLevel?.message
            }
            info='Intended activity level for the prosthetic'
          >
            <SelectOptionsWithOther
              options={ActivityLevel}
              labels={activityLevelLabels}
              selectedValue={value}
              otherValue={watch('otherActivityLevel')}
              onValueChange={onChange}
              onOtherValueChange={(val) => setValue('otherActivityLevel', val)}
              placeholder='Enter custom activity level'
              hasError={!!errors.otherActivityLevel}
            />
          </FormField>
        )}
      />

      {/* User Adaptation */}
      <Controller
        control={control}
        name='userAdaptation'
        render={({ field: { onChange, value } }) => (
          <FormField
            label='User Adaptation'
            error={errors.userAdaptation?.message}
            info="Patient's adaptation level to the prosthetic"
          >
            <View style={formSheetStyles.selectContainer}>
              {Object.entries(UserAdaptation).map(([key, val]) => (
                <SelectOption
                  key={key}
                  label={userAdaptationLabels[val]}
                  selected={value === val}
                  onSelect={() => onChange(val)}
                  onClear={() => onChange(null)}
                />
              ))}
            </View>
          </FormField>
        )}
      />

      {/* Details */}
      <Controller
        control={control}
        name='details'
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label='Additional Details'
            error={errors.details?.message}
            info='Any additional information about the prosthetic'
          >
            <FormInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ''}
              placeholder='Enter additional details (optional)'
              multiline
              numberOfLines={20}
              textAlignVertical='top'
              style={formSheetStyles.textArea}
              hasError={!!errors.details}
            />
          </FormField>
        )}
      />
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      android_keyboardInputMode='adjustResize'
      footerComponent={(props) => (
        <FormSheetFooter
          {...props}
          onClose={() => {
            bottomSheetRef.current?.close();
            onClose();
          }}
          onReset={handleReset}
          handleSave={handleSubmit(onSubmit)}
          isPending={isCreating || isUpdating}
          isEditMode={isEditMode}
        />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={formSheetStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderBasicInformation()}
        {renderTypeSpecificProperties()}
        {renderAdditionalInformation()}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  rangeVerticalContainer: {
    width: '100%',
  },
  rangeSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  rangeLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  rangeSeparatorText: {
    marginHorizontal: 10,
    color: '#000',
    fontSize: 14,
  },
});
