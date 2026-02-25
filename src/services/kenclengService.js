// src/services/kenclengService.js
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

// ── Kencleng ──────────────────────────────────────────────────────────────────

export const createKencleng = async ({ userId, nama, target }) => {
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
  const q = query(
    collection(db, COLLECTIONS.KENCLENG),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getKenclengById = async (id) => {
  const snap = await getDoc(doc(db, COLLECTIONS.KENCLENG, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const getAllKencleng = async () => {
  const q = query(collection(db, COLLECTIONS.KENCLENG), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort by saldo client-side to avoid composite index requirement
  return data.sort((a, b) => (b.saldo || 0) - (a.saldo || 0));
};

export const updateKenclengStatus = async (id, status) => {
  await updateDoc(doc(db, COLLECTIONS.KENCLENG, id), {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeKencleng = (userId, callback) => {
  const q = query(
    collection(db, COLLECTIONS.KENCLENG),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

// ── Setoran ───────────────────────────────────────────────────────────────────

export const createSetoran = async ({ kenclengId, userId, nominal, catatan, inputBy }) => {
  const data = {
    kenclengId,
    userId,
    nominal,
    catatan: catatan || '',
    status: STATUS_SETORAN.PENDING,
    inputBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COLLECTIONS.SETORAN), data);
  return { id: ref.id, ...data };
};

export const approveSetoran = async (setoranId, kenclengId, nominal) => {
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
  await updateDoc(doc(db, COLLECTIONS.SETORAN, setoranId), {
    status: STATUS_SETORAN.DITOLAK,
    alasanDitolak: alasan || '',
    updatedAt: serverTimestamp(),
  });
};

export const getRiwayatSetoran = async (kenclengId) => {
  const q = query(
    collection(db, COLLECTIONS.SETORAN),
    where('kenclengId', '==', kenclengId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getPendingSetoran = async () => {
  const q = query(
    collection(db, COLLECTIONS.SETORAN),
    where('status', '==', STATUS_SETORAN.PENDING),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeSetoran = (kenclengId, callback) => {
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
};

export const getLeaderboard = async () => {
  // Simple query - filter nonaktif client-side to avoid requiring composite index
  const q = query(
    collection(db, COLLECTIONS.KENCLENG),
    orderBy('saldo', 'desc'),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((k) => k.status !== 'nonaktif')
    .slice(0, 20);
};
