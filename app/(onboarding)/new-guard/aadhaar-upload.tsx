import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Alert, 
  Pressable, 
  Platform, 
  ActionSheetIOS, 
  Modal, 
  Easing,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, SectionTitle, Button } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/theme';
import { useOnboarding } from '../../../src/context/OnboardingContext';
import { scannerService } from '../../../src/services/scanner/ScannerService';
import { ocrService } from '../../../src/services/ocr/OCRService';
import { aadhaarParser } from '../../../src/services/parser/AadhaarParser';
import { PreviewState } from '../../../src/types/Document';
import { OCR_STAGES } from '../../../src/constants/OCR';
import { ANIMATION } from '../../../src/constants/Animation';
import { useImagePickerAction } from '../../../src/hooks/useImagePickerAction';

import UploadCard from '../../../src/components/onboarding/UploadCard';
import ImagePreviewModal from '../../../src/components/onboarding/ImagePreviewModal';
import OCRProcessingOverlay from '../../../src/components/onboarding/OCRProcessingOverlay';

export default function AadhaarUploadScreen() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const { openPicker, PickerComponent } = useImagePickerAction();
  
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [displayedPercent, setDisplayedPercent] = useState<number>(0);
  const [displayedTime, setDisplayedTime] = useState<number>(0);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const progress = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const scanLineY = useRef(new Animated.Value(0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;
  const spinnerAnim = useRef(new Animated.Value(0)).current;
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const progressListener = progress.addListener(({ value }) => {
      setDisplayedPercent(Math.min(100, Math.round(value * 100)));
      const remainingSecs = Math.max(0, Math.ceil((1 - value) * (OCR_STAGES.length * ANIMATION.OCR_STAGE_DELAY_MS) / 1000));
      setDisplayedTime(remainingSecs);
    });

    return () => {
      progress.removeListener(progressListener);
      progress.stopAnimation();
      textOpacity.stopAnimation();
      scanLineY.stopAnimation();
      previewAnim.stopAnimation();
      spinnerAnim.stopAnimation();
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, []);

  const handlePickImage = async (side: 'front' | 'back', source: 'gallery' | 'camera') => {
    try {
      const result = source === 'gallery' ? await scannerService.pickFromGallery() : await scannerService.captureFromCamera();
      if (result) {
        setPreview({ uri: result.uri, side, source, width: result.width, height: result.height, filename: result.filename });
        Animated.spring(previewAnim, {
          toValue: 1, useNativeDriver: true, damping: ANIMATION.PREVIEW_SPRING_DAMPING, stiffness: ANIMATION.PREVIEW_SPRING_STIFFNESS,
        }).start();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong while processing the image.');
    }
  };

  const handleUseImage = () => {
    if (!preview) return;
    preview.side === 'front' ? setFrontImage(preview.uri) : setBackImage(preview.uri);
    Animated.timing(previewAnim, { toValue: 0, duration: ANIMATION.PREVIEW_FADE_OUT_MS, useNativeDriver: true }).start(() => setPreview(null));
  };

  const handleRetake = () => {
    if (!preview) return;
    const { side, source } = preview;
    Animated.timing(previewAnim, { toValue: 0, duration: ANIMATION.PREVIEW_RETAKE_FADE_OUT_MS, useNativeDriver: true }).start(() => {
      setPreview(null);
      setTimeout(() => handlePickImage(side, source), ANIMATION.PREVIEW_RETAKE_DELAY_MS);
    });
  };

  const handleCancelPreview = () => {
    Animated.timing(previewAnim, { toValue: 0, duration: ANIMATION.PREVIEW_FADE_OUT_MS, useNativeDriver: true }).start(() => setPreview(null));
  };

  const handleContinue = async () => {
    if (!frontImage || !backImage) return;

    setIsProcessing(true);
    setCurrentStageIndex(0);
    progress.setValue(0);
    textOpacity.setValue(1);
    scanLineY.setValue(0);
    spinnerAnim.setValue(0);

    const totalDuration = OCR_STAGES.length * ANIMATION.OCR_STAGE_DELAY_MS;

    Animated.timing(progress, { toValue: 1, duration: totalDuration, useNativeDriver: false }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(scanLineY, { toValue: ANIMATION.SCAN_LINE_TRAVEL_DISTANCE, duration: ANIMATION.SCAN_LINE_DURATION_MS, useNativeDriver: true }),
      Animated.timing(scanLineY, { toValue: 0, duration: ANIMATION.SCAN_LINE_DURATION_MS, useNativeDriver: true })
    ])).start();
    Animated.loop(Animated.timing(spinnerAnim, { toValue: 1, duration: ANIMATION.SPINNER_DURATION_MS, easing: Easing.linear, useNativeDriver: true })).start();

    let step = 0;
    stepIntervalRef.current = setInterval(() => {
      step++;
      if (step < OCR_STAGES.length) {
        Animated.sequence([Animated.timing(textOpacity, { toValue: 0, duration: ANIMATION.TEXT_FADE_OUT_MS, useNativeDriver: true })]).start(() => {
          setCurrentStageIndex(step);
          Animated.timing(textOpacity, { toValue: 1, duration: ANIMATION.TEXT_FADE_IN_MS, useNativeDriver: true }).start();
        });
      } else {
        if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      }
    }, ANIMATION.OCR_STAGE_DELAY_MS);

    try {
      const ocrResult = await ocrService.extract(frontImage, backImage);
      if (ocrResult.success) {
        const parsedData = await aadhaarParser.parse(ocrResult.rawText);
        updateData(parsedData);
        setIsProcessing(false);
        router.push('/(onboarding)/new-guard/review-details');
      }
    } catch (error) {
      Alert.alert("OCR Failed", "Unable to extract text from document.");
      setIsProcessing(false);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    }
  };

  return (
    <Screen scrollable={false} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle 
          title="Upload Document" 
          subtitle="Upload both sides of the document for automatic information extraction." 
          style={styles.header} 
        />

        <UploadCard 
          title="Front Side" 
          imageUri={frontImage} 
          isProcessing={isProcessing} 
          onPress={() => openPicker(() => handlePickImage('front', 'camera'), () => handlePickImage('front', 'gallery'))} 
          onReplace={() => openPicker(() => handlePickImage('front', 'camera'), () => handlePickImage('front', 'gallery'))} 
          onRemove={() => setFrontImage(null)} 
        />
        <UploadCard 
          title="Back Side" 
          imageUri={backImage} 
          isProcessing={isProcessing} 
          onPress={() => openPicker(() => handlePickImage('back', 'camera'), () => handlePickImage('back', 'gallery'))} 
          onReplace={() => openPicker(() => handlePickImage('back', 'camera'), () => handlePickImage('back', 'gallery'))} 
          onRemove={() => setBackImage(null)} 
        />

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
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continue" 
          disabled={!frontImage || !backImage || isProcessing} 
          onPress={handleContinue} 
          style={styles.button} 
        />
      </View>

      <PickerComponent />

      <ImagePreviewModal 
        preview={preview} 
        previewAnim={previewAnim} 
        onCancel={handleCancelPreview} 
        onRetake={handleRetake} 
        onUseImage={handleUseImage} 
      />
      
      <OCRProcessingOverlay 
        isProcessing={isProcessing} 
        scanLineY={scanLineY} 
        progress={progress} 
        displayedPercent={displayedPercent} 
        displayedTime={displayedTime} 
        currentStageIndex={currentStageIndex} 
        textOpacity={textOpacity} 
        spinnerInterpolate={spinnerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })} 
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollView: { 
    flex: 1,
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: spacing['2xl'], 
  },
  header: { 
    marginBottom: spacing.lg, 
    marginTop: spacing.md,
  },
  infoCard: { 
    backgroundColor: colors.background, 
    marginTop: spacing.xs, 
    marginBottom: spacing.md, 
  },
  infoTitle: { 
    fontSize: typography.fontSize.md, 
    fontWeight: typography.fontWeight.semibold, 
    color: colors.success, 
    marginBottom: spacing.sm,
  },
  bulletPoints: { 
    paddingLeft: spacing.sm,
  },
  bulletText: { 
    fontSize: typography.fontSize.sm, 
    color: colors.textSecondary, 
    marginBottom: spacing.xs,
  },
  footer: { 
    paddingTop: spacing.md, 
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg, 
    backgroundColor: colors.background, 
    borderTopWidth: 1, 
    borderTopColor: colors.border, 
  },
  button: { 
    width: '100%',
  },
});