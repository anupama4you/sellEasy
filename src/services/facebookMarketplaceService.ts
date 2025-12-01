import { Linking, Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ProductListing } from '../types';

export class FacebookMarketplaceService {
  /**
   * Post to Facebook Marketplace using deep linking
   * Opens Facebook app/website with listing ready to post
   */
  static async postToMarketplace(listing: ProductListing): Promise<boolean> {
    try {
      // Format the listing text
      const listingText = this.createShareableText(listing);

      // Copy to clipboard for easy pasting
      await Clipboard.setStringAsync(listingText);

      // Try to open Facebook Marketplace
      const opened = await this.openFacebookMarketplace();

      if (opened) {
        Alert.alert(
          '📋 Listing Info Copied!',
          'Facebook Marketplace is opening.\n\n' +
          'Your listing details have been copied to clipboard:\n\n' +
          `📝 Title: ${listing.title}\n` +
          `💰 Price: $${listing.price}\n\n` +
          'Simply paste the information and upload your photo!',
          [{ text: 'Got it!' }]
        );
        return true;
      }

      // Fallback: Show share dialog
      return await this.shareListingInfo(listing);
    } catch (error: any) {
      console.error('Error opening marketplace:', error);
      Alert.alert('Error', 'Could not open Facebook. Try using the Share option instead.');
      return false;
    }
  }

