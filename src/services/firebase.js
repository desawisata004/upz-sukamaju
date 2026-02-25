// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration - hardcode dulu untuk testing
const firebaseConfig = {
  apiKey: "AIzaSyCKezmnqYrzPfO-MB2ur2x0aIdx8iYJWMM",
  authDomain: "upz-sukamaju.firebaseapp.com",
  projectId: "upz-sukamaju",
  storageBucket: "upz-sukamaju.firebasestorage.app",
  messagingSenderId: "511069915901",
  appId: "1:511069915901:web:c8ec6af8961a75dd878c94",
  measurementId: ""
};

// Inisialisasi Firebase
let app = null;
let auth = null;
let db = null;

// Inisialisasi hanya di browser
if (typeof window !== 'undefined') {
  try {
    console.log('Mencoba inisialisasi Firebase dengan config:', firebaseConfig);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.log('Running on server, skipping Firebase init');
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