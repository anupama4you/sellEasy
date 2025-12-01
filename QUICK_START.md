# SellEasy - Quick Start Guide

Get up and running with SellEasy in 5 minutes!

## 🚀 Fastest Way to Start

```bash
# 1. Navigate to project
cd selleasy

# 2. Start the app
npm start

# 3. Open on your phone with Expo Go app (scan QR code)
```

That's it! The app will work in demo mode with mock AI responses.

## 📱 Test the App (Demo Mode)

1. **Launch SellEasy** on your phone
2. Tap **"Start Selling"**
3. Allow **camera permissions**
4. **Take a photo** of any item
5. Wait for AI to generate listing (mock data)
6. **Review** the auto-generated content
7. **Edit** if needed
8. For actual posting, configure Facebook (see below)

## 🔧 Quick Facebook Setup (5 Steps)

To actually post to Facebook Marketplace:

1. **Get Access Token**:
   - Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Select your app (or create one)
   - Get User Token → Add permissions: `pages_manage_posts`
   - Generate Access Token → Copy it

2. **Get Page ID**:
   - Go to your Facebook Page
   - Click "About" → Scroll down → Copy "Page ID"

3. **Configure in App**:
   - Open SellEasy → Settings
   - Paste Access Token
   - Paste Page ID
   - Tap "Save Credentials"

4. **Test Posting**:
   - Create a listing
   - Tap "Post"
   - Check your Facebook Page!

## 📁 Project Structure (Quick Overview)

```
selleasy/
├── App.tsx                          # Main app entry
├── src/
│   ├── screens/                     # All app screens
│   │   ├── HomeScreen.tsx          # Landing page
│   │   ├── CameraScreen.tsx        # Photo capture
│   │   ├── PreviewScreen.tsx       # Edit listing
│   │   └── SettingsScreen.tsx      # Configuration
│   ├── services/                    # Business logic
│   │   ├── aiService.ts            # AI content generation
│   │   ├── objectDetectionService.ts  # Object recognition
│   │   └── facebookMarketplaceService.ts  # FB posting
│   └── navigation/                  # Navigation setup
└── README.md                        # Full documentation
```

## 🎯 Common Commands

```bash
# Start development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (Mac only)
npm run ios

# Clear cache and restart
npm start -- -c

# Install new package
npm install package-name
```

## 🔑 API Keys (Optional - For Production)

For better AI results, add these API keys:

### Google Vision API (Object Detection)
```typescript
// src/services/objectDetectionService.ts
const VISION_API_KEY = 'YOUR_KEY_HERE';
```

### OpenAI API (Content Generation)
```typescript
// src/services/aiService.ts
const AI_API_KEY = 'YOUR_KEY_HERE';
```

Without these, the app uses built-in templates (works great for testing!).

## ⚠️ Troubleshooting

### Camera not working?
```bash
# Make sure you're on a real device (not simulator)
# Simulators have limited camera support
# Grant camera permissions when prompted
```

### Can't scan QR code?
```bash
# Use tunnel mode for better connectivity
npm start -- --tunnel
```

### Dependencies error?
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Facebook posting fails?
- Check Access Token is valid
- Verify Page ID is correct
- Ensure token has `pages_manage_posts` permission
- Token might be expired (regenerate it)

## 📚 Need More Help?

- **Full Setup Guide**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **All Features**: See [FEATURES.md](FEATURES.md)
- **Detailed Docs**: See [README.md](README.md)

## 💡 Pro Tips

1. **Use Real Device**: Camera features work best on actual phones
2. **Good Lighting**: Better photos = better AI detection
3. **Center Objects**: Keep items centered in frame
4. **Test in Demo**: Try the flow without Facebook first
5. **Save Credentials**: Settings persist between app restarts

## 🎉 You're Ready!

Start selling your unused items now:

```bash
npm start
```

Scan the QR code with Expo Go and start taking photos!

---

**Questions?** Check the detailed documentation files or the inline code comments.
