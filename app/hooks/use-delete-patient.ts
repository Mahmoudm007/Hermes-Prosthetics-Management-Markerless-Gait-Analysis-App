import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

import { axiosClient } from '@/lib/axios';
import type { Patient } from '@/types';

interface DeletePatientProps {
  id?: number;
  callbackFn?: () => void;
  fallbackFn?: () => void;
}

export function useDeletePatient({
  id,
  callbackFn,
  fallbackFn,
}: DeletePatientProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!id) return null;

      return await axiosClient.delete<Patient>(`patients/${id}`);
    },
    onError: () => {
      if (fallbackFn) {
        fallbackFn();
      }
      return toast.error('Failed to delete this patient');
    },
    onSuccess: () => {
      if (callbackFn) {
        callbackFn();
      }
      return toast.success('Patient deleted successfully');
    },
  });

  const handleDelete = () => {
    if (!id) return;

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
