import React, { useRef, useState, useEffect, useImperativeHandle } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

export type SegmentType = "numeric" | "alpha" | "fixed";

export interface SegmentConfig {
  length: number;
  type: SegmentType;
  value?: string;
}

export interface SegmentedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  segments: SegmentConfig[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "next";
  ref?: React.Ref<{ focus: () => void }>;
}

export function SegmentedInput({
  label,
  value,
  onChange,
  segments,
  required = false,
  disabled = false,
  error,
  onSubmitEditing,
  returnKeyType = "next",
  ref,
}: SegmentedInputProps) {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [chunks, setChunks] = useState<string[]>(() => {
    let currentIdx = 0;
    return segments.map((seg) => {
      if (seg.type === "fixed" && seg.value) return seg.value;
      const chunk = (value || "").slice(currentIdx, currentIdx + seg.length);
      currentIdx += seg.length;
      return chunk;
    });
  });

  useImperativeHandle(ref, () => ({
    focus: () => {
      const firstEditable = segments.findIndex((s) => s.type !== "fixed");
      if (firstEditable !== -1) inputRefs.current[firstEditable]?.focus();
    },
  }));

  const lastEditableIndex = segments
    .map((s, i) => (s.type !== "fixed" ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  useEffect(() => {
    if (!value) {
      setChunks(
        segments.map((seg) =>
          seg.type === "fixed" && seg.value ? seg.value : "",
        ),
      );
    } else {
      const expectedLength = segments.reduce((acc, s) => acc + s.length, 0);
      if (value.length === expectedLength) {
        setChunks((prev) => {
          if (prev.join("") === value) return prev;
          let currentIdx = 0;
          return segments.map((seg) => {
            if (seg.type === "fixed" && seg.value) {
              currentIdx += seg.length;
              return seg.value;
            }
            const chunk = value.slice(currentIdx, currentIdx + seg.length);
            currentIdx += seg.length;
            return chunk;
          });
        });
      }
    }
  }, [value, segments]);

  const handleChange = (text: string, index: number) => {
    const seg = segments[index];
    if (seg.type === "fixed") return;

    if (text.length > seg.length) {
      let pasted = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
      let reconstructed = "";
      let pIdx = 0;
      const newChunks = [...chunks];

      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        if (s.type === "fixed" && s.value) {
          reconstructed += s.value;
          newChunks[i] = s.value;
          if (pasted[pIdx] === s.value) pIdx++;
        } else {
          let chunk = pasted.slice(pIdx, pIdx + s.length);
          if (s.type === "numeric") chunk = chunk.replace(/\D/g, "");
          if (s.type === "alpha") chunk = chunk.replace(/[^A-Z]/g, "");
          reconstructed += chunk;
          newChunks[i] = chunk;
          pIdx += s.length;
        }
      }

      setChunks(newChunks);
      onChange(reconstructed);

      let lastFilled = -1;
      for (let i = newChunks.length - 1; i >= 0; i--) {
        if (newChunks[i].length > 0) {
          lastFilled = i;
          break;
        }
      }
      if (lastFilled >= 0 && lastFilled < segments.length - 1) {
        inputRefs.current[lastFilled + 1]?.focus();
      } else if (lastFilled === segments.length - 1) {
        inputRefs.current[lastFilled]?.focus();
      }
      return;
    }

    let sanitized = text;
    if (seg.type === "numeric") sanitized = sanitized.replace(/\D/g, "");
    else if (seg.type === "alpha")
      sanitized = sanitized.replace(/[^a-zA-Z]/g, "").toUpperCase();

    const newChunks = [...chunks];
    newChunks[index] = sanitized;

    segments.forEach((s, i) => {
      if (s.type === "fixed" && s.value) newChunks[i] = s.value;
    });

    setChunks(newChunks);
    onChange(newChunks.join(""));

    if (sanitized.length === seg.length && index < segments.length - 1) {
      let nextIdx = index + 1;
      while (nextIdx < segments.length && segments[nextIdx].type === "fixed") {
        nextIdx++;
      }
      if (nextIdx < segments.length) {
        inputRefs.current[nextIdx]?.focus();
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      chunks[index] === "" &&
      index > 0
    ) {
      let prevIdx = index - 1;
      while (prevIdx >= 0 && segments[prevIdx].type === "fixed") {
        prevIdx--;
      }
      if (prevIdx >= 0) inputRefs.current[prevIdx]?.focus();
    }
  };

  const handleSubmitEditing = (index: number) => {
    if (index === lastEditableIndex) {
      if (onSubmitEditing) onSubmitEditing();
    } else {
      let nextIdx = index + 1;
      while (nextIdx < segments.length && segments[nextIdx].type === "fixed") {
        nextIdx++;
      }
      if (nextIdx < segments.length) inputRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.row}>
        {segments.map((seg, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            style={[
              styles.inputBox,
              { flex: seg.length },
              !!error && styles.errorInput,
              (disabled || seg.type === "fixed") && styles.disabledInput,
            ]}
            value={chunks[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType={seg.type === "numeric" ? "number-pad" : "default"}
            maxLength={seg.length}
            autoCapitalize={seg.type === "alpha" ? "characters" : "none"}
            editable={!disabled && seg.type !== "fixed"}
            textAlign="center"
            placeholderTextColor={colors.border}
            returnKeyType={index === lastEditableIndex ? returnKeyType : "next"}
            onSubmitEditing={() => handleSubmitEditing(index)}
            blurOnSubmit={
              index === lastEditableIndex ? returnKeyType === "done" : false
            }
          />
        ))}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
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
    minWidth: 36,
  },
  disabledInput: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  errorInput: { borderColor: colors.error },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});