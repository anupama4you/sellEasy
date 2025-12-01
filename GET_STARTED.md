# 🚀 Get Started with SellEasy

Welcome to SellEasy! Your AI-powered marketplace listing generator is ready to use.

## ⚡ Quick Start (2 Minutes)

### Step 1: Start the App
```bash
npm start
```

### Step 2: Open on Your Phone
1. Download **Expo Go** app from your app store
   - iOS: App Store
   - Android: Google Play Store

2. Scan the QR code shown in your terminal
   - iOS: Use Camera app
   - Android: Use Expo Go app

3. Wait for the app to load

### Step 3: Try It Out!
1. Tap **"Start Selling"**
2. Allow camera permissions
3. Take a photo of any item around you
4. Watch the AI generate a listing
5. Review and edit the content
6. Done! (In demo mode, posting is disabled until you configure Facebook)

---

## 📱 What You'll See

### Home Screen
- Clean welcome page
- "How it works" guide
- Big "Start Selling" button
- Feature highlights
- Settings access

### Camera Screen
- Full-screen camera view
- Visual composition guides
- Gallery picker
- Capture button
- Real-time preview

### Preview Screen
- Your photo
- AI-generated title
- Auto-written description
- Price suggestion
- Category and condition
- Edit any field
- One-click post button

### Settings Screen
- Facebook connection status
- Access token configuration
- Page ID setup
- Help documentation
- API configuration guide

---

## 🎯 Current Mode: DEMO

The app is currently in **demo mode**:
- ✅ Full UI and navigation works
- ✅ Camera capture works
- ✅ Image selection works
- ✅ AI generates mock listings
- ✅ Edit and preview works
- ❌ Facebook posting disabled (needs configuration)

To enable posting, see "Enable Facebook Posting" below.

---

## 🔧 Enable Facebook Posting (Optional)

To actually post to Facebook Marketplace:

### 1. Get Facebook Credentials

**Access Token:**
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select or create an app
3. Get User Token
4. Add permission: `pages_manage_posts`
5. Click "Generate Access Token"
6. **Copy the token**

**Page ID:**
1. Go to your Facebook Page
2. Click "About"
3. Scroll to find "Page ID"
4. **Copy the ID**

### 2. Configure in App

1. Open SellEasy
2. Go to Settings (⚙️ button)
3. Paste your Access Token
4. Paste your Page ID
5. Tap "Save Credentials"
6. Status should show "Connected"

### 3. Test It

1. Go back to Home
2. Take a photo of something
3. Review the listing
4. Tap "Post"
5. Check your Facebook Page!

---

## 🤖 Upgrade AI (Optional)

For better results, add real AI APIs:

### Google Cloud Vision (Better Object Detection)

1. Create project at [console.cloud.google.com](https://console.cloud.google.com/)
2. Enable Cloud Vision API
3. Create API key
4. Edit `src/services/objectDetectionService.ts`
5. Replace `VISION_API_KEY` with your key

### OpenAI GPT-4 (Better Content)

1. Get API key at [platform.openai.com](https://platform.openai.com/)
2. Edit `src/services/aiService.ts`
3. Replace `AI_API_KEY` with your key
4. Uncomment the actual API code

Without these, the app uses smart templates (works great for most items!).

---

## 📖 Available Commands

```bash
# Start development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (Mac only)
npm run ios

# Clear cache
npm start -- -c

# Use tunnel (better connectivity)
npm start -- --tunnel
```

---

## 🎨 Customize Your App

### Change Colors
Edit the hex color codes in:
- `src/screens/HomeScreen.tsx`
- `src/screens/CameraScreen.tsx`
- `src/screens/PreviewScreen.tsx`
- `src/screens/SettingsScreen.tsx`

Look for `#007AFF` (blue) and replace with your brand color.

### Modify AI Templates
Edit `src/services/aiService.ts`:
- Add new product categories
- Change title formats
- Modify description templates
- Adjust pricing logic

### Update Text
Change any text directly in the screen files.

---

## ❓ Troubleshooting

### Camera not working?
- Use a real device (not simulator)
- Grant camera permissions in Settings
- Check if Expo Go has camera access

### Can't connect to Expo?
```bash
# Try tunnel mode
npm start -- --tunnel
```

### TypeScript errors?
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### App crashes?
```bash
# Clear cache
npm start -- -c
```

### Facebook posting fails?
- Verify Access Token is correct
- Check Page ID is accurate
- Ensure token has `pages_manage_posts` permission
- Token might be expired (generate new one)

---

## 📚 Documentation

- **[README.md](README.md)** - Complete documentation
- **[QUICK_START.md](QUICK_START.md)** - Fast setup guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup
- **[FEATURES.md](FEATURES.md)** - All features explained
- **[PROJECT_SUMMARY.txt](PROJECT_SUMMARY.txt)** - Overview

---

## 🎉 You're All Set!

Your SellEasy app is ready to use. Start the development server and begin creating listings:

```bash
npm start
```

Scan the QR code and start turning your unused items into cash!

---

## 💡 Tips for Best Results

1. **Good Lighting**: Take photos in well-lit areas
2. **Center Objects**: Keep items centered in frame
3. **Clear Background**: Simple backgrounds work best
4. **Multiple Angles**: Try different perspectives
5. **Edit Freely**: Customize all generated content
6. **Save Time**: Use templates for similar items

---

## 🌟 What's Next?

1. **Test the flow** end-to-end
2. **Configure Facebook** for real posting
3. **Add AI APIs** for better results
4. **Customize branding** with your colors
5. **Build for production** when ready

---

**Happy Selling!** 🎯
