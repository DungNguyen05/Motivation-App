# My Reminders App - Quick Setup & Testing Guide

A React Native reminder app with push notifications.

## 🚀 Quick Start

### Prerequisites
- Node.js (16+): [Download here](https://nodejs.org/)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation & Compilation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repository-url>
   cd my-reminders-app
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

## 📱 Testing Methods

### Method 1: Same WiFi Network (Easiest)
1. Run `npm start`
2. Scan QR code with your phone's camera (iOS) or Expo Go app (Android)
3. App loads on your phone

### Method 2: Different Networks / No WiFi (Tunnel)

**Option A: Use Expo Tunnel**
```bash
# Start with tunnel (works across different networks)
npx expo start --tunnel
```
- Scan the QR code that appears
- Works even if phone and computer are on different networks
- Slower but more reliable for testing

**Option B: Manual Connection**
```bash
# Start normally first
npm start

# In the terminal, press 's' to switch to Expo Go
# Then press 't' to switch to tunnel mode
```

**Option C: Use ngrok (Alternative tunnel)**
```bash
# If tunnel doesn't work, install ngrok
npm install -g ngrok

# Start your app normally
npm start

# In another terminal, tunnel the port (usually 8081)
ngrok http 8081

# Use the ngrok URL in Expo Go manually
```

### Method 3: Build and Install APK (Android Only)

**For Android devices without Expo Go:**

1. **Build APK:**
   ```bash
   # Login to Expo account (create one at expo.dev)
   npx expo login

   # Build Android APK
   npx expo build:android -t apk
   ```

2. **Download and install:**
   - Wait for build to complete (10-20 minutes)
   - Download APK from the link provided
   - Install on Android device

### Method 4: Local Development Build

**For advanced users:**

1. **Setup EAS Build:**
   ```bash
   npm install -g @expo/eas-cli
   eas login
   eas build:configure
   ```

2. **Build for testing:**
   ```bash
   # Android
   eas build --platform android --profile development

   # iOS (requires Apple Developer account)
   eas build --platform ios --profile development
   ```

## 🔧 Platform-Specific Compilation

### Android Emulator
```bash
# Requires Android Studio installed
npm run android
```

### iOS Simulator (Mac only)
```bash
# Requires Xcode installed
npm run ios
```

### Web Browser (Limited features)
```bash
npm run web
```

## 🐛 Troubleshooting

### Can't Connect to Development Server

**Problem:** QR code not working, connection issues

**Solutions:**
```bash
# 1. Try tunnel mode
npx expo start --tunnel

# 2. Clear cache and restart
npx expo start --clear

# 3. Check if ports are blocked
npx expo start --localhost

# 4. Use specific host
npx expo start --host <your-ip-address>
```

### Different Network Testing

**Problem:** Phone and computer on different WiFi networks

**Solutions:**
1. **Use tunnel mode:** `npx expo start --tunnel`
2. **Connect to same network:** Use mobile hotspot
3. **Use ngrok:** Install and tunnel manually
4. **Build APK:** For permanent testing

### Slow Loading with Tunnel

**Problem:** App loads slowly with tunnel mode

**Solutions:**
- Tunnel mode is slower but works across networks
- For faster development, use same WiFi when possible
- Build development APK for faster testing

### Expo Go App Issues

**Problem:** Expo Go app crashes or won't load

**Solutions:**
```bash
# 1. Update Expo Go app on phone
# 2. Update Expo CLI
npm install -g @expo/eas-cli@latest

# 3. Clear Expo cache
npx expo start --clear

# 4. Restart development server
```

## 📦 Production Builds

### Build APK for Distribution
```bash
# Build production APK
npx expo build:android -t apk --release-channel production

# Build AAB for Google Play Store
npx expo build:android -t app-bundle
```

### Build for iOS
```bash
# Requires Apple Developer account
npx expo build:ios
```

## 🌐 Testing Without Expo Go

### Create Development Build

1. **Generate development build:**
   ```bash
   npx expo install expo-dev-client
   npx expo run:android
   # or
   npx expo run:ios
   ```

2. **This creates a standalone app** that doesn't need Expo Go

### Over-the-Air (OTA) Updates

```bash
# Publish updates without rebuilding
npx expo publish

# Users get updates automatically
```

## 📋 Quick Commands Cheat Sheet

```bash
# Basic setup
npm install
npm start

# Different connection methods
npx expo start --tunnel          # Different networks
npx expo start --localhost       # Local only
npx expo start --clear          # Clear cache

# Platform specific
npm run android                 # Android emulator
npm run ios                    # iOS simulator
npm run web                    # Web browser

# Building
npx expo build:android         # Android APK
npx expo build:ios            # iOS build
```

## 📱 Recommended Testing Workflow

1. **Development:** Use same WiFi + `npm start`
2. **Demo/Testing:** Use tunnel mode `npx expo start --tunnel`
3. **Distribution:** Build APK/IPA for sharing
4. **Production:** Submit to app stores

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Build Service](https://expo.dev/eas)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Expo Go App Download](https://expo.dev/client)

---

**Need help?** Check the troubleshooting section or create an issue in the repository.