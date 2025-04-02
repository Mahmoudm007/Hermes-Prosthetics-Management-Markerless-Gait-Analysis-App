import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Keyboard } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

import FormField from '@/components/ui/form/form-field';
import SelectOption from '@/components/ui/form/select-option';
import DateYearSelector from '@/components/ui/form/date-year-selector';
import FormInput from '@/components/ui/form/form-input';
import FormSheetFooter from './form-sheet-footer';

import { axiosClient } from '@/lib/axios';
import { Colors } from '@/constants/Colors';
import { formSheetStyles } from '@/constants/form-sheet-styles';

import {
  type MedicalCondition,
  Severity,
  TreatmentStatus,
  treatmentStatusLabels,
} from '@/types';

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  medicalConditionName: z
    .string()
    .min(1, 'Medical condition name is required')
    .max(255),
  diagnosisDate: z.date().nullable().optional(),
  diagnosisYear: z
    .number()
    .min(1900, 'Year must be after 1900')
    .max(currentYear, `Year cannot be after ${currentYear}`)
    .nullable()
    .optional(),
  severity: z.nativeEnum(Severity).optional(),
  treatmentStatus: z.nativeEnum(TreatmentStatus).optional(),
  details: z.string().optional(),
  patientId: z.number(),
});

interface MedicalConditionFormSheetProps {
  isVisible: boolean;
  onClose: () => void;
  patientId: number;
  medicalCondition?: MedicalCondition | null;
}

export default function MedicalConditionFormSheet({
  isVisible,
  onClose,
  patientId,
  medicalCondition,
}: MedicalConditionFormSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const queryClient = useQueryClient();

  const isEditMode = !!medicalCondition;

  const snapPoints = useMemo(() => ['95%'], []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicalConditionName: '',
      diagnosisDate: null,
      diagnosisYear: null,
      severity: undefined,
      treatmentStatus: undefined,
      details: '',
      patientId,
    },
  });

  const diagnosisDate = watch('diagnosisDate');
  const diagnosisYear = watch('diagnosisYear');

  const handleReset = () => {
    if (medicalCondition) {
      reset({
        medicalConditionName: medicalCondition.medicalConditionName,
        diagnosisDate: medicalCondition.diagnosisDate
          ? new Date(medicalCondition.diagnosisDate)
          : null,
        diagnosisYear: medicalCondition.diagnosisYear || null,
        severity: medicalCondition.severity,
        treatmentStatus: medicalCondition.treatmentStatus,
        details: medicalCondition.details || '',
        patientId: medicalCondition.patientId,
      });
    } else {
      reset({
        medicalConditionName: '',
        diagnosisDate: null,
        diagnosisYear: null,
        severity: undefined,
        treatmentStatus: undefined,
        details: '',
        patientId,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      handleReset();
    }
  }, [isVisible, medicalCondition, patientId, reset]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={() => {
          Keyboard.dismiss();
          bottomSheetRef.current?.close();
        }}
      />
    ),
    []
  );

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await axiosClient.post<MedicalCondition>('medical-conditions', {
        ...data,
        diagnosisDate: data.diagnosisDate
          ? new Date(data.diagnosisDate).toISOString().split('T')[0]
          : undefined,
      });
    },
    onError: () => {
      return toast.error('Failed to create medical condition');
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: [`patient_${patientId}`],
        });
      }
      bottomSheetRef.current?.close();
      onClose();
      return toast.success('Medical condition deleted successfully');
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!medicalCondition) return null;

      return await axiosClient.patch<MedicalCondition>(
        `medical-conditions/${medicalCondition.id}`,
        {
          ...data,
          diagnosisDate: data.diagnosisDate
            ? new Date(data.diagnosisDate).toISOString().split('T')[0]
            : undefined,
          patientId: undefined,
        }
      );
    },
    onError: () => {
      return toast.error('Failed to update medical condition');
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: [`patient_${patientId}`],
        });
      }
      bottomSheetRef.current?.close();
      onClose();
      return toast.success('Medical condition updated successfully');
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditMode) {
      update(data);
    } else {
      create(data);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      android_keyboardInputMode='adjustResize'
      footerComponent={(props) => (
        <FormSheetFooter
          {...props}
          onClose={() => {
            bottomSheetRef.current?.close();
            onClose();
          }}
          onReset={handleReset}
          handleSave={handleSubmit(onSubmit)}
          isPending={isCreating || isUpdating}
          isEditMode={isEditMode}
        />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={formSheetStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={formSheetStyles.header}>
          <MaterialIcons
            name='medical-services'
            size={28}
            color={Colors.primary}
          />
          <Text style={formSheetStyles.title}>
            {isEditMode ? 'Update Medical Condition' : 'Add Medical Condition'}
          </Text>
        </View>

        {/* Medical Condition Name */}
        <Controller
          control={control}
          name='medicalConditionName'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label='Medical Condition Name'
              required
              error={errors.medicalConditionName?.message}
              info='Enter the name of the diagnosed medical condition (e.g., Osteoarthritis, Diabetes).'
            >
              <FormInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder='Enter medical condition name'
                hasError={!!errors.medicalConditionName}
              />
            </FormField>
          )}
        />

        {/* Diagnosis Date/Year Selection */}
        <DateYearSelector
          date={diagnosisDate || null}
          year={diagnosisYear || null}
          onDateChange={(date) => setValue('diagnosisDate', date)}
          onYearChange={(year) => setValue('diagnosisYear', year)}
          label='When was it diagnosed?'
          hint='Select either a specific date or just the year'
          error={errors.diagnosisDate?.message || errors.diagnosisYear?.message}
        />

        {/* Severity */}
        <Controller
          control={control}
          name='severity'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Severity'
              info='Indicates how severe the condition is, which can impact treatment decisions.'
            >
              <View style={formSheetStyles.selectContainer}>
                {Object.entries(Severity).map(([key, val]) => (
                  <SelectOption
                    key={key}
                    label={key}
                    selected={value === val}
                    onSelect={() => onChange(val)}
                    onClear={
                      value === val ? () => onChange(undefined) : undefined
                    }
                  />
                ))}
              </View>
            </FormField>
          )}
        />

        {/* Treatment Status */}
        <Controller
          control={control}
          name='treatmentStatus'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Treatment Status'
              info='Indicates the current status of treatment for this condition.'
            >
              <View style={formSheetStyles.selectContainer}>
                {Object.entries(TreatmentStatus).map(([key, val]) => (
                  <SelectOption
                    key={key}
                    label={treatmentStatusLabels[val]}
                    selected={value === val}
                    onSelect={() => onChange(val)}
                    onClear={
                      value === val ? () => onChange(undefined) : undefined
                    }
                  />
                ))}
              </View>
            </FormField>
          )}
        />

        {/* Details */}
        <Controller
          control={control}
          name='details'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label='Additional Details'
              info='Any additional information about the condition, treatments, or notes.'
            >
              <FormInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ''}
                placeholder='Enter additional details (optional)'
                multiline
                numberOfLines={20}
                textAlignVertical='top'
                style={formSheetStyles.textArea}
                hasError={!!errors.details}
              />
            </FormField>
          )}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
