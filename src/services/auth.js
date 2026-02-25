// src/services/auth.js
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Helper untuk cek Firebase siap
const isFirebaseReady = () => {
  if (!auth || !db) {
    console.warn('Firebase belum diinisialisasi');
    return false;
  }
  return true;
};

export const loginWithEmail = async (email, password) => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase Auth tidak tersedia. Periksa koneksi dan konfigurasi.');
  }
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    
    // Terjemahkan error ke Bahasa Indonesia
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Email atau password salah');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Format email tidak valid');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Terlalu banyak percobaan. Coba lagi nanti');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Koneksi internet bermasalah');
    } else {
      throw new Error(`Gagal login: ${error.message}`);
    }
  }
};

export const logout = async () => {
  if (!isFirebaseReady()) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const registerWarga = async ({ email, password, nama, alamat, noHp }) => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase tidak tersedia');
  }
  
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: nama });

    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email,
      nama,
      alamat,
      noHp,
      role: 'warga',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return result.user;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const getUserData = async (uid) => {
  if (!isFirebaseReady()) return null;
  
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (error) {
    console.error('Error getting user data:', error);
  }
  return null;
};

export const onAuthChange = (callback) => {
  if (!isFirebaseReady()) {
    callback(null);
    return () => {};
  }
  
  try {
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('Error setting auth listener:', error);
    callback(null);
    return () => {};
  }
};