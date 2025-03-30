import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

import { axiosClient } from '@/lib/axios';
import type { Injury } from '@/types';

interface DeleteInjuryProps {
  id?: number;
  patientId?: number;
  callbackFn?: () => void;
  fallbackFn?: () => void;
}

export function useDeleteInjury({
  id,
  patientId,
  callbackFn,
  fallbackFn,
}: DeleteInjuryProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!id) return null;

      return await axiosClient.delete<Injury>(`injuries/${id}`);
    },
    onError: () => {
      if (fallbackFn) {
        fallbackFn();
      }
      return toast.error('Failed to delete this injury');
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
      return toast.success('Injury deleted successfully');
    },
  });

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Injury',
      'Are you sure you want to delete this injury?',
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
