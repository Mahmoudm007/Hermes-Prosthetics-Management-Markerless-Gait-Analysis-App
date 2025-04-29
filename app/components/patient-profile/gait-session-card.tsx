import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useDeleteSession } from '@/hooks/use-delete-session';
import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';
import {
  analysisStatusColors,
  analysisStatusLabels,
  GaitSessionListItem,
} from '@/types';

interface GaitSessionCardProps {
  session: GaitSessionListItem;
}

export default function GaitSessionCard({ session }: GaitSessionCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { handleDelete, isPending } = useDeleteSession({
    id: session.id,
    callbackFn: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions_'] });
    },
  });

  const onViewSession = () => {
    router.push({
      pathname: '/session/[id]',
      params: {
        id: session.id,
        title: session.title || `Session ${session.id}`,
      },
    });
  };

  const formattedDate = session.sessionDate
    ? format(new Date(session.sessionDate), 'dd MMMM yyyy')
    : format(new Date(session.createdAt), 'dd MMMM yyyy');

  const timeAgo = session.sessionDate
    ? formatDistanceToNow(new Date(session.sessionDate))
    : formatDistanceToNow(new Date(session.createdAt));

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isPending}>
        <TouchableOpacity
          style={patientProfileStyles.card}
          activeOpacity={0.6}
          onPress={onViewSession}
        >
          <View style={patientProfileStyles.cardHeader}>
            <FontAwesome5 name='walking' size={20} color={Colors.secondary} />
            <Text style={patientProfileStyles.cardTitle}>
              {session.title || `Session ${session.id}`}
            </Text>
          </View>
          <View style={patientProfileStyles.cardContent}>
            <Text style={patientProfileStyles.cardDetail}>
              Date: {formattedDate} ({timeAgo})
            </Text>
            <Text style={patientProfileStyles.cardDetail}>
              Status: {analysisStatusLabels[session.analysisStatus]}
            </Text>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: analysisStatusColors[session.analysisStatus],
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label />
        <ContextMenu.Item
          key={`details_session_${session.id}`}
          onSelect={onViewSession}
        >
          <ContextMenu.ItemTitle>Session Details</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'info.circle',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item
          key={`delete_session_${session.id}`}
          onSelect={handleDelete}
        >
          <ContextMenu.ItemTitle>Delete Session</ContextMenu.ItemTitle>
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

const styles = StyleSheet.create({
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
