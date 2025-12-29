# Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development
```bash
npm start
```

Press `i` to open in iOS Simulator (requires Xcode)

### 3. Build for iPhone (Standalone App)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
npx eas build --platform ios --profile preview
```

## First Time Using the App

1. **Add Your First Bottle**
   - Tap the camera icon
   - Take a photo of a bottle label
   - The app will try to detect the name and category
   - Edit if needed and save

2. **Browse Cocktails**
   - Switch to the Cocktails tab
   - See what you can make with your current inventory
   - Tap "Can Make" to see recipes you have all ingredients for

3. **Make a Cocktail**
   - Tap any cocktail to see the full recipe
   - Follow the ingredients and instructions
   - Enjoy!

## Key Features

✅ **100% Offline** - No internet required
✅ **No API Keys** - Everything runs locally
✅ **Persistent Storage** - Data survives app restarts
✅ **Smart Matching** - Shows what cocktails you can make
✅ **50+ Recipes** - Pre-loaded cocktail database
✅ **Dark Mode** - Automatic theme switching

## Troubleshooting

**Camera not working?**
- Grant camera permissions in iOS Settings

**Can't add bottles?**
- Make sure you've allowed photo library access

**Database empty?**
- The app auto-populates cocktails on first launch
- Try restarting the app

## Need Help?

- Check the full [README.md](README.md)
- Open an issue on [GitHub](https://github.com/kamio90/local-storage-bartender)

---

**Happy mixing! 🍹**
