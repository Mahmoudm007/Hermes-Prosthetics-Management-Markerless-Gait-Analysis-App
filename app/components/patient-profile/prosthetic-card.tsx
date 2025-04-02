import { useMemo, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

import { useProstheticStore } from '@/hooks/use-prosthetic-store';
import { useDeleteProsthetic } from '@/hooks/use-delete-prosthetic';

import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';
import {
  activityLevelLabels,
  controlSystemLabels,
  fingerPositionLabels,
  footTypeLabels,
  kneeTypeLabels,
  materialTypeLabels,
  pelvicSocketLabels,
  ProstheticType,
  prostheticTypeLabels,
  sideLabels,
  socketFitLabels,
  suspensionSystemLabels,
  toePositionLabels,
  type Prosthetic,
} from '@/types';

interface ProstheticCardProps {
  prosthetic: Prosthetic;
}

const getDisplayValue = (
  value: any,
  otherValue: string | null,
  labelsMap: Record<any, string>
) => {
  if (value === undefined || value === null) return null;

  const stringValue = value.toString();
  const isOtherOrUnknown =
    stringValue.includes('Other') || stringValue.includes('Unknown');

  if (!isOtherOrUnknown) {
    return labelsMap[value] || null;
  }

  return otherValue || null;
};

export default function ProstheticCard({ prosthetic }: ProstheticCardProps) {
  const { showProstheticDetails } = useProstheticStore();

  const { handleDelete, isPending } = useDeleteProsthetic({
    id: prosthetic.id,
    patientId: prosthetic.patientId,
  });

  const materialDisplay = useMemo(
    () =>
      getDisplayValue(
        prosthetic.material,
        prosthetic.otherMaterial,
        materialTypeLabels
      ),
    [prosthetic.material, prosthetic.otherMaterial]
  );

  const socketFitDisplay = useMemo(
    () => getDisplayValue(prosthetic.socketFit, null, socketFitLabels),
    [prosthetic.socketFit]
  );

  const controlSystemDisplay = useMemo(
    () =>
      getDisplayValue(
        prosthetic.controlSystem,
        prosthetic.otherControlSystem,
        controlSystemLabels
      ),
    [prosthetic.controlSystem, prosthetic.otherControlSystem]
  );

  const activityLevelDisplay = useMemo(
    () =>
      getDisplayValue(
        prosthetic.activityLevel,
        prosthetic.otherActivityLevel,
        activityLevelLabels
      ),
    [prosthetic.activityLevel, prosthetic.otherActivityLevel]
  );

  const prostheticTypeDisplay = useMemo(
    () =>
      getDisplayValue(
        prosthetic.type,
        prosthetic.otherType,
        prostheticTypeLabels
      ) || 'Unknown Type',
    [prosthetic.type, prosthetic.otherType]
  );

  const installationDateFormatted = useMemo(() => {
    if (!prosthetic.installationDate && !prosthetic.installationYear)
      return null;

    return {
      full: prosthetic.installationDate
        ? format(new Date(prosthetic.installationDate), 'dd MMMM yyyy')
        : prosthetic.installationYear,
      timeAgo: formatDistanceToNow(
        new Date(
          prosthetic.installationDate || `${prosthetic.installationYear}-01-01`
        )
      ),
    };
  }, [prosthetic.installationDate, prosthetic.installationYear]);

  const deactivationDateFormatted = useMemo(() => {
    if (!prosthetic.deactivationDate && !prosthetic.deactivationYear)
      return null;

    return prosthetic.deactivationDate
      ? format(new Date(prosthetic.deactivationDate), 'dd MMMM yyyy')
      : prosthetic.deactivationYear;
  }, [prosthetic.deactivationDate, prosthetic.deactivationYear]);

  const titleText = useMemo(() => {
    const modelPart =
      prosthetic.manufacturer || prosthetic.model
        ? `${prosthetic.manufacturer || ''} ${prosthetic.model || ''}`.trim()
        : '';

    return `${modelPart}${modelPart ? ' - ' : ''}${prostheticTypeDisplay}`;
  }, [prosthetic.manufacturer, prosthetic.model, prostheticTypeDisplay]);

  const lowerLimbDetails = useMemo(() => {
    if (
      ![
        ProstheticType.Transtibial,
        ProstheticType.Syme,
        ProstheticType.PartialFoot,
      ].includes(prosthetic.type)
    )
      return null;

    const details = [];

    const footTypeDisplay = getDisplayValue(
      prosthetic.footType,
      prosthetic.otherFootType,
      footTypeLabels
    );

    if (footTypeDisplay) {
      details.push(
        <Text key='footType' style={patientProfileStyles.cardDetail}>
          Foot Type: {footTypeDisplay}
        </Text>
      );
    }

    const suspensionDisplay = getDisplayValue(
      prosthetic.suspensionSystem,
      prosthetic.otherSuspensionSystem,
      suspensionSystemLabels
    );

    if (suspensionDisplay) {
      details.push(
        <Text key='suspensionSystem' style={patientProfileStyles.cardDetail}>
          Suspension: {suspensionDisplay}
        </Text>
      );
    }

    return details;
  }, [
    prosthetic.type,
    prosthetic.footType,
    prosthetic.otherFootType,
    prosthetic.suspensionSystem,
    prosthetic.otherSuspensionSystem,
  ]);

  const kneeDetails = useMemo(() => {
    if (
      ![
        ProstheticType.Transfemoral,
        ProstheticType.KneeDisarticulation,
      ].includes(prosthetic.type)
    )
      return null;

    const details = [];

    const kneeTypeDisplay = getDisplayValue(
      prosthetic.kneeType,
      prosthetic.otherKneeType,
      kneeTypeLabels
    );

    if (kneeTypeDisplay) {
      details.push(
        <Text key='kneeType' style={patientProfileStyles.cardDetail}>
          Knee Type: {kneeTypeDisplay}
        </Text>
      );
    }

    if (controlSystemDisplay) {
      details.push(
        <Text key='controlSystem' style={patientProfileStyles.cardDetail}>
          Control: {controlSystemDisplay}
        </Text>
      );
    }

    return details;
  }, [
    prosthetic.type,
    prosthetic.kneeType,
    prosthetic.otherKneeType,
    controlSystemDisplay,
  ]);

  const hipDetails = useMemo(() => {
    if (prosthetic.type !== ProstheticType.HipDisarticulation) return null;

    const details = [];

    const pelvicSocketDisplay = getDisplayValue(
      prosthetic.pelvicSocket,
      prosthetic.otherPelvicSocket,
      pelvicSocketLabels
    );

    if (pelvicSocketDisplay) {
      details.push(
        <Text key='pelvicSocket' style={patientProfileStyles.cardDetail}>
          Pelvic Socket: {pelvicSocketDisplay}
        </Text>
      );
    }

    const hipKneeTypeDisplay = getDisplayValue(
      prosthetic.kneeType,
      prosthetic.otherKneeType,
      kneeTypeLabels
    );

    if (hipKneeTypeDisplay) {
      details.push(
        <Text key='kneeType' style={patientProfileStyles.cardDetail}>
          Knee Type: {hipKneeTypeDisplay}
        </Text>
      );
    }

    return details;
  }, [
    prosthetic.type,
    prosthetic.pelvicSocket,
    prosthetic.otherPelvicSocket,
    prosthetic.kneeType,
    prosthetic.otherKneeType,
  ]);

  const upperLimbDetails = useMemo(() => {
    if (
      ![
        ProstheticType.Transhumeral,
        ProstheticType.Transradial,
        ProstheticType.ShoulderDisarticulation,
      ].includes(prosthetic.type)
    )
      return null;

    const details = [];

    if (controlSystemDisplay) {
      details.push(
        <Text key='controlSystem' style={patientProfileStyles.cardDetail}>
          Control: {controlSystemDisplay}
        </Text>
      );
    }

    return details;
  }, [prosthetic.type, controlSystemDisplay]);

  const handDetails = useMemo(() => {
    if (prosthetic.type !== ProstheticType.Hand) return null;

    const details = [];

    if (prosthetic.gripStrength) {
      details.push(
        <Text key='gripStrength' style={patientProfileStyles.cardDetail}>
          Grip Strength: {prosthetic.gripStrength} N
        </Text>
      );
    }

    if (controlSystemDisplay) {
      details.push(
        <Text key='controlSystem' style={patientProfileStyles.cardDetail}>
          Control: {controlSystemDisplay}
        </Text>
      );
    }

    return details;
  }, [prosthetic.type, prosthetic.gripStrength, controlSystemDisplay]);

  const fingerDetails = useMemo(() => {
    if (prosthetic.type !== ProstheticType.Finger) return null;

    const details = [];

    if (prosthetic.fingerPosition) {
      details.push(
        <Text key='fingerPosition' style={patientProfileStyles.cardDetail}>
          Position: {fingerPositionLabels[prosthetic.fingerPosition]}
        </Text>
      );
    }

    if (prosthetic.gripStrength) {
      details.push(
        <Text key='gripStrength' style={patientProfileStyles.cardDetail}>
          Grip Strength: {prosthetic.gripStrength} N
        </Text>
      );
    }

    return details;
  }, [prosthetic.type, prosthetic.fingerPosition, prosthetic.gripStrength]);

  const toeDetails = useMemo(() => {
    if (prosthetic.type !== ProstheticType.Toe) return null;

    const details = [];

    if (prosthetic.toePosition) {
      details.push(
        <Text key='toePosition' style={patientProfileStyles.cardDetail}>
          Position: {toePositionLabels[prosthetic.toePosition]}
        </Text>
      );
    }

    return details;
  }, [prosthetic.type, prosthetic.toePosition]);

  const otherTypeDetails = useMemo(() => {
    if (prosthetic.type !== ProstheticType.Other) return null;

    const details = [];

    if (controlSystemDisplay) {
      details.push(
        <Text key='controlSystem' style={patientProfileStyles.cardDetail}>
          Control: {controlSystemDisplay}
        </Text>
      );
    }

    if (prosthetic.gripStrength) {
      details.push(
        <Text key='gripStrength' style={patientProfileStyles.cardDetail}>
          Grip Strength: {prosthetic.gripStrength} N
        </Text>
      );
    }

    return details;
  }, [prosthetic.type, controlSystemDisplay, prosthetic.gripStrength]);

  const commonDetails = useMemo(() => {
    const details = [];

    if (materialDisplay) {
      details.push(
        <Text key='material' style={patientProfileStyles.cardDetail}>
          Material: {materialDisplay}
        </Text>
      );
    }

    if (socketFitDisplay) {
      details.push(
        <Text key='socketFit' style={patientProfileStyles.cardDetail}>
          Socket Fit: {socketFitDisplay}
        </Text>
      );
    }

    if (prosthetic.residualLimbLength) {
      details.push(
        <Text key='residualLimbLength' style={patientProfileStyles.cardDetail}>
          Residual Limb: {prosthetic.residualLimbLength} cm
        </Text>
      );
    }

    if (
      prosthetic.rangeOfMotionMin !== null &&
      prosthetic.rangeOfMotionMax !== null
    ) {
      details.push(
        <Text key='rangeOfMotion' style={patientProfileStyles.cardDetail}>
          ROM: {prosthetic.rangeOfMotionMin}° - {prosthetic.rangeOfMotionMax}°
        </Text>
      );
    }

    if (activityLevelDisplay) {
      details.push(
        <Text key='activityLevel' style={patientProfileStyles.cardDetail}>
          Activity Level: {activityLevelDisplay}
        </Text>
      );
    }

    return details;
  }, [
    materialDisplay,
    socketFitDisplay,
    prosthetic.residualLimbLength,
    prosthetic.rangeOfMotionMin,
    prosthetic.rangeOfMotionMax,
    activityLevelDisplay,
  ]);

  const typeSpecificDetails = useMemo(() => {
    return [
      ...(lowerLimbDetails || []),
      ...(kneeDetails || []),
      ...(hipDetails || []),
      ...(upperLimbDetails || []),
      ...(handDetails || []),
      ...(fingerDetails || []),
      ...(toeDetails || []),
      ...(otherTypeDetails || []),
      ...commonDetails,
    ];
  }, [
    lowerLimbDetails,
    kneeDetails,
    hipDetails,
    upperLimbDetails,
    handDetails,
    fingerDetails,
    toeDetails,
    otherTypeDetails,
    commonDetails,
  ]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isPending}>
        <TouchableOpacity
          style={patientProfileStyles.card}
          activeOpacity={0.6}
          // onPress={handleShowDetails}
        >
          <View style={patientProfileStyles.cardHeader}>
            <MaterialIcons name='device-hub' size={20} color={Colors.primary} />
            <Text style={patientProfileStyles.cardTitle}>{titleText}</Text>
          </View>
          <View style={patientProfileStyles.cardContent}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 3,
              }}
            >
              <View
                style={[
                  patientProfileStyles.statusDot,
                  {
                    backgroundColor: prosthetic.isActive
                      ? Colors.success
                      : Colors.destructive,
                  },
                ]}
              />
              <Text style={patientProfileStyles.cardDetail}>
                Status: {prosthetic.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>

            {installationDateFormatted && (
              <Text style={patientProfileStyles.cardDetail}>
                Installed: {installationDateFormatted.full} (
                {installationDateFormatted.timeAgo})
              </Text>
            )}

            {!prosthetic.isActive && deactivationDateFormatted && (
              <Text style={patientProfileStyles.cardDetail}>
                Deactivated: {deactivationDateFormatted}
              </Text>
            )}

            <Text style={patientProfileStyles.cardDetail}>
              Side: {sideLabels[prosthetic.side]}
            </Text>

            {typeSpecificDetails}
          </View>
        </TouchableOpacity>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label />
        <ContextMenu.Item
          key={`details_prosthetic_${prosthetic.id}`}
          onSelect={() => showProstheticDetails(prosthetic)}
        >
          <ContextMenu.ItemTitle>Prosthetic Details</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'info.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item key={`edit_prosthetic_${prosthetic.id}`}>
          <ContextMenu.ItemTitle>Edit Prosthetic</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'pencil.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item
          key={`delete_prosthetic_${prosthetic.id}`}
          onSelect={handleDelete}
        >
          <ContextMenu.ItemTitle>Delete Prosthetic</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'trash.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
