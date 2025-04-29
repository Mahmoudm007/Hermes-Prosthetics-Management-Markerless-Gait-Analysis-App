import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import GaitVideoInput, {
  type VideoData,
} from '@/components/ui/form/gait-video-input';
import FormInput from '@/components/ui/form/form-input';
import { formSheetStyles } from '@/constants/form-sheet-styles';
import { Colors } from '@/constants/Colors';
import { axiosClient } from '@/lib/axios';
import { toast } from 'sonner-native';
import { uploadVideoToCloudinary } from '@/lib/cloudinary-uploader';
import FormSheetFooter from './form-sheet-footer';

// Define the form schema
const gaitSessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  sessionDate: z.date().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  videoUrl: z.string().optional(),
  videoData: z.any().refine((val) => val !== null, {
    message: 'Video is required',
  }),
});

type GaitSessionFormData = z.infer<typeof gaitSessionSchema>;

export interface GaitSessionFormHandles {
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
  isPending: boolean;
}

interface GaitSessionFormProps {
  patientId: number;
  onClose: () => void;
  displayMode?: 'sheet' | 'screen';
  onSuccess?: () => void;
}

const GaitSessionForm = forwardRef<
  GaitSessionFormHandles,
  GaitSessionFormProps
>(({ patientId, onClose, displayMode = 'sheet', onSuccess }, ref) => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [useTodayDate, setUseTodayDate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GaitSessionFormData>({
    resolver: zodResolver(gaitSessionSchema),
    defaultValues: {
      title: '',
      sessionDate: undefined,
      description: '',
      notes: '',
      videoUrl: undefined,
    },
  });

  const sessionDate = watch('sessionDate');

  const handleReset = () => {
    reset();
    setVideoData(null);
  };

  useEffect(() => {
    handleReset();
  }, []);

  useImperativeHandle(ref, () => ({
    handleSubmit: async () => {
      await handleSubmit(onSubmitForm)();
    },
    handleReset,
    isPending: isUploading || isCreating,
  }));

  const { mutate: createGaitSession, isPending: isCreating } = useMutation({
    mutationFn: async (data: GaitSessionFormData) => {
      console.log({
        title: data.title,
        patientId: patientId,
        sessionDate: data.sessionDate
          ? new Date(data.sessionDate).toISOString().split('T')[0]
          : undefined,
        description: data.description || '',
        notes: data.notes || '',
        videoUrl: data.videoUrl,
      });
      return await axiosClient.post('gait-sessions', {
        title: data.title,
        patientId: patientId,
        sessionDate: data.sessionDate
          ? new Date(data.sessionDate).toISOString().split('T')[0]
          : undefined,
        description: data.description || '',
        notes: data.notes || '',
        videoUrl: data.videoUrl,
      });
    },
    onError: () => {
      toast.error('Failed to create gait session');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gait-sessions'] });
      queryClient.invalidateQueries({ queryKey: [`patient_${patientId}`] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      toast.success('Gait session created successfully');
      reset();
      setVideoData(null);
    },
  });

  const onSubmitForm = async (data: GaitSessionFormData) => {
    try {
      // First upload the video to Cloudinary
      if (videoData && videoData.isChanged && videoData.base64) {
        setIsUploading(true);

        // const uploadResult = {
        // success: true,
        // url: 'https://res.cloudinary.com/deuvh8isd/video/upload/v1745860121/gait-sessions/z2s7qdezx5levdh4qbhj.mp4',
        // error: null,
        // };
        const uploadResult = await uploadVideoToCloudinary(videoData);
        setIsUploading(false);

        if (uploadResult.success && uploadResult.url) {
          data.videoUrl = uploadResult.url;
        } else {
          toast.error(
            'Failed to upload video: ' + (uploadResult.error || 'Unknown error')
          );
          return;
        }
      }

      // Then create the gait session with the video URL
      createGaitSession(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while saving gait session data');
      setIsUploading(false);
    }
  };

  const handleVideoChange = (newVideoData: VideoData | null) => {
    setVideoData(newVideoData);
    setValue('videoData', newVideoData);
  };

  const handleSetTodayDate = (value: boolean) => {
    setUseTodayDate(value);
    if (value) {
      const today = new Date();
      setValue('sessionDate', today);
    }
  };

  const handleDateConfirm = (date: Date) => {
    setValue('sessionDate', date);
    setDatePickerVisible(false);
  };

  const isSubmitting = isCreating || isUploading;

  return (
    <View style={styles.container}>
      <View style={formSheetStyles.header}>
        <FontAwesome5 name='walking' size={24} color={Colors.primary} />
        <Text style={formSheetStyles.title}>New Gait Session</Text>
      </View>

      {/* Title */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title *</Text>
        <Controller
          control={control}
          name='title'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              style={errors.title ? styles.inputError : undefined}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder='Enter session title'
              placeholderTextColor='#999'
              hasError={!!errors.title}
            />
          )}
        />
        {errors.title && (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        )}
      </View>

      {/* Video Input - Now Required */}
      <View style={styles.videoSection}>
        <View style={styles.labelWithTooltip}>
          <Text style={styles.label}>Gait Video *</Text>
          <TouchableOpacity style={styles.tooltipIcon}>
            <FontAwesome5
              name='question-circle'
              size={16}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
        <GaitVideoInput
          initialVideoUrl={null}
          onVideoChange={handleVideoChange}
          maxDuration={10}
          disabled={isSubmitting}
        />
        {errors.videoData && (
          <Text style={styles.errorText}>{errors.videoData.message}</Text>
        )}
      </View>

      {/* Session Date with Today Checkbox */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Session Date</Text>
        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={[styles.dateInput, useTodayDate && styles.dateInputDisabled]}
            onPress={() => !useTodayDate && setDatePickerVisible(true)}
            disabled={useTodayDate}
          >
            <Text style={styles.dateText}>
              {sessionDate
                ? sessionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select date'}
            </Text>
            <FontAwesome5
              name='calendar-alt'
              size={16}
              color={useTodayDate ? '#999' : Colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.todayContainer}>
            <Text style={styles.todayLabel}>Today</Text>
            <Switch
              value={useTodayDate}
              onValueChange={handleSetTodayDate}
              trackColor={{ false: '#ddd', true: `${Colors.primary}80` }}
              thumbColor={useTodayDate ? Colors.primary : '#f4f3f4'}
              disabled={isSubmitting}
            />
          </View>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode='date'
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
          date={sessionDate}
          maximumDate={new Date()}
          disabled={isSubmitting}
        />
      </View>

      {/* Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name='description'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              style={[styles.textArea]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder='Enter session description'
              placeholderTextColor='#999'
              multiline
              textAlignVertical='top'
            />
          )}
        />
      </View>

      {/* Notes */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes</Text>
        <Controller
          control={control}
          name='notes'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              style={[styles.textArea]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder='Enter additional notes'
              placeholderTextColor='#999'
              multiline
              textAlignVertical='top'
            />
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
          isEditMode={false}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  labelWithTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipIcon: {
    marginLeft: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateInputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  todayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayLabel: {
    fontSize: 14,
    color: '#333',
  },
  videoSection: {
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GaitSessionForm;
