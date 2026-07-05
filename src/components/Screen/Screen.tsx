import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  ViewStyle, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  safeAreaEdges?: Edge[];
}

export function Screen({
  children,
  scrollable = true,
  style,
  safeAreaEdges = ['top', 'bottom', 'left', 'right'],
}: ScreenProps) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.nonScrollContent, style]}>{children}</View>
  );

  // By placing KeyboardAvoidingView as the outermost wrapper, it manages the entire screen layout.
  // This prevents SafeAreaView's bottom edge calculations from interfering with Android's adjustResize 
  // and ensures iOS padding works natively around the safe area.
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        {content}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  nonScrollContent: {
    flex: 1,
    padding: spacing.md,
  },
});