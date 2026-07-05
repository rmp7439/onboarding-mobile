import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Card, SectionTitle, Button } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/theme';
import { useOnboarding } from '../../../src/context/OnboardingContext';

const OCR_STAGES = [
  'Scanning Document',
  'Enhancing Image',
  'Reading Text',
  'Extracting Name',
  'Extracting DOB',
  'Extracting Address',
  'Preparing Review'
];

interface PreviewState {
  uri: string;
  side: 'front' | 'back';
  source: 'gallery' | 'camera';
  width: number;
  height: number;
  filename: string;
}

export default function AadhaarUploadScreen() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  
  // OCR Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);

  // Preview Screen State
  const [preview, setPreview] = useState<PreviewState | null>(null);

  // Animation values
  const progress = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const scanLineY = useRef(new Animated.Value(0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;
  
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      progress.stopAnimation();
      textOpacity.stopAnimation();
      scanLineY.stopAnimation();
      previewAnim.stopAnimation();
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, []);

  const handlePickImage = async (side: 'front' | 'back', source: 'gallery' | 'camera') => {
    try {
      let result;

      if (source === 'gallery') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Permission to access the gallery is required!');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Permission to access the camera is required!');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename = asset.fileName || asset.uri.split('/').pop() || 'document.jpg';
        
        setPreview({
          uri: asset.uri,
          side,
          source,
          width: asset.width,
          height: asset.height,
          filename
        });

        // Animate preview screen in
        Animated.spring(previewAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }).start();
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert('Error', 'Something went wrong while processing the image.');
    }
  };

  const handleUseImage = () => {
    if (!preview) return;
    
    // Save to the correct slot
    if (preview.side === 'front') {
      setFrontImage(preview.uri);
    } else {
      setBackImage(preview.uri);
    }

    // Animate preview out
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setPreview(null);
    });
  };

  const handleRetake = () => {
    if (!preview) return;
    const { side, source } = preview;
    
    // Close preview and immediately reopen picker
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setPreview(null);
      // Slight delay ensures the UI settles before opening native modals again
      setTimeout(() => {
        handlePickImage(side, source);
      }, 100);
    });
  };

  const handleCancelPreview = () => {
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setPreview(null);
    });
  };

  const handleContinue = () => {
    setIsProcessing(true);
    setCurrentStageIndex(0);
    
    progress.setValue(0);
    textOpacity.setValue(1);
    scanLineY.setValue(0);

    const totalDuration = OCR_STAGES.length * 800;

    Animated.timing(progress, {
      toValue: 1,
      duration: totalDuration,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: 296,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();

    let step = 0;
    stepIntervalRef.current = setInterval(() => {
      step++;
      if (step >= OCR_STAGES.length) {
        if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
        
        setTimeout(() => {
          updateData({
            fullName: 'Vikram Sharma',
            dateOfBirth: '15/08/1995',
            gender: 'Male',
            aadhaarNumber: '[Aadhaar Redacted]', 
            address: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pinCode: '400001',
          });
          setIsProcessing(false);
          router.push('/(onboarding)/new-guard/review-details');
        }, 500);
      } else {
        Animated.sequence([
          Animated.timing(textOpacity, { toValue: 0, duration: 200, useNativeDriver: true })
        ]).start(() => {
          setCurrentStageIndex(step);
          Animated.timing(textOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
      }
    }, 800);
  };

  const renderUploadSection = (
    title: string,
    imageUri: string | null,
    onGallery: () => void,
    onCamera: () => void,
    onRemove: () => void
  ) => (
    <Card style={styles.uploadCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.thumbnailImage} 
            resizeMode="cover" 
          />
          <Button 
            title="Remove" 
            variant="outline" 
            onPress={onRemove} 
            style={styles.actionButton}
            disabled={isProcessing}
          />
        </View>
      ) : (
        <View style={styles.buttonGroup}>
          <Button 
            title="Upload from Gallery" 
            variant="outline" 
            onPress={onGallery} 
            style={styles.actionButton}
            disabled={isProcessing}
          />
          <View style={styles.buttonSpacer} />
          <Button 
            title="Capture using Camera" 
            variant="secondary" 
            onPress={onCamera} 
            style={styles.actionButton}
            disabled={isProcessing}
          />
        </View>
      )}
    </Card>
  );

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <SectionTitle
          title="Upload Document"
          subtitle="Upload both sides of the document for automatic information extraction."
          style={styles.header}
        />

        {renderUploadSection(
          'Front Side',
          frontImage,
          () => handlePickImage('front', 'gallery'),
          () => handlePickImage('front', 'camera'),
          () => setFrontImage(null)
        )}

        {renderUploadSection(
          'Back Side',
          backImage,
          () => handlePickImage('back', 'gallery'),
          () => handlePickImage('back', 'camera'),
          () => setBackImage(null)
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>✓ OCR will automatically extract:</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletText}>• Full Name</Text>
            <Text style={styles.bulletText}>• Date of Birth</Text>
            <Text style={styles.bulletText}>• Gender</Text>
            <Text style={styles.bulletText}>• Address</Text>
            <Text style={styles.bulletText}>• Document Number</Text>
          </View>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          disabled={!frontImage || !backImage || isProcessing}
          onPress={handleContinue}
          style={styles.button}
        />
      </View>

      {/* Full Screen Image Preview Overlay */}
      {preview && (
        <Animated.View 
          style={[
            styles.previewScreenOverlay,
            {
              opacity: previewAnim,
              transform: [{
                translateY: previewAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0] // Slide up slightly while fading in
                })
              }]
            }
          ]}
        >
          <SafeAreaView style={styles.previewSafeArea}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Review Image</Text>
              <Button title="Cancel" variant="outline" onPress={handleCancelPreview} style={styles.cancelPreviewBtn} />
            </View>
            
            <View style={styles.previewImageWrapper}>
              <Image 
                source={{ uri: preview.uri }} 
                style={styles.fullPreviewImage} 
                resizeMode="contain" 
              />
            </View>

            <View style={styles.previewFooter}>
              <Card style={styles.previewDetailsCard}>
                <View style={styles.previewDetailRow}>
                  <Text style={styles.previewDetailLabel}>Filename:</Text>
                  <Text style={styles.previewDetailValue} numberOfLines={1} ellipsizeMode="middle">
                    {preview.filename}
                  </Text>
                </View>
                <View style={styles.previewDetailRow}>
                  <Text style={styles.previewDetailLabel}>Resolution:</Text>
                  <Text style={styles.previewDetailValue}>
                    {preview.width} x {preview.height}
                  </Text>
                </View>
              </Card>
              
              <View style={styles.previewButtonRow}>
                <Button 
                  title="Retake" 
                  variant="outline" 
                  onPress={handleRetake} 
                  style={styles.previewHalfBtn} 
                />
                <Button 
                  title="Use Image" 
                  onPress={handleUseImage} 
                  style={styles.previewHalfBtn} 
                />
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      )}

      {/* OCR Processing Animated Overlay - Google Lens Style */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          
          <View style={styles.scannerBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
          </View>

          <View style={styles.statusContainer}>
            <Animated.Text style={[styles.stageText, { opacity: textOpacity }]}>
              {OCR_STAGES[currentStageIndex]}...
            </Animated.Text>
            
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]} 
              />
            </View>
          </View>

        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  content: { flex: 1 },
  header: { marginBottom: spacing.lg, marginTop: spacing.md },
  uploadCard: { marginBottom: spacing.lg },
  cardTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text, marginBottom: spacing.md },
  buttonGroup: { width: '100%' },
  actionButton: { width: '100%' },
  buttonSpacer: { height: spacing.sm },
  previewContainer: { width: '100%' },
  thumbnailImage: { width: '100%', height: 140, borderRadius: radius.md, marginBottom: spacing.md, backgroundColor: colors.background },
  infoCard: { backgroundColor: colors.background, marginTop: spacing.xs, marginBottom: spacing.xl },
  infoTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.success, marginBottom: spacing.sm },
  bulletPoints: { paddingLeft: spacing.sm },
  bulletText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  footer: { paddingVertical: spacing.md, marginTop: spacing.md },
  button: { width: '100%' },

  // Preview Screen Styles
  previewScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
    zIndex: 20, // Sit above everything
  },
  previewSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  previewTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  cancelPreviewBtn: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
  previewImageWrapper: {
    flex: 1,
    backgroundColor: '#000', // Black background for image isolation
    marginVertical: spacing.md,
  },
  fullPreviewImage: {
    width: '100%',
    height: '100%',
  },
  previewFooter: {
    padding: spacing.md,
    paddingBottom: spacing.xl, // Extra padding for bottom edge
  },
  previewDetailsCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  previewDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewDetailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  previewDetailValue: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'right',
    marginLeft: spacing.lg,
  },
  previewButtonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewHalfBtn: {
    flex: 1,
  },
  
  // Lens-Style Processing Overlay
  processingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0, 0, 0, 0.92)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: spacing.xl, 
    zIndex: 30 // Ensure it covers preview if somehow triggered simultaneously
  },
  scannerBox: {
    width: 240,
    height: 300,
    position: 'relative',
    marginBottom: spacing['3xl'],
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.primary,
  },
  topLeft: {
    top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radius.md,
  },
  topRight: {
    top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radius.md,
  },
  bottomLeft: {
    bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radius.md,
  },
  bottomRight: {
    bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: radius.md,
  },
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8, 
    borderRadius: radius.full,
  },
  statusContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  stageText: { 
    fontSize: typography.fontSize.lg, 
    fontWeight: typography.fontWeight.semibold, 
    color: colors.white, 
    marginBottom: spacing.xl, 
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressBarBackground: { 
    width: '100%', 
    height: 6, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: radius.full, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: colors.primary, 
    borderRadius: radius.full 
  },
});