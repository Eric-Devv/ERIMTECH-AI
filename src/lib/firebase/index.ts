// src/lib/firebase/index.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
// import { getMessaging } from 'firebase/messaging'; // If using FCM

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Server-side check (runs at module load time on the server)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  if (!firebaseConfig.apiKey) {
    console.error(
      '[SERVER CHECK] Firebase API Key is missing. Please check your .env.local file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set. You MUST restart your development server after updating .env.local.'
    );
  } else if (firebaseConfig.apiKey === 'YOUR_API_KEY' || (firebaseConfig.apiKey && firebaseConfig.apiKey.includes('YOUR_API_KEY'))) {
     console.warn(
      '[SERVER CHECK] Firebase API Key appears to be a placeholder ("YOUR_API_KEY"). Please replace it with your actual Firebase API key in .env.local and restart your development server.'
    );
  }
}

// Client-side check (runs when this module is imported on the client)
// This won't run during SSR if the error happens there, but helps for client-side initialization issues.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (!firebaseConfig.apiKey) {
    console.error(
      '[CLIENT CHECK] Firebase API Key is missing. Please check your .env.local file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set. You may need to restart your development server after updating .env.local.'
    );
  } else if (firebaseConfig.apiKey === 'YOUR_API_KEY' || (firebaseConfig.apiKey && firebaseConfig.apiKey.includes('YOUR_API_KEY'))) {
     console.warn(
      '[CLIENT CHECK] Firebase API Key appears to be a placeholder ("YOUR_API_KEY"). Please replace it with your actual Firebase API key in .env.local and restart your development server.'
    );
  }
}


let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
// const messaging = getMessaging(app); // If using FCM

export { app, auth, db, storage /*, messaging */ };

