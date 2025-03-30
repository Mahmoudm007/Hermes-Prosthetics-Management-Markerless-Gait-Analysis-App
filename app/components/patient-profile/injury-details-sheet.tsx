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

import { useDeleteInjury } from '@/hooks/use-delete-injury';
import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';

import { sideLabels, type Injury } from '@/types';

interface InjuryDetailsSheetProps {
  injury: Injury | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function InjuryDetailsSheet({
  injury,
  isVisible,
  onClose,
}: InjuryDetailsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['70%', '85%'], []);

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

  const { handleDelete, isPending } = useDeleteInjury({
    id: injury?.id,
    patientId: injury?.patientId,
    callbackFn: onClose,
  });

  const handleUpdate = () => {
    if (!injury) return;
    console.log('Updating injury', injury.id);
  };

  const formatInjuryDate = () => {
    if (!injury) return '';

    if (injury.injuryDate) {
      return format(new Date(injury.injuryDate), 'dd MMMM yyyy');
    } else if (injury.injuryYear) {
      return injury.injuryYear.toString();
    }
    return 'Unknown';
  };

  const formatTimeSince = () => {
    if (!injury) return '';

    if (injury.injuryDate || injury.injuryYear) {
      return formatDistanceToNow(
        new Date(injury.injuryDate || `${injury.injuryYear}-01-01`)
      );
    }
    return '';
  };

  if (!injury) return null;

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
          <FontAwesome5 name='band-aid' size={28} color={Colors.secondary} />
          <Text style={patientProfileStyles.title}>{injury.injuryType}</Text>
        </View>

        <View style={patientProfileStyles.sheetInfoSection}>
          {(injury.injuryDate || injury.injuryYear) && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='calendar-alt'
                  size={24}
                  color={Colors.secondary}
                />
              }
              label='Date of Injury'
              value={`${formatInjuryDate()} ${
                formatTimeSince() ? ` (${formatTimeSince()})` : ''
              }`}
            />
          )}

          <InfoItem
            icon={
              <FontAwesome5
                name='arrows-alt-h'
                size={24}
                color={Colors.secondary}
              />
            }
            label='Side'
            value={sideLabels[injury.side]}
          />

          {injury.currentImpact && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='impact'
                  size={24}
                  color={Colors.secondary}
                />
              }
              label='Current Impact'
              value={injury.currentImpact}
            />
          )}

          {typeof injury.treated === 'boolean' && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='check-circle'
                  size={24}
                  color={Colors.secondary}
                />
              }
              label='Treatment Status'
              value={injury.treated ? 'Treated' : 'Not Treated'}
            />
          )}

          {injury.treatmentMethod && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='procedures'
                  size={24}
                  color={Colors.secondary}
                />
              }
              label='Treatment Method'
              value={injury.treatmentMethod}
            />
          )}

          {injury.details && (
            <View style={patientProfileStyles.sheetDetailsSection}>
              <View style={patientProfileStyles.infoItem}>
                <View style={patientProfileStyles.sheetDetailsIcon}>
                  <FontAwesome5
                    name='info-circle'
                    size={24}
                    color={Colors.secondary}
                  />
                </View>
                <View style={patientProfileStyles.infoContent}>
                  <Text style={patientProfileStyles.infoLabel}>Details</Text>
                  <Text style={patientProfileStyles.sheetDetailsText}>
                    {injury.details}
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
