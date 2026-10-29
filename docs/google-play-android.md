# SecurePlus Android app / Google Play guide

This project includes an Android app scaffold powered by Capacitor. It is not a signed or published Play Store release.

The Android app is a native shell around the existing React/Vite SecurePlus site. You still edit the main app in `src/App.jsx` and related web files. After changes, sync the web build into Android.

## App identity

- App name: `SecurePlus`
- Android package name: `com.secureplusprep.app`
- Web build folder: `dist`
- Native Android project folder: `android/`

Important: the Android package name is permanent on Google Play. If you change it later, Google treats it like a different app.

## Local commands

Install dependencies:

```bash
npm install
```

Build the website and copy it into Android:

```bash
npm run android:sync
```

Build a debug APK for testing:

```bash
npm run android:debug
```

Open the app in Android Studio:

```bash
npm run android:open
```

Create a release Android App Bundle:

```bash
npm run android:release
```

The release bundle output is usually:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Google Play normally wants an `.aab`, not an `.apk`.

## Required before real Play Store upload

1. Add production Vite environment variables before running `npm run android:sync`.

   The Android app embeds the Vite build. If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing during build time, the installed app will not have live Supabase auth/data access.

2. Configure Google sign-in redirects.

   Supabase Google OAuth that works on the website may need extra redirect/deep-link setup for the Android WebView. Test email login and Google login on a real Android device before submitting.

3. Sign the release app.

   Google Play requires a signed release. Use Android Studio's `Build > Generate Signed Bundle / APK` flow for the first upload, then keep the keystore safe.

4. Prepare store listing assets.

   You will need:

   - App icon
   - Feature graphic
   - Phone screenshots
   - Short description
   - Full description
   - Privacy Policy URL
   - Data safety answers

5. Test account deletion.

   Because the app has user accounts, Google Play may check whether users can request deletion from inside the app and from the web.

## Suggested Play Store positioning

Short description:

```text
Original Security+ MCQ and PBQ practice with Smart Review. Not exam dumps.
```

Opening description:

```text
SecurePlus helps CompTIA Security+ learners practise with original, scenario-based MCQs and PBQs that explain the underlying concepts. Use Smart Review, Daily Challenge, Concept Deep Dives, and report cards to understand what to study next.
```

Trust line to repeat:

```text
Original scenario-based practice. Not exam dumps.
```
