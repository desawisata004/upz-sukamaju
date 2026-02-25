// src/services/auth.js
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Helper untuk cek Firebase siap
const isFirebaseReady = () => {
  const ready = !!(auth && db);
  if (!ready) {
    console.warn('Firebase belum siap:', { auth: !!auth, db: !!db });
  }
  return ready;
};

export const loginWithEmail = async (email, password) => {
  console.log('Mencoba login dengan email:', email);
  
  if (!isFirebaseReady()) {
    throw new Error('Firebase Auth tidak tersedia. Refresh halaman dan coba lagi.');
  }
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login berhasil:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Login error details:', error);
    
    // Terjemahkan error
    if (error.code === 'auth/user-not-found') {
      throw new Error('Email tidak terdaftar');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Password salah');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Format email tidak valid');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Terlalu banyak percobaan. Coba lagi nanti');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Koneksi internet bermasalah');
    } else if (error.code === 'auth/internal-error') {
      throw new Error('Error internal. Coba refresh halaman');
    } else {
      throw new Error(`Gagal login: ${error.message || 'Unknown error'}`);
    }
  }
};

export const logout = async () => {
  if (!isFirebaseReady()) return;
  try {
    await signOut(auth);
    console.log('Logout berhasil');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getUserData = async (uid) => {
  if (!isFirebaseReady()) return null;
  
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    } else {
      console.warn('User data tidak ditemukan untuk uid:', uid);
    }
  } catch (error) {
    console.error('Error getting user data:', error);
  }
  return null;
};

export const onAuthChange = (callback) => {
  if (!isFirebaseReady()) {
    console.warn('Auth listener tidak bisa dipasang karena Firebase belum siap');
    callback(null);
    return () => {};
  }
  
  try {
    return onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? user.email : 'null');
      callback(user);
    });
  } catch (error) {
    console.error('Error setting auth listener:', error);
    callback(null);
    return () => {};
  }
};