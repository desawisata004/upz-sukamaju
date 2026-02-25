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
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    console.error('Firebase config missing:', missing.join(', '));
    return false;
  }
  return true;
};

// Inisialisasi Firebase
let app = null;
let auth = null;
let db = null;

// Inisialisasi hanya di browser
if (typeof window !== 'undefined') {
  try {
    if (validateConfig()) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('✅ Firebase initialized successfully');
    } else {
      console.error('❌ Firebase config tidak lengkap');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
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