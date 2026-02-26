import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../config/constants';

export const getAllUsers = async () => {
  if (!db) return [];
  
  try {
    const q = query(collection(db, COLLECTIONS.USERS));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const getWargaUsers = async () => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', 'warga')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Error getting warga:', error);
    return [];
  }
};

export const getPengurusUsers = async () => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', 'in', ['rt', 'admin'])
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Error getting pengurus:', error);
    return [];
  }
};

export const updateUser = async (uid, data) => {
  if (!db) throw new Error('Firestore not initialized');
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteUser = async (uid) => {
  if (!db) throw new Error('Firestore not initialized');
  await deleteDoc(doc(db, COLLECTIONS.USERS, uid));
};

export const getUserById = async (uid) => {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};