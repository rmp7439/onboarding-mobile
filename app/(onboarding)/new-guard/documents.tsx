import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Screen, Card, SectionTitle, Button } from "../../../src/components";
import { colors, spacing, typography, radius } from "../../../src/theme";
import { useOnboarding } from "../../../src/context/OnboardingContext";
import { DocumentItem } from "../../../src/types/Document";
import { useImagePickerAction } from "../../../src/hooks/useImagePickerAction";

const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: "pan", title: "PAN Card", uri: null, filename: null },
  { id: "driving", title: "Driving Licence", uri: null, filename: null },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const { openPicker, PickerComponent } = useImagePickerAction();
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);

  const handlePickImage = async (id: string, source: "gallery" | "camera") => {
    try {
      let result;
      if (source === "gallery") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename =
          asset.fileName || asset.uri.split("/").pop() || "document.jpg";

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id ? { ...doc, uri: asset.uri, filename } : doc,
          ),
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Something went wrong while attaching the document.",
      );
    }
  };

  const handleRemove = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, uri: null, filename: null } : doc,
      ),
    );
  };

  const handleContinue = () => {
    const uploadedDocs = documents
      .filter((doc) => doc.uri !== null)
      .map((doc) => doc.title);
    updateData({ uploadedDocuments: uploadedDocs });

    // TODO: Navigate to the new manual review screen (Pending V2 Implementation)
    console.log("Navigating to final review...");
    // router.push('/(onboarding)/new-guard/review-manual');
  };

  return (
    <Screen scrollable={false} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title="Supporting Documents" style={styles.header} />

        <Card style={styles.listCard}>
          {documents.map((doc, index) => {
            const isLast = index === documents.length - 1;
            return (
              <View
                key={doc.id}
                style={[styles.rowContainer, !isLast && styles.rowBorder]}
              >
                <View style={styles.rowHeader}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  {doc.uri ? (
                    <View style={styles.uploadedBadge}>
                      <Text style={styles.uploadedBadgeText}>✓ Attached</Text>
                    </View>
                  ) : (
                    <Text style={styles.optionalText}>Optional</Text>
                  )}
                </View>

                {!doc.uri ? (
                  <View style={styles.actionContainer}>
                    <Button
                      title="Upload"
                      variant="outline"
                      onPress={() =>
                        openPicker(
                          () => handlePickImage(doc.id, "camera"),
                          () => handlePickImage(doc.id, "gallery"),
                        )
                      }
                      style={styles.actionButton}
                    />
                  </View>
                ) : (
                  <View style={styles.attachmentContainer}>
                    <View style={styles.fileInfoRow}>
                      <Image
                        source={{ uri: doc.uri }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                      <View style={styles.fileDetails}>
                        <Text
                          style={styles.filenameText}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {doc.filename}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActionRow}>
                      <Button
                        title="Replace"
                        variant="outline"
                        onPress={() =>
                          openPicker(
                            () => handlePickImage(doc.id, "camera"),
                            () => handlePickImage(doc.id, "gallery"),
                          )
                        }
                        style={styles.halfBtn}
                      />
                      <View style={styles.actionSpacer} />
                      <Button
                        title="Remove"
                        variant="outline"
                        onPress={() => handleRemove(doc.id)}
                        style={styles.halfBtn}
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.fullButton}
        />
      </View>

      <PickerComponent />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.md,
    paddingBottom: spacing["2xl"],
  },
  header: { marginBottom: spacing.lg },
  listCard: {
    padding: 0,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    overflow: "hidden",
  },
  rowContainer: { padding: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  docTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  optionalText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  uploadedBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  uploadedBadgeText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionContainer: { marginTop: spacing.xs },
  actionButton: { height: 44 },
  attachmentContainer: { marginTop: spacing.xs },
  fileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  fileDetails: { flex: 1, marginLeft: spacing.md },
  filenameText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  cardActionRow: { flexDirection: "row", justifyContent: "space-between" },
  halfBtn: { flex: 1, height: 40 },
  actionSpacer: { width: spacing.md },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fullButton: { width: "100%" },
});