import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FacebookMarketplaceService } from '../services/facebookMarketplaceService';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [hasFacebookApp, setHasFacebookApp] = useState(false);

  useEffect(() => {
    checkFacebookApp();
  }, []);

  const checkFacebookApp = async () => {
    const hasApp = await FacebookMarketplaceService.isFacebookAppInstalled();
    setHasFacebookApp(hasApp);
  };

  const testFacebookConnection = async () => {
    const opened = await FacebookMarketplaceService.openFacebookMarketplace();
    if (opened) {
      Alert.alert('Success!', 'Facebook opened successfully. You can close it and come back to the app.');
    } else {
      Alert.alert(
        'Facebook Not Available',
        'Could not open Facebook. Please install the Facebook app or check your internet connection.'
      );
    }
  };

  const openFacebookApp = () => {
    Linking.openURL('https://www.facebook.com/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Facebook Connection</Text>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                hasFacebookApp ? styles.statusDotConnected : styles.statusDotDisconnected
              ]}
            />
            <Text style={styles.statusText}>
              {hasFacebookApp ? 'Facebook App Detected' : 'Facebook App Not Installed'}
            </Text>
          </View>
          <TouchableOpacity style={styles.testButton} onPress={testFacebookConnection}>
            <Text style={styles.testButtonText}>Test Facebook Connection</Text>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 How Posting Works</Text>
          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Create Your Listing</Text>
              <Text style={styles.stepText}>
                Take a photo and let AI generate the perfect listing
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Tap "Post to Facebook"</Text>
              <Text style={styles.stepText}>
                Your listing info is automatically copied to clipboard
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Facebook Opens</Text>
              <Text style={styles.stepText}>
                The app or website opens to create a new marketplace listing
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>4</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Paste & Upload</Text>
              <Text style={styles.stepText}>
                Paste the info, upload your photo, and publish!
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Pro Tips</Text>
          <Text style={styles.bulletPoint}>
            • Install the Facebook app for the best experience
          </Text>
          <Text style={styles.bulletPoint}>
            • Your listing details are automatically copied
          </Text>
          <Text style={styles.bulletPoint}>
            • Simply paste into Facebook's listing form
          </Text>
          <Text style={styles.bulletPoint}>
            • Don't forget to upload your photo!
          </Text>
          <Text style={styles.bulletPoint}>
            • Use "More Options" for sharing to other platforms
          </Text>
        </View>

        {/* Facebook App Section */}
        {!hasFacebookApp && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get the Facebook App</Text>
            <Text style={styles.description}>
              For the best experience, install the Facebook mobile app.
              It allows direct access to Marketplace listing creation.
            </Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={openFacebookApp}
            >
              <Text style={styles.downloadButtonText}>Open Facebook</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Configuration (Optional)</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              By default, the app uses built-in templates for generating listings.
              For enhanced AI features, you can configure external APIs:
            </Text>
            <Text style={styles.bulletPoint}>
              • OpenAI API for advanced descriptions
            </Text>
            <Text style={styles.bulletPoint}>
              • Google Vision API for better object detection
            </Text>
            <Text style={[styles.infoText, { marginTop: 10 }]}>
              Edit the API keys in the source code:
            </Text>
            <Text style={styles.codeText}>
              src/services/aiService.ts
            </Text>
            <Text style={styles.codeText}>
              src/services/objectDetectionService.ts
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.appName}>SellEasy v1.0.0</Text>
            <Text style={styles.aboutText}>
              Turn your unused items into cash quickly and easily with AI-powered
              listing generation and one-tap Facebook posting.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  placeholder: {
    width: 50
  },
  content: {
    flex: 1
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  statusDotConnected: {
    backgroundColor: '#4CAF50'
  },
  statusDotDisconnected: {
    backgroundColor: '#FF9800'
  },
  statusText: {
    fontSize: 14,
    color: '#666'
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333'
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  stepText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8
  },
  bulletPoint: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
    paddingLeft: 4
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16
  },
  downloadButton: {
    backgroundColor: '#1877F2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center'
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  aboutCard: {
    alignItems: 'center'
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#1976D2',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginVertical: 2
  },
  bottomPadding: {
    height: 40
  }
});
