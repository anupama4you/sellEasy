import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ProductListing, ProductImage } from '../types';
import { ObjectDetectionService } from '../services/objectDetectionService';
import { AIService } from '../services/aiService';
import { ChatGPTService } from '../services/chatgptService';
import { WatermarkService } from '../services/watermarkService';

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<ProductImage[]>([]);
  const [useChatGPT, setUseChatGPT] = useState(false);
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation<CameraScreenNavigationProp>();

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to take photos</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false
      });

      // Add to captured images with camera metadata
      const newImage: ProductImage = {
        uri: photo.uri,
        isFromCamera: true,
        hasWatermark: false,
        timestamp: new Date()
      };

      setCapturedImages(prev => [...prev, newImage]);

      Alert.alert(
        'Photo Captured!',
        capturedImages.length === 0
          ? 'Add more photos or process this one?'
          : `You have ${capturedImages.length + 1} photos. Add more or continue?`,
        [
          { text: 'Add More', style: 'cancel' },
          { text: 'Process', onPress: () => processAllImages([...capturedImages, newImage]) }
        ]
      );
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsProcessing(true);

        // Add gallery images (NOT from camera, so no watermark)
        const newImages: ProductImage[] = result.assets.map(asset => ({
          uri: asset.uri,
          isFromCamera: false,
          hasWatermark: false,
          timestamp: new Date()
        }));

        const allImages = [...capturedImages, ...newImages];
        setCapturedImages(allImages);

        Alert.alert(
          'Images Added',
          `Added ${newImages.length} image(s). Total: ${allImages.length}`,
          [
            { text: 'Add More', style: 'cancel' },
            { text: 'Process', onPress: () => processAllImages(allImages) }
          ]
        );

        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setIsProcessing(false);
    }
  };

  const processAllImages = async (images: ProductImage[]) => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please capture or select at least one image.');
      return;
    }

    setIsProcessing(true);

    try {
      // Check if ChatGPT is available
      const hasChatGPT = await ChatGPTService.hasApiKey();

      let aiContent;

      if (hasChatGPT && images.length > 0) {
        // Use ChatGPT for advanced image analysis
        console.log(`Analyzing ${images.length} image(s) with ChatGPT...`);

        const imageUris = images.map(img => img.uri);

        if (images.length === 1) {
          aiContent = await ChatGPTService.analyzeImage(imageUris[0]);
        } else {
          aiContent = await ChatGPTService.analyzeMultipleImages(imageUris);
        }
      } else {
        // Fallback to object detection + basic AI
        console.log('Using basic object detection...');
        const detectedObject = await ObjectDetectionService.detectObject(images[0].uri);

        if (!ObjectDetectionService.isValidMarketplaceItem(detectedObject.class)) {
          Alert.alert(
            'Invalid Item',
            `We detected "${detectedObject.class}" which may not be suitable for marketplace. Do you want to continue?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Continue',
                onPress: () => {
                  generateListingFromDetection(images, detectedObject);
                }
              }
            ]
          );
          setIsProcessing(false);
          return;
        }

        aiContent = await AIService.generateListingContent(detectedObject);
      }

      // Create listing with all images
      const listing: ProductListing = {
        title: aiContent.title,
        description: aiContent.description,
        price: aiContent.suggestedPrice,
        suggestedPrice: aiContent.suggestedPrice,
        category: aiContent.category,
        condition: aiContent.condition,
        imageUri: images[0].uri, // Primary image
        images: images // All images
      };

      setIsProcessing(false);
      navigation.navigate('Preview', { listing });
    } catch (error: any) {
      console.error('Error processing images:', error);
      setIsProcessing(false);

      Alert.alert(
        'Processing Error',
        error.message || 'Failed to process images. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => processAllImages(images)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const generateListingFromDetection = async (images: ProductImage[], detectedObject: any) => {
    try {
      const aiContent = await AIService.generateListingContent(detectedObject);

      const listing: ProductListing = {
        title: aiContent.title,
        description: aiContent.description,
        price: aiContent.suggestedPrice,
        suggestedPrice: aiContent.suggestedPrice,
        category: aiContent.category,
        condition: aiContent.condition,
        imageUri: images[0].uri,
        images: images,
        detectedObject: detectedObject
      };

      navigation.navigate('Preview', { listing });
    } catch (error) {
      console.error('Error generating listing:', error);
      Alert.alert('Error', 'Failed to generate listing. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    Alert.alert(
      'Clear All Images',
      'Are you sure you want to remove all captured images?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setCapturedImages([])
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>

            {capturedImages.length > 0 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {capturedImages.length} {capturedImages.length === 1 ? 'photo' : 'photos'}
                </Text>
              </View>
            )}
          </View>

          {capturedImages.length > 0 && (
            <ScrollView
              horizontal
              style={styles.imagePreviewContainer}
              contentContainerStyle={styles.imagePreviewContent}
            >
              {capturedImages.map((image, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  {image.isFromCamera && (
                    <View style={styles.cameraBadge}>
                      <Text style={styles.cameraBadgeText}>📷</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.frame}>
            <View style={[styles.frameCorner, styles.topLeft]} />
            <View style={[styles.frameCorner, styles.topRight]} />
            <View style={[styles.frameCorner, styles.bottomLeft]} />
            <View style={[styles.frameCorner, styles.bottomRight]} />
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {capturedImages.length === 0
                ? 'Position your item in the frame'
                : 'Add more photos for better listing!'}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Text style={styles.galleryButtonText}>📷</Text>
              <Text style={styles.galleryButtonLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            {capturedImages.length > 0 ? (
              <TouchableOpacity
                style={styles.processButton}
                onPress={() => processAllImages(capturedImages)}
                disabled={isProcessing}
              >
                <Text style={styles.processButtonText}>✓</Text>
                <Text style={styles.processButtonLabel}>Done</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {capturedImages.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearAllImages}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>
            {capturedImages.length > 1
              ? `Analyzing ${capturedImages.length} images...`
              : 'Analyzing image...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  camera: {
    flex: 1,
    width: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  imageCounter: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  imagePreviewContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    height: 100
  },
  imagePreviewContent: {
    paddingHorizontal: 10
  },
  imagePreviewWrapper: {
    marginHorizontal: 5,
    position: 'relative'
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff'
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraBadgeText: {
    fontSize: 10
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  frame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40
  },
  frameCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
    borderWidth: 3
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  instructions: {
    padding: 20,
    alignItems: 'center'
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ddd'
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff'
  },
  captureButtonDisabled: {
    opacity: 0.5
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  galleryButtonText: {
    fontSize: 24
  },
  galleryButtonLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2
  },
  processButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  processButtonText: {
    fontSize: 24,
    color: '#fff'
  },
  processButtonLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2
  },
  clearButton: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center'
  },
  placeholder: {
    width: 60
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
