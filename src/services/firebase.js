import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Validasi environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    '❌ Firebase: Missing environment variables:',
    missingEnvVars.join(', ')
  );
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Cek apakah semua config ada
const hasValidConfig = Object.values(firebaseConfig).every(
  value => value && value !== ''
);

let app = null;
let auth = null;
let db = null;
let messaging = null;
let initializationError = null;

if (typeof window !== 'undefined') {
  if (!hasValidConfig) {
    initializationError = new Error('Firebase configuration is incomplete. Please check your environment variables.');
    console.error('❌ Firebase:', initializationError.message);
  } else {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      initializationError = error;
      console.error('❌ Firebase initialization error:', error);
    }
  }
}

export { auth, db, initializationError };

export const getMessagingInstance = async () => {
  if (typeof window === 'undefined') return null;
  if (!app) return null;
  
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    }
  } catch (error) {
    console.error('❌ Firebase messaging not supported:', error);
  }
  return null;
};

export const isFirebaseReady = () => {
  return !initializationError && app && auth && db;
};

export default app;