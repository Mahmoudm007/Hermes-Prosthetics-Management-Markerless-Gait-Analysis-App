import { useCallback, useMemo, useRef } from 'react';
import { View, Text } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { format, formatDistanceToNow } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';

import InfoItem from './info-item';
import DetailsSheetFooter from './details-sheet-footer';

import { useMedicalConditionFormStore } from '@/hooks/use-medical-condition-form-store';
import { useDeleteMedicalCondition } from '@/hooks/use-delete-medical-condition';
import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';

import {
  severityLabels,
  treatmentStatusLabels,
  type MedicalCondition,
} from '@/types';

interface MedicalConditionDetailsSheetProps {
  medicalCondition: MedicalCondition | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function MedicalConditionDetailsSheet({
  medicalCondition,
  isVisible,
  onClose,
}: MedicalConditionDetailsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['60%', '85%'], []);

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

  const { showMedicalConditionForm } = useMedicalConditionFormStore();

  const { handleDelete, isPending } = useDeleteMedicalCondition({
    id: medicalCondition?.id,
    patientId: medicalCondition?.patientId,
    callbackFn: onClose,
  });

  const handleUpdate = () => {
    if (!medicalCondition) return;
    showMedicalConditionForm(medicalCondition);
  };

  const formatDiagnosisDate = () => {
    if (!medicalCondition) return '';

    if (medicalCondition.diagnosisDate) {
      return format(new Date(medicalCondition.diagnosisDate), 'dd MMMM yyyy');
    } else if (medicalCondition.diagnosisYear) {
      return medicalCondition.diagnosisYear.toString();
    }
    return 'Unknown';
  };

  const formatTimeSince = () => {
    if (!medicalCondition) return '';

    if (medicalCondition.diagnosisDate || medicalCondition.diagnosisYear) {
      return formatDistanceToNow(
        new Date(
          medicalCondition.diagnosisDate ||
            `${medicalCondition.diagnosisYear}-01-01`
        )
      );
    }
    return '';
  };

  if (!medicalCondition) return null;

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
        <View style={patientProfileStyles.header}>
          <FontAwesome5 name='file-medical' size={28} color={Colors.tertiary} />
          <Text style={patientProfileStyles.title}>
            {medicalCondition.medicalConditionName}
          </Text>
        </View>

        <View style={patientProfileStyles.sheetInfoSection}>
          <InfoItem
            icon={
              <FontAwesome5
                name='calendar-alt'
                size={24}
                color={Colors.tertiary}
              />
            }
            label='Diagnosed on'
            value={`${formatDiagnosisDate()} ${
              formatTimeSince() ? ` (${formatTimeSince()})` : ''
            }`}
          />

          <InfoItem
            icon={
              <FontAwesome5
                name='exclamation-triangle'
                size={24}
                color={Colors.tertiary}
              />
            }
            label='Severity'
            value={severityLabels[medicalCondition.severity]}
          />

          <InfoItem
            icon={
              <FontAwesome5
                name='heartbeat'
                size={24}
                color={Colors.tertiary}
              />
            }
            label='Treatment Status'
            value={treatmentStatusLabels[medicalCondition.treatmentStatus]}
          />

          {medicalCondition.details && (
            <View style={patientProfileStyles.sheetDetailsSection}>
              <View style={patientProfileStyles.infoItem}>
                <View style={patientProfileStyles.sheetDetailsIcon}>
                  <FontAwesome5
                    name='info-circle'
                    size={24}
                    color={Colors.tertiary}
                  />
                </View>
                <View style={patientProfileStyles.infoContent}>
                  <Text style={patientProfileStyles.infoLabel}>Details</Text>
                  <Text style={patientProfileStyles.sheetDetailsText}>
                    {medicalCondition.details}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
