import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { Toaster } from 'sonner-native';

import { tokenCache } from '@/lib/cache';
import { Colors } from '@/constants/Colors';

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

function InitialLayout() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const pathName = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(authenticated)';

    if (isSignedIn && !inAuthGroup) {
      router.replace('/home');
    } else if (!isSignedIn && pathName !== '/') {
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, pathName, segments]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name='index' />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <ActionSheetProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Toaster />
              <InitialLayout />
            </GestureHandlerRootView>
          </ActionSheetProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
