import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { SwipeableRow, type SwipeAction } from '@/components/swipeable-row';
import { useDeleteSession } from '@/hooks/use-delete-session';

import { Colors } from '@/constants/Colors';
import {
  analysisStatusColors,
  analysisStatusLabels,
  GaitSessionListItem,
} from '@/types';

interface SessionsListItemProps {
  session: GaitSessionListItem;
}

export default function SessionsListItem({ session }: SessionsListItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showActionSheetWithOptions } = useActionSheet();

  const onViewSession = () => {
    router.push({
      pathname: '/session/[id]',
      params: {
        id: session.id,
        title: session.title || `Session ${session.id}`,
      },
    });
  };

  const { handleDelete, isPending: isDeleting } = useDeleteSession({
    id: session.id,
    callbackFn: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions_'] });
    },
  });

  const swipeActions: SwipeAction[] = [
    {
      text: 'More',
      color: Colors.dark,
      icon: 'ellipsis-horizontal',
      onPress: () => {
        const options = ['View Session Details', 'Delete Session', 'Cancel'];
        const destructiveButtonIndex = 1;
        const cancelButtonIndex = 2;

        showActionSheetWithOptions(
          {
            title: `Actions for ${session.title || `Session ${session.id}`}`,
            options,
            cancelButtonIndex,
            destructiveButtonIndex,
          },
          (selectedIndex) => {
            switch (selectedIndex) {
              case 0:
                onViewSession();
                break;

              case destructiveButtonIndex:
                handleDelete();
                break;

              case cancelButtonIndex:
                break;
            }
          }
        );
      },
      platform: 'ios',
      disabled: isDeleting,
    },
    {
      text: 'Delete',
      color: Colors.tertiary,
      icon: 'trash',
      platform: 'android',
      onPress: handleDelete,
      disabled: isDeleting,
    },
  ];

  const patientName = `${session.patient.firstName} ${session.patient.lastName}`;

  const formattedDate = session.sessionDate
    ? format(new Date(session.sessionDate), 'MMM d, yyyy')
    : format(new Date(session.createdAt), 'MMM d, yyyy');

  return (
    <SwipeableRow actions={swipeActions}>
      <TouchableOpacity
        style={styles.touchableOpacity}
        activeOpacity={0.6}
        onPress={onViewSession}
        disabled={isDeleting}
      >
        <View style={styles.listItemContainer}>
          <Image
            source={
              session.patient?.imageUrl
                ? { uri: session.patient.imageUrl }
                : require('@/assets/images/user-placeholder.png')
            }
            style={styles.listItemImage}
          />
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.sessionTitle} numberOfLines={1}>
                {session.title || `Session ${session.id}`}
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      analysisStatusColors[session.analysisStatus],
                  },
                ]}
              />
            </View>
            <Text style={styles.patientName}>Patient: {patientName}</Text>
            <Text style={styles.sessionDetail}>
              {formattedDate} • {analysisStatusLabels[session.analysisStatus]}
            </Text>
          </View>
        </View>
        <View style={styles.separator} />
      </TouchableOpacity>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  touchableOpacity: {
    flex: 1,
    marginTop: 10,
    overflow: 'hidden',
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  listItemImage: {
    width: 40,
    height: 40,
    borderRadius: 30,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '500',
  },
  sessionDetail: {
    color: Colors.lightText,
    fontSize: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.lightBorder,
    marginLeft: 50,
  },
});
