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
    
    console.log('Attempting login with email:', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful for:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Login error details:', error.code, error.message);
    
    // Handle specific error codes
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('Email tidak terdaftar');
      case 'auth/wrong-password':
        throw new Error('Password salah');
      case 'auth/invalid-email':
        throw new Error('Format email tidak valid');
      case 'auth/too-many-requests':
        throw new Error('Terlalu banyak percobaan. Coba lagi nanti');
      case 'auth/network-request-failed':
        throw new Error('Koneksi internet bermasalah');
      case 'auth/invalid-credential':
        throw new Error('Email atau password salah');
      case 'auth/configuration-not-found':
        throw new Error('Konfigurasi Firebase salah. Hubungi admin.');
      default:
        throw new Error(`Gagal login: ${error.message}`);
    }
  }
};

export const logout = async () => {
  try {
    if (!auth) return;
    await signOut(auth);
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getUserData = async (uid) => {
  try {
    if (!db) return null;
    
    console.log('Fetching user data for uid:', uid);
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      console.log('User data found');
      return { uid: snap.id, ...snap.data() };
    } else {
      console.log('No user data found for uid:', uid);
      return null;
    }
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
    console.log('Setting up auth state listener');
    return onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User ${user.email} logged in` : 'No user');
      callback(user);
    });
  } catch (error) {
    console.error('Error setting auth listener:', error);
    callback(null);
    return () => {};
  }
};

export const registerUser = async ({ email, password, nama, noHp, alamat, role = 'warga' }) => {
  try {
    checkFirebase();
    
    console.log('Registering new user with email:', email);
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

    console.log('Saving user data to Firestore for uid:', uid);
    await setDoc(doc(db, 'users', uid), userData);
    console.log('User registered successfully');
    
    return result.user;
  } catch (error) {
    console.error('Register error:', error.code, error.message);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('Email sudah terdaftar');
      case 'auth/weak-password':
        throw new Error('Password minimal 6 karakter');
      case 'auth/invalid-email':
        throw new Error('Format email tidak valid');
      case 'auth/network-request-failed':
        throw new Error('Koneksi internet bermasalah');
      default:
        throw new Error('Gagal mendaftar: ' + error.message);
    }
  }
};

export const updateUserProfile = async (uid, { nama, noHp, alamat }) => {
  try {
    checkFirebase();
    
    console.log('Updating user profile for uid:', uid);
    await updateDoc(doc(db, 'users', uid), {
      nama: nama.trim(),
      noHp: noHp || '',
      alamat: alamat || '',
      updatedAt: serverTimestamp(),
    });
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error('Gagal update profil: ' + error.message);
  }
};