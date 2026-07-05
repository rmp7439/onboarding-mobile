import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated, 
  SafeAreaView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Screen, SectionTitle, Button, Card } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/theme';
import { useOnboarding } from '../../../src/context/OnboardingContext';
import { ANIMATION } from '../../../src/constants/Animation';

export default function CapturePhotoScreen() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const [permission, requestPermission] = useCameraPermissions();
  
  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const flashAnim = useRef(new Animated.Value(0)).current;

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    // 1. Trigger realistic camera flash animation
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: ANIMATION?.FLASH_IN_MS || 50,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: ANIMATION?.FLASH_OUT_MS || 400,
        useNativeDriver: true,
      })
    ]).start();

    try {
      // 2. Capture actual photo from Expo Camera
      const photoData = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photoData && photoData.uri) {
        setPhoto(photoData.uri);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
  };

  const handleContinue = () => {
    if (photo) {
      updateData({ selfieUri: photo });
      router.push('/(onboarding)/new-guard/documents');
    }
  };

  // ---------------------------------------------------------------------------
  // PERMISSION STATE
  // ---------------------------------------------------------------------------
  if (!permission) {
    // Camera permissions are still loading
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

  // ---------------------------------------------------------------------------
  // PREVIEW STATE
  // ---------------------------------------------------------------------------
  if (photo) {
    return (
      <Screen style={styles.container}>
        <View style={styles.content}>
          <SectionTitle
            title="Review Photo"
            subtitle="Ensure your face is clearly visible, well-lit, and directly facing the camera."
            style={styles.header}
          />
          <Card style={styles.previewCard}>
            <View style={styles.capturedPlaceholder}>
              <Image source={{ uri: photo }} style={styles.capturedImage} resizeMode="cover" />
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
            onPress={handleRetake}
            style={[styles.fullButton, styles.secondaryButton]}
          />
        </View>
      </Screen>
    );
  }

  // ---------------------------------------------------------------------------
  // LIVE CAMERA STATE
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.cameraContainer}>
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject} 
        facing="front"
      />

      {/* UI Overlay over the live camera feed */}
      <View style={styles.cameraOverlay}>
        <View style={styles.cameraHeader}>
          <Text style={styles.cameraTitle}>Face Capture</Text>
          <Text style={styles.cameraSubtitle}>Position your face inside the circle</Text>
        </View>

        <View style={styles.faceGuideContainer}>
          {/* Circular Face Guide Overlay */}
          <View style={styles.faceGuide} />
        </View>

        <View style={styles.cameraFooter}>
          <Pressable 
            style={({ pressed }) => [
              styles.shutterButton,
              pressed && styles.shutterButtonPressed,
              isCapturing && styles.shutterButtonDisabled
            ]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            <View style={styles.shutterInner} />
          </Pressable>
        </View>
      </View>

      {/* Camera Flash Overlay */}
      <Animated.View 
        style={[styles.flashOverlay, { opacity: flashAnim }]} 
        pointerEvents="none" 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Permission & Preview State Styles
  container: { 
    flex: 1, 
    justifyContent: 'space-between',
  },
  content: { 
    flex: 1,
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  permissionHeader: {
    alignItems: 'center',
    textAlign: 'center',
  },
  header: { 
    marginBottom: spacing.xl, 
    marginTop: spacing.md,
  },
  previewCard: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedPlaceholder: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  footer: { 
    paddingVertical: spacing.md, 
    marginTop: spacing.md,
  },
  fullButton: { 
    width: '100%',
  },
  secondaryButton: { 
    marginTop: spacing.md,
  },

  // Camera State Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  cameraHeader: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cameraSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  faceGuideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 280,
    height: 380, // Slightly oval to match face proportions better
    borderRadius: 140, // 280/2
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderStyle: 'dashed',
  },
  cameraFooter: {
    paddingBottom: 60,
    paddingTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  shutterButtonDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    zIndex: 100,
  }
});