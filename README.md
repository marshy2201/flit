# FLIT – Expo SDK 58 prototype

A front-end-only React Native demo. It uses local mock data and sample imagery. No backend, database, authentication, authorisation, payments, subscriptions, or real messaging are included.

## Requirements

- Node.js compatible with Expo SDK 58
- npm
- Expo Go or an SDK 58-compatible development build

## Code formatting

The source is supplied with readable line breaks and formatting. Prettier is also included so you can consistently format the project in VS Code or from the terminal:

```bash
npm run format
```

To check formatting without changing files:

```bash
npm run format:check
```

## Install and run

From this project directory:

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo start
```

The `expo install --fix` command aligns Expo-related dependencies with the installed SDK. If Expo Go on your device does not support SDK 58, use a development build compatible with SDK 58.

## Demo interactions

- Discover: swipe cards left/right or use pass, super-like and interest buttons.
- Filters: toggle a small illustrative filter panel.
- Property details: tap the card or details link.
- Saved: see properties you've liked.
- Matches: sample seller-accepted interests.
- Messages: send messages locally in the current session; nothing is transmitted.
- Profile: sample verification state and referral-service entry points.
- Seller dashboard: preview sample listings and accept a sample interest.

All property listings and people are fictional demo content. Images are loaded from Unsplash and require an internet connection.
