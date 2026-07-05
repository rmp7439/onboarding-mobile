import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../src/context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="new-guard" />
        <Stack.Screen name="profile" />
      </Stack>
    </OnboardingProvider>
  );
}