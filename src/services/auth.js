import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, isFirebaseReady, initializationError } from './firebase';

// Helper untuk cek Firebase
const checkFirebase = () => {
  if (!isFirebaseReady()) {
    console.error('Firebase not ready:', initializationError);
    throw new Error('Firebase tidak tersedia. Periksa koneksi internet dan konfigurasi.');
  }
  return true;
};

export const loginWithEmail = async (email, password) => {
  try {
    checkFirebase();
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error codes
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
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Email atau password salah');
    } else {
      throw new Error(`Gagal login: ${error.message}`);
    }
  }
};

export const logout = async () => {
  try {
    if (!auth) return;
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getUserData = async (uid) => {
  try {
    if (!db) return null;
    
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { uid: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const onAuthChange = (callback) => {
  if (!auth) {
    console.warn('Auth not initialized, sending null user');
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

export const registerUser = async ({ email, password, nama, noHp, alamat, role = 'warga' }) => {
  try {
    checkFirebase();
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;

    const userData = {
      uid,
      nama: nama.trim(),
      email: email.toLowerCase().trim(),
      noHp: noHp || '',
      alamat: alamat || '',
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', uid), userData);
    
    return result.user;
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email sudah terdaftar');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password minimal 6 karakter');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Format email tidak valid');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Koneksi internet bermasalah');
    } else {
      throw new Error('Gagal mendaftar: ' + error.message);
    }
  }
};

export const updateUserProfile = async (uid, { nama, noHp, alamat }) => {
  try {
    checkFirebase();
    
    await updateDoc(doc(db, 'users', uid), {
      nama: nama.trim(),
      noHp: noHp || '',
      alamat: alamat || '',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error('Gagal update profil: ' + error.message);
  }
};