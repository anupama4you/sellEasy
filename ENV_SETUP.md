# Environment Variables Setup

SellEasy supports configuration via environment variables for easier deployment and API key management.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys to `.env`:**
   ```bash
   # OpenAI API (for ChatGPT Vision)
   OPENAI_API_KEY=sk-proj-your-actual-api-key-here
   ```

3. **Restart the app:**
   ```bash
   npm start
   ```

## Supported Environment Variables

### `OPENAI_API_KEY`
- **Purpose**: ChatGPT Vision API for advanced image analysis
- **Get it from**: https://platform.openai.com/api-keys
- **Required**: No (optional, enhances AI features)
- **Example**: `sk-proj-abc123...`

### `GOOGLE_VISION_API_KEY`
- **Purpose**: Google Cloud Vision API for object detection
- **Get it from**: https://console.cloud.google.com/
- **Required**: No (fallback included)
- **Example**: `AIzaSyB...`

### `FACEBOOK_ACCESS_TOKEN` & `FACEBOOK_PAGE_ID`
- **Purpose**: Direct Facebook API posting (legacy)
- **Note**: Not currently used - app uses deep linking instead
- **Required**: No

## How It Works

### API Key Priority
The app uses API keys in this order:

1. **User-configured key** (Settings screen) - Highest priority
2. **Environment variable** (.env file) - Fallback
3. **Basic AI** (built-in templates) - Last resort

### Example Workflow

```
User opens app
  ↓
Checks AsyncStorage for user key → Found? Use it ✓
  ↓ (if not found)
Checks .env for OPENAI_API_KEY → Found? Use it ✓
  ↓ (if not found)
Use basic AI (built-in) ✓
```

## Display in Settings

The Settings screen shows the API key source:

- **"Source: User Settings"** - Key from Settings screen
- **"Source: Environment Variable (.env)"** - Key from .env file
- **"Using Basic AI"** - No key configured

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit .env to version control**
   - Already added to `.gitignore`
   - Keep API keys private

2. **Use different keys for development/production**
   ```bash
   # Development
   OPENAI_API_KEY=sk-proj-dev-key...

   # Production (separate .env)
   OPENAI_API_KEY=sk-proj-prod-key...
   ```

3. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys after migration

## Development vs Production

### Local Development
```bash
# .env (local)
OPENAI_API_KEY=sk-proj-dev-12345...
```

### Production Build
```bash
# Set in your build environment
export OPENAI_API_KEY=sk-proj-prod-67890...
```

## Troubleshooting

### API Key Not Working

1. **Check the file exists:**
   ```bash
   ls -la .env
   ```

2. **Verify the format:**
   ```bash
   # Correct
   OPENAI_API_KEY=sk-proj-abc123...

   # Wrong (no spaces, no quotes)
   OPENAI_API_KEY = "sk-proj-abc123..."
   ```

3. **Restart the bundler:**
   ```bash
   # Stop the app (Ctrl+C)
   npm start
   ```

4. **Clear cache:**
   ```bash
   npm start -- --reset-cache
   ```

### Environment Variable Not Loading

- Check `babel.config.js` includes `react-native-dotenv`
- Ensure `.env` is in root directory
- Restart Metro bundler

### User Key vs Environment Key

- User key (from Settings) **always** takes priority
- Environment key is only used when no user key exists
- Remove user key in Settings to use .env key

## Benefits of Environment Variables

✅ **Team Development**: Share `.env.example`, each dev uses their own keys
✅ **CI/CD Integration**: Set keys in build environment
✅ **Security**: Keys never committed to git
✅ **Flexibility**: Easy to switch between dev/staging/prod keys
✅ **Fallback**: App works even if user doesn't configure Settings

## Related Files

- `.env` - Your actual API keys (not in git)
- `.env.example` - Template with placeholders (in git)
- `babel.config.js` - Babel configuration for dotenv
- `src/types/env.d.ts` - TypeScript definitions
- `src/services/chatgptService.ts` - Uses environment variables

## Support

If you have issues with environment variables:
1. Check this guide
2. Review `.env.example` format
3. Ensure `react-native-dotenv` is installed
4. Restart Metro bundler

---

**Happy Developing!** 🚀
