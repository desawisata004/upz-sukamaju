import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration - LANGSUNG DIISI (untuk test)
const firebaseConfig = {
  apiKey: "AIzaSyCKezmnqYrzPfO-MB2ur2x0aIdx8iYJWMM",
  authDomain: "upz-sukamaju.firebaseapp.com",
  projectId: "upz-sukamaju",
  storageBucket: "upz-sukamaju.firebasestorage.app",
  messagingSenderId: "511069915901",
  appId: "1:511069915901:web:c8ec6af8961a75dd878c94"
};

console.log('🔥 Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '✅ ADA' : '❌ TIDAK ADA'
});

// Validasi konfigurasi
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase: Missing required config fields:', missingFields.join(', '));
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
      initializationError = new Error('Firebase configuration is invalid');
      console.error('❌ Firebase validation failed');
    } else {
      console.log('🔥 Firebase config validated, initializing...');
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
      
      auth = getAuth(app);
      console.log('✅ Firebase auth initialized');
      
      db = getFirestore(app);
      console.log('✅ Firebase firestore initialized');
      
      console.log('🎉 Firebase fully initialized successfully');
    }
  } catch (error) {
    initializationError = error;
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.log('⏸️ Skipping Firebase init on server');
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