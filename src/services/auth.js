// src/services/auth.js
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const loginWithEmail = async (email, password) => {
  if (!auth) throw new Error('Firebase Auth tidak tersedia');
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    
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
    } else {
      throw new Error(`Gagal login: ${error.message}`);
    }
  }
};

export const logout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getUserData = async (uid) => {
  if (!db) return null;
  
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
  if (!auth) {
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