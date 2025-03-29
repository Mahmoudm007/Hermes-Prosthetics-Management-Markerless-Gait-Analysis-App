import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import ImageView from 'react-native-image-viewing';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Fontisto,
  AntDesign,
} from '@expo/vector-icons';

import InfoItem from '@/components/patient-profile/info-item';
import SectionHeader from '@/components/patient-profile/section-header';
import MedicalConditionCard from '@/components/patient-profile/medical-condition-card';
import InjuryCard from '@/components/patient-profile/injury-card';
import ProstheticCard from '@/components/patient-profile/prosthetic-card';
import ProstheticsBodyDiagram from '@/components/patient-profile/prosthetics-body-diagram';

import { axiosClient } from '@/lib/axios';
import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';
import {
  limbDominanceIcons,
  type Patient,
  Sex,
  sexIcons,
  sexLabels,
} from '@/types';
import { MoreButton } from '@/components/more-button';

export default function PatientProfile() {
  const { id, name } = useLocalSearchParams();
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const navigation = useNavigation();

  const {
    data: patient,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [`patient_${id}`],
    queryFn: async () => {
      const data = await axiosClient.get<Patient>(`patients/${id}`);
      return data.data;
    },
  });

  useEffect(() => {
    if (id) {
      navigation.setOptions({
        headerRight: () => (
          <MoreButton
            menuConfig={[
              {
                title: 'Actions',
                items: [
                  {
                    key: `edit_${id}`,
                    title: 'Update Details',
                    icon: 'info.circle',
                    onSelect: () => console.log('Updating patient', id),
                  },
                  {
                    key: `delete_${id}`,
                    title: 'Delete Patient',
                    icon: 'trash',
                    style: { color: Colors.primary },
                    onSelect: () =>
                      Alert.alert(
                        'Delete Patient',
                        'Are you sure you want to delete this patient?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Delete',
                            onPress: () => console.log('Deleting patient', id),
                          },
                        ]
                      ),
                  },
                ],
              },
              {
                title: 'Add New',
                items: [
                  {
                    key: `new_medical_condition_${id}`,
                    title: 'Add Medical Condition',
                    icon: 'plus.circle',
                    onSelect: () => console.log('Adding medical condition', id),
                  },
                  {
                    key: `new_injury_${id}`,
                    title: 'Add Injury',
                    icon: 'plus.circle',
                    onSelect: () => console.log('Adding injury', id),
                  },
                  {
                    key: `new_prosthetic_${id}`,
                    title: 'Add Prosthetic',
                    icon: 'plus.circle',
                    onSelect: () => console.log('Adding prosthetic', id),
                  },
                ],
              },
            ]}
          />
        ),
      });
    }
  }, [id]);

  useEffect(() => {
    if (name) {
      navigation.setOptions({
        title: name,
      });
    }
  }, [name]);

  if (!patient || isLoading) {
    // TODO: Make proper loading screen
    return (
      <SafeAreaView style={patientProfileStyles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={patientProfileStyles.container}>
      <ScrollView
        contentContainerStyle={patientProfileStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Avatar Section */}
        <View style={patientProfileStyles.avatarContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setIsImageViewVisible(true)}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/205' }}
              style={patientProfileStyles.avatar}
            />
          </TouchableOpacity>
          <Text style={patientProfileStyles.patientName}>
            {patient.firstName} {patient.lastName}
          </Text>

          <ImageView
            images={[{ uri: 'https://i.pravatar.cc/205' }]}
            imageIndex={0}
            visible={isImageViewVisible}
            onRequestClose={() => setIsImageViewVisible(false)}
            swipeToCloseEnabled
            doubleTapToZoomEnabled
          />
        </View>

        {/* Basic Info Section */}
        <View style={patientProfileStyles.infoSection}>
          {patient.email && (
            <InfoItem
              icon={<Ionicons name='mail' size={24} color={Colors.primary} />}
              label='Email'
              value={patient.email}
            />
          )}
          {patient.phoneNumber && (
            <InfoItem
              icon={<Ionicons name='call' size={24} color={Colors.primary} />}
              label='Phone'
              value={patient.phoneNumber}
            />
          )}
          {(patient.birthDate || patient.age) && (
            <InfoItem
              icon={
                <FontAwesome5
                  name='calendar-alt'
                  size={24}
                  color={Colors.primary}
                />
              }
              label={patient.birthDate ? 'Birth Date' : 'Age'}
              value={
                patient.birthDate
                  ? `${patient.birthDate} (${patient.age} years)`
                  : `${patient.age} years`
              }
            />
          )}
          {patient.sex && (
            <InfoItem
              icon={
                <FontAwesome5
                  name={sexIcons[patient.sex]}
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Sex'
              value={sexLabels[patient.sex]}
            />
          )}

          {patient.height && (
            <InfoItem
              icon={
                <MaterialCommunityIcons
                  name='human-male-height'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Height'
              value={`${patient.height} cm`}
            />
          )}

          {patient.weight && (
            <InfoItem
              icon={
                <MaterialCommunityIcons
                  name='weight-kilogram'
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Weight'
              value={`${patient.weight} kg`}
            />
          )}

          {patient.limbDominance && (
            <InfoItem
              icon={
                <FontAwesome5
                  name={limbDominanceIcons[patient.limbDominance]}
                  size={24}
                  color={Colors.primary}
                />
              }
              label='Limb Dominance'
              value={patient.limbDominance}
            />
          )}
          {patient.ssn && (
            <InfoItem
              icon={
                <AntDesign name='idcard' size={24} color={Colors.primary} />
              }
              label='SSN'
              value={patient.ssn}
            />
          )}
        </View>

        {/* Separator */}
        <View style={patientProfileStyles.separator} />

        {/* Medical Conditions Section */}
        <SectionHeader
          title='Medical Conditions'
          icon={
            <FontAwesome5
              name='notes-medical'
              size={24}
              color={Colors.tertiary}
            />
          }
        />
        <View style={patientProfileStyles.cardsContainer}>
          {patient.medicalConditions.map((medicalCondition) => (
            <MedicalConditionCard
              key={medicalCondition.id}
              medicalCondition={medicalCondition}
            />
          ))}
        </View>

        {/* Separator */}
        <View style={patientProfileStyles.separator} />

        {/* Injuries Section */}
        <SectionHeader
          title='Injuries'
          icon={<Fontisto name='bandage' size={24} color={Colors.secondary} />}
        />
        <View style={patientProfileStyles.cardsContainer}>
          {patient.injuries.map((injury) => (
            <InjuryCard key={injury.id} injury={injury} />
          ))}
        </View>

        {/* Separator */}
        <View style={patientProfileStyles.separator} />

        {/* Prosthetics Section */}
        <SectionHeader
          title='Prosthetics'
          icon={
            <FontAwesome5 name='wheelchair' size={24} color={Colors.primary} />
          }
        />
        <ProstheticsBodyDiagram
          prosthetics={patient.prosthetics}
          sex={patient.sex}
        />

        <View
          style={{
            ...patientProfileStyles.cardsContainer,
            padding: 0,
            marginTop: patient.sex === Sex.Male ? -20 : -10,
          }}
        >
          {patient.prosthetics.map((prosthetic) => (
            <ProstheticCard key={prosthetic.id} prosthetic={prosthetic} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
