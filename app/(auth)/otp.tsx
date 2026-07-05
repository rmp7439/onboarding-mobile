import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Pressable, ScrollView, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, SectionTitle } from '../../src/components';
import { colors, spacing, typography } from '../../src/theme';

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [isFocused, setIsFocused] = useState(true);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setOtp(numericText);
    if (error) {
      setError('');
    }
  };

  const handleVerify = () => {
    Keyboard.dismiss();
    
    if (otp !== '123456') {
      setError('Invalid OTP');
      return;
    }

    setError('');
    router.replace('/(onboarding)/home');
  };

  const handleResend = () => {
    setTimer(30);
    setOtp('');
    setError('');
    inputRef.current?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const otpArray = new Array(OTP_LENGTH).fill(0);

  return (
    <Screen scrollable={false} style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <SectionTitle
            title="Verify OTP"
            subtitle="We've sent a 6-digit OTP to your mobile number."
            style={styles.header}
          />

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleOtpChange}
              onFocus={() => { setIsFocused(true); setError(''); }}
              onBlur={() => setIsFocused(false)}
              keyboardType="numeric"
              maxLength={OTP_LENGTH}
              autoFocus={true}
              caretHidden={true}
              style={styles.hiddenInput}
            />
            
            <Pressable style={styles.otpDisplayContainer} onPress={handleFocus}>
              {otpArray.map((_, index) => {
                const digit = otp[index] || '';
                const isActive = isFocused && otp.length === index;

                return (
                  <View 
                    key={index} 
                    style={[
                      styles.otpSlot, 
                      isActive && styles.otpSlotActive,
                      !!error && styles.otpSlotError
                    ]}
                  >
                    <Text style={styles.otpDigit}>{digit}</Text>
                  </View>
                );
              })}
            </Pressable>
            
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity 
                disabled={timer > 0} 
                onPress={handleResend}
                activeOpacity={0.8}
              >
                <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                Countdown: {formatTime(timer)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Verify"
          disabled={otp.length !== OTP_LENGTH}
          onPress={handleVerify}
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
  header: {
    marginBottom: spacing['2xl'],
  },
  inputContainer: {
    width: '100%',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 10,
  },
  otpDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  otpSlot: {
    flex: 1,
    height: 56,
    borderBottomWidth: 2,
    borderColor: colors.border,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xs,
    marginHorizontal: 4,
  },
  otpSlotActive: {
    borderColor: colors.primary,
  },
  otpSlotError: {
    borderColor: colors.error,
  },
  otpDigit: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  resendText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  resendLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  resendLinkDisabled: {
    color: colors.border,
  },
  timerContainer: {
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  timerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  demoHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: 24,
  },
  button: {
    width: '100%',
  },
});