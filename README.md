# SellEasy - AI-Powered Marketplace Listing App

Turn your unused items into cash in seconds! SellEasy uses AI to automatically generate professional marketplace listings from a single photo.

## Features

- **📸 Quick Photo Capture**: Take a photo or select from your gallery
- **🤖 AI Object Detection**: Automatically identifies what you're selling
- **✍️ Smart Content Generation**: AI-generated titles, descriptions, and pricing
- **💰 Price Suggestions**: Get market-based price recommendations
- **📱 One-Tap Facebook Integration**: Opens Facebook Marketplace with info ready to paste
- **✏️ Easy Editing**: Review and customize listings before posting
- **🚀 Zero Setup**: No API keys or tokens needed!

## How It Works

1. **Snap a Photo**: Open the app and take a picture of any item
2. **AI Magic**: The app detects the object and generates a complete listing
3. **Review & Edit**: Check the auto-generated content and make adjustments
4. **Post**: Tap "Post to Facebook" → Info copied → Facebook opens → Paste & publish!

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator
- Physical device with Expo Go app (recommended for camera testing)

## Installation

1. **Clone or navigate to the project**:
   ```bash
   cd selleasy
   ```

2. **Install dependencies** (already completed):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Run on your device**:
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Physical Device**: Install Expo Go app and scan the QR code

## Configuration

### Facebook Marketplace Setup

**No configuration needed!** 🎉

SellEasy uses deep linking to open Facebook Marketplace directly. Just:
1. Install the Facebook app (recommended) or use web browser
2. Tap "Post to Facebook" in the app
3. Paste the auto-copied info and upload your photo
4. Done!

**See [HOW_IT_WORKS.md](HOW_IT_WORKS.md) for detailed explanation**

### Optional: AI Services Configuration

For enhanced AI features, configure API keys in the source files:

**Object Detection** ([src/services/objectDetectionService.ts](src/services/objectDetectionService.ts)):
- Google Cloud Vision API
- Alternative: AWS Rekognition, Azure Computer Vision

**Content Generation** ([src/services/aiService.ts](src/services/aiService.ts)):
- OpenAI API (GPT-4 Vision recommended)
- Alternative: Anthropic Claude API

Add your API keys in the respective service files:

```typescript
// src/services/aiService.ts
const AI_API_KEY = 'your_openai_api_key_here';

// src/services/objectDetectionService.ts
const VISION_API_KEY = 'your_google_vision_api_key_here';
```

## Project Structure

```
selleasy/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Main landing screen
│   │   ├── CameraScreen.tsx        # Camera capture interface
│   │   ├── PreviewScreen.tsx       # Listing preview and editing
│   │   └── SettingsScreen.tsx      # Configuration settings
│   ├── services/
│   │   ├── aiService.ts            # AI content generation
│   │   ├── objectDetectionService.ts  # Image recognition
│   │   └── facebookMarketplaceService.ts  # FB API integration
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Navigation setup
│   └── types/
│       └── index.ts                # TypeScript definitions
├── App.tsx                         # Root component
├── app.json                        # Expo configuration
└── package.json                    # Dependencies
```

## Usage

### Taking Your First Photo

1. Launch SellEasy
2. Tap "Start Selling"
3. Allow camera permissions
4. Position your item in the frame
5. Tap the capture button

### Reviewing the Listing

The app automatically generates:
- **Title**: Attention-grabbing headline
- **Description**: Detailed product description
- **Price**: Market-based suggestion
- **Category**: Appropriate marketplace category
- **Condition**: Estimated item condition

Edit any field before posting!

### Posting to Marketplace

1. Review the generated listing
2. Make any desired edits
3. Tap "Post" in the top-right
4. Confirm to publish to Facebook Marketplace

## Development

### Running in Development Mode

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator (Mac only)
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web (limited functionality)
npx expo start --web
```

### Building for Production

```bash
# Build for iOS (requires Mac + Apple Developer account)
eas build --platform ios

# Build for Android
eas build --platform android

# Create development build
npx expo run:android
npx expo run:ios
```

## Technologies Used

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Screen navigation
- **Expo Camera**: Camera access and photo capture
- **Expo Image Picker**: Gallery photo selection
- **AsyncStorage**: Local data persistence
- **Axios**: HTTP client for API calls

## API Integration

### Facebook Graph API

The app uses Facebook Graph API v18.0 for marketplace posting:

```typescript
POST https://graph.facebook.com/v18.0/{page-id}/marketplace_listings
```

Required permissions:
- `pages_manage_posts`
- `pages_read_engagement`

### AI Services (Optional)

**Google Cloud Vision API**:
```typescript
POST https://vision.googleapis.com/v1/images:annotate
```

**OpenAI API**:
```typescript
POST https://api.openai.com/v1/chat/completions
```

## Troubleshooting

### Camera Not Working
- Ensure camera permissions are granted in device settings
- Try running on a physical device (simulators have limited camera support)

### Facebook Posting Fails
- Verify your Access Token is valid and not expired
- Check that your Page ID is correct
- Ensure you have the required permissions on your Facebook Page

### AI Detection Not Accurate
- Ensure good lighting when taking photos
- Center the object in the frame
- Consider upgrading to paid AI services for better accuracy

## Limitations

- **Demo Mode**: By default, uses mock AI responses (configure real APIs for production)
- **Facebook OAuth**: Manual token entry required (full OAuth flow not implemented)
- **Marketplace Limitations**: Facebook has strict policies for marketplace listings
- **iOS Builds**: Requires Mac and Apple Developer account

## Future Enhancements

- [ ] Full Facebook OAuth integration
- [ ] Support for multiple marketplace platforms (eBay, Craigslist)
- [ ] Listing history and management
- [ ] Price comparison with similar items
- [ ] Multi-image support
- [ ] Barcode scanning for packaged products
- [ ] Social sharing features

## License

This project is created for educational and personal use.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Facebook and AI service documentation
3. Ensure all dependencies are properly installed

## Acknowledgments

- Expo team for the amazing development platform
- Facebook for the Graph API
- AI service providers (OpenAI, Google Cloud Vision)

---

**Ready to start selling?** Launch the app and turn your clutter into cash!
