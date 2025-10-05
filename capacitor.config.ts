import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tasko.application', // Make sure this matches your App ID
  appName: 'Tasko',
  webDir: 'dist',
  plugins: {
    // FirebaseAuthentication plugin configuration removed as Firebase Auth is no longer used.
    // Supabase handles authentication directly.
  },
};

export default config;