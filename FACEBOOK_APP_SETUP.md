# 📱 Force Facebook App (No Browser)

This guide explains how SellEasy forces the Facebook **mobile app** to open instead of the browser.

---

## 🎯 How It Works Now

### Updated Behavior

When you tap **"Post to Facebook"**:

1. **Tries Facebook App First** (multiple deep link URLs)
   - `fb://marketplace/create` - Direct to Marketplace
   - `fb://page/marketplace` - Alternative route
   - `fb://marketplace` - General marketplace
   - `fb://feed` - Facebook feed

2. **If App Not Installed**
   - Shows dialog: "Facebook App Not Found"
   - Options:
     - "Install Facebook" → Opens App Store
     - "Use Browser Instead" → Opens web (optional)
     - "Cancel" → Go back

3. **Never Opens Browser Automatically**
   - Only opens browser if user explicitly chooses it
   - Otherwise, prompts to install the app

---

## 🔧 Technical Implementation

### 1. Deep Link Priority

```typescript
static async openFacebookMarketplace(): Promise<boolean> {
  // ONLY try app URLs first
  const appUrls = [
    'fb://marketplace/create',
    'fb://page/marketplace',
    'fb://marketplace',
    'fb://feed'
  ];

  for (const url of appUrls) {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true; // Success!
    }
  }

  // App not found - show dialog
  Alert.alert('Facebook App Not Found', ...);
  return false;
}
```

### 2. URL Scheme Configuration

**iOS** ([app.json](app.json)):
```json
"LSApplicationQueriesSchemes": [
  "fb",
  "fbapi",
  "fbauth2",
  "fbshareextension"
]
```

**Android** ([app.json](app.json)):
```json
"intentFilters": [
  {
    "action": "VIEW",
    "data": { "scheme": "fb" }
  }
]
```

### 3. App Store Links

When user chooses "Install Facebook":

**iOS**:
```
https://apps.apple.com/app/facebook/id284882215
```

**Android**:
```
market://details?id=com.facebook.katana
```

---

## 📋 Available Functions

### `openFacebookMarketplace()`
**Default behavior** - Tries app, then shows dialog

```typescript
const opened = await FacebookMarketplaceService.openFacebookMarketplace();
```

### `openFacebookAppOnly()`
**Force app only** - Never offers browser option

```typescript
const opened = await FacebookMarketplaceService.openFacebookAppOnly();
```

### `showPostingOptions()`
**Give user choices**

```typescript
await FacebookMarketplaceService.showPostingOptions(listing);
```

Options shown:
- Open Facebook (app preferred)
- Share to... (native share dialog)
- Copy Info (just copy to clipboard)

---

## 🎨 User Experience Flow

### Scenario 1: Facebook App Installed ✅

```
User taps "Post to Facebook"
    ↓
App checks: fb:// URLs
    ↓
Facebook app opens!
    ↓
User pastes info & publishes
```

### Scenario 2: No Facebook App ❌

```
User taps "Post to Facebook"
    ↓
App checks: fb:// URLs (all fail)
    ↓
Dialog appears:
  "Facebook App Not Found"
  [Install Facebook]
  [Use Browser Instead]
  [Cancel]
    ↓
User chooses action
```

---

## ⚙️ Customization Options

### Option 1: Always Require App (Strictest)

Replace `openFacebookMarketplace()` calls with `openFacebookAppOnly()`:

```typescript
// In PreviewScreen.tsx
const success = await FacebookMarketplaceService.openFacebookAppOnly();
```

This **never** offers browser as an option.

### Option 2: Skip Dialog, Direct to App Store

```typescript
static async openFacebookMarketplace(): Promise<boolean> {
  // Try app URLs
  for (const url of appUrls) {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return true;
    }
  }

  // Instead of dialog, go straight to app store
  await this.openAppStore();
  return false;
}
```

### Option 3: Add "Don't Show Again" Preference

```typescript
const dontShowAgain = await AsyncStorage.getItem('fb_app_warning_shown');
if (!dontShowAgain) {
  Alert.alert(...);
  await AsyncStorage.setItem('fb_app_warning_shown', 'true');
}
```

---

## 🔍 Testing

### Test on iOS

1. **With Facebook App**:
   ```bash
   npm run ios
   ```
   - Create listing → Post
   - Should open Facebook app directly

2. **Without Facebook App**:
   - Uninstall Facebook from iOS simulator
   - Try posting → Should show "Install" dialog

### Test on Android

1. **With Facebook App**:
   ```bash
   npm run android
   ```
   - Same as iOS

2. **Without Facebook App**:
   - Uninstall from Android emulator
   - Should show Google Play Store option

---

## 📱 Deep Link URLs Tried

Here are all the Facebook deep link patterns attempted:

| URL | Purpose | Priority |
|-----|---------|----------|
| `fb://marketplace/create` | Direct to marketplace creation | 1st |
| `fb://page/marketplace` | Alternative marketplace route | 2nd |
| `fb://marketplace` | General marketplace page | 3rd |
| `fb://feed` | Facebook feed (fallback) | 4th |

**Note**: These only work if Facebook app is installed!

---

## ❓ FAQs

### Why not just use web URLs?

Web URLs **always** work, but:
- Worse user experience (slower)
- No app integration
- More steps for user
- Less native feel

### What if user refuses to install the app?

They can:
1. Choose "Use Browser Instead" in the dialog
2. Use "More Options" → "Share to..."
3. Use "More Options" → "Copy Info" and paste manually

### Can I remove the browser option completely?

Yes! Use `openFacebookAppOnly()` instead of `openFacebookMarketplace()`.

### What about other social platforms?

Same approach works for:
- Instagram: `instagram://`
- Twitter/X: `twitter://`
- WhatsApp: `whatsapp://`
- LinkedIn: `linkedin://`

---

## 🚀 Recommended Setup

**For best user experience**:

1. **Use**: `openFacebookMarketplace()` (current default)
   - Tries app first
   - Offers browser as backup
   - Helps user install app

2. **First-time guidance**:
   - Show in Settings: "For best experience, install Facebook app"
   - Test button to verify app is installed

3. **Error handling**:
   - Clear messages
   - Actionable options
   - Never leave user stuck

---

## ✅ Current Configuration

Your app is **already configured** to:
- ✅ Prioritize Facebook app over browser
- ✅ Show helpful dialog if app missing
- ✅ Offer app store link
- ✅ Provide browser fallback option
- ✅ Handle all edge cases

**No additional configuration needed!**

---

**The app will now strongly prefer opening Facebook in the mobile app, with graceful fallbacks if the app isn't installed.** 📱✨
