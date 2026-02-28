# EverAfter 🌌

> Preserve a Mind Before It Fades

EverAfter is a memory preservation app designed to help people capture, organize, and interact with their life memories. Built with React Native (Expo) and Firebase.

## Features

- 📅 **Calendar-Based Memory Capture** - Record memories tied to specific dates
- 🎤 **Voice & Media Support** - Add voice recordings, photos, and videos
- ✨ **AI Enhancement** - Automatically extract emotions, people, and themes
- 🌌 **LifeLine View** - Visualize your life journey in an immersive 3D space
- 🎙️ **Speak With Memory** - Have conversations with your past self
- 📊 **Memory Highlights** - Auto-generated life summaries and insights

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: LLM integration for memory enhancement
- **Voice**: ElevenLabs API for voice synthesis
- **Animations**: React Native Reanimated

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Expo Go app on your phone

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start --tunnel
```

Scan the QR code with Expo Go to preview on your device.

## Project Structure

```
EverAfter/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Splash screen
│   ├── login.tsx          # Authentication
│   └── home.tsx           # Main hub
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/            # Firebase configuration
│   ├── constants/         # Theme and constants
│   └── context/           # React contexts
└── assets/                # Images and fonts
```

## License

MIT
