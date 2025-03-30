import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

import { axiosClient } from '@/lib/axios';
import type { Prosthetic } from '@/types';

interface DeleteProstheticProps {
  id?: number;
  patientId?: number;
  callbackFn?: () => void;
  fallbackFn?: () => void;
}

export function useDeleteProsthetic({
  id,
  patientId,
  callbackFn,
  fallbackFn,
}: DeleteProstheticProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!id) return null;

      return await axiosClient.delete<Prosthetic>(`prosthetics/${id}`);
    },
    onError: () => {
      if (fallbackFn) {
        fallbackFn();
      }
      return toast.error('Failed to delete this prosthetic');
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
      return toast.success('Prosthetic deleted successfully');
    },
  });

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Prosthetic',
      'Are you sure you want to delete this prosthetic?',
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
