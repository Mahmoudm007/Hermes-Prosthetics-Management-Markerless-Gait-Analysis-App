import { Text, TouchableOpacity, View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';

import { useMedicalConditionStore } from '@/hooks/use-medical-condition-store';
import { useDeleteMedicalCondition } from '@/hooks/use-delete-medical-condition';

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
  const { showMedicalConditionDetails } = useMedicalConditionStore();

  const { handleDelete, isPending } = useDeleteMedicalCondition({
    id: medicalCondition.id,
    patientId: medicalCondition.patientId,
  });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isPending}>
        <TouchableOpacity
          style={patientProfileStyles.card}
          activeOpacity={0.6}
          // onPress={() => showMedicalConditionDetails(medicalCondition)}
        >
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
          onSelect={() => showMedicalConditionDetails(medicalCondition)}
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
          onSelect={handleDelete}
        >
          <ContextMenu.ItemTitle>
            Delete Medical Condition
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
