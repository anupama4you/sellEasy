# SellEasy Setup Guide

This guide will walk you through setting up SellEasy from scratch.

## Step 1: Development Environment

### Prerequisites

1. **Install Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **Install a code editor**
   - VS Code (recommended): [code.visualstudio.com](https://code.visualstudio.com/)

3. **Install Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

### For iOS Development (Mac only)
- Install Xcode from the App Store
- Install Xcode Command Line Tools: `xcode-select --install`

### For Android Development
- Install Android Studio: [developer.android.com/studio](https://developer.android.com/studio)
- Set up Android Emulator through Android Studio

## Step 2: Project Setup

The project is already initialized! Just ensure dependencies are installed:

```bash
cd selleasy
npm install
```

## Step 3: Facebook Marketplace Configuration

### Create a Facebook App

1. **Go to Facebook Developers**
   - Visit [developers.facebook.com](https://developers.facebook.com/)
   - Log in with your Facebook account

2. **Create an App**
   - Click "Create App"
   - Choose "Business" as the app type
   - Fill in app details

3. **Add Facebook Login**
   - In the app dashboard, add "Facebook Login" product
   - Configure OAuth redirect URIs if needed

4. **Get a Page Access Token**
   - Go to Tools → Graph API Explorer
   - Select your app
   - Select your Facebook Page
   - Add permissions: `pages_manage_posts`, `pages_read_engagement`
   - Click "Generate Access Token"
   - **Important**: Save this token!

5. **Get Your Page ID**
   - Go to your Facebook Page
   - Click "About"
   - Scroll down to find "Page ID"
   - Or use Graph API Explorer: `GET /me?fields=id`

### Configure in SellEasy

1. Open the SellEasy app
2. Navigate to Settings
3. Enter your Page Access Token
4. Enter your Page ID
5. Tap "Save Credentials"

## Step 4: AI Services Configuration (Optional but Recommended)

### Google Cloud Vision API (for Object Detection)

1. **Create a Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Vision API**
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create API Key**
   - Go to "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

4. **Add to Project**
   ```typescript
   // Edit src/services/objectDetectionService.ts
   const VISION_API_KEY = 'your_actual_api_key_here';
   ```

### OpenAI API (for Content Generation)

1. **Create an OpenAI Account**
   - Go to [platform.openai.com](https://platform.openai.com/)
   - Sign up or log in

2. **Get API Key**
   - Go to API Keys section
   - Click "Create new secret key"
   - Copy the key (you won't see it again!)

3. **Add Billing**
   - Add a payment method in Billing section
   - GPT-4 Vision is recommended for best results

4. **Add to Project**
   ```typescript
   // Edit src/services/aiService.ts
   const AI_API_KEY = 'your_actual_api_key_here';
   ```

### Alternative: Anthropic Claude API

1. **Get API Key**
   - Go to [console.anthropic.com](https://console.anthropic.com/)
   - Create an API key

2. **Update Service**
   ```typescript
   // In src/services/aiService.ts
   const AI_API_URL = 'https://api.anthropic.com/v1/messages';
   const AI_API_KEY = 'your_anthropic_key_here';
   ```

## Step 5: Running the App

### Start Development Server

```bash
npx expo start
```

### Run on Device (Recommended for Camera)

1. **Install Expo Go**
   - iOS: Download from App Store
   - Android: Download from Play Store

2. **Connect**
   - Make sure your phone and computer are on the same WiFi
   - Scan the QR code from the terminal
   - iOS: Use Camera app to scan
   - Android: Use Expo Go app to scan

### Run on Simulator/Emulator

**iOS (Mac only)**:
```bash
npx expo start --ios
```

**Android**:
```bash
npx expo start --android
```

## Step 6: Testing the App

### Test Camera Functionality

1. Open the app
2. Tap "Start Selling"
3. Allow camera permissions
4. Take a photo of an item
5. Verify object detection works
6. Review generated listing

### Test Listing Creation

1. Check that title is generated
2. Verify description is appropriate
3. Confirm price suggestion makes sense
4. Edit fields to ensure they save

### Test Facebook Posting

1. Ensure you've configured Facebook credentials
2. Create a test listing
3. Tap "Post"
4. Check your Facebook Page for the listing

## Step 7: Customization

### Modify AI Templates

Edit [src/services/aiService.ts](src/services/aiService.ts) to customize:
- Title templates
- Description formats
- Price calculation logic
- Category mappings

### Adjust UI Theme

Edit screen files in `src/screens/` to change:
- Colors
- Fonts
- Layout
- Button styles

### Add New Categories

Update the templates in `aiService.ts` to support more product types.

## Troubleshooting

### "Camera permission denied"
- Go to device Settings → SellEasy → Permissions
- Enable Camera and Photos

### "Failed to post to marketplace"
**Check:**
- Access token is valid and not expired
- Page ID is correct
- You have admin access to the Page
- Token has required permissions

### "Object detection failed"
**Solutions:**
- Configure Google Vision API (currently using mock data)
- Ensure good lighting in photos
- Center object in frame

### "Expo Go connection issues"
**Try:**
- Use tunnel mode: `npx expo start --tunnel`
- Check firewall settings
- Restart Expo dev server
- Restart phone

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Reset Expo cache
npx expo start -c
```

## Production Build

### Build with EAS (Expo Application Services)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure Project**
   ```bash
   eas build:configure
   ```

4. **Build for Android**
   ```bash
   eas build --platform android
   ```

5. **Build for iOS** (requires Apple Developer account)
   ```bash
   eas build --platform ios
   ```

## Security Notes

- **Never commit API keys** to version control
- Use `.env` files for sensitive data (currently configured in code)
- Rotate Facebook tokens regularly
- Monitor API usage to avoid unexpected charges
- Review Facebook's Platform Policies

## Next Steps

1. Test the complete flow end-to-end
2. Configure real AI APIs for production use
3. Customize branding and colors
4. Add your own product categories
5. Build and publish to app stores

## Support Resources

- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev/)
- **Facebook Graph API**: [developers.facebook.com/docs/graph-api](https://developers.facebook.com/docs/graph-api)
- **OpenAI API Docs**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **Google Vision API**: [cloud.google.com/vision/docs](https://cloud.google.com/vision/docs)

---

You're all set! Start the app and begin selling your unused items with ease.
