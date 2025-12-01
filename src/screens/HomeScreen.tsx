import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SellEasy</Text>
          <Text style={styles.subtitle}>Sell your unused items in seconds</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>📸</Text>
          <Text style={styles.heroTitle}>How it works</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Take a photo of your item</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>AI generates title, description & price</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Review and edit if needed</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>One-click post to Marketplace</Text>
            </View>
          </View>
        </View>

        {/* Main CTA */}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.cameraButtonIcon}>📷</Text>
          <Text style={styles.cameraButtonText}>Start Selling</Text>
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>AI-Powered</Text>
            <Text style={styles.featureText}>
              Automatic object detection and smart pricing
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Super Fast</Text>
            <Text style={styles.featureText}>
              Create listings in under 30 seconds
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureTitle}>Smart Pricing</Text>
            <Text style={styles.featureText}>
              Get suggested prices based on market data
            </Text>
          </View>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Turn your unused items into cash with SellEasy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 20
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  hero: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    alignItems: 'center'
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333'
  },
  steps: {
    width: '100%'
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#333'
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  cameraButtonIcon: {
    fontSize: 24,
    marginRight: 12
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  features: {
    marginBottom: 30
  },
  feature: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center'
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333'
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  settingsButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  }
});
