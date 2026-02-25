// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCKezmnqYrzPfO-MB2ur2x0aIdx8iYJWMM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "upz-sukamaju.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "upz-sukamaju",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "upz-sukamaju.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "511069915901",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:511069915901:web:c8ec6af8961a75dd878c94",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ""
};

// Inisialisasi Firebase
let app = null;
let auth = null;
let db = null;

if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized');
  } catch (error) {
    console.error('❌ Firebase init error:', error);
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