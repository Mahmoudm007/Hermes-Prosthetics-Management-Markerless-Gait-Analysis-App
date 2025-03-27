import { Stack } from 'expo-router';

import { MoreButton } from '@/components/more-button';
import { Colors } from '@/constants/Colors';

export default function PatientsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Patients',
          headerShadowVisible: false,
          headerRight: () => <MoreButton />,
          headerSearchBarOptions: {
            placeholder: 'Search patients',
            tintColor: Colors.primary,
          },
        }}
      />
    </Stack>
  );
}
