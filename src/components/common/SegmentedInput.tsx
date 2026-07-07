import React, { useRef, useMemo, memo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  NativeSyntheticEvent, 
  TextInputKeyPressEventData 
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

export type SegmentType = 'numeric' | 'alpha';

export interface SegmentConfig {
  length: number;
  type: SegmentType;
}

export interface SegmentedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  segments: SegmentConfig[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const SegmentedInput = memo(function SegmentedInput({
  label,
  value,
  onChange,
  segments,
  required = false,
  disabled = false,
  error,
}: SegmentedInputProps) {
  // Array of refs to manage focus switching
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Split the parent's single string into chunks matching the segment config
  const chunks = useMemo(() => {
    let currentIdx = 0;
    return segments.map((seg) => {
      const chunk = (value || '').slice(currentIdx, currentIdx + seg.length);
      currentIdx += seg.length;
      return chunk;
    });
  }, [value, segments]);

  const handleChange = (text: string, index: number) => {
    const seg = segments[index];
    let sanitized = text;

    // Strict internal validation
    if (seg.type === 'numeric') {
      sanitized = sanitized.replace(/\D/g, ''); // Numbers only
    } else if (seg.type === 'alpha') {
      sanitized = sanitized.replace(/[^a-zA-Z]/g, '').toUpperCase(); // Letters only, auto-uppercase
    }

    // Build the new combined value for the parent
    const newChunks = [...chunks];
    newChunks[index] = sanitized;
    const newValue = newChunks.join('');
    onChange(newValue);

    // Auto-advance focus if this chunk is completely filled
    if (sanitized.length === seg.length && index < segments.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    // Natural Backspace navigation: Move to previous box if current is empty
    if (e.nativeEvent.key === 'Backspace' && chunks[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>

      <View style={styles.row}>
        {segments.map((seg, index) => (
          <TextInput
            key={index}
            ref={(el) => {inputRefs.current[index] = el}}
            style={[
              styles.inputBox,
              { flex: seg.length }, // Proportionally size the box based on max characters
              !!error && styles.errorInput,
              disabled && styles.disabledInput,
            ]}
            value={chunks[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType={seg.type === 'numeric' ? 'number-pad' : 'default'}
            maxLength={seg.length}
            autoCapitalize={seg.type === 'alpha' ? 'characters' : 'none'}
            editable={!disabled}
            textAlign="center"
            placeholderTextColor={colors.border}
          />
        ))}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

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
  requiredAsterisk: {
    color: colors.error,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 48,
    minWidth: 36, // Ensures the 1-letter PAN box remains easily tappable
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