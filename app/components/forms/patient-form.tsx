import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontAwesome5 } from '@expo/vector-icons';
import { toast } from 'sonner-native';

import FormField from '@/components/ui/form/form-field';
import FormInput from '@/components/ui/form/form-input';
import SelectOption from '@/components/ui/form/select-option';
import DateNumberSelector from '../ui/form/date-number-selector';
import ImagePickerInputProps, {
  type ImageData,
} from '@/components/ui/form/image-picker-input';

import { axiosClient } from '@/lib/axios';
import { uploadToCloudinary } from '@/lib/cloudinary-uploader';

import { formSheetStyles } from '@/constants/form-sheet-styles';
import { Colors } from '@/constants/Colors';

import {
  Sex,
  sexLabels,
  LimbDominance,
  limbDominanceLabels,
  type Patient,
} from '@/types';
import FormSheetFooter from './form-sheet-footer';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(255),
  lastName: z.string().min(1, 'Last name is required').max(255),
  ssn: z.string().nullable().optional(),
  email: z.string().email('Invalid email address').nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  sex: z.nativeEnum(Sex),
  birthDate: z.date().nullable().optional(),
  age: z.number().min(0).max(120).nullable().optional(),
  height: z.number().min(1, 'Height must be greater than 0'),
  weight: z.number().min(1, 'Weight must be greater than 0'),
  limbDominance: z.nativeEnum(LimbDominance),
  imageUrl: z.string().nullable().optional(),
});

export type PatientFormData = z.infer<typeof formSchema>;

export interface PatientFormHandles {
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
  isPending: boolean;
}

interface PatientFormProps {
  patientId?: number | null;
  onClose?: () => void;
  displayMode?: 'screen' | 'sheet';
  onSuccess?: () => void;
}

