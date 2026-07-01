# SITESCOP Mobile

Expo/React Native client application for iPhone, iPad, and Android.

## Current milestone

This first mobile build implements the approved demo workflow with native controls:

- Administrator and Inspector demo roles
- Dashboard and assigned jobs
- Job creation
- Building and Pest & Timber inspection sections
- Reusable checklist options
- Photo and camera action placeholders
- Delete confirmation
- Report preview
- Company and team settings

It intentionally uses local sample data. Authentication, cloud database, offline synchronization, real media capture, signatures, email, and PDF services are production milestones.

## Run with Expo Go

```bash
npm install
npx expo start
```

Install **Expo Go** on the iPhone or Android device and scan the QR code while both devices are on the same network.

## Create an Android APK

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

## Create an iPhone TestFlight build

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

The iOS bundle ID and Android package are both `au.com.sitescop.inspections`. Production publishing must use client-owned Expo, Apple Developer, and Google Play accounts.
