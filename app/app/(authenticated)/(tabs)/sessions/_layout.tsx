import { Stack } from 'expo-router';

import { MoreButton } from '@/components/more-button';
import { Colors } from '@/constants/Colors';

export default function SessionsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Sessions',
          headerShadowVisible: false,
          headerRight: () => <MoreButton />,
          headerSearchBarOptions: {
            placeholder: 'Search sessions',
            tintColor: Colors.primary,
          },
        }}
      />
    </Stack>
  );
}
