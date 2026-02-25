import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS, STATUS_KENCLENG, STATUS_SETORAN } from '../config/constants';

// ==================== KENCLENG ====================

export const createKencleng = async ({ userId, nama, target }) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const data = {
    userId,
    nama,
    target: target || 500000,
    saldo: 0,
    status: STATUS_KENCLENG.AKTIF,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const ref = await addDoc(collection(db, COLLECTIONS.KENCLENG), data);
  return { id: ref.id, ...data };
};

export const getKenclengByUser = async (userId) => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.KENCLENG),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const getKenclengById = async (id) => {
  if (!db) return null;
  
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.KENCLENG, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const getAllKencleng = async () => {
  if (!db) return [];
  
  try {
    const q = query(collection(db, COLLECTIONS.KENCLENG), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return data.sort((a, b) => (b.saldo || 0) - (a.saldo || 0));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const updateKenclengStatus = async (id, status) => {
  if (!db) throw new Error('Firestore not initialized');
  await updateDoc(doc(db, COLLECTIONS.KENCLENG, id), {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeKencleng = (userId, callback) => {
  if (!db) return () => {};
  
  try {
    const q = query(
      collection(db, COLLECTIONS.KENCLENG),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(data);
    });
  } catch (error) {
    console.error('Error:', error);
    return () => {};
  }
};

// ==================== SETORAN ====================

export const createSetoran = async ({ kenclengId, userId, nominal, catatan, inputBy }) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const data = {
    kenclengId,
    userId,
    nominal,
    catatan: catatan || '',
    status: STATUS_SETORAN.PENDING,
    inputBy: inputBy || 'system',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const ref = await addDoc(collection(db, COLLECTIONS.SETORAN), data);
  return { id: ref.id, ...data };
};

export const approveSetoran = async (setoranId, kenclengId, nominal) => {
  if (!db) throw new Error('Firestore not initialized');
  
  await updateDoc(doc(db, COLLECTIONS.SETORAN, setoranId), {
    status: STATUS_SETORAN.DITERIMA,
    updatedAt: serverTimestamp(),
  });
  
  await updateDoc(doc(db, COLLECTIONS.KENCLENG, kenclengId), {
    saldo: increment(nominal),
    updatedAt: serverTimestamp(),
  });
};

export const rejectSetoran = async (setoranId, alasan) => {
  if (!db) throw new Error('Firestore not initialized');
  
  await updateDoc(doc(db, COLLECTIONS.SETORAN, setoranId), {
    status: STATUS_SETORAN.DITOLAK,
    alasanDitolak: alasan || '',
    updatedAt: serverTimestamp(),
  });
};

export const getRiwayatSetoran = async (kenclengId) => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.SETORAN),
      where('kenclengId', '==', kenclengId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const getPendingSetoran = async () => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.SETORAN),
      where('status', '==', STATUS_SETORAN.PENDING),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const subscribeSetoran = (kenclengId, callback) => {
  if (!db) return () => {};
  
  try {
    const q = query(
      collection(db, COLLECTIONS.SETORAN),
      where('kenclengId', '==', kenclengId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(data);
    });
  } catch (error) {
    console.error('Error:', error);
    return () => {};
  }
};

export const getLeaderboard = async () => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.KENCLENG),
      orderBy('saldo', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((k) => k.status !== STATUS_KENCLENG.NONAKTIF)
      .slice(0, 20);
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const getTotalSetoranHariIni = async () => {
  if (!db) return 0;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, COLLECTIONS.SETORAN),
      where('createdAt', '>=', today),
      where('createdAt', '<', tomorrow),
      where('status', '==', STATUS_SETORAN.DITERIMA)
    );
    
    const snap = await getDocs(q);
    return snap.docs.reduce((total, doc) => total + (doc.data().nominal || 0), 0);
  } catch (error) {
    console.error('Error:', error);
    return 0;
  }
};