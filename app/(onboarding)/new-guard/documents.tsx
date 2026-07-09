import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Alert, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Screen, Card, SectionTitle, Button } from "../../../src/components";
import { useImagePickerAction } from "../../../src/hooks/useImagePickerAction";
import { useOnboarding } from "../../../src/context/OnboardingContext";
import { api } from "../../../src/api/apiClient";
import { mapEmployeeData, mapDocumentType } from "../../../src/utils/dataMappers";
import { DocumentItem } from "../../../src/types/Document";
import { colors, spacing, typography, radius } from "../../../src/theme";
import { IMAGE_QUALITY } from "../../../src/constants/App";

const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: "aadhaar", title: "Aadhaar Card", uri: null, filename: null, required: true },
  { id: "pan", title: "PAN Card", uri: null, filename: null, required: false },
  { id: "driving", title: "Driving Licence", uri: null, filename: null, required: false },
  { id: "bank", title: "Bank Passbook / Cancelled Cheque", uri: null, filename: null, required: false },
  { id: "education", title: "Education Proof", uri: null, filename: null, required: false },
  { id: "voter", title: "Voter ID Card", uri: null, filename: null, required: false },
  { id: "discharge", title: "Discharge Book (If Applicable)", uri: null, filename: null, required: false },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const { openPicker, PickerComponent } = useImagePickerAction();
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  const [registeredEmployeeId, setRegisteredEmployeeId] = useState<string | null>(null);
  const [isSelfieUploaded, setIsSelfieUploaded] = useState(false);
  const [completedDocUploads, setCompletedDocUploads] = useState<string[]>([]);

  const handlePickImage = async (id: string, source: "gallery" | "camera") => {
    try {
      let result;
      if (source === "gallery") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: IMAGE_QUALITY,
        });
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: IMAGE_QUALITY,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename = asset.fileName || asset.uri.split("/").pop() || "document.jpg";
        setDocuments((prev) => prev.map((doc) => doc.id === id ? { ...doc, uri: asset.uri, filename } : doc));
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong while attaching the document.");
    }
  };

  const handleRemove = (id: string) => {
    setDocuments((prev) => prev.map((doc) => doc.id === id ? { ...doc, uri: null, filename: null } : doc));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorText(null);

    try {
      let empId = registeredEmployeeId;

      if (!empId) {
        setProgressText("Registering employee details...");
        const mappedData = mapEmployeeData(data);
        const result = await api.registerEmployee(mappedData);
        empId = result.id;
        setRegisteredEmployeeId(empId);
      }

      if (!isSelfieUploaded && data.selfieUri) {
        setProgressText("Uploading security selfie...");
        await api.uploadSelfie(empId!, data.selfieUri);
        setIsSelfieUploaded(true);
      }

      const docsToUpload = documents.filter((doc) => doc.uri !== null);
      for (let i = 0; i < docsToUpload.length; i++) {
        const doc = docsToUpload[i];

        if (completedDocUploads.includes(doc.id)) continue;

        setProgressText(`Uploading ${doc.title} (${i + 1}/${docsToUpload.length})...`);
        const docType = mapDocumentType(doc.id);

        await api.uploadDocument(empId!, docType, doc.uri!);
        setCompletedDocUploads((prev) => [...prev, doc.id]);
      }

      setProgressText("Finalizing profile...");
      const finalDocNames = docsToUpload.map((doc) => doc.title);
      updateData({ uploadedDocuments: finalDocNames });

      router.push("/(onboarding)/new-guard/success");
    } catch (error: any) {
      setErrorText(error.message || "An unexpected error occurred during the upload process.");
    } finally {
      setIsSubmitting(false);
      setProgressText("");
    }
  };

  const requiredDocs = documents.filter((doc) => doc.required);
  const optionalDocs = documents.filter((doc) => !doc.required);
  
  // Submit is enabled as long as all required docs (just Aadhaar) are uploaded
  const isContinueEnabled = requiredDocs.every((doc) => doc.uri !== null);

  const renderDocumentRow = (doc: DocumentItem, index: number, total: number) => {
    const isLast = index === total - 1;
    return (
      <View key={doc.id} style={[styles.rowContainer, !isLast && styles.rowBorder]}>
        <View style={styles.rowHeader}>
          <Text style={styles.docTitle}>{doc.title}</Text>
          {doc.uri ? (
            <View style={styles.uploadedBadge}>
              <Text style={styles.uploadedBadgeText}>✓ Attached</Text>
            </View>
          ) : (
            <Text style={[styles.optionalText, doc.required && styles.requiredText]}>
              {doc.required ? "Required" : "Optional"}
            </Text>
          )}
        </View>

        {!doc.uri ? (
          <View style={styles.actionContainer}>
            <Button
              title="Upload"
              variant="outline"
              disabled={isSubmitting}
              onPress={() => openPicker(() => handlePickImage(doc.id, "camera"), () => handlePickImage(doc.id, "gallery"))}
              style={styles.actionButton}
            />
          </View>
        ) : (
          <View style={styles.attachmentContainer}>
            <View style={styles.fileInfoRow}>
              <Image source={{ uri: doc.uri }} style={styles.thumbnail} resizeMode="cover" />
              <View style={styles.fileDetails}>
                <Text style={styles.filenameText} numberOfLines={1} ellipsizeMode="middle">{doc.filename}</Text>
              </View>
            </View>
            <View style={styles.cardActionRow}>
              <Button
                title="Replace"
                variant="outline"
                disabled={isSubmitting}
                onPress={() => openPicker(() => handlePickImage(doc.id, "camera"), () => handlePickImage(doc.id, "gallery"))}
                style={styles.halfBtn}
              />
              <View style={styles.actionSpacer} />
              <Button
                title="Remove"
                variant="outline"
                disabled={isSubmitting}
                onPress={() => handleRemove(doc.id)}
                style={styles.halfBtn}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen scrollable={false} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionTitle
          title="Supporting Documents"
          subtitle="Upload required documents before continuing."
          style={styles.header}
        />

        <SectionTitle title="Required Document" style={styles.sectionHeader} />
        <Card style={styles.listCard}>
          {requiredDocs.map((doc, index) => renderDocumentRow(doc, index, requiredDocs.length))}
        </Card>

        {optionalDocs.length > 0 && (
          <>
            <SectionTitle title="Additional Documents" style={[styles.sectionHeader, styles.marginTop]} />
            <Card style={styles.listCard}>
              {optionalDocs.map((doc, index) => renderDocumentRow(doc, index, optionalDocs.length))}
            </Card>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}
        {progressText ? <Text style={styles.progressText}>{progressText}</Text> : null}
        <Button
          title={errorText ? "Retry Failed Uploads" : "Submit"}
          onPress={handleSubmit}
          disabled={!isContinueEnabled || isSubmitting}
          loading={isSubmitting}
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
  header: { marginBottom: spacing.md },
  sectionHeader: { marginBottom: spacing.sm },
  marginTop: { marginTop: spacing.xl },
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
  requiredText: { color: colors.error },
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
  progressText: {
    textAlign: "center",
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  errorBanner: {
    textAlign: "center",
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
});