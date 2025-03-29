import { Alert, Text, TouchableOpacity, View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';
import { toast } from 'sonner-native';

import { axiosClient } from '@/lib/axios';
import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';
import {
  severityLabels,
  treatmentStatusLabels,
  type MedicalCondition,
} from '@/types';

interface MedicalConditionCardProps {
  medicalCondition: MedicalCondition;
}

export default function MedicalConditionCard({
  medicalCondition,
}: MedicalConditionCardProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteMedicalCondition, isPending } = useMutation({
    mutationFn: async () => {
      return await axiosClient.delete<MedicalCondition>(
        `medical-conditions/${medicalCondition.id}`
      );
    },
    onError: () => {
      return toast.error('Failed to delete this medical condition');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`patient_${medicalCondition.patientId}`],
      });
      return toast.success('Medical condition deleted successfully');
    },
  });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isPending}>
        <TouchableOpacity style={patientProfileStyles.card} activeOpacity={0.6}>
          <View style={patientProfileStyles.cardHeader}>
            <FontAwesome5
              name='file-medical'
              size={20}
              color={Colors.tertiary}
            />
            <Text style={patientProfileStyles.cardTitle}>
              {medicalCondition.medicalConditionName}
            </Text>
          </View>
          <View style={patientProfileStyles.cardContent}>
            {(medicalCondition.diagnosisDate ||
              medicalCondition.diagnosisYear) && (
              <Text style={patientProfileStyles.cardDetail}>
                Diagnosed on:{' '}
                {medicalCondition.diagnosisDate
                  ? format(
                      new Date(medicalCondition.diagnosisDate),
                      'dd MMMM yyyy'
                    )
                  : medicalCondition.diagnosisYear}{' '}
                (
                {formatDistanceToNow(
                  new Date(
                    medicalCondition.diagnosisDate ||
                      `${medicalCondition.diagnosisYear}-01-01`
                  )
                )}
                )
              </Text>
            )}
            <Text style={patientProfileStyles.cardDetail}>
              Severity: {severityLabels[medicalCondition.severity]}
            </Text>
            <Text style={patientProfileStyles.cardDetail}>
              Status: {treatmentStatusLabels[medicalCondition.treatmentStatus]}
            </Text>
          </View>
        </TouchableOpacity>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label />
        <ContextMenu.Item
          key={`details_medical_condition_${medicalCondition.id}`}
        >
          <ContextMenu.ItemTitle>
            Medical Condition Details
          </ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'info.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item key={`edit_medical_condition_${medicalCondition.id}`}>
          <ContextMenu.ItemTitle>Edit Medical Condition</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'pencil.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item
          key={`delete_medical_condition_${medicalCondition.id}`}
          onSelect={() => {
            Alert.alert(
              'Delete Medical Condition',
              'Are you sure you want to delete this medical condition?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteMedicalCondition(),
                },
              ]
            );
          }}
        >
          <ContextMenu.ItemTitle>
            Medical Condition Details
          </ContextMenu.ItemTitle>
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
