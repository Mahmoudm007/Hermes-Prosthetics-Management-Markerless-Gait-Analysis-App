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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ImageView from 'react-native-image-viewing';
import { FlashList } from '@shopify/flash-list';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Fontisto,
  AntDesign,
  FontAwesome6,
} from '@expo/vector-icons';

import { MoreButton } from '@/components/more-button';
import InfoItem from '@/components/patient-profile/info-item';
import SectionHeader from '@/components/patient-profile/section-header';
import MedicalConditionCard from '@/components/patient-profile/medical-condition-card';
import InjuryCard from '@/components/patient-profile/injury-card';
import ProstheticCard from '@/components/patient-profile/prosthetic-card';
import ProstheticsBodyDiagram from '@/components/patient-profile/prosthetics-body-diagram';

import PatientFormSheet from '@/components/forms/patient-form-sheet';
import MedicalConditionDetailsSheet from '@/components/patient-profile/medical-condition-details-sheet';
import InjuryDetailsSheet from '@/components/patient-profile/injury-details-sheet';
import ProstheticDetailsSheet from '@/components/patient-profile/prosthetic-details-sheet';
import MedicalConditionFormSheet from '@/components/forms/medical-condition-form-sheet';
import InjuryFormSheet from '@/components/forms/injury-form-sheet';
import ProstheticFormSheet from '@/components/forms/prosthetic-form-sheet';

import { useDeletePatient } from '@/hooks/use-delete-patient';
import { useMedicalConditionStore } from '@/hooks/use-medical-condition-store';
import { useInjuryStore } from '@/hooks/use-injury-store';
import { useProstheticStore } from '@/hooks/use-prosthetic-store';
import { useMedicalConditionFormStore } from '@/hooks/use-medical-condition-form-store';
import { useInjuryFormStore } from '@/hooks/use-injury-form-store';
import { useProstheticFormStore } from '@/hooks/use-prosthetic-form-store';

import { axiosClient } from '@/lib/axios';
import { patientProfileStyles } from '@/constants/patient-profile-styles';
import { Colors } from '@/constants/Colors';
import {
  limbDominanceIcons,
  type Patient,
  type MedicalCondition,
  type Injury,
  type Prosthetic,
  Sex,
  sexIcons,
  sexLabels,
  GaitSessionListItem,
} from '@/types';
import GaitSessionFormSheet from '@/components/forms/gait-session-form-sheet';
import GaitSessionCard from '@/components/patient-profile/gait-session-card';

const EmptyListComponent = ({ message }: { message: string }) => (
  <View style={patientProfileStyles.emptyListContainer}>
    <Text style={patientProfileStyles.emptyListText}>{message}</Text>
  </View>
);

