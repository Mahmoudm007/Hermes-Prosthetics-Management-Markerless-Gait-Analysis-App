import { TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

export default function BrowseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.backgroundAlt },
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Browse',
          headerTitleAlign: 'center',
          headerLeft: () => <HeaderLeft />,
          headerRight: () => <HeaderRight />,
        }}
      />
    </Stack>
  );
}

function HeaderLeft() {
  const { user } = useUser();

  return (
    <Image
      source={{ uri: user?.imageUrl }}
      style={{ width: 32, height: 32, borderRadius: 16, marginRight: 16 }}
    />
  );
}

function HeaderRight() {
  return (
    <TouchableOpacity>
      <Ionicons name='settings-outline' size={24} color={Colors.primary} />
    </TouchableOpacity>
  );
}