  /**
   * Open Facebook Marketplace create page
   * Prioritizes Facebook app over browser
   */
  static async openFacebookMarketplace(): Promise<boolean> {
    // Try Facebook app deep links ONLY (no web fallback by default)
    const appUrls = [
      'fb://marketplace/create',  // Direct to Marketplace create
      'fb://page/marketplace',     // Alternative marketplace route
      'fb://marketplace',          // General marketplace
      'fb://feed'                  // Facebook feed as last app resort
    ];

    // First, try to open in Facebook app only
    for (const url of appUrls) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return true;
        }
      } catch (error) {
        console.log(`Cannot open ${url}, trying next app URL...`);
        continue;
      }
    }

    // If Facebook app is not installed, show helpful message
    Alert.alert(
      'Facebook App Not Found',
      'To use this feature, please install the Facebook app for the best experience.\n\nAlternatively, you can use "More Options" to share or copy the listing.',
      [
        {
          text: 'Install Facebook',
          onPress: () => this.openAppStore()
        },
        {
          text: 'Use Browser Instead',
          onPress: async () => {
            await this.openFacebookWebsite();
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );

    return false;
  }

  /**
   * Force open in Facebook app only, with user guidance if not installed
   */
  static async openFacebookAppOnly(): Promise<boolean> {
    const appUrls = [
      'fb://marketplace/create',
      'fb://marketplace',
      'fb://feed'
    ];

    for (const url of appUrls) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    // App not installed
    Alert.alert(
      'Facebook App Required',
      'Please install the Facebook mobile app to post directly to Marketplace.',
      [
        {
          text: 'Get Facebook App',
          onPress: () => this.openAppStore()
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );

    return false;
  }

  /**
   * Open app store to download Facebook
   */
  private static async openAppStore(): Promise<void> {
    const appStoreUrls = {
      ios: 'https://apps.apple.com/app/facebook/id284882215',
      android: 'market://details?id=com.facebook.katana'
    };

    try {
      // Try Android first
      const canOpenAndroid = await Linking.canOpenURL(appStoreUrls.android);
      if (canOpenAndroid) {
        await Linking.openURL(appStoreUrls.android);
        return;
      }

      // Try iOS
      await Linking.openURL(appStoreUrls.ios);
    } catch (error) {
      Alert.alert('Error', 'Could not open app store');
    }
  }

  /**
   * Open Facebook website (only when explicitly chosen)
   */
  private static async openFacebookWebsite(): Promise<void> {
    const webUrls = [
      'https://www.facebook.com/marketplace/create',
      'https://m.facebook.com/marketplace/create'
    ];

    for (const url of webUrls) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return;
        }
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Share listing using native share dialog
   * Allows posting to Facebook or any other app
   */
  static async shareListingInfo(listing: ProductListing): Promise<boolean> {
    try {
      const message = this.createShareableText(listing);

      // Copy to clipboard first
      await Clipboard.setStringAsync(message);

      const result = await Share.share({
        message: message,
        title: `For Sale: ${listing.title}`
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        }
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Could not share listing');
      return false;
    }
  }

  /**
   * Show listing info and options
   */
  static async showPostingOptions(listing: ProductListing): Promise<void> {
    const text = this.createShareableText(listing);

    // Copy to clipboard
    await Clipboard.setStringAsync(text);

    Alert.alert(
      'Post Your Listing',
      'Choose how you want to post:',
      [
        {
          text: 'Open Facebook',
          onPress: async () => {
            const opened = await this.openFacebookMarketplace();
            if (!opened) {
              Alert.alert(
                'Info Copied',
                'Could not open Facebook app.\n\nYour listing info is copied to clipboard.\n\nOpen Facebook manually and paste!'
              );
            }
          }
        },
        {
          text: 'Share to...',
          onPress: () => this.shareListingInfo(listing)
        },
        {
          text: 'Copy Info',
          onPress: () => {
            Alert.alert(
              'Copied!',
              'Listing information copied to clipboard.\n\nOpen Facebook and paste it there!'
            );
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  }

  /**
   * Create formatted text for sharing/copying
   */
  static createShareableText(listing: ProductListing): string {
    return `📱 ${listing.title}

${listing.description}

💰 Price: $${listing.price}
📦 Condition: ${this.formatCondition(listing.condition)}
🏷️ Category: ${listing.category}

#ForSale #Marketplace`;
  }

  /**
   * Create detailed listing text with all info
   */
  static createDetailedListingText(listing: ProductListing): string {
    let text = `=== LISTING DETAILS ===\n\n`;
    text += `TITLE:\n${listing.title}\n\n`;
    text += `DESCRIPTION:\n${listing.description}\n\n`;
    text += `PRICE: $${listing.price}\n`;
    text += `CONDITION: ${this.formatCondition(listing.condition)}\n`;
    text += `CATEGORY: ${listing.category}\n\n`;

    if (listing.detectedObject) {
      text += `Detected Item: ${listing.detectedObject.class}\n`;
      text += `Confidence: ${Math.round(listing.detectedObject.confidence * 100)}%\n\n`;
    }

    text += `Don't forget to upload your photo!\n`;
    text += `\n#SellEasy #Marketplace #ForSale`;

    return text;
  }

  /**
   * Format condition for display
   */
  private static formatCondition(condition: string): string {
    return condition
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if Facebook app is installed
   */
  static async isFacebookAppInstalled(): Promise<boolean> {
    try {
      return await Linking.canOpenURL('fb://');
    } catch {
      return false;
    }
  }

  /**
   * Get posting instructions
   */
  static getPostingInstructions(): string {
    return `📱 How to Post to Facebook Marketplace:

1️⃣ Tap "Post to Facebook" button
2️⃣ Facebook will open automatically
3️⃣ Upload your photo
4️⃣ Paste the listing info (already copied!)
5️⃣ Review and tap "Publish"

✨ Your listing details are automatically copied to clipboard for easy pasting!`;
  }

  /**
   * Share to Facebook timeline (alternative)
   */
  static async shareToFacebookTimeline(listing: ProductListing): Promise<void> {
    const text = encodeURIComponent(this.createShareableText(listing));
    const urls = [
      `fb://publish/?text=${text}`,
      `https://www.facebook.com/sharer/sharer.php?quote=${text}`
    ];

    for (const url of urls) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return;
        }
      } catch (error) {
        continue;
      }
    }

    Alert.alert('Error', 'Cannot open Facebook');
  }

  /**
   * Open Facebook app or website
   */
  static async openFacebook(): Promise<void> {
    const urls = ['fb://', 'https://www.facebook.com'];

    for (const url of urls) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return;
        }
      } catch (error) {
        continue;
      }
    }

    Alert.alert(
      'Cannot Open Facebook',
      'Please install the Facebook app or open facebook.com in your browser.'
    );
  }

  /**
   * Save listing for later (just stores in state for this session)
   */
  static async saveDraft(listing: ProductListing): Promise<void> {
    // Could implement AsyncStorage here if you want persistent drafts
    const text = this.createDetailedListingText(listing);
    await Clipboard.setStringAsync(text);
    Alert.alert('Draft Saved', 'Listing details copied to clipboard!');
  }
}
