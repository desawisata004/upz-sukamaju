// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Fallback values untuk mencegah error saat build
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'dummy-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'dummy-auth-domain',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'dummy-project-id',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'dummy-storage-bucket',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'dummy-sender-id',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'dummy-app-id',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'dummy-measurement-id',
};

// Inisialisasi Firebase hanya jika di browser dan memiliki konfigurasi valid
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback untuk SSR/build time
  app = null;
  auth = null;
  db = null;
}

export { auth, db };

export const getMessagingInstance = async () => {
  if (typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (supported && app) {
      return getMessaging(app);
    }
  } catch (error) {
    console.error('Messaging not supported:', error);
  }
  return null;
};

export default app;