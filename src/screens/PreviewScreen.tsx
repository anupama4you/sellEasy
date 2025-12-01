import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { RootStackParamList, ProductListing } from '../types';
import { FacebookMarketplaceService } from '../services/facebookMarketplaceService';

type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'Preview'>;
type PreviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Preview'>;

type CopiedField = 'title' | 'price' | 'description' | 'photo' | null;

export default function PreviewScreen() {
  const route = useRoute<PreviewScreenRouteProp>();
  const navigation = useNavigation<PreviewScreenNavigationProp>();
  const { listing: initialListing } = route.params;

  const [listing, setListing] = useState<ProductListing>(initialListing);
  const [isPosting, setIsPosting] = useState(false);
  const [copiedFields, setCopiedFields] = useState<Set<CopiedField>>(new Set());
  const [showGuide, setShowGuide] = useState(false);

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

  const savePhotoToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permission to save the photo');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(listing.imageUri);
      setCopiedFields(prev => new Set(prev).add('photo'));
      showToast('📸 Photo saved to gallery! Upload it in Facebook');
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo');
    }
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
        {/* Image Preview with Save Button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: listing.imageUri }} style={styles.image} />
          <TouchableOpacity
            style={[styles.savePhotoButton, copiedFields.has('photo') && styles.savedButton]}
            onPress={savePhotoToGallery}
          >
            <Text style={styles.savePhotoText}>
              {copiedFields.has('photo') ? '✅ Photo Saved' : '📸 Save Photo to Gallery'}
            </Text>
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
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    backgroundColor: '#000'
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
