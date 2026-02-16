import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { tokenCache } from '@/utils/cache';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colorScheme } = useTheme();

  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(value === 'true');
      } catch {
        setHasOnboarded(false);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!isLoaded || hasOnboarded === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!hasOnboarded) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)');
      }
    } else if (isSignedIn) {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    } else if (!inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments, hasOnboarded]);

  if (!isLoaded || hasOnboarded === null) {
    return null; // Or a loading spinner
  }

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
    return <View />;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <InitialLayout />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
