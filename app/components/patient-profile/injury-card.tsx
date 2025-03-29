import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ContextMenu from 'zeego/context-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';
import { toast } from 'sonner-native';

import { axiosClient } from '@/lib/axios';
import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';
import { sideLabels, type Injury } from '@/types';

interface InjuryCardProps {
  injury: Injury;
}

export default function InjuryCard({ injury }: InjuryCardProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteInjury, isPending } = useMutation({
    mutationFn: async () => {
      return await axiosClient.delete<Injury>(`injuries/${injury.id}`);
    },
    onError: () => {
      return toast.error('Failed to delete this injury');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`patient_${injury.patientId}`],
      });
      return toast.success('Injury deleted successfully');
    },
  });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isPending}>
        <TouchableOpacity style={patientProfileStyles.card} activeOpacity={0.6}>
          <View style={patientProfileStyles.cardHeader}>
            <FontAwesome5 name='band-aid' size={20} color={Colors.secondary} />
            <Text style={patientProfileStyles.cardTitle}>
              {injury.injuryType}
            </Text>
          </View>
          <View style={patientProfileStyles.cardContent}>
            {(injury.injuryDate || injury.injuryYear) && (
              <Text style={patientProfileStyles.cardDetail}>
                Date:{' '}
                {injury.injuryDate
                  ? format(new Date(injury.injuryDate), 'dd MMMM yyyy')
                  : injury.injuryYear}{' '}
                (
                {formatDistanceToNow(
                  new Date(injury.injuryDate || `${injury.injuryYear}-01-01`)
                )}
                )
              </Text>
            )}
            <Text style={patientProfileStyles.cardDetail}>
              Side: {sideLabels[injury.side]}
            </Text>
            {injury.currentImpact && (
              <Text style={patientProfileStyles.cardDetail}>
                Impact: {injury.currentImpact}
              </Text>
            )}
            {typeof injury.treated === 'boolean' && (
              <Text style={patientProfileStyles.cardDetail}>
                {injury.treated ? 'Treated' : 'Not Treated'}
              </Text>
            )}
            {injury.treatmentMethod && (
              <Text style={patientProfileStyles.cardDetail}>
                Treatment Method: {injury.treatmentMethod}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label />
        <ContextMenu.Item key={`details_inujury_${injury.id}`}>
          <ContextMenu.ItemTitle>Injury Details</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'info.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item key={`edit_inujury_${injury.id}`}>
          <ContextMenu.ItemTitle>Edit Prosthetic</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'pencil.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item
          key={`delete_inujury_${injury.id}`}
          onSelect={() => {
            Alert.alert(
              'Delete Injury',
              'Are you sure you want to delete this injury?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  onPress: () => deleteInjury(),
                },
              ]
            );
          }}
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
