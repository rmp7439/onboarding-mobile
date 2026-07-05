import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Card, Button } from "../index";
import { colors, spacing, typography, radius } from "../../theme";

interface UploadCardProps {
  title: string;
  imageUri: string | null;
  isProcessing: boolean;
  onPress: () => void;
  onReplace: () => void;
  onRemove: () => void;
}

export default function UploadCard({
  title,
  imageUri,
  isProcessing,
  onPress,
  onReplace,
  onRemove,
}: UploadCardProps) {
  if (imageUri) {
    return (
      <Card style={styles.uploadCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.uploadedBadge}>
            <Text style={styles.uploadedBadgeText}>✓ Uploaded</Text>
          </View>
        </View>
        <Image
          source={{ uri: imageUri }}
          style={styles.cardThumbnail}
          resizeMode="cover"
        />
        <View style={styles.cardActionRow}>
          <Button
            title="Replace"
            variant="outline"
            onPress={onReplace}
            style={styles.halfBtn}
            disabled={isProcessing}
          />
          <View style={styles.actionSpacer} />
          <Button
            title="Remove"
            variant="outline"
            onPress={onRemove}
            style={styles.halfBtn}
            disabled={isProcessing}
          />
        </View>
      </Card>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isProcessing}
      android_ripple={{ color: "rgba(0,0,0,0.05)" }}
    >
      <Card style={[styles.uploadCard, styles.emptyUploadCard]}>
        <Text style={styles.emptyCardIcon}>📄</Text>
        <Text style={styles.emptyCardTitle}>Upload {title}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  uploadCard: { marginBottom: spacing.lg },
  emptyUploadCard: {
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  emptyCardIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  uploadedBadge: {
    backgroundColor: "#E8F8EE",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  uploadedBadgeText: {
    color: colors.success,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  cardThumbnail: {
    width: "100%",
    height: 160,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActionRow: { flexDirection: "row", justifyContent: "space-between" },
  halfBtn: { flex: 1 },
  actionSpacer: { width: spacing.sm },
});