# AI Reminder App 🤖⏰

An intelligent React Native reminder app that uses AI to analyze your goals and create smart, personalized reminder schedules.

## 🌟 Features

### Core Features
- **AI Goal Analysis**: Enter your goal and timeframe, AI creates a complete reminder schedule
- **Smart Reminders**: AI generates contextual reminders based on goal type and timeline
- **Manual Reminders**: Traditional reminder creation for quick tasks
- **Push Notifications**: Get notified even when the app is closed
- **Status Tracking**: Monitor active, expired, and cancelled reminders
- **Category Organization**: Reminders organized by AI-generated categories

### AI Features
- **Goal Understanding**: AI analyzes your goal and suggests optimal reminder patterns
- **Timeline Adaptation**: Automatically adjusts reminder frequency based on your timeframe
- **Context-Aware**: Different reminder strategies for different goal types (fitness, learning, habits)
- **Milestone Creation**: AI identifies key checkpoints and creates milestone reminders
- **Smart Scheduling**: Optimal timing for different types of reminders

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (version 16+): [Download here](https://nodejs.org/)
2. **Expo CLI**: `npm install -g @expo/cli`
3. **Expo Go app** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
4. **Hugging Face Account** (free): [Sign up here](https://huggingface.co/join)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repository-url>
   cd ai-reminders-app
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Scan QR code** with your phone to open the app

## 🤖 AI Setup

### Getting Your Hugging Face API Key

1. **Create account**: Go to [huggingface.co/join](https://huggingface.co/join)
2. **Generate token**: Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. **Create new token** with "Read" permission
4. **Copy the token** (starts with `hf_`)

### Setting Up AI in the App

1. Open the app and tap the **⚙️** settings button
2. Paste your Hugging Face API key
3. Tap **"Test Connection"** to verify it works
4. Save settings

## 📱 How to Use

### Creating AI-Powered Reminders

1. Tap **🤖 AI Goal** button
2. Enter your goal (e.g., "Learn Spanish", "Exercise regularly", "Read 12 books")
3. Select your timeframe (1 week to 1 year)
4. Tap **"Analyze Goal with AI"**
5. Review and edit the AI-generated reminders
6. Tap **"Create Reminders"**

### Example AI Goals

- **"Learn Python programming in 3 months"**
  - Creates daily practice reminders
  - Weekly progress reviews
  - Monthly milestone checkpoints
  - Resource gathering reminders

- **"Run a 5K in 6 weeks"**
  - Daily training reminders
  - Rest day notifications
  - Progressive distance goals
  - Nutrition and hydration reminders

- **"Drink 8 glasses of water daily"**
  - Hourly water reminders
  - Morning hydration kickstart
  - Evening intake review

### Manual Reminders

For quick, one-off reminders:
1. Tap **+ Manual** button
2. Enter your message
3. Set date and time
4. Create reminder

## 🔄 App Workflow

### 1. Initial Setup
```
User Opens App → Permission Requests → Settings Configuration → API Key Setup
```

### 2. AI Goal Creation Workflow
```
Goal Input → AI Analysis → Strategy Generation → Reminder Scheduling → Notification Setup
```

**Detailed Steps:**
1. **Goal Input**: User enters goal and selects timeframe
2. **AI Processing**: Hugging Face API analyzes goal type and context
3. **Strategy Creation**: AI generates comprehensive achievement strategy
4. **Reminder Generation**: System creates specific reminders based on strategy
5. **Scheduling**: Each reminder is scheduled with appropriate timing
6. **Notification Setup**: Push notifications are registered with the system

### 3. Reminder Management Workflow
```
View Reminders → Status Tracking → Action (Cancel/Delete) → Notification Updates
```

### 4. AI Analysis Process
```
Input: "Learn Spanish in 3 months"
↓
AI Analysis: Language learning requires daily practice, weekly reviews
↓
Strategy: Daily 30min practice, weekly progress checks, monthly assessments
↓
Reminders Generated:
- Daily: "Practice Spanish for 30 minutes"
- Weekly: "Review this week's Spanish progress"
- Monthly: "Spanish milestone check - assess your progress"
```

## 🛠️ Technologies Used

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type safety and better development experience
- **Expo** - Development platform and build tools
- **Hugging Face API** - AI language models for goal analysis
- **AsyncStorage** - Local data persistence
- **Expo Notifications** - Push notification handling
- **React Native DateTimePicker** - Date/time selection

## 📂 Project Structure

```
ai-reminders-app/
├── src/
│   ├── components/
│   │   ├── AddReminderForm.tsx     # Manual reminder creation
│   │   ├── ReminderItem.tsx        # Individual reminder display
│   │   ├── AIGoalForm.tsx          # AI goal input and analysis
│   │   └── SettingsModal.tsx       # App settings and API key
│   ├── hooks/
│   │   └── useReminders.ts         # Reminder state management
│   ├── services/
│   │   ├── AIService.ts            # Hugging Face API integration
│   │   ├── NotificationService.ts  # Push notification handling
│   │   ├── ReminderService.ts      # Reminder business logic
│   │   ├── StorageService.ts       # Local data storage
│   │   └── SettingsService.ts      # App settings management
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── App.tsx                         # Main app component
├── package.json                    # Dependencies and scripts
├── app.json                        # Expo configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 🎯 Key Components Created/Modified

### New AI Components
- **AIGoalForm.tsx** - AI goal input interface with preview
- **SettingsModal.tsx** - API key configuration and settings
- **AIService.ts** - Hugging Face API integration and analysis
- **SettingsService.ts** - Settings persistence and management

### Enhanced Components
- **App.tsx** - Added AI workflow and settings integration
- **useReminders.ts** - Added support for multiple reminders and AI-generated content
- **ReminderService.ts** - Added batch reminder creation and AI categorization
- **types/index.ts** - Extended types for AI features

## 🤖 AI Integration Details

### Supported Models
The app tries multiple Hugging Face models for reliability:
- microsoft/DialoGPT-large
- google/flan-t5-large
- facebook/blenderbot-400M-distill
- mistralai/Mistral-7B-Instruct-v0.1

### AI Analysis Process
1. **Goal Parsing**: Extracts intent, timeframe, and goal type
2. **Strategy Generation**: Creates achievement strategy with milestones
3. **Reminder Mapping**: Converts strategy into specific reminders
4. **Schedule Optimization**: Sets optimal timing for different reminder types
5. **Fallback Handling**: Provides structured reminders even if AI fails

### Smart Categories
AI automatically categorizes reminders:
- **Start** - Initial action reminders
- **Daily** - Regular practice reminders
- **Weekly Review** - Progress assessment
- **Monthly Milestone** - Major checkpoints
- **Practice** - Skill-building activities
- **Rest Day** - Recovery reminders
- **Completion** - Goal achievement celebration

## 📱 Testing Methods

### Development Testing
```bash
# Same WiFi network
npm start
# Scan QR code with phone

# Different networks (tunnel mode)
npx expo start --tunnel
# More reliable across networks

# Clear cache if issues
npx expo start --clear
```

### Production Testing
```bash
# Build Android APK
npx expo build:android -t apk

# Build iOS (requires Apple Developer account)
npx expo build:ios
```

## 🔧 Configuration

### Environment Setup
1. Set up Hugging Face API key in app settings
2. Enable notification permissions
3. Configure timezone (automatic)

### Customization Options
- Reminder frequency preferences
- Notification sound settings
- AI analysis depth
- Category preferences

## 🐛 Troubleshooting

### Common Issues

**AI not working:**
- Check API key is valid
- Test connection in settings
- Ensure internet connectivity
- Try different goal phrasing

**Notifications not appearing:**
- Enable notification permissions
- Check device notification settings
- Verify reminder times are in future
- Test with manual reminder first

**App crashes:**
- Clear cache: `npx expo start --clear`
- Check for typos in API key
- Restart development server
- Check console for error messages

**Poor AI suggestions:**
- Be more specific with goals
- Include timeframe context
- Try rephrasing the goal
- Use examples from the app

## 🚀 Production Deployment

### Building for Release
```bash
# Android
npx expo build:android --release-channel production

# iOS
npx expo build:ios --release-channel production
```

### App Store Requirements
- Icons: 1024x1024 for store, adaptive icons for Android
- Privacy policy: Required for AI data processing
- App description: Mention AI and notification features

## 📊 Features Comparison

| Feature | Manual Mode | AI Mode |
|---------|-------------|---------|
| Setup Time | 30 seconds | 2-3 minutes |
| Reminders Created | 1 per action | 5-25 per goal |
| Customization | Full control | AI-optimized |
| Learning Curve | None | Minimal |
| Best For | Quick tasks | Long-term goals |

## 🔒 Privacy & Security

- **API Key**: Stored locally on device only
- **Goal Data**: Sent to Hugging Face for analysis only
- **Reminders**: Stored locally, never uploaded
- **No Tracking**: No analytics or user tracking
- **Open Source**: All code is transparent and auditable

## 📈 Roadmap

### Planned Features
- **Voice Input**: Speak your goals instead of typing
- **Progress Tracking**: Visual progress charts and statistics
- **Goal Templates**: Pre-built templates for common goals
- **Team Goals**: Share goals and reminders with others
- **Habit Tracking**: Mark reminders as completed
- **Custom AI Models**: Fine-tuned models for specific goal types

### Technical Improvements
- **Offline AI**: Local AI models for basic analysis
- **Better Scheduling**: More sophisticated reminder timing
- **Integration**: Calendar and task app synchronization
- **Widgets**: Home screen widgets for quick access

## 🤝 Contributing

This is an educational project. To contribute:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly on both iOS and Android
4. Submit a pull request with detailed description

## 📄 License

MIT License - Feel free to use for learning and personal projects.

---

**Happy Goal Achieving! 🎉**

*Transform your aspirations into achievable steps with AI-powered reminders.*