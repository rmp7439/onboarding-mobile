import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Screen, SectionTitle, Button, Card } from "../../../src/components";
import { colors, spacing, typography, radius } from "../../../src/theme";
import { useOnboarding } from "../../../src/context/OnboardingContext";
import { ANIMATION } from "../../../src/constants/Animation";
import { IMAGE_QUALITY } from "../../../src/constants/App";

export default function CapturePhotoScreen() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Dynamic layout states for perfect cropping
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [guideTop, setGuideTop] = useState(0);

  const flashAnim = useRef(new Animated.Value(0)).current;

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);

    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: ANIMATION.FLASH_IN_MS || 50,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: ANIMATION.FLASH_OUT_MS || 400,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const photoData = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      if (photoData && photoData.uri) {
        let photoWidth = photoData.width;
        let photoHeight = photoData.height;

        if (screenWidth < screenHeight && photoWidth > photoHeight) {
          photoWidth = photoData.height;
          photoHeight = photoData.width;
        }

        const scale = Math.max(screenWidth / photoWidth, screenHeight / photoHeight);
        const displayedWidth = photoWidth * scale;
        const displayedHeight = photoHeight * scale;

        const offsetX = (displayedWidth - screenWidth) / 2;
        const offsetY = (displayedHeight - screenHeight) / 2;
        const guideLeft = (screenWidth - 280) / 2;

        // 1. Find the center of the visual guide on the screen
        const guideCenterX = guideLeft + (280 / 2);
        const guideCenterY = guideTop + (380 / 2);

        // 2. Define the square size needed to fully encompass the 280x380 guide
        const squareSize = 380;
        const halfSquare = squareSize / 2;

        // 3. Calculate the top-left coordinates of this square on the screen
        const squareLeft = guideCenterX - halfSquare;
        const squareTop = guideCenterY - halfSquare;

        // 4. Map the screen square coordinates to the raw photo resolution
        const cropX = Math.max(0, Math.floor((squareLeft + offsetX) / scale));
        const cropY = Math.max(0, Math.floor((squareTop + offsetY) / scale));
        
        // 5. Ensure the final crop is a perfect square and doesn't exceed photo boundaries
        const targetCropSize = Math.floor(squareSize / scale);
        const cropSize = Math.min(
          targetCropSize, 
          photoWidth - cropX, 
          photoHeight - cropY
        );

        const manipResult = await manipulateAsync(
          photoData.uri,
          // Use the single cropSize for both width and height to guarantee a 1:1 image
          [{ crop: { originX: cropX, originY: cropY, width: cropSize, height: cropSize } }],
          { compress: IMAGE_QUALITY, format: SaveFormat.JPEG }
        );

        setPhoto(manipResult.uri);
      }
    } catch (error) {
      console.error("Failed to capture photo:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleContinue = () => {
    if (photo) {
      updateData({ selfieUri: photo });
      router.push("/(onboarding)/new-guard/documents");
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <Screen style={styles.container}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionIcon}>📷</Text>
          <SectionTitle
            title="Camera Access Required"
            subtitle="We need access to your camera to capture your employee profile photo for identity verification."
            style={styles.permissionHeader}
          />
        </View>
        <View style={styles.footer}>
          <Button
            title="Allow Camera Access"
            onPress={requestPermission}
            style={styles.fullButton}
          />
        </View>
      </Screen>
    );
  }

  if (photo) {
    return (
      <Screen style={styles.container}>
        <View style={styles.content}>
          <SectionTitle title="Review Photo" style={styles.header} />
          <Card style={styles.previewCard}>
            {/* The preview will now natively fit the cropped face nicely */}
            <View style={styles.capturedPlaceholder}>
              <Image
                source={{ uri: photo }}
                style={styles.capturedImage}
                resizeMode="cover"
              />
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            title="Use Photo"
            onPress={handleContinue}
            style={styles.fullButton}
          />
          <Button
            title="Retake"
            variant="outline"
            onPress={() => setPhoto(null)}
            style={[styles.fullButton, styles.secondaryButton]}
          />
        </View>
      </Screen>
    );
  }

  return (
    <SafeAreaView style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="front"
      />

      <View style={styles.cameraOverlay}>
        <View style={styles.cameraHeader}>
          <Text style={styles.cameraTitle}>Face Capture</Text>
          <Text style={styles.cameraSubtitle}>
            Position your face inside the circle
          </Text>
        </View>

        <View
          style={styles.faceGuideContainer}
          // Extracts the exact Y-position of the face guide relative to the screen on load
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            setGuideTop(y + (height - 280) / 2);
          }}
        >
          <View style={styles.faceGuide} />
        </View>

        <View style={styles.cameraFooter}>
          <Pressable
            style={({ pressed }) => [
              styles.shutterButton,
              pressed && styles.shutterButtonPressed,
              isCapturing && styles.shutterButtonDisabled,
            ]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            <View style={styles.shutterInner} />
          </Pressable>
        </View>
      </View>

      <Animated.View
        style={[styles.flashOverlay, { opacity: flashAnim }]}
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  permissionIcon: { fontSize: 64, marginBottom: spacing.xl },
  permissionHeader: { alignItems: "center" },
  header: { marginBottom: spacing.xl, marginTop: spacing.md },
  previewCard: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  capturedPlaceholder: {
    width: "100%",
    aspectRatio: 1 / 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  capturedImage: { width: "100%", height: "100%" },
  footer: { paddingVertical: spacing.md, marginTop: spacing.md },
  fullButton: { width: "100%" },
  secondaryButton: { marginTop: spacing.md },
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    zIndex: 10,
  },
  cameraHeader: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  cameraTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: "#FFF",
    marginBottom: spacing.xs,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cameraSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  faceGuideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  faceGuide: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderStyle: "dashed",
  },
  cameraFooter: {
    paddingBottom: 60,
    paddingTop: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterButtonPressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  shutterButtonDisabled: { opacity: 0.5 },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFF",
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFF",
    zIndex: 100,
  },
});