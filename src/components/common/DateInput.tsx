import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  NativeSyntheticEvent
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

export interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  error?: string;
}

export function DateInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  minYear,
  maxYear,
  error: externalError,
}: DateInputProps) {
  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const [internalError, setInternalError] = useState<string>('');

  const parts = (value || '').split('/');
  const day = parts[0] || '';
  const month = parts[1] || '';
  const year = parts[2] || '';

  // --- Helper Functions ---
  const getMaxDays = (m: number, y?: number) => {
    if (m === 2) {
      if (y !== undefined) {
         // Leap year calculation
         return (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28;
      }
      return 29; // Assume leap year is possible until the year is known
    }
    return [4, 6, 9, 11].includes(m) ? 30 : 31;
  };

  const isFutureDate = (d: number, m: number, y: number) => {
    const today = new Date();
    const inputDate = new Date(y, m - 1, d);
    today.setHours(0, 0, 0, 0); // Strip time for accurate day comparison
    return inputDate > today;
  };

  // --- Strict Input Handlers ---
  const handleDayChange = (text: string) => {
    setInternalError('');
    const cleanText = text.replace(/\D/g, ''); 
    
    if (cleanText.length === 2) {
      const d = parseInt(cleanText, 10);
      if (d < 1 || d > 31) {
        setInternalError('Invalid day.');
        return; // Reject state update
      }
      
      const m = month.length === 2 ? parseInt(month, 10) : undefined;
      const y = year.length === 4 ? parseInt(year, 10) : undefined;
      
      // Prevent entering a day that exceeds the selected month's maximum
      if (m && d > getMaxDays(m, y)) {
        setInternalError('Invalid day for this month.');
        return;
      }
      
      // Prevent entering a day in the future (if maxYear equals the current year)
      if (m && y && maxYear !== undefined && y === maxYear && isFutureDate(d, m, y)) {
        setInternalError('Future dates are not allowed.');
        return;
      }
    }
    
    onChange(`${cleanText}/${month}/${year}`);
    if (cleanText.length === 2 && parseInt(cleanText, 10) > 0) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (text: string) => {
    setInternalError('');
    const cleanText = text.replace(/\D/g, '');
    
    if (cleanText.length === 2) {
      const m = parseInt(cleanText, 10);
      if (m < 1 || m > 12) {
        setInternalError('Invalid month.');
        return; // Reject state update
      }
      
      const d = day.length === 2 ? parseInt(day, 10) : undefined;
      const y = year.length === 4 ? parseInt(year, 10) : undefined;
      
      // Prevent entering a month that breaks the existing day (e.g. Day is 31, typing Month 04)
      if (d && d > getMaxDays(m, y)) {
        setInternalError('Invalid date for this month.');
        return;
      }
      
      if (d && y && maxYear !== undefined && y === maxYear && isFutureDate(d, m, y)) {
        setInternalError('Future dates are not allowed.');
        return;
      }
    }
    
    onChange(`${day}/${cleanText}/${year}`);
    if (cleanText.length === 2 && parseInt(cleanText, 10) > 0) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (text: string) => {
    setInternalError('');
    const cleanText = text.replace(/\D/g, '');
    
    if (cleanText.length === 4) {
      const y = parseInt(cleanText, 10);
      
      // Reject year out of bounds immediately
      if (minYear !== undefined && y < minYear) {
        setInternalError(`Year cannot be before ${minYear}.`);
        return;
      }
      if (maxYear !== undefined && y > maxYear) {
        setInternalError(`Year cannot exceed ${maxYear}.`);
        return;
      }

      const d = day.length === 2 ? parseInt(day, 10) : undefined;
      const m = month.length === 2 ? parseInt(month, 10) : undefined;
      
      if (d && m) {
        // Prevent typing a year that breaks the leap day (e.g. 29/02 and typing 2025)
        if (d > getMaxDays(m, y)) {
          setInternalError('Invalid calendar date.');
          return;
        }
        if (maxYear !== undefined && y === maxYear && isFutureDate(d, m, y)) {
          setInternalError('Future dates are not allowed.');
          return;
        }
      }
    }

    onChange(`${day}/${month}/${cleanText}`);
  };

  const handleMonthKeyPress = (e: NativeSyntheticEvent<{ key: string }>) => {
    if (e.nativeEvent.key === 'Backspace' && month === '') {
      dayRef.current?.focus();
    }
  };

  const handleYearKeyPress = (e: NativeSyntheticEvent<{ key: string }>) => {
    if (e.nativeEvent.key === 'Backspace' && year === '') {
      monthRef.current?.focus();
    }
  };

  const displayError = internalError || externalError;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.row}>
        <TextInput
          ref={dayRef}
          style={[styles.inputBox, !!displayError && styles.errorInput, disabled && styles.disabledInput]}
          value={day}
          onChangeText={handleDayChange}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="DD"
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
        />
        <Text style={styles.separator}>/</Text>
        
        <TextInput
          ref={monthRef}
          style={[styles.inputBox, !!displayError && styles.errorInput, disabled && styles.disabledInput]}
          value={month}
          onChangeText={handleMonthChange}
          onKeyPress={handleMonthKeyPress}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="MM"
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
        />
        <Text style={styles.separator}>/</Text>

        <TextInput
          ref={yearRef}
          style={[styles.inputBox, styles.yearBox, !!displayError && styles.errorInput, disabled && styles.disabledInput]}
          value={year}
          onChangeText={handleYearChange}
          onKeyPress={handleYearKeyPress}
          keyboardType="number-pad"
          maxLength={4}
          placeholder="YYYY"
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
        />
      </View>

      {!!displayError && <Text style={styles.errorText}>{displayError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 48,
    textAlign: 'center',
  },
  yearBox: {
    flex: 1.5,
  },
  separator: {
    fontSize: typography.fontSize.lg,
    color: colors.border,
    fontWeight: typography.fontWeight.medium,
  },
  disabledInput: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  errorInput: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});