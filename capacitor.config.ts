import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tasko.application', // Make sure this matches your App ID
  appName: 'Tasko',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      // IMPORTANT: Replace 'YOUR_GOOGLE_WEB_CLIENT_ID_HERE' with your actual Google Web Client ID.
      // You can find this in your Google Cloud Console under Credentials -> OAuth 2.0 Client IDs (Type: Web application).
      // This is crucial for Google Sign-In to work on mobile platforms.
      serverClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID_HERE', // <--- REPLACE THIS WITH YOUR ACTUAL GOOGLE WEB CLIENT ID
      forceCodeForRefreshToken: true, // Recommended for server-side token exchange
    } as any, // Added 'as any' to bypass TypeScript error
  },
};

export default config;