import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, sendSignInLinkToEmail } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { toast } from 'sonner';

let firebaseApp: FirebaseApp;
export let auth: Auth;
export let db: Firestore;
export let storage: FirebaseStorage;

export const actionCodeSettings = {
  url: import.meta.env.VITE_FIREBASE_SIGN_IN_REDIRECT_URL || `${window.location.origin}/finishSignIn`,
  handleCodeInApp: true,
  android: {
    packageName: "com.tasko.app",
    installApp: true,
    minimumVersion: "12"
  },
  ios: {
    bundleId: "com.tasko.app",
  },
};

export const initializeFirebaseClient = () => {
  if (typeof window === 'undefined') {
    console.warn("Attempted to initialize Firebase on server-side. Skipping.");
    return;
  }

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const requiredConfigKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'appId',
    'storageBucket',
    'messagingSenderId',
  ];
  const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

  if (missingKeys.length > 0) {
    const errorMessage = `Firebase initialization failed: Missing environment variables for: ${missingKeys.join(', ')}. Please check your .env file.`;
    console.error(errorMessage);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);

  enableIndexedDbPersistence(db)
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
};