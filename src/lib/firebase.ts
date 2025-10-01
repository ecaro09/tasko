import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { toast } from 'sonner'; // Import toast for error messages

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
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  const errorMessage = `Firebase initialization failed: Missing environment variables for: ${missingKeys.join(', ')}. Please check your .env file.`;
  console.error(errorMessage);
  toast.error(errorMessage);
  // Prevent further execution if critical config is missing
  throw new Error(errorMessage);
}

// Log the API key to check if it's being loaded
console.log("Firebase API Key:", firebaseConfig.apiKey ? "Loaded" : "Not Loaded", firebaseConfig.apiKey);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable Firestore offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("Firestore offline persistence enabled successfully!");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn("Firestore persistence failed: Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence.
      console.warn("Firestore persistence failed: The current browser does not support all of the features required to enable persistence.");
    } else {
      console.error("Firestore persistence failed for unknown reason:", err);
    }
  });