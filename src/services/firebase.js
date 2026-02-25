// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration dari environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Validasi konfigurasi
const isConfigValid = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'dummy-api-key' &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

// Inisialisasi Firebase hanya jika di browser dan memiliki konfigurasi valid
let app;
let auth;
let db;

try {
  if (typeof window !== 'undefined' && isConfigValid()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase config missing or invalid, running in mock mode');
    app = null;
    auth = null;
    db = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
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