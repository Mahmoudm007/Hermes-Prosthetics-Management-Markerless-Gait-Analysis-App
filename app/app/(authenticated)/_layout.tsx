import { Stack } from 'expo-router';

import { Colors } from '@/constants/Colors';

export default function AuthenticatedLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name='(tabs)'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='patient/new'
        options={{
          headerTitle: 'New Patient',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name='patient/[id]'
        options={{
          title: 'Patient Profile',
          presentation: 'modal',
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: '#000' },
        }}
      />
    </Stack>
  );
}
