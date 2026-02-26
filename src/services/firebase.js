import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validasi konfigurasi
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase: Missing required config fields:', missingFields.join(', '));
    return false;
  }
  
  // Cek format apiKey (biasanya panjang)
  if (firebaseConfig.apiKey.length < 20) {
    console.error('❌ Firebase: API Key seems invalid');
    return false;
  }
  
  return true;
};

// Inisialisasi Firebase
let app = null;
let auth = null;
let db = null;
let messaging = null;
let initializationError = null;

// Hanya inisialisasi di browser
if (typeof window !== 'undefined') {
  try {
    if (!validateConfig()) {
      initializationError = new Error('Firebase configuration is invalid. Please check your environment variables.');
    } else {
      console.log('🔥 Firebase config validated, initializing...');
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    initializationError = error;
    console.error('❌ Firebase initialization error:', error);
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