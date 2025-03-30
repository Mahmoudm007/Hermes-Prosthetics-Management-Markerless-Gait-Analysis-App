import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

import { axiosClient } from '@/lib/axios';
import type { MedicalCondition } from '@/types';

interface DeleteMedicalConditionProps {
  id?: number;
  patientId?: number;
  callbackFn?: () => void;
  fallbackFn?: () => void;
}

export function useDeleteMedicalCondition({
  id,
  patientId,
  callbackFn,
  fallbackFn,
}: DeleteMedicalConditionProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!id) return null;

      return await axiosClient.delete<MedicalCondition>(
        `medical-conditions/${id}`
      );
    },
    onError: () => {
      if (fallbackFn) {
        fallbackFn();
      }
      return toast.error('Failed to delete this medical condition');
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: [`patient_${patientId}`],
        });
      }
      if (callbackFn) {
        callbackFn();
      }
      return toast.success('Medical condition deleted successfully');
    },
  });

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Medical Condition',
      'Are you sure you want to delete this medical condition?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => mutate(),
        },
      ]
    );
  };

  return {
    mutate,
    isPending,
    handleDelete,
  };
}