export default function PatientProfile() {
  const { id, name } = useLocalSearchParams();
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [isPatientFormVisible, setIsPatientFormVisible] = useState(false);
  const [isGaitSessionFormVisible, setIsGaitSessionFormVisible] =
    useState(false);

  const navigation = useNavigation();
  const queryClient = useQueryClient();

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

  const { handleDelete, isPending: isDeleting } = useDeletePatient({
    id: +id,
    callbackFn: () => {
      navigation.goBack();
      queryClient.invalidateQueries({ queryKey: ['patients_'] });
    },
  });

  const {
    selectedMedicalCondition,
    isMedicalConditionDetailsSheetVisible,
    hideMedicalConditionDetails,
    reset: resetMedicalConditionStore,
  } = useMedicalConditionStore();

  const {
    selectedFormMedicalCondition,
    isMedicalConditionFormVisible,
    showMedicalConditionForm,
    hideMedicalConditionForm,
    resetMedicalConditionForm,
  } = useMedicalConditionFormStore();

  const {
    selectedInjury,
    isInjuryDetailsSheetVisible,
    hideInjuryDetails,
    reset: resetInjuryStore,
  } = useInjuryStore();

  const {
    selectedFormInjury,
    isInjuryFormVisible,
    showInjuryForm,
    hideInjuryForm,
    resetInjuryForm,
  } = useInjuryFormStore();

  const {
    selectedProsthetic,
    isProstheticDetailsSheetVisible,
    hideProstheticDetails,
    reset: resetProstheticStore,
  } = useProstheticStore();

  const {
    selectedFormProsthetic,
    isProstheticFormVisible,
    showProstheticForm,
    hideProstheticForm,
    resetProstheticForm,
  } = useProstheticFormStore();

  const renderMedicalCondition = ({ item }: { item: MedicalCondition }) => (
    <MedicalConditionCard medicalCondition={item} />
  );

  const renderInjury = ({ item }: { item: Injury }) => (
    <InjuryCard injury={item} />
  );

  const renderProsthetic = ({ item }: { item: Prosthetic }) => (
    <ProstheticCard prosthetic={item} />
  );

  const renderGaitSession = ({ item }: { item: GaitSessionListItem }) => (
    <GaitSessionCard session={item} />
  );

  useEffect(() => {
    if (id) {
      resetMedicalConditionStore();
      resetMedicalConditionForm();
      resetInjuryStore();
      resetInjuryForm();
      resetProstheticStore();
      resetProstheticForm();
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
                    onSelect: () => setIsPatientFormVisible(true),
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
                            onPress: handleDelete,
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
                    onSelect: () => showMedicalConditionForm(null),
                  },
                  {
                    key: `new_injury_${id}`,
                    title: 'Add Injury',
                    icon: 'plus.circle',
                    onSelect: () => showInjuryForm(null),
                  },
                  {
                    key: `new_prosthetic_${id}`,
                    title: 'Add Prosthetic',
                    icon: 'plus.circle',
                    onSelect: () => showProstheticForm(null),
                  },
                  {
                    key: `new_gait_session_${id}`,
                    title: 'Add Gait Session',
                    icon: 'plus.circle',
                    onSelect: () => setIsGaitSessionFormVisible(true),
                  },
                ],
              },
            ]}
            disabled={isLoading || isDeleting}
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
            disabled={!patient.imageUrl}
          >
            <Image
              source={
                patient.imageUrl
                  ? { uri: patient.imageUrl }
                  : require('@/assets/images/user-placeholder.png')
              }
              style={patientProfileStyles.avatar}
            />
          </TouchableOpacity>
          <Text style={patientProfileStyles.patientName}>
            {patient.firstName} {patient.lastName}
          </Text>

          <ImageView
            images={[{ uri: patient.imageUrl }]}
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
                <FontAwesome6
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
        <View style={patientProfileStyles.listContainer}>
          <FlashList
            data={patient.medicalConditions}
            renderItem={renderMedicalCondition}
            estimatedItemSize={150}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <EmptyListComponent message='No medical conditions recorded' />
            }
            horizontal={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Separator */}
        <View style={patientProfileStyles.separator} />

        {/* Injuries Section */}
        <SectionHeader
          title='Injuries'
          icon={<Fontisto name='bandage' size={24} color={Colors.secondary} />}
        />
        <View style={patientProfileStyles.listContainer}>
          <FlashList
            data={patient.injuries}
            renderItem={renderInjury}
            estimatedItemSize={150}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <EmptyListComponent message='No injuries recorded' />
            }
            horizontal={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
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

        <View style={patientProfileStyles.listContainer}>
          <FlashList
            data={patient.prosthetics}
            renderItem={renderProsthetic}
            estimatedItemSize={150}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <EmptyListComponent message='No prosthetics recorded' />
            }
            horizontal={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{
              paddingTop: patient.sex === Sex.Male ? 0 : 10,
            }}
          />
        </View>

        {/* Gait Sessions Section */}
        <SectionHeader
          title='Gait Sessions'
          icon={
            <FontAwesome5 name='walking' size={24} color={Colors.primary} />
          }
        />
        <View style={patientProfileStyles.listContainer}>
          <FlashList
            data={patient.gaitSessions}
            renderItem={renderGaitSession}
            estimatedItemSize={150}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <EmptyListComponent message='No gait sessions recorded' />
            }
            horizontal={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <PatientFormSheet
        isVisible={isPatientFormVisible}
        onClose={() => setIsPatientFormVisible(false)}
        patientId={+id}
        onSuccess={() => setIsPatientFormVisible(false)}
      />

      <MedicalConditionDetailsSheet
        medicalCondition={selectedMedicalCondition}
        isVisible={isMedicalConditionDetailsSheetVisible}
        onClose={hideMedicalConditionDetails}
      />

      <MedicalConditionFormSheet
        medicalCondition={selectedFormMedicalCondition}
        patientId={patient.id}
        isVisible={isMedicalConditionFormVisible}
        onClose={hideMedicalConditionForm}
      />

      <InjuryDetailsSheet
        injury={selectedInjury}
        isVisible={isInjuryDetailsSheetVisible}
        onClose={hideInjuryDetails}
      />

      <InjuryFormSheet
        injury={selectedFormInjury}
        patientId={patient.id}
        isVisible={isInjuryFormVisible}
        onClose={hideInjuryForm}
      />

      <ProstheticDetailsSheet
        prosthetic={selectedProsthetic}
        isVisible={isProstheticDetailsSheetVisible}
        onClose={hideProstheticDetails}
      />

      <ProstheticFormSheet
        prosthetic={selectedFormProsthetic}
        patientId={patient.id}
        isVisible={isProstheticFormVisible}
        onClose={hideProstheticForm}
        patientProsthetics={patient.prosthetics}
      />

      <GaitSessionFormSheet
        isVisible={isGaitSessionFormVisible}
        onClose={() => setIsGaitSessionFormVisible(false)}
        patientId={patient.id}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: [`patient_${id}`],
          });
          setIsGaitSessionFormVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
