import { Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import PatientForm from '@/components/forms/patient-form';

export default function NewPatientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <SafeAreaView>
      <PatientForm
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['patients_'],
          });
        }}
        onClose={() => {
          Keyboard.dismiss();
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
