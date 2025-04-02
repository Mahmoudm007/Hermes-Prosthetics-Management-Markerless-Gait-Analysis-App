import { useEffect } from 'react';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { Toaster } from 'sonner-native';
import { configureReanimatedLogger } from 'react-native-reanimated';

import { tokenCache } from '@/lib/cache';
import { Colors } from '@/constants/Colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

if (__DEV__) {
  configureReanimatedLogger({
    strict: false,
  });
}

function InitialLayout() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const pathName = usePathname();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(authenticated)';

    if (isSignedIn && !inAuthGroup) {
      router.replace('/home');
    } else if (!isSignedIn && pathName !== '/') {
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, pathName, segments]);

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
              <InitialLayout />
              <Toaster richColors />
            </GestureHandlerRootView>
          </ActionSheetProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
