import { useCallback, useMemo, useRef } from 'react';
import { View, Text } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { format, formatDistanceToNow } from 'date-fns';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

import InfoItem from './info-item';
import DetailsSheetFooter from './details-sheet-footer';

import { useDeleteProsthetic } from '@/hooks/use-delete-prosthetic';
import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';

import {
  activityLevelLabels,
  alignmentLabels,
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
  userAdaptationLabels,
  type Prosthetic,
} from '@/types';

interface ProstheticDetailsSheetProps {
  prosthetic: Prosthetic | null;
  isVisible: boolean;
  onClose: () => void;
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

  return otherValue || labelsMap[value] || null;
};

const isRelevantProperty = (
  property: string,
  type: ProstheticType
): boolean => {
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
      'fingerPosition',
      'alignment',
      'gripStrength',
      'rangeOfMotionMin',
      'rangeOfMotionMax',
    ],
    [ProstheticType.Toe]: ['residualLimbLength', 'toePosition', 'alignment'],
    [ProstheticType.Other]: [], // All properties could be relevant for "Other"
  };

  // For "Other" type, consider all properties as relevant
  if (type === ProstheticType.Other) return true;

  return relevantProperties[type].includes(property);
};

export default function ProstheticDetailsSheet({
  prosthetic,
  isVisible,
  onClose,
}: ProstheticDetailsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['95%'], []);

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
        onPress={() => bottomSheetRef.current?.close()}
      />
    ),
    []
  );

  const { handleDelete, isPending } = useDeleteProsthetic({
    id: prosthetic?.id,
    patientId: prosthetic?.patientId,
    callbackFn: onClose,
  });

  const handleUpdate = () => {
    if (!prosthetic) return;
    console.log('Updating prosthetic', prosthetic.id);
  };

  const formatInstallationDate = () => {
    if (!prosthetic) return '';

    if (prosthetic.installationDate) {
      return format(new Date(prosthetic.installationDate), 'dd MMMM yyyy');
    } else if (prosthetic.installationYear) {
      return prosthetic.installationYear.toString();
    }
    return 'Unknown';
  };

  const formatTimeSince = () => {
    if (!prosthetic) return '';

    if (prosthetic.installationDate || prosthetic.installationYear) {
      return formatDistanceToNow(
        new Date(
          prosthetic.installationDate || `${prosthetic.installationYear}-01-01`
        )
      );
    }
    return '';
  };

  const renderHeader = () => {
    if (!prosthetic) return null;

    const prostheticTypeDisplay = getDisplayValue(
      prosthetic.type,
      prosthetic.otherType,
      prostheticTypeLabels
    );

    return (
      <View style={patientProfileStyles.header}>
        <MaterialIcons name='device-hub' size={28} color={Colors.primary} />
        <Text style={patientProfileStyles.title}>
          {prosthetic.manufacturer || prosthetic.model
            ? `${prosthetic.manufacturer || ''} ${
                prosthetic.model || ''
              }`.trim()
            : ''}{' '}
          {prosthetic.manufacturer || prosthetic.model ? '- ' : ''}
          {prostheticTypeDisplay || 'Unknown Type'}
        </Text>
      </View>
    );
  };

  const renderBasicDetails = () => {
    if (!prosthetic) return null;

    return (
      <View style={patientProfileStyles.sheetInfoSection}>
        <Text style={patientProfileStyles.sectionTitle}>Basic Details</Text>

        <View style={patientProfileStyles.infoItem}>
          <View style={patientProfileStyles.infoIcon}>
            <FontAwesome5 name='power-off' size={24} color={Colors.primary} />
          </View>
          <View style={patientProfileStyles.infoContent}>
            <Text style={patientProfileStyles.infoLabel}>Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              <Text style={patientProfileStyles.infoValue}>
                {prosthetic.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {(prosthetic.installationDate || prosthetic.installationYear) && (
          <InfoItem
            icon={
              <FontAwesome5
                name='calendar-alt'
                size={24}
                color={Colors.primary}
              />
            }
            label='Installation Date'
            value={`${formatInstallationDate()} ${
              formatTimeSince() ? ` (${formatTimeSince()})` : ''
            }`}
          />
        )}

        {!prosthetic.isActive &&
          (prosthetic.deactivationDate || prosthetic.deactivationYear) && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='calendar-times'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Deactivation Date'
              value={
                prosthetic.deactivationDate
                  ? format(
                      new Date(prosthetic.deactivationDate),
                      'dd MMMM yyyy'
                    )
                  : prosthetic.deactivationYear?.toString() || 'Unknown'
              }
            />
          )}

        <InfoItem
          icon={
            <FontAwesome5
              name='arrows-alt-h'
              size={24}
              color={Colors.primary}
            />
          }
          label='Side'
          value={sideLabels[prosthetic.side]}
        />

        {prosthetic.weight && (
          <InfoItem
            icon={
              <FontAwesome5 name='weight' size={24} color={Colors.primary} />
            }
            label='Weight'
            value={`${prosthetic.weight} g`}
          />
        )}

        {prosthetic.length && (
          <InfoItem
            icon={
              <FontAwesome5
                name='ruler-vertical'
                size={24}
                color={Colors.primary}
              />
            }
            label='Length'
            value={`${prosthetic.length} cm`}
          />
        )}

        {prosthetic.usageDuration && (
          <InfoItem
            icon={
              <FontAwesome5 name='clock' size={24} color={Colors.primary} />
            }
            label='Usage Duration'
            value={`${prosthetic.usageDuration} hours/day`}
          />
        )}

        {getDisplayValue(
          prosthetic.material,
          prosthetic.otherMaterial,
          materialTypeLabels
        ) && (
          <InfoItem
            icon={
              <FontAwesome5
                name='layer-group'
                size={24}
                color={Colors.primary}
              />
            }
            label='Material'
            value={
              getDisplayValue(
                prosthetic.material,
                prosthetic.otherMaterial,
                materialTypeLabels
              ) || ''
            }
          />
        )}

        {getDisplayValue(
          prosthetic.userAdaptation,
          null,
          userAdaptationLabels
        ) && (
          <InfoItem
            icon={
              <FontAwesome5
                name='user-check'
                size={24}
                color={Colors.primary}
              />
            }
            label='User Adaptation'
            value={
              getDisplayValue(
                prosthetic.userAdaptation,
                null,
                userAdaptationLabels
              ) || ''
            }
          />
        )}

        {getDisplayValue(
          prosthetic.activityLevel,
          prosthetic.otherActivityLevel,
          activityLevelLabels
        ) && (
          <InfoItem
            icon={
              <FontAwesome5 name='running' size={24} color={Colors.primary} />
            }
            label='Activity Level'
            value={
              getDisplayValue(
                prosthetic.activityLevel,
                prosthetic.otherActivityLevel,
                activityLevelLabels
              ) || ''
            }
          />
        )}
      </View>
    );
  };

  const renderTypeSpecificProperties = () => {
    if (!prosthetic) return null;

    return (
      <View style={patientProfileStyles.sheetInfoSection}>
        <Text style={patientProfileStyles.sectionTitle}>
          Type-Specific Properties
        </Text>

        {renderLowerLimbProperties()}

        {renderUpperLimbProperties()}

        {renderDigitProperties()}

        {renderCommonProperties()}
      </View>
    );
  };

  const renderLowerLimbProperties = () => {
    if (!prosthetic) return null;

    const isLowerLimb = [
      ProstheticType.Transtibial,
      ProstheticType.Transfemoral,
      ProstheticType.PartialFoot,
      ProstheticType.Syme,
      ProstheticType.KneeDisarticulation,
      ProstheticType.HipDisarticulation,
    ].includes(prosthetic.type);

    if (!isLowerLimb) return null;

    return (
      <>
        {isRelevantProperty('residualLimbLength', prosthetic.type) &&
          prosthetic.residualLimbLength && (
            <InfoItem
              icon={
                <FontAwesome5 name='ruler' size={24} color={Colors.primary} />
              }
              label='Residual Limb Length'
              value={`${prosthetic.residualLimbLength} cm`}
            />
          )}

        {isRelevantProperty('footType', prosthetic.type) &&
          getDisplayValue(
            prosthetic.footType,
            prosthetic.otherFootType,
            footTypeLabels
          ) && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='shoe-prints'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Foot Type'
              value={
                getDisplayValue(
                  prosthetic.footType,
                  prosthetic.otherFootType,
                  footTypeLabels
                ) || ''
              }
            />
          )}

        {isRelevantProperty('kneeType', prosthetic.type) &&
          getDisplayValue(
            prosthetic.kneeType,
            prosthetic.otherKneeType,
            kneeTypeLabels
          ) && (
            <InfoItem
              icon={
                <FontAwesome5 name='bone' size={24} color={Colors.primary} />
              }
              label='Knee Type'
              value={
                getDisplayValue(
                  prosthetic.kneeType,
                  prosthetic.otherKneeType,
                  kneeTypeLabels
                ) || ''
              }
            />
          )}

        {isRelevantProperty('pelvicSocket', prosthetic.type) &&
          getDisplayValue(
            prosthetic.pelvicSocket,
            prosthetic.otherPelvicSocket,
            pelvicSocketLabels
          ) && (
            <InfoItem
              icon={
                <FontAwesome5 name='ring' size={24} color={Colors.primary} />
              }
              label='Pelvic Socket'
              value={
                getDisplayValue(
                  prosthetic.pelvicSocket,
                  prosthetic.otherPelvicSocket,
                  pelvicSocketLabels
                ) || ''
              }
            />
          )}
      </>
    );
  };

  const renderUpperLimbProperties = () => {
    if (!prosthetic) return null;

    const isUpperLimb = [
      ProstheticType.Transhumeral,
      ProstheticType.Transradial,
      ProstheticType.Hand,
      ProstheticType.ShoulderDisarticulation,
    ].includes(prosthetic.type);

    if (!isUpperLimb) return null;

    return (
      <>
        {isRelevantProperty('residualLimbLength', prosthetic.type) &&
          prosthetic.residualLimbLength && (
            <InfoItem
              icon={
                <FontAwesome5 name='ruler' size={24} color={Colors.primary} />
              }
              label='Residual Limb Length'
              value={`${prosthetic.residualLimbLength} cm`}
            />
          )}

        {isRelevantProperty('gripStrength', prosthetic.type) &&
          prosthetic.gripStrength && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='hand-rock'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Grip Strength'
              value={`${prosthetic.gripStrength} N`}
            />
          )}
      </>
    );
  };

  const renderDigitProperties = () => {
    if (!prosthetic) return null;

    return (
      <>
        {prosthetic.type === ProstheticType.Finger &&
          prosthetic.fingerPosition && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='hand-point-up'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Finger Position'
              value={fingerPositionLabels[prosthetic.fingerPosition]}
            />
          )}

        {prosthetic.type === ProstheticType.Toe && prosthetic.toePosition && (
          <InfoItem
            icon={
              <FontAwesome5 name='socks' size={24} color={Colors.primary} />
            }
            label='Toe Position'
            value={toePositionLabels[prosthetic.toePosition]}
          />
        )}
      </>
    );
  };

  const renderCommonProperties = () => {
    if (!prosthetic) return null;

    return (
      <>
        {isRelevantProperty('suspensionSystem', prosthetic.type) &&
          getDisplayValue(
            prosthetic.suspensionSystem,
            prosthetic.otherSuspensionSystem,
            suspensionSystemLabels
          ) && (
            <InfoItem
              icon={
                <FontAwesome5 name='link' size={24} color={Colors.primary} />
              }
              label='Suspension System'
              value={
                getDisplayValue(
                  prosthetic.suspensionSystem,
                  prosthetic.otherSuspensionSystem,
                  suspensionSystemLabels
                ) || ''
              }
            />
          )}

        {isRelevantProperty('controlSystem', prosthetic.type) &&
          getDisplayValue(
            prosthetic.controlSystem,
            prosthetic.otherControlSystem,
            controlSystemLabels
          ) && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='microchip'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Control System'
              value={
                getDisplayValue(
                  prosthetic.controlSystem,
                  prosthetic.otherControlSystem,
                  controlSystemLabels
                ) || ''
              }
            />
          )}

        {isRelevantProperty('alignment', prosthetic.type) &&
          getDisplayValue(
            prosthetic.alignment,
            prosthetic.otherAlignment,
            alignmentLabels
          ) && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='ruler-combined'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Alignment'
              value={
                getDisplayValue(
                  prosthetic.alignment,
                  prosthetic.otherAlignment,
                  alignmentLabels
                ) || ''
              }
            />
          )}

        {isRelevantProperty('socketFit', prosthetic.type) &&
          getDisplayValue(prosthetic.socketFit, null, socketFitLabels) && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='compress-arrows-alt'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Socket Fit'
              value={
                getDisplayValue(prosthetic.socketFit, null, socketFitLabels) ||
                ''
              }
            />
          )}

        {/* Range of Motion */}
        {isRelevantProperty('rangeOfMotionMin', prosthetic.type) &&
          isRelevantProperty('rangeOfMotionMax', prosthetic.type) &&
          prosthetic.rangeOfMotionMin !== null &&
          prosthetic.rangeOfMotionMax !== null && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='angle-double-right'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Range of Motion'
              value={`${prosthetic.rangeOfMotionMin}° - ${prosthetic.rangeOfMotionMax}°`}
            />
          )}

        {/* Stiffness */}
        {isRelevantProperty('stiffness', prosthetic.type) &&
          prosthetic.stiffness && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='compress'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Stiffness'
              value={`${prosthetic.stiffness} ${
                [
                  ProstheticType.Transfemoral,
                  ProstheticType.KneeDisarticulation,
                  ProstheticType.HipDisarticulation,
                ].includes(prosthetic.type)
                  ? 'Nm/°'
                  : 'N/m'
              }`}
            />
          )}

        {/* Shock Absorption */}
        {isRelevantProperty('shockAbsorptionEnergy', prosthetic.type) &&
          prosthetic.shockAbsorptionEnergy && (
            <InfoItem
              icon={
                <FontAwesome5 name='bolt' size={24} color={Colors.primary} />
              }
              label='Shock Absorption Energy'
              value={`${prosthetic.shockAbsorptionEnergy} J`}
            />
          )}
      </>
    );
  };

  const hasNonRelevantProperties = () => {
    if (!prosthetic) return false;

    return Object.entries(prosthetic).some(([key, value]) => {
      if (
        [
          'id',
          'patientId',
          'type',
          'side',
          'weight',
          'length',
          'usageDuration',
          'installationDate',
          'installationYear',
          'material',
          'userAdaptation',
          'activityLevel',
          'manufacturer',
          'model',
          'details',
          'createdAt',
          'updatedAt',
          'otherType',
          'otherMaterial',
          'otherActivityLevel',
        ].includes(key)
      ) {
        return false;
      }

      return (
        !isRelevantProperty(key, prosthetic.type) &&
        value !== null &&
        value !== undefined
      );
    });
  };

  const renderOtherProperties = () => {
    if (!prosthetic || !hasNonRelevantProperties()) return null;

    return (
      <>
        <View style={patientProfileStyles.separator} />
        <View style={patientProfileStyles.sheetInfoSection}>
          <Text style={patientProfileStyles.sectionTitle}>
            Other Properties
          </Text>

          {/* Foot Type (if not relevant but has value) */}
          {!isRelevantProperty('footType', prosthetic.type) &&
            getDisplayValue(
              prosthetic.footType,
              prosthetic.otherFootType,
              footTypeLabels
            ) && (
              <InfoItem
                icon={
                  <FontAwesome5
                    name='shoe-prints'
                    size={24}
                    color={Colors.primary}
                  />
                }
                label='Foot Type'
                value={
                  getDisplayValue(
                    prosthetic.footType,
                    prosthetic.otherFootType,
                    footTypeLabels
                  ) || ''
                }
              />
            )}

          {/* Knee Type (if not relevant but has value) */}
          {!isRelevantProperty('kneeType', prosthetic.type) &&
            getDisplayValue(
              prosthetic.kneeType,
              prosthetic.otherKneeType,
              kneeTypeLabels
            ) && (
              <InfoItem
                icon={
                  <FontAwesome5 name='bone' size={24} color={Colors.primary} />
                }
                label='Knee Type'
                value={
                  getDisplayValue(
                    prosthetic.kneeType,
                    prosthetic.otherKneeType,
                    kneeTypeLabels
                  ) || ''
                }
              />
            )}

          {/* Pelvic Socket (if not relevant but has value) */}
          {!isRelevantProperty('pelvicSocket', prosthetic.type) &&
            getDisplayValue(
              prosthetic.pelvicSocket,
              prosthetic.otherPelvicSocket,
              pelvicSocketLabels
            ) && (
              <InfoItem
                icon={
                  <FontAwesome5 name='ring' size={24} color={Colors.primary} />
                }
                label='Pelvic Socket'
                value={
                  getDisplayValue(
                    prosthetic.pelvicSocket,
                    prosthetic.otherPelvicSocket,
                    pelvicSocketLabels
                  ) || ''
                }
              />
            )}

          {/* Residual Limb Length (if not relevant but has value) */}
          {!isRelevantProperty('residualLimbLength', prosthetic.type) &&
            prosthetic.residualLimbLength && (
              <InfoItem
                icon={
                  <FontAwesome5 name='ruler' size={24} color={Colors.primary} />
                }
                label='Residual Limb Length'
                value={`${prosthetic.residualLimbLength} cm`}
              />
            )}

          {/* Grip Strength (if not relevant but has value) */}
          {!isRelevantProperty('gripStrength', prosthetic.type) &&
            prosthetic.gripStrength && (
              <InfoItem
                icon={
                  <FontAwesome5
                    name='hand-rock'
                    size={24}
                    color={Colors.primary}
                  />
                }
                label='Grip Strength'
                value={`${prosthetic.gripStrength} N`}
              />
            )}

          {/* Finger Position (if not relevant but has value) */}
          {!isRelevantProperty('fingerPosition', prosthetic.type) &&
            prosthetic.fingerPosition && (
              <InfoItem
                icon={
                  <FontAwesome5
                    name='hand-point-up'
                    size={24}
                    color={Colors.primary}
                  />
                }
                label='Finger Position'
                value={fingerPositionLabels[prosthetic.fingerPosition]}
              />
            )}

          {/* Toe Position (if not relevant but has value) */}
          {!isRelevantProperty('toePosition', prosthetic.type) &&
            prosthetic.toePosition && (
              <InfoItem
                icon={
                  <FontAwesome5 name='socks' size={24} color={Colors.primary} />
                }
                label='Toe Position'
                value={toePositionLabels[prosthetic.toePosition]}
              />
            )}

          {/* Suspension System (if not relevant but has value) */}
          {!isRelevantProperty('suspensionSystem', prosthetic.type) &&
            getDisplayValue(
              prosthetic.suspensionSystem,
              prosthetic.otherSuspensionSystem,
              suspensionSystemLabels
            ) && (
              <InfoItem
                icon={
                  <FontAwesome5 name='link' size={24} color={Colors.primary} />
                }
                label='Suspension System'
                value={
                  getDisplayValue(
                    prosthetic.suspensionSystem,
                    prosthetic.otherSuspensionSystem,
                    suspensionSystemLabels
                  ) || ''
                }
              />
            )}

          {/* Control System (if not relevant but has value) */}
          {!isRelevantProperty('controlSystem', prosthetic.type) &&
            getDisplayValue(
              prosthetic.controlSystem,
              prosthetic.otherControlSystem,
              controlSystemLabels
            ) && (
              <InfoItem
                icon={
                  <FontAwesome5
                    name='microchip'
                    size={24}
                    color={Colors.primary}
                  />
                }
                label='Control System'
                value={
                  getDisplayValue(
                    prosthetic.controlSystem,
                    prosthetic.otherControlSystem,
                    controlSystemLabels
                  ) || ''
                }
              />
            )}

          {/* Alignment (if not relevant but has value) */}
          {!isRelevantProperty('alignment', prosthetic.type) &&
            getDisplayValue(
              prosthetic.alignment,
              prosthetic.otherAlignment,
              alignmentLabels
            ) && (
              <InfoItem
                icon={
                  <FontAwesome5
                    name='ruler-combined'
                    size={24}
                    color={Colors.primary}
                  />
                }
                label='Alignment'
                value={
                  getDisplayValue(
                    prosthetic.alignment,
                    prosthetic.otherAlignment,
                    alignmentLabels
                  ) || ''
                }
              />
            )}

          {/* Socket Fit (if not relevant but has value) */}
          {!isRelevantProperty('socketFit', prosthetic.type) &&
            getDisplayValue(prosthetic.socketFit, null, socketFitLabels) && (
              <InfoItem
                icon={
                  <FontAwesome5
                    name='compress-arrows-alt'
                    size={24}
                    color={Colors.primary}
                  />
                }
                label='Socket Fit'
                value={
                  getDisplayValue(
                    prosthetic.socketFit,
                    null,
                    socketFitLabels
                  ) || ''
                }
              />
            )}

          {/* Range of Motion (if not relevant but has value) */}
          {(!isRelevantProperty('rangeOfMotionMin', prosthetic.type) ||
            !isRelevantProperty('rangeOfMotionMax', prosthetic.type)) &&
            prosthetic.rangeOfMotionMin !== null &&
            prosthetic.rangeOfMotionMax !== null && (
              <InfoItem
                icon={
                  <FontAwesome5
                    name='angle-double-right'
                    size={24}
                    color={Colors.primary}
                  />
                }
                label='Range of Motion'
                value={`${prosthetic.rangeOfMotionMin}° - ${prosthetic.rangeOfMotionMax}°`}
              />
            )}

          {/* Stiffness (if not relevant but has value) */}
          {!isRelevantProperty('stiffness', prosthetic.type) &&
            prosthetic.stiffness && (
              <InfoItem
                icon={
                  <FontAwesome5
                    name='compress'
                    size={24}
                    color={Colors.primary}
                  />
                }
                label='Stiffness'
                value={`${prosthetic.stiffness} N/m`}
              />
            )}

          {/* Shock Absorption (if not relevant but has value) */}
          {!isRelevantProperty('shockAbsorptionEnergy', prosthetic.type) &&
            prosthetic.shockAbsorptionEnergy && (
              <InfoItem
                icon={
                  <FontAwesome5 name='bolt' size={24} color={Colors.primary} />
                }
                label='Shock Absorption Energy'
                value={`${prosthetic.shockAbsorptionEnergy} J`}
              />
            )}
        </View>
      </>
    );
  };

  const renderDetailsSection = () => {
    if (!prosthetic || !prosthetic.details) return null;

    return (
      <View style={patientProfileStyles.sheetDetailsSection}>
        <View style={patientProfileStyles.infoItem}>
          <View style={patientProfileStyles.sheetDetailsIcon}>
            <FontAwesome5 name='info-circle' size={24} color={Colors.primary} />
          </View>
          <View style={patientProfileStyles.infoContent}>
            <Text style={patientProfileStyles.infoLabel}>Details</Text>
            <Text style={patientProfileStyles.sheetDetailsText}>
              {prosthetic.details}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!prosthetic) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={patientProfileStyles.sheetBackground}
      handleIndicatorStyle={patientProfileStyles.indicator}
      footerComponent={(props) => (
        <DetailsSheetFooter
          {...props}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          isPending={isPending}
        />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={patientProfileStyles.contentContainer}
        showsVerticalScrollIndicator={false}
        style={patientProfileStyles.sheetContainer}
      >
        {renderHeader()}
        {renderBasicDetails()}

        <View style={patientProfileStyles.separator} />

        {renderTypeSpecificProperties()}
        {renderOtherProperties()}
        {renderDetailsSection()}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
