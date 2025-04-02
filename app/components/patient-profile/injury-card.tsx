import { Text, TouchableOpacity, View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';

import { useInjuryStore } from '@/hooks/use-injury-store';
import { useInjuryFormStore } from '@/hooks/use-injury-form-store';
import { useDeleteInjury } from '@/hooks/use-delete-injury';

import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';
import { sideLabels, type Injury } from '@/types';

interface InjuryCardProps {
  injury: Injury;
}

export default function InjuryCard({ injury }: InjuryCardProps) {
  const { showInjuryDetails } = useInjuryStore();
  const { showInjuryForm } = useInjuryFormStore();

  const { handleDelete, isPending } = useDeleteInjury({
    id: injury.id,
    patientId: injury.patientId,
  });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isPending}>
        <TouchableOpacity
          style={patientProfileStyles.card}
          activeOpacity={0.6}
          // onPress={() => showInjuryDetails(injury)}
        >
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
        <ContextMenu.Item
          key={`details_inujury_${injury.id}`}
          onSelect={() => showInjuryDetails(injury)}
        >
          <ContextMenu.ItemTitle>Injury Details</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'info.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item
          key={`edit_inujury_${injury.id}`}
          onSelect={() => showInjuryForm(injury)}
        >
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
