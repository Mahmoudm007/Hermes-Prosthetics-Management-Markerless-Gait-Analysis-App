import { Stack } from 'expo-router';

import { Colors } from '@/constants/Colors';

export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Search',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: 'Patients, Sessions, and More',
            tintColor: Colors.primary,
            inputType: 'text',
          },
        }}
      />
    </Stack>
  );
}
