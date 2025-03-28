import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useDebouncedCallback } from 'use-debounce';

import { MoreButton } from '@/components/more-button';

import { useSearchStore } from '@/lib/search-store';
import { Colors } from '@/constants/Colors';

export default function PatientsLayout() {
  const { setSearchValue } = useSearchStore();

  const debouncedSetSearchValue = useDebouncedCallback((text: string) => {
    setSearchValue(text);
  }, 300);

  useEffect(() => {
    return () => {
      setSearchValue('');
    };
  }, []);

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
            onChangeText: (e) => {
              debouncedSetSearchValue(e.nativeEvent.text);
            },
            onCancelButtonPress: () => {
              setSearchValue('');
            },
          },
        }}
      />
    </Stack>
  );
}
