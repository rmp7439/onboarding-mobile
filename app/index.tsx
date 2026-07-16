import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { Session } from '../src/utils/Session';
import { colors } from '../src/theme';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await Session.getEmployeeSession();
        
        if (session && session.token) {
          setInitialRoute('/(onboarding)/home');
        } else {
          setInitialRoute('/(auth)/login');
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
        setInitialRoute('/(auth)/login');
      } finally {
        setIsReady(true);
      }
    };

    restoreSession();
  }, []);

  if (!isReady || !initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={initialRoute as any} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});