const PatientForm = forwardRef<PatientFormHandles, PatientFormProps>(
  ({ patientId, onClose, displayMode = 'screen', onSuccess }, ref) => {
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const queryClient = useQueryClient();

    const isEditMode = !!patientId;

    // Fetch patient data if in edit mode
    const {
      data: patient,
      isLoading: isLoadingPatient,
      isError,
    } = useQuery({
      queryKey: [`patient_${patientId}`],
      queryFn: async () => {
        if (!patientId) return null;
        const response = await axiosClient.get<Patient>(
          `patients/${patientId}`
        );
        return response.data;
      },
      enabled: !!patientId,
    });

    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
      setValue,
      watch,
    } = useForm<PatientFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        firstName: '',
        lastName: '',
        ssn: null,
        email: null,
        phoneNumber: null,
        sex: Sex.Unknown,
        birthDate: null,
        age: null,
        height: undefined,
        weight: undefined,
        limbDominance: LimbDominance.Unknown,
        imageUrl: null,
      },
    });

    const handleReset = () => {
      if (patient) {
        reset({
          firstName: patient.firstName,
          lastName: patient.lastName,
          ssn: patient.ssn,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          sex: patient.sex,
          birthDate: patient.birthDate ? new Date(patient.birthDate) : null,
          age: patient.age,
          height: patient.height,
          weight: patient.weight,
          limbDominance: patient.limbDominance,
          imageUrl: patient.imageUrl || null,
        });

        if (patient.imageUrl) {
          setImageData({
            uri: patient.imageUrl,
            isChanged: false,
          });
        } else {
          setImageData(null);
        }
      } else {
        reset({
          firstName: '',
          lastName: '',
          ssn: null,
          email: null,
          phoneNumber: null,
          sex: Sex.Unknown,
          birthDate: null,
          age: null,
          height: undefined,
          weight: undefined,
          limbDominance: LimbDominance.Unknown,
          imageUrl: null,
        });
        setImageData(null);
      }
    };

    useEffect(() => {
      if (patient) {
        handleReset();
      }
    }, [patient]);

    const handleImageChange = (newImageData: ImageData | null) => {
      setImageData(newImageData);
    };

    const { mutate: createPatient, isPending: isCreating } = useMutation({
      mutationFn: async (data: PatientFormData) => {
        return await axiosClient.post<Patient>('patients', {
          ...data,
          birthDate: data.birthDate
            ? new Date(data.birthDate).toISOString().split('T')[0]
            : undefined,
          medicalConditions: [],
          injuries: [],
          prosthetics: [],
        });
      },
      onError: () => {
        toast.error('Failed to create patient');
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['patients'] });
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        toast.success('Patient created successfully');
      },
    });

    const { mutate: updatePatient, isPending: isUpdating } = useMutation({
      mutationFn: async (data: PatientFormData) => {
        if (!patientId) return null;

        return await axiosClient.patch<Patient>(`patients/${patientId}`, {
          ...data,
          birthDate: data.birthDate
            ? new Date(data.birthDate).toISOString().split('T')[0]
            : undefined,
        });
      },
      onError: () => {
        toast.error('Failed to update patient');
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['patients'] });
        queryClient.invalidateQueries({ queryKey: [`patient_${patientId}`] });
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        toast.success('Patient updated successfully');
      },
    });

    const onSubmitForm = async (data: PatientFormData) => {
      try {
        if (imageData && imageData.isChanged && imageData.base64) {
          setIsUploading(true);
          const uploadResult = await uploadToCloudinary(imageData);
          setIsUploading(false);

          if (uploadResult.success && uploadResult.url) {
            data.imageUrl = uploadResult.url;
          } else {
            toast.error(
              'Failed to upload image: ' +
                (uploadResult.error || 'Unknown error')
            );
            return;
          }
        } else if (imageData === null && patient?.imageUrl) {
          data.imageUrl = null;
        } else if (patient?.imageUrl && !imageData?.isChanged) {
          data.imageUrl = patient.imageUrl;
        }

        if (isEditMode) {
          updatePatient(data);
        } else {
          createPatient(data);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('An error occurred while saving patient data');
      }
    };

    useImperativeHandle(ref, () => ({
      handleSubmit: async () => {
        await handleSubmit(onSubmitForm)();
      },
      handleReset,
      isPending: isUploading || isCreating || isUpdating,
    }));

    if (isEditMode && isLoadingPatient) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Colors.primary} />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      );
    }

    if (isEditMode && isError) {
      return (
        <View style={styles.errorContainer}>
          <FontAwesome5
            name='exclamation-circle'
            size={40}
            color={Colors.tertiary}
          />
          <Text style={styles.errorText}>Failed to load patient data</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => onClose && onClose()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const isSubmitting = isCreating || isUpdating || isUploading;

    const formContent = (
      <>
        <View style={formSheetStyles.header}>
          <FontAwesome5 name='user-alt' size={24} color={Colors.primary} />
          <Text style={formSheetStyles.title}>
            {isEditMode ? 'Edit Patient' : 'Add New Patient'}
          </Text>
        </View>

        {/* Patient Image */}
        <ImagePickerInputProps
          initialImageUrl={patient?.imageUrl || null}
          onImageChange={handleImageChange}
        />

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={formSheetStyles.sectionTitle}>Basic Information</Text>

          {/* First Name */}
          <Controller
            control={control}
            name='firstName'
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label='First Name'
                required
                error={errors.firstName?.message}
              >
                <FormInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder='Enter first name'
                  hasError={!!errors.firstName}
                />
              </FormField>
            )}
          />

          {/* Last Name */}
          <Controller
            control={control}
            name='lastName'
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label='Last Name'
                required
                error={errors.lastName?.message}
              >
                <FormInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder='Enter last name'
                  hasError={!!errors.lastName}
                />
              </FormField>
            )}
          />

          {/* SSN */}
          <Controller
            control={control}
            name='ssn'
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label='SSN / National ID'
                info='Social Security Number or National ID'
                error={errors.ssn?.message}
              >
                <FormInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  placeholder='Enter SSN or National ID'
                  hasError={!!errors.ssn}
                />
              </FormField>
            )}
          />
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={formSheetStyles.sectionTitle}>Contact Information</Text>

          {/* Email */}
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label='Email' error={errors.email?.message}>
                <FormInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  placeholder='Enter email address'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  hasError={!!errors.email}
                />
              </FormField>
            )}
          />

          {/* Phone Number */}
          <Controller
            control={control}
            name='phoneNumber'
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label='Phone Number'
                error={errors.phoneNumber?.message}
              >
                <FormInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  placeholder='Enter phone number'
                  keyboardType='phone-pad'
                  hasError={!!errors.phoneNumber}
                />
              </FormField>
            )}
          />
        </View>

        {/* Physical Information */}
        <View style={styles.section}>
          <Text style={formSheetStyles.sectionTitle}>Physical Information</Text>

          {/* Sex */}
          <Controller
            control={control}
            name='sex'
            render={({ field: { onChange, value } }) => (
              <FormField label='Sex' info='Biological sex of the patient'>
                <View style={formSheetStyles.selectContainer}>
                  {Object.entries(Sex).map(([key, val]) => (
                    <SelectOption
                      key={key}
                      label={sexLabels[val]}
                      selected={value === val}
                      onSelect={() => onChange(val)}
                      onClear={
                        value === val && val !== Sex.Unknown
                          ? () => onChange(Sex.Unknown)
                          : undefined
                      }
                    />
                  ))}
                </View>
              </FormField>
            )}
          />

          {/* Birth Date / Age */}
          <Controller
            control={control}
            name='birthDate'
            render={({ field: { onChange, value } }) => (
              <Controller
                control={control}
                name='age'
                render={({
                  field: { onChange: onAgeChange, value: ageValue },
                }) => (
                  <DateNumberSelector
                    date={value || null}
                    number={ageValue || null}
                    onDateChange={onChange}
                    onNumberChange={onAgeChange}
                    label='Date of Birth / Age'
                    hint='Select either a specific birth date or just the age'
                    error={errors.birthDate?.message || errors.age?.message}
                    dateButtonLabel='Select Birth Date'
                    numberButtonLabel='Select Age'
                    minNumber={0}
                    maxNumber={120}
                  />
                )}
              />
            )}
          />

          {/* Height */}
          <Controller
            control={control}
            name='height'
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label='Height (cm)'
                required
                error={errors.height?.message}
                info="Patient's height in centimeters"
              >
                <FormInput
                  onBlur={onBlur}
                  onChangeText={(text) =>
                    onChange(text ? parseFloat(text) : '')
                  }
                  value={value?.toString() || ''}
                  placeholder='Enter height in cm'
                  keyboardType='numeric'
                  hasError={!!errors.height}
                />
              </FormField>
            )}
          />

          {/* Weight */}
          <Controller
            control={control}
            name='weight'
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label='Weight (kg)'
                required
                error={errors.weight?.message}
                info="Patient's weight in kilograms"
              >
                <FormInput
                  onBlur={onBlur}
                  onChangeText={(text) =>
                    onChange(text ? parseFloat(text) : '')
                  }
                  value={value?.toString() || ''}
                  placeholder='Enter weight in kg'
                  keyboardType='numeric'
                  hasError={!!errors.weight}
                />
              </FormField>
            )}
          />

          {/* Limb Dominance */}
          <Controller
            control={control}
            name='limbDominance'
            render={({ field: { onChange, value } }) => (
              <FormField label='Limb Dominance' info="Patient's dominant limb">
                <View style={formSheetStyles.selectContainer}>
                  {Object.entries(LimbDominance).map(([key, val]) => (
                    <SelectOption
                      key={key}
                      label={limbDominanceLabels[val]}
                      selected={value === val}
                      onSelect={() => onChange(val)}
                      onClear={
                        value === val && val !== LimbDominance.Unknown
                          ? () => onChange(LimbDominance.Unknown)
                          : undefined
                      }
                    />
                  ))}
                </View>
              </FormField>
            )}
          />
        </View>

        {displayMode === 'screen' && (
          <FormSheetFooter
            onReset={handleReset}
            onClose={() => {
              Alert.alert(
                'Discard Changes',
                'Are you sure you want to discard changes and go back?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Discard',
                    onPress: () => {
                      handleReset();
                      if (onClose) onClose();
                    },
                    style: 'destructive',
                  },
                ]
              );
            }}
            handleSave={handleSubmit(onSubmitForm)}
            isPending={isSubmitting}
            isEditMode={isEditMode}
          />
        )}
      </>
    );

    if (displayMode === 'screen') {
      return (
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {formContent}
        </ScrollView>
      );
    } else {
      return formContent;
    }
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.primary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: Colors.tertiary,
    fontSize: 16,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cancelButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PatientForm;
