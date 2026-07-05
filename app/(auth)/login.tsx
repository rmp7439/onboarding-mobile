import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, SectionTitle } from '../../src/components';
import { colors, spacing, radius, typography } from '../../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleNumberChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setMobileNumber(numericText);
    if (error) {
      setError('');
    }
  };

  const handleContinue = () => {
    Keyboard.dismiss();
    
    if (mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (mobileNumber !== '9876543210') {
      setError('Invalid Phone Number');
      return;
    }

    setError('');
    router.push('/(auth)/otp');
  };

  return (
    <Screen scrollable={false} style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>EO</Text>
          </View>

          <SectionTitle 
            title="Employee Onboarding" 
            subtitle="Sign in to continue" 
            style={styles.header}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter Mobile Number</Text>
            <View 
              style={[
                styles.underlineInputContainer,
                isFocused && styles.underlineInputContainerFocused,
                !!error && styles.underlineInputContainerError
              ]}
            >
              <TextInput
                style={styles.inputText}
                value={mobileNumber}
                onChangeText={handleNumberChange}
                onFocus={() => { setIsFocused(true); setError(''); }}
                onBlur={() => setIsFocused(false)}
                keyboardType="numeric"
                maxLength={10}
                selectionColor={colors.primary}
              />
            </View>
            
            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          disabled={mobileNumber.length !== 10}
          onPress={handleContinue}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing['2xl'],
  },
  content: {
    flex: 1,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xl,
    letterSpacing: 1,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  underlineInputContainer: {
    borderBottomWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
  },
  underlineInputContainerFocused: {
    borderColor: colors.primary,
  },
  underlineInputContainerError: {
    borderColor: colors.error,
  },
  inputText: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: 2,
    padding: 0, 
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  demoHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: 24, 
  },
  button: {
    width: '100%',
  },
});