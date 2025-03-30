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

  const renderTypeSpecificDetails = () => {
    const details = [];

    const materialDisplay = getDisplayValue(
      prosthetic.material,
      prosthetic.otherMaterial,
      materialTypeLabels
    );

    if (materialDisplay) {
      details.push(
        <Text key='material' style={patientProfileStyles.cardDetail}>
          Material: {materialDisplay}
        </Text>
      );
    }

    const socketFitDisplay = getDisplayValue(
      prosthetic.socketFit,
      null,
      socketFitLabels
    );

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

    const controlSystemDisplay = getDisplayValue(
      prosthetic.controlSystem,
      prosthetic.otherControlSystem,
      controlSystemLabels
    );

    switch (prosthetic.type) {
      // Lower Limb Prostheses
      case ProstheticType.Transtibial:
      case ProstheticType.Syme:
      case ProstheticType.PartialFoot:
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
            <Text
              key='suspensionSystem'
              style={patientProfileStyles.cardDetail}
            >
              Suspension: {suspensionDisplay}
            </Text>
          );
        }
        break;

      case ProstheticType.Transfemoral:
      case ProstheticType.KneeDisarticulation:
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
        break;

      case ProstheticType.HipDisarticulation:
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
        break;

      // Upper Limb Prostheses
      case ProstheticType.Transhumeral:
      case ProstheticType.Transradial:
      case ProstheticType.ShoulderDisarticulation:
        if (controlSystemDisplay) {
          details.push(
            <Text key='controlSystem' style={patientProfileStyles.cardDetail}>
              Control: {controlSystemDisplay}
            </Text>
          );
        }
        break;

      case ProstheticType.Hand:
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
        break;

      // Digit Prostheses
      case ProstheticType.Finger:
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
        break;

      case ProstheticType.Toe:
        if (prosthetic.toePosition) {
          details.push(
            <Text key='toePosition' style={patientProfileStyles.cardDetail}>
              Position: {toePositionLabels[prosthetic.toePosition]}
            </Text>
          );
        }
        break;

      case ProstheticType.Other:
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

    const activityLevelDisplay = getDisplayValue(
      prosthetic.activityLevel,
      prosthetic.otherActivityLevel,
      activityLevelLabels
    );

    if (activityLevelDisplay) {
      details.push(
        <Text key='activityLevel' style={patientProfileStyles.cardDetail}>
          Activity Level: {activityLevelDisplay}
        </Text>
      );
    }

    return details;
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isPending}>
        <TouchableOpacity
          style={patientProfileStyles.card}
          activeOpacity={0.6}
          onPress={() => showProstheticDetails(prosthetic)}
        >
          <View style={patientProfileStyles.cardHeader}>
            <MaterialIcons name='device-hub' size={20} color={Colors.primary} />
            <Text style={patientProfileStyles.cardTitle}>
              {prosthetic.manufacturer || prosthetic.model
                ? `${prosthetic.manufacturer || ''} ${
                    prosthetic.model || ''
                  }`.trim()
                : ''}{' '}
              {prosthetic.manufacturer || prosthetic.model ? '- ' : ''}
              {getDisplayValue(
                prosthetic.type,
                prosthetic.otherType,
                prostheticTypeLabels
              ) || 'Unknown Type'}
            </Text>
          </View>
          <View style={patientProfileStyles.cardContent}>
            {(prosthetic.installationDate || prosthetic.installationYear) && (
              <Text style={patientProfileStyles.cardDetail}>
                Installed:{' '}
                {prosthetic.installationDate
                  ? format(
                      new Date(prosthetic.installationDate),
                      'dd MMMM yyyy'
                    )
                  : prosthetic.installationYear}{' '}
                (
                {formatDistanceToNow(
                  new Date(
                    prosthetic.installationDate ||
                      `${prosthetic.installationYear}-01-01`
                  )
                )}
                )
              </Text>
            )}

            <Text style={patientProfileStyles.cardDetail}>
              Side: {sideLabels[prosthetic.side]}
            </Text>

            {renderTypeSpecificDetails()}
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
