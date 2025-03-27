import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { SwipeableRow, SwipeAction } from './swipeable-row';

import type { PatientListItem } from '@/types';

interface PatientsListItemProps {
  patient: PatientListItem;
}

export default function PatientsListItem({ patient }: PatientsListItemProps) {
  const router = useRouter();

  const swipeActions: SwipeAction[] = [
    {
      text: 'Update',
      color: '#007AFF',
      icon: 'pencil',
      onPress: () => console.log('Update pressed'),
    },
    {
      text: 'Delete',
      color: '#ff3b30',
      icon: 'trash',
      onPress: () => console.log('Delete pressed'),
    },
  ];

  return (
    <SwipeableRow actions={swipeActions}>
      <TouchableOpacity
        style={styles.touchableOpacity}
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: '/patient/[id]',
            params: { id: patient.id },
          });
        }}
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
