import { collection, getDocs, query, where } from 'firebase/firestore';
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