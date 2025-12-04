import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { RootStackParamList, ProductListing, ProductImage } from '../types';
import { FacebookMarketplaceService } from '../services/facebookMarketplaceService';
import { WatermarkService } from '../services/watermarkService';

type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'Preview'>;
type PreviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Preview'>;

type CopiedField = 'title' | 'price' | 'description' | 'photo' | null;

const { width } = Dimensions.get('window');

export default function PreviewScreen() {
  const route = useRoute<PreviewScreenRouteProp>();
  const navigation = useNavigation<PreviewScreenNavigationProp>();
  const { listing: initialListing } = route.params;

  const [listing, setListing] = useState<ProductListing>({
    ...initialListing,
    images: initialListing.images || [
      {
        uri: initialListing.imageUri,
        isFromCamera: false,
        hasWatermark: false,
        timestamp: new Date()
      }
    ]
  });
  const [isPosting, setIsPosting] = useState(false);
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [copiedFields, setCopiedFields] = useState<Set<CopiedField>>(new Set());
  const [showGuide, setShowGuide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [watermarkedImages, setWatermarkedImages] = useState<ProductImage[]>([]);

  const updateField = (field: keyof ProductListing, value: any) => {
    setListing(prev => ({ ...prev, [field]: value }));
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message, [{ text: 'OK' }]);
    }
  };

  const copyField = async (field: CopiedField, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedFields(prev => new Set(prev).add(field));

    const messages: Record<string, string> = {
      title: '📋 Title copied! Paste it in Facebook\'s title field',
      price: '💰 Price copied! Paste it in Facebook\'s price field',
      description: '📝 Description copied! Paste it in Facebook\'s description field',
      photo: '📸 Photo saved! Upload it from your gallery in Facebook'
    };

    showToast(messages[field as string] || 'Copied!');
  };

  // Auto-watermark camera images on mount
  useEffect(() => {
    watermarkCameraImages();
  }, []);

  const watermarkCameraImages = async () => {
    setIsWatermarking(true);

    try {
      const imagesToWatermark = listing.images.filter(
        img => img.isFromCamera && !img.hasWatermark
      );

      if (imagesToWatermark.length === 0) {
        setIsWatermarking(false);
        return;
      }

      const watermarked = await WatermarkService.watermarkMultipleImages(listing.images);
      setWatermarkedImages(watermarked);

      setListing(prev => ({
        ...prev,
        images: watermarked
      }));

      const cameraImageCount = imagesToWatermark.length;
      showToast(
        `✅ ${cameraImageCount} camera ${cameraImageCount === 1 ? 'photo' : 'photos'} watermarked with "SellEasy Verified"`
      );
    } catch (error) {
      console.error('Error watermarking images:', error);
    } finally {
      setIsWatermarking(false);
    }
  };

  const saveAllPhotosToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permission to save photos');
        return;
      }

      setIsPosting(true);

      // Save only camera photos with watermarks
      const cameraImages = listing.images.filter(img => img.isFromCamera);

      if (cameraImages.length === 0) {
        Alert.alert(
          'No Camera Photos',
          'Only photos taken with camera can be saved with "SellEasy Verified" watermark.\n\nGallery images will not be watermarked.'
        );
        setIsPosting(false);
        return;
      }

      let savedCount = 0;
      for (const image of cameraImages) {
        try {
          const uriToSave = image.watermarkedUri || image.uri;
          await MediaLibrary.saveToLibraryAsync(uriToSave);
          savedCount++;
        } catch (error) {
          console.error(`Failed to save image ${image.uri}:`, error);
        }
      }

      setCopiedFields(prev => new Set(prev).add('photo'));
      showToast(
        `📸 ${savedCount} watermarked ${savedCount === 1 ? 'photo' : 'photos'} saved to gallery!`
      );

      setIsPosting(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save photos');
      setIsPosting(false);
    }
  };

  const savePhotoToGallery = async () => {
    await saveAllPhotosToGallery();
  };

  const copyAllAndPost = async () => {
    // Validate listing
    if (!listing.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!listing.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (listing.price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setIsPosting(true);

    try {
      // Copy all info to clipboard
      const allInfo = `Title: ${listing.title}\nPrice: $${listing.price}\nDescription: ${listing.description}`;
      await Clipboard.setStringAsync(allInfo);

      // Save photo
      await savePhotoToGallery();

      // Mark all as copied
      setCopiedFields(new Set(['title', 'price', 'description', 'photo']));

      // Open Facebook Marketplace
      const success = await FacebookMarketplaceService.postToMarketplace(listing);

      if (success) {
        setTimeout(() => {
          navigation.navigate('Home');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error posting listing:', error);
      Alert.alert('Error', error.message || 'Failed to open Facebook. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const postToMarketplace = async () => {
    copyAllAndPost();
  };

  const showPostingOptions = async () => {
    if (!listing.title.trim() || !listing.description.trim() || listing.price <= 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    await FacebookMarketplaceService.showPostingOptions(listing);
  };

  const getProgress = () => {
    const total = 4; // title, price, description, photo
    const copied = copiedFields.size;
    return { copied, total, percentage: Math.round((copied / total) * 100) };
  };

  const progress = getProgress();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview Listing</Text>
        <TouchableOpacity onPress={postToMarketplace} disabled={isPosting}>
          {isPosting ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={[styles.headerButton, styles.postButton]}>Post to Facebook</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      {copiedFields.size > 0 && (
        <View style={styles.progressBar}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              ✅ {progress.copied}/{progress.total} fields ready
            </Text>
            <Text style={styles.progressPercentage}>{progress.percentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Multiple Images Preview with Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {listing.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: image.watermarkedUri || image.uri }}
                  style={styles.image}
                />
                {image.isFromCamera && image.hasWatermark && (
                  <View style={styles.watermarkBadge}>
                    <Text style={styles.watermarkBadgeText}>✓ SellEasy Verified</Text>
                  </View>
                )}
                {!image.isFromCamera && (
                  <View style={styles.galleryBadge}>
                    <Text style={styles.galleryBadgeText}>Gallery Image</Text>
                    <Text style={styles.galleryBadgeSubtext}>No watermark</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {listing.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {listing.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    index === selectedImageIndex && styles.imageIndicatorActive
                  ]}
                />
              ))}
            </View>
          )}

          {listing.images.length > 1 && (
            <View style={styles.imageCounter2}>
              <Text style={styles.imageCounterText2}>
                {selectedImageIndex + 1}/{listing.images.length}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.savePhotoButton, copiedFields.has('photo') && styles.savedButton]}
            onPress={savePhotoToGallery}
            disabled={isPosting}
          >
            {isPosting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.savePhotoText}>
                {copiedFields.has('photo')
                  ? '✅ Photos Saved'
                  : listing.images.filter(img => img.isFromCamera).length > 0
                  ? `📸 Save ${listing.images.filter(img => img.isFromCamera).length} Watermarked Photo${listing.images.filter(img => img.isFromCamera).length > 1 ? 's' : ''}`
                  : '📸 No Camera Photos'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Detected Object Badge */}
        {listing.detectedObject && (
          <View style={styles.detectionBadge}>
            <Text style={styles.detectionText}>
              Detected: {listing.detectedObject.class} (
              {Math.round(listing.detectedObject.confidence * 100)}% confident)
            </Text>
          </View>
        )}

        {/* Title with Copy Button */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Title *</Text>
            <TouchableOpacity
              style={[styles.copyButton, copiedFields.has('title') && styles.copiedButton]}
              onPress={() => copyField('title', listing.title)}
            >
              <Text style={[styles.copyButtonText, copiedFields.has('title') && styles.copiedButtonText]}>
                {copiedFields.has('title') ? '✅ Copied' : '📋 Copy'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={listing.title}
            onChangeText={(text) => updateField('title', text)}
            placeholder="Enter listing title"
            maxLength={100}
          />
          <Text style={styles.charCount}>{listing.title.length}/100</Text>
        </View>

        {/* Description with Copy Button */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description *</Text>
            <TouchableOpacity
              style={[styles.copyButton, copiedFields.has('description') && styles.copiedButton]}
              onPress={() => copyField('description', listing.description)}
            >
              <Text style={[styles.copyButtonText, copiedFields.has('description') && styles.copiedButtonText]}>
                {copiedFields.has('description') ? '✅ Copied' : '📋 Copy'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={listing.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Describe your item"
            multiline
            numberOfLines={6}
            maxLength={500}
          />
          <Text style={styles.charCount}>{listing.description.length}/500</Text>
        </View>

        {/* Price with Copy Button */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Price (USD) *</Text>
            <TouchableOpacity
              style={[styles.copyButton, copiedFields.has('price') && styles.copiedButton]}
              onPress={() => copyField('price', listing.price.toString())}
            >
              <Text style={[styles.copyButtonText, copiedFields.has('price') && styles.copiedButtonText]}>
                {copiedFields.has('price') ? '✅ Copied' : '📋 Copy'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.priceInput}
              value={listing.price.toString()}
              onChangeText={(text) => {
                const price = parseFloat(text) || 0;
                updateField('price', price);
              }}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>
          {listing.suggestedPrice && listing.price !== listing.suggestedPrice && (
            <Text style={styles.suggestion}>
              Suggested price: ${listing.suggestedPrice}
            </Text>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerText}>{listing.category}</Text>
          </View>
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.label}>Condition</Text>
          <View style={styles.conditionButtons}>
            {(['new', 'like-new', 'good', 'fair', 'poor'] as const).map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[
                  styles.conditionButton,
                  listing.condition === cond && styles.conditionButtonActive
                ]}
                onPress={() => updateField('condition', cond)}
              >
                <Text
                  style={[
                    styles.conditionButtonText,
                    listing.condition === cond && styles.conditionButtonTextActive
                  ]}
                >
                  {cond.charAt(0).toUpperCase() + cond.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step-by-Step Guide */}
        <View style={styles.guideBox}>
          <TouchableOpacity
            style={styles.guideHeader}
            onPress={() => setShowGuide(!showGuide)}
          >
            <Text style={styles.guideTitle}>📱 Quick Posting Guide</Text>
            <Text style={styles.guideToggle}>{showGuide ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showGuide && (
            <View style={styles.guideContent}>
              <View style={styles.guideStep}>
                <Text style={styles.guideStepNumber}>1</Text>
                <Text style={styles.guideStepText}>
                  Save photo to gallery using the button above
                </Text>
              </View>
              <View style={styles.guideStep}>
                <Text style={styles.guideStepNumber}>2</Text>
                <Text style={styles.guideStepText}>
                  Tap "Post to Facebook" → Facebook will open
                </Text>
              </View>
              <View style={styles.guideStep}>
                <Text style={styles.guideStepNumber}>3</Text>
                <Text style={styles.guideStepText}>
                  In Facebook, paste each field (already copied!)
                </Text>
              </View>
              <View style={styles.guideStep}>
                <Text style={styles.guideStepNumber}>4</Text>
                <Text style={styles.guideStepText}>
                  Upload your photo from gallery
                </Text>
              </View>
              <View style={styles.guideStep}>
                <Text style={styles.guideStepNumber}>5</Text>
                <Text style={styles.guideStepText}>
                  Review and tap "Publish" in Facebook
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Smart Copying</Text>
          <Text style={styles.infoText}>
            Tap individual "Copy" buttons to copy each field separately, or use "Post to Facebook" to copy everything at once and open Facebook.
          </Text>
          <TouchableOpacity
            style={styles.moreOptionsButton}
            onPress={showPostingOptions}
          >
            <Text style={styles.moreOptionsText}>More Options...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF'
  },
  postButton: {
    fontWeight: '600'
  },
  progressBar: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50'
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3
  },
  content: {
    flex: 1
  },
  imageContainer: {
    position: 'relative'
  },
  imageWrapper: {
    width: width,
    height: 300,
    position: 'relative'
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover',
    backgroundColor: '#000'
  },
  watermarkBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  watermarkBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  galleryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  galleryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  galleryBadgeSubtext: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  imageIndicatorActive: {
    width: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  imageCounter2: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  imageCounterText2: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  savePhotoButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  savedButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)'
  },
  savePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  detectionBadge: {
    backgroundColor: '#4CAF50',
    padding: 12,
    alignItems: 'center'
  },
  detectionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  copiedButton: {
    backgroundColor: '#4CAF50'
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  copiedButtonText: {
    color: '#fff'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginRight: 8
  },
  priceInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    padding: 12
  },
  suggestion: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa'
  },
  pickerText: {
    fontSize: 16,
    color: '#333'
  },
  conditionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  conditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  conditionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  conditionButtonText: {
    fontSize: 14,
    color: '#666'
  },
  conditionButtonTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  guideBox: {
    backgroundColor: '#FFF3E0',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800'
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100'
  },
  guideToggle: {
    fontSize: 16,
    color: '#E65100',
    fontWeight: 'bold'
  },
  guideContent: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  guideStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9800',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10
  },
  guideStepText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20
  },
  moreOptionsButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center'
  },
  moreOptionsText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600'
  },
  bottomPadding: {
    height: 40
  }
});
