import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tasko.application', // Make sure this matches your App ID
  appName: 'Tasko',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    FirebaseAuthentication: {
      // IMPORTANT: Replace 'YOUR_GOOGLE_WEB_CLIENT_ID_HERE' with your actual Google Web Client ID
      // You can find this in your Google Cloud Console under Credentials -> OAuth 2.0 Client IDs (Type: Web application)
      serverClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID_HERE',
      forceCodeForRefreshToken: true, // Recommended for server-side token exchange
    },
  },
};

export default config;