# Bartender Storage - Local AI Home Bar Manager

A standalone React Native + Expo iOS application for managing your home bar inventory with 100% LOCAL AI - no API keys needed, no cloud dependencies, completely offline.

## Features

### Photo Recognition & Inventory (100% LOCAL AI)
- Take photos or upload images of alcohol bottles
- **ML Kit OCR** - Real text recognition from bottle labels
- **Advanced AI Classification** - Intelligent alcohol category detection with:
  - 100+ brand name recognition (Absolut, Jack Daniel's, Bacardi, etc.)
  - Multi-language support (English, Polish, Russian, Spanish, etc.)
  - **Confidence scoring** - Shows AI certainty (High/Medium/Low)
  - Smart keyword matching with brand-specific detection
  - Support for 10 alcohol categories
- **Smart Name Extraction** - AI extracts brand name from label text with scoring algorithm
- SQLite database for persistent storage - survives app restarts
- View collection with thumbnails and details
- Mark bottles as full, low, or empty
- Search and filter by category

### Cocktail Suggestions (LOCAL DATABASE)
- Pre-loaded SQLite database with 50+ popular cocktail recipes
- Smart matching: shows what you can make NOW with your inventory
- Shows missing ingredients for cocktails you're close to making
- Detailed recipes with:
  - Required alcohol types
  - Non-alcoholic ingredients with measurements
  - Step-by-step instructions
  - Glass type and garnish suggestions
  - Difficulty level
- Sort by "can make now" vs "need extra ingredients"

### Technical Highlights
- **100% LOCAL** - No external APIs, no API keys required
- **PERSISTENT STORAGE** - All data stored in SQLite, survives app closure/restart
- **LOCAL PHOTOS** - Images stored in app's document directory
- **DARK MODE** - Automatic light/dark theme based on system settings
- **CLEAN UI** - Built with React Native Paper

## Technology Stack

- **React Native** - Cross-platform mobile framework
- **Expo SDK** - Development and build toolchain
- **TypeScript** - Type-safe code
- **expo-sqlite** - Local persistent database
- **expo-camera** - Camera access for bottle scanning
- **expo-image-picker** - Photo library access
- **expo-file-system** - Local file storage for photos
- **React Navigation** - App navigation
- **React Native Paper** - Material Design UI components
- **Local ML/OCR** - Keyword-based classification (extensible with ML Kit)

## Prerequisites

- Node.js (v20.19.4 or higher recommended)
- npm or yarn
- macOS (for iOS builds)
- Xcode (for iOS development)
- Expo account (free) - for EAS Build

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kamio90/local-storage-bartender.git
cd local-storage-bartender
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm start
```

This will start the Expo development server. You can:
- Press `i` to open in iOS Simulator (requires Xcode)
- Scan QR code with Expo Go app (development mode only)

## Building Standalone iOS App

The app is configured for EAS Build to create a standalone .ipa file that installs directly on iPhone (no Expo Go required).

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure EAS Build

The project already includes `eas.json` configuration. To initialize or update:

```bash
eas build:configure
```

### 4. Build for iOS

#### For Testing (Internal Distribution)

```bash
npx eas build --platform ios --profile preview
```

This creates an .ipa file you can install via:
- TestFlight (after uploading to App Store Connect)
- Direct installation via Xcode or Apple Configurator
- Ad-hoc distribution to registered devices

#### For Production

```bash
npx eas build --platform ios --profile production
```

### 5. Install on iPhone

After the build completes:

#### Option A: TestFlight
1. Download the .ipa from EAS Build dashboard
2. Upload to App Store Connect
3. Add internal or external testers
4. Install via TestFlight app

#### Option B: Direct Install (Development)
1. Download the .ipa from EAS Build dashboard
2. Connect iPhone to Mac
3. Open Xcode → Window → Devices and Simulators
4. Drag .ipa onto your device

#### Option C: Expo Development Build
```bash
eas build --platform ios --profile development
npx expo start --dev-client
```

## Data Persistence

### What Gets Stored Locally

1. **SQLite Database** (`bartender.db`)
   - Bottle inventory with all details
   - 50+ pre-loaded cocktail recipes
   - Relationships between cocktails and ingredients
   - Location: App's SQLite directory

2. **Photos**
   - All bottle photos stored in app's document directory
   - Persist across app restarts
   - Deleted when bottle is removed

3. **Everything is LOCAL**
   - No cloud sync
   - No external API calls
   - No API keys required
   - Works 100% offline

### Database Schema

**bottles**
- id, name, category, photoUri, quantity, status, dateAdded, notes

**cocktails**
- id, name, category, difficulty, instructions, garnish, glassType

**cocktail_alcohol**
- cocktailId, alcoholType (many-to-many)

**cocktail_ingredients**
- id, cocktailId, name, amount, isAlcohol, alcoholType

## Cocktail Database

The app includes 50+ cocktail recipes:

**Classic Cocktails**: Margarita, Mojito, Old Fashioned, Martini, Manhattan, Negroni, Daiquiri, Whiskey Sour, Mai Tai, etc.

**Modern Cocktails**: Cosmopolitan, Espresso Martini, Aperol Spritz, Penicillin, etc.

**Tiki Cocktails**: Mai Tai, Piña Colada, Zombie, etc.

**Party Cocktails**: Long Island Iced Tea, Sex on the Beach, etc.

All recipes include:
- Required alcohol types
- Non-alcoholic ingredients with measurements
- Detailed instructions
- Garnish suggestions
- Glass type recommendations
- Difficulty level

## Local AI/ML Features

The app uses **advanced local AI** with no cloud dependencies:

### 1. ML Kit OCR Text Recognition
- **Real-time text detection** from bottle labels using ML Kit
- Automatically processes photos to extract all visible text
- Works offline - no internet required
- Falls back gracefully if ML Kit unavailable

### 2. Intelligent Alcohol Classification
- **100+ recognized brands** across all categories:
  - **Vodka**: Absolut, Grey Goose, Belvedere, Smirnoff, Tito's, etc.
  - **Whiskey**: Jack Daniel's, Jim Beam, Johnnie Walker, Jameson, etc.
  - **Rum**: Bacardi, Captain Morgan, Havana Club, etc.
  - **Gin**: Tanqueray, Bombay Sapphire, Hendrick's, etc.
  - **Tequila**: Patrón, Don Julio, Casamigos, etc.
  - Plus Brandy, Liqueur, Wine, Beer, and specialty spirits

- **Multi-language support**:
  - English, Polish (wódka), Russian (водка), Spanish (ron), French (rhum)
  - International brand name recognition

- **Smart scoring algorithm**:
  - Longer brand names = higher confidence (more specific)
  - Exact word matches get bonus points
  - Multiple keyword matches increase accuracy

### 3. Confidence Scoring System
- **High Confidence (70%+)**: Strong brand/keyword match - green badge
- **Medium Confidence (40-69%)**: Partial match - orange badge
- **Low Confidence (<40%)**: Weak match - red badge
- **Visual feedback**: Shows detected keywords and confidence percentage

### 4. Advanced Name Extraction
- Intelligent line scoring to find brand name
- Filters out noise (ABV%, volume measurements, generic terms)
- Prioritizes first lines and capitalized text
- Brand name recognition boosts confidence

### 5. Manual Override
- All AI suggestions can be edited
- Fallback to manual entry if OCR fails
- User always has final control

### ML Kit Integration

The app includes ML Kit OCR integration out of the box:

```typescript
// Automatic OCR processing in src/ml/textRecognition.ts
const result = await processBottleImage(imageUri);
// Returns: { text, extractedName, classification, confidence }
```

If ML Kit is not available, the app gracefully falls back to manual entry mode.

## App Structure

```
/src
  /components       # Reusable UI components
  /screens          # Screen components
    - CameraScreen.tsx
    - AddBottleScreen.tsx
    - InventoryScreen.tsx
    - CocktailsScreen.tsx
    - CocktailDetailScreen.tsx
  /database         # SQLite operations
    - init.ts
    - cocktailData.ts
    - populateCocktails.ts
    - bottleOperations.ts
    - cocktailOperations.ts
  /ml               # OCR and classification
    - textRecognition.ts
  /utils            # Helpers
    - storage.ts
    - theme.ts
  /types            # TypeScript types
    - index.ts
/assets             # Images and icons
App.tsx             # Main app component
eas.json            # EAS Build configuration
app.json            # Expo configuration
```

## Configuration Files

### app.json
- App name, bundle identifier
- Camera and photo library permissions
- iOS and Android specific settings

### eas.json
- Build profiles (development, preview, production)
- Distribution settings

## Permissions

The app requires:
- **Camera**: To scan bottle labels
- **Photo Library**: To upload existing bottle photos
- **File System**: To store photos locally

All permissions are requested at runtime with clear explanations.

## Troubleshooting

### Build Issues

**Node version mismatch**: Upgrade to Node 20.19.4+
```bash
nvm install 20.19.4
nvm use 20.19.4
```

**EAS Build fails**: Check build logs in Expo dashboard

**SQLite errors**: Database auto-initializes on first launch

### Runtime Issues

**Photos not loading**: Check file system permissions

**Camera not working**: Grant camera permissions in iOS Settings

**Database empty**: App auto-populates cocktails on first launch

## Development

### Running in Development

```bash
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Clearing Cache

```bash
npm start -- --clear
```

## Future Enhancements

- Full ML Kit OCR integration
- Barcode scanning
- Custom cocktail recipes
- Shopping list generation
- Bottle value tracking
- Export/import inventory
- Widget support

## Privacy

This app prioritizes your privacy:
- ✅ 100% local data storage
- ✅ No cloud sync
- ✅ No analytics
- ✅ No API calls
- ✅ No user accounts
- ✅ Works completely offline

## License

MIT License - feel free to use and modify

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- Open an issue on GitHub
- Check documentation at [Expo Docs](https://docs.expo.dev)

## Credits

Built with:
- React Native
- Expo SDK
- React Native Paper
- React Navigation

Cocktail recipes curated from classic mixology resources.

---

**Remember**: This app works 100% offline with no API keys or external dependencies. Your data stays on your device!
