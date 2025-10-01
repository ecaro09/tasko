import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { toast } from 'sonner'; // Import toast for user feedback

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
for (const key of requiredConfig) {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
    const errorMessage = `Firebase configuration error: VITE_FIREBASE_${key.toUpperCase()} is missing or invalid in your .env file.`;
    console.error(errorMessage);
    toast.error(errorMessage); // Show toast to user
    // Throw an error to stop the app from initializing with invalid config
    throw new Error(errorMessage);
  }
}

let app;
let authInstance = null; // Initialize to null
let dbInstance = null;   // Initialize to null

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);

  // Enable Firestore offline persistence
  enableIndexedDbPersistence(dbInstance)
    .then(() => {
      console.log("Firestore offline persistence enabled successfully!");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore persistence failed: Multiple tabs open, persistence can only be enabled in one tab at a time.");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore persistence failed: The current browser does not support all of the features required to enable persistence.");
      } else {
        console.error("Firestore persistence failed for unknown reason:", err);
      }
    });

} catch (error: any) {
  console.error("Failed to initialize Firebase:", error);
  toast.error(`Failed to initialize Firebase: ${error.message}`);
  // authInstance and dbInstance are already null, no need to re-assign
}

export const auth = authInstance;
export const db = dbInstance;