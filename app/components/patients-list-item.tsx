import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useActionSheet } from '@expo/react-native-action-sheet';

import { SwipeableRow, SwipeAction } from './swipeable-row';

import type { PatientListItem } from '@/types';

interface PatientsListItemProps {
  patient: PatientListItem;
}

export default function PatientsListItem({ patient }: PatientsListItemProps) {
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();

  const onViewProfile = () => {
    router.push({
      pathname: '/patient/[id]',
      params: {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
      },
    });
  };

  const onUpdate = () => {
    console.log('Update Patient Details pressed');
  };

  const onDelete = () => {
    Alert.alert(
      `Delete ${patient.firstName} ${patient.lastName} Record`,
      `Are you sure you want to delete ${patient.firstName} ${patient.lastName} record? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => console.log('Deleting patient', patient.id),
        },
      ]
    );
  };

  const swipeActions: SwipeAction[] = [
    {
      text: 'More',
      color: '#8E8E93',
      icon: 'ellipsis-horizontal',
      onPress: () => {
        const options = [
          'View Patient Profile',
          'Update Patient Details',
          'Delete Patient',
          'Cancel',
        ];
        const destructiveButtonIndex = 2;
        const cancelButtonIndex = 3;

        showActionSheetWithOptions(
          {
            title: `Actions for ${patient.firstName} ${patient.lastName}`,
            options,
            cancelButtonIndex,
            destructiveButtonIndex,
          },
          (selectedIndex) => {
            switch (selectedIndex) {
              case 0:
                onViewProfile();
                break;

              case 1:
                onUpdate();
                break;

              case destructiveButtonIndex:
                onDelete();
                break;

              case cancelButtonIndex:
            }
          }
        );
      },
      platform: 'ios',
    },
    {
      text: 'Update',
      color: '#007AFF',
      icon: 'pencil',
      platform: 'android',
      onPress: onUpdate,
    },
    {
      text: 'Delete',
      color: '#ff3b30',
      icon: 'trash',
      platform: 'android',
      onPress: onDelete,
    },
  ];

  return (
    <SwipeableRow actions={swipeActions}>
      <TouchableOpacity
        style={styles.touchableOpacity}
        activeOpacity={0.6}
        onPress={onViewProfile}
      >
        <View style={styles.listItemContainer}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/205' }}
            style={styles.listItemImage}
          />
          <View>
            <Text style={styles.patientName}>
              {patient.firstName} {patient.lastName}
            </Text>
            {patient.email && (
              <Text style={styles.patientDetail}>{patient.email}</Text>
            )}
            {patient.phoneNumber && (
              <Text style={styles.patientDetail}>{patient.phoneNumber}</Text>
            )}
            <Text style={styles.patientDetail}>
              Age:{' '}
              {patient.birthDate
                ? new Date().getFullYear() -
                  new Date(patient.birthDate).getFullYear()
                : patient.age || 'N/A'}{' '}
              | Height: {patient.height} cm | Weight: {patient.weight} kg
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
    height: 80,
    marginTop: 10,
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  listItemImage: {
    width: 40,
    height: 40,
    borderRadius: 30,
  },
  patientName: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  patientDetail: {
    color: '#6E6E73',
    fontSize: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DCDCE2',
    marginLeft: 50,
  },
});
