# Reminder App 📱⏰

A simple and intuitive React Native app for setting and managing reminders with push notifications.

## 📋 Features

- **Create Reminders**: Set custom reminder messages with date and time
- **Push Notifications**: Get notified even when the app is closed
- **Smart Status Tracking**: See which reminders are active, expired, or cancelled
- **Easy Management**: Cancel or delete reminders with confirmation dialogs
- **Clean Interface**: User-friendly design with clear visual feedback
- **Cross-Platform**: Works on both iOS and Android devices

## 🛠️ Technologies Used

- **React Native** - Mobile app framework
- **TypeScript** - For type safety and better development experience
- **Expo** - Development platform and build tools
- **AsyncStorage** - Local data storage
- **Expo Notifications** - Push notification handling
- **React Native DateTimePicker** - Date and time selection

## 📱 Screenshots

*Add screenshots of your app here when available*

## 🚀 Getting Started

### Prerequisites

Before running this app, make sure you have:

1. **Node.js** installed (version 16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   
2. **Expo CLI** installed globally:
   ```bash
   npm install -g @expo/cli
   ```

3. **Expo Go app** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation

1. **Clone or download this project** to your computer

2. **Open terminal/command prompt** and navigate to the project folder:
   ```bash
   cd reminder-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

### Running the App

1. **Start the development server**:
   ```bash
   npm start
   ```
   or
   ```bash
   expo start
   ```

2. **Scan the QR code** that appears in your terminal with:
   - **iPhone**: Use the Camera app to scan the QR code
   - **Android**: Use the Expo Go app to scan the QR code

3. The app will load on your phone!

### Alternative Running Methods

- **Android Emulator**: `npm run android`
- **iOS Simulator** (Mac only): `npm run ios`
- **Web Browser**: `npm run web`

## 📖 How to Use the App

### Creating a Reminder

1. Tap the **"+ Add Reminder"** button at the bottom
2. Enter your reminder message (up to 200 characters)
3. Select the date by tapping the date button
4. Select the time by tapping the time button
5. Tap **"Create Reminder"** to save

### Managing Reminders

- **View Status**: Each reminder shows if it's Active, Expired, or Cancelled
- **Cancel Reminder**: Tap "Cancel" to stop an active reminder
- **Delete Reminder**: Tap "Delete" to permanently remove a reminder
- **Clear All**: Use the "Clear All" button to remove all reminders at once
- **Refresh**: Pull down on the list to refresh and see updates

### Understanding Reminder Status

- 🟢 **Active**: Reminder is set and will notify you at the scheduled time
- 🔴 **Expired**: The reminder time has passed
- ⚪ **Cancelled**: You manually cancelled this reminder

## 🔧 Project Structure

```
reminder-app/
├── src/
│   ├── components/          # React components
│   │   ├── AddReminderForm.tsx
│   │   └── ReminderItem.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useReminders.ts
│   ├── services/           # Business logic and external services
│   │   ├── NotificationService.ts
│   │   ├── ReminderService.ts
│   │   └── StorageService.ts
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── App.tsx                 # Main app component
├── package.json           # Dependencies and scripts
├── app.json              # Expo configuration
└── README.md             # This file
```

## ⚠️ Important Notes

### Permissions

The app needs notification permissions to work properly:

- **First Launch**: The app will ask for permission to send notifications
- **If Denied**: You'll see a warning message in the app
- **To Fix**: Go to your phone's Settings > Apps > Reminder App > Permissions > Allow Notifications

### Limitations

- **Background Limits**: Notifications may not work if the phone's battery optimization is too aggressive
- **iOS Testing**: Notifications work differently on iOS simulator vs real device
- **Time Zones**: Reminders are set in your device's local time zone

## 🐛 Troubleshooting

### Common Issues

**App won't start:**
- Make sure you ran `npm install`
- Check that Node.js is installed correctly
- Try deleting `node_modules` folder and running `npm install` again

**QR code won't scan:**
- Make sure your phone and computer are on the same Wi-Fi network
- Try the `expo start --tunnel` command instead

**Notifications not working:**
- Check that notifications are enabled in your phone settings
- Make sure the reminder time is in the future
- Test on a real device (notifications may not work on simulators)

**App crashes:**
- Check the terminal for error messages
- Try restarting the development server with `npm start`

### Getting Help

If you're having issues:

1. Check the [Expo Documentation](https://docs.expo.dev/)
2. Look at [React Native Documentation](https://reactnative.dev/docs/getting-started)
3. Search for your error message online
4. Ask for help on programming forums like Stack Overflow

## 🔄 Making Changes

### Adding New Features

The app is built with a modular structure, making it easy to add features:

- **New UI components**: Add to `src/components/`
- **New functionality**: Add to `src/services/`
- **New data types**: Add to `src/types/`

### Customizing the App

**Change App Name:**
- Edit the `name` field in `app.json`

**Change App Icon:**
- Replace `assets/icon.png` with your own icon (1024x1024 pixels)

**Change Colors:**
- Edit the StyleSheet objects in each component file

## 📚 Learning Resources

Since you're a beginner, here are some helpful resources:

- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)

## 🏗️ Building for Production

When you're ready to publish your app:

1. **Create an Expo account** at [expo.dev](https://expo.dev)
2. **Build the app**:
   ```bash
   expo build:android
   expo build:ios
   ```
3. **Follow Expo's publishing guide** for submitting to app stores

## 📝 License

This project is for educational purposes. Feel free to modify and use it as you learn!

---

**Happy Coding! 🎉**

*If you found this helpful, don't forget to star the project and share it with other beginners!*