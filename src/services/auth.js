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
import { COLLECTIONS, ROLES } from '../config/constants';

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const registerWarga = async ({ email, password, nama, alamat, noHp }) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: nama });

  await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
    uid: result.user.uid,
    email,
    nama,
    alamat,
    noHp,
    role: ROLES.WARGA,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return result.user;
};

export const getUserData = async (uid) => {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
