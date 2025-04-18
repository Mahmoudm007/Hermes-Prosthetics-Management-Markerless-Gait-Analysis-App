import { useCallback, useEffect, useMemo, useRef } from 'react';
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
import DateNumberSelector from '../ui/form/date-number-selector';
import FormInput from '@/components/ui/form/form-input';
import ToggleSwitch from '@/components/ui/form/toggle-switch';
import FormSheetFooter from './form-sheet-footer';

import { axiosClient } from '@/lib/axios';
import { Colors } from '@/constants/Colors';
import { formSheetStyles } from '@/constants/form-sheet-styles';

import { type Injury, Side, sideLabels } from '@/types';

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  injuryType: z.string().min(1, 'Injury type is required').max(255),
  injuryDate: z.date().nullable().optional(),
  injuryYear: z
    .number()
    .min(1900, 'Year must be after 1900')
    .max(currentYear, `Year cannot be after ${currentYear}`)
    .nullable()
    .optional(),
  treated: z.boolean().nullable().optional(),
  treatmentMethod: z.string().nullable().optional(),
  currentImpact: z.string().nullable().optional(),
  side: z.nativeEnum(Side),
  details: z.string().nullable().optional(),
  patientId: z.number(),
});

interface InjuryFormSheetProps {
  isVisible: boolean;
  onClose: () => void;
  patientId: number;
  injury?: Injury | null;
}

export default function InjuryFormSheet({
  isVisible,
  onClose,
  patientId,
  injury,
}: InjuryFormSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const queryClient = useQueryClient();

  const isEditMode = !!injury;

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
      injuryType: '',
      injuryDate: null,
      injuryYear: null,
      treated: null,
      treatmentMethod: null,
      currentImpact: null,
      side: undefined,
      details: null,
      patientId,
    },
  });

  const injuryDate = watch('injuryDate');
  const injuryYear = watch('injuryYear');
  const treated = watch('treated');

  const handleReset = () => {
    if (injury) {
      reset({
        injuryType: injury.injuryType,
        injuryDate: injury.injuryDate ? new Date(injury.injuryDate) : null,
        injuryYear: injury.injuryYear || null,
        treated: injury.treated,
        treatmentMethod: injury.treatmentMethod,
        currentImpact: injury.currentImpact,
        side: injury.side,
        details: injury.details,
        patientId: injury.patientId,
      });
    } else {
      reset({
        injuryType: '',
        injuryDate: null,
        injuryYear: null,
        treated: null,
        treatmentMethod: null,
        currentImpact: null,
        side: undefined,
        details: null,
        patientId,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      handleReset();
    }
  }, [isVisible, injury, patientId, reset]);

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
      return await axiosClient.post<Injury>('injuries', {
        ...data,
        injuryDate: data.injuryDate
          ? new Date(data.injuryDate).toISOString().split('T')[0]
          : undefined,
      });
    },
    onError: () => {
      return toast.error('Failed to create injury record');
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: [`patient_${patientId}`],
        });
      }
      bottomSheetRef.current?.close();
      onClose();
      return toast.success('Injury record created successfully');
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!injury) return null;

      return await axiosClient.patch<Injury>(`injuries/${injury.id}`, {
        ...data,
        injuryDate: data.injuryDate
          ? new Date(data.injuryDate).toISOString().split('T')[0]
          : undefined,
        patientId: undefined,
      });
    },
    onError: () => {
      return toast.error('Failed to update injury record');
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: [`patient_${patientId}`],
        });
      }
      bottomSheetRef.current?.close();
      onClose();
      return toast.success('Injury record updated successfully');
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
          <MaterialIcons name='healing' size={28} color={Colors.primary} />
          <Text style={formSheetStyles.title}>
            {isEditMode ? 'Update Injury Record' : 'Add Injury Record'}
          </Text>
        </View>

        {/* Injury Type */}
        <Controller
          control={control}
          name='injuryType'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label='Injury Type'
              required
              error={errors.injuryType?.message}
              info='Enter the type of injury (e.g., Fracture, Sprain, Tear).'
            >
              <FormInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder='Enter injury type'
                hasError={!!errors.injuryType}
              />
            </FormField>
          )}
        />

        {/* Injury Date/Year Selection */}
        <DateNumberSelector
          date={injuryDate || null}
          number={injuryYear || null}
          onDateChange={(date) => setValue('injuryDate', date)}
          onNumberChange={(year) => setValue('injuryYear', year)}
          label='When did the injury occur?'
          hint='Select either a specific date or just the year'
          error={errors.injuryDate?.message || errors.injuryYear?.message}
          numberButtonLabel='Select Year'
          minNumber={1900}
          maxNumber={currentYear}
        />

        {/* Side Selection */}
        <Controller
          control={control}
          name='side'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Affected Side'
              info='Which side of the body was affected by the injury.'
            >
              <View style={formSheetStyles.selectContainer}>
                {Object.entries(Side).map(([key, val]) => (
                  <SelectOption
                    key={key}
                    label={sideLabels[val]}
                    selected={value === val}
                    onSelect={() => onChange(val)}
                    onClear={
                      value === val && val !== Side.Unknown
                        ? () => onChange(Side.Unknown)
                        : undefined
                    }
                  />
                ))}
              </View>
            </FormField>
          )}
        />

        {/* Treated Checkbox */}
        <Controller
          control={control}
          name='treated'
          render={({ field: { onChange, value } }) => (
            <FormField
              label='Was this injury treated?'
              info='Indicate whether the injury received medical treatment.'
            >
              <View style={formSheetStyles.checkboxContainer}>
                <ToggleSwitch
                  value={value === true}
                  onValueChange={onChange}
                  labelOn='Yes, it was treated'
                  labelOff='No, it was not treated'
                />
              </View>
            </FormField>
          )}
        />

        {/* Treatment Method - Only show if treated is true */}
        {treated === true && (
          <Controller
            control={control}
            name='treatmentMethod'
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label='Treatment Method'
                info='Describe how the injury was treated (e.g., Surgery, Physical Therapy).'
              >
                <FormInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  placeholder='Enter treatment method'
                  hasError={!!errors.treatmentMethod}
                />
              </FormField>
            )}
          />
        )}

        {/* Current Impact */}
        <Controller
          control={control}
          name='currentImpact'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label='Current Impact'
              info='Describe how this injury currently affects the patient (e.g., Limited mobility, Pain during activity).'
            >
              <FormInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ''}
                placeholder='Enter current impact'
                hasError={!!errors.currentImpact}
              />
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
              info='Any additional information about the injury, its cause, or other relevant notes.'
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
