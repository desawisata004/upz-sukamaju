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

// ==================== ANALYTICS ====================

export const getSetoranByPeriod = async (bulan, tahun) => {
  if (!db) return [];
  try {
    const start = new Date(tahun, bulan - 1, 1);
    const end = new Date(tahun, bulan, 1);
    const q = query(
      collection(db, COLLECTIONS.SETORAN),
      where('createdAt', '>=', start),
      where('createdAt', '<', end),
      where('status', '==', STATUS_SETORAN.DITERIMA),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const getTrendBulanan = async (nBulan = 6) => {
  if (!db) return [];
  try {
    const now = new Date();
    const results = [];
    for (let i = nBulan - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const bulan = d.getMonth() + 1;
      const tahun = d.getFullYear();
      const start = new Date(tahun, bulan - 1, 1);
      const end = new Date(tahun, bulan, 1);
      const q = query(
        collection(db, COLLECTIONS.SETORAN),
        where('createdAt', '>=', start),
        where('createdAt', '<', end),
        where('status', '==', STATUS_SETORAN.DITERIMA)
      );
      const snap = await getDocs(q);
      const total = snap.docs.reduce((acc, doc) => acc + (doc.data().nominal || 0), 0);
      const count = snap.docs.length;
      results.push({
        bulan: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
        total,
        count,
        raw: d,
      });
    }
    return results;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const getSetoranStats = async () => {
  if (!db) return { hariIni: 0, mingguIni: 0, bulanIni: 0, pending: 0, totalDiterima: 0 };
  try {
    const now = new Date();
    const startHari = new Date(now); startHari.setHours(0,0,0,0);
    const startMinggu = new Date(now); startMinggu.setDate(now.getDate() - now.getDay()); startMinggu.setHours(0,0,0,0);
    const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);

    const [snapAll, snapPending] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.SETORAN), where('status', '==', STATUS_SETORAN.DITERIMA))),
      getDocs(query(collection(db, COLLECTIONS.SETORAN), where('status', '==', STATUS_SETORAN.PENDING)))
    ]);

    let hariIni = 0, mingguIni = 0, bulanIni = 0, totalDiterima = 0;
    snapAll.docs.forEach(doc => {
      const data = doc.data();
      const nominal = data.nominal || 0;
      totalDiterima += nominal;
      const ts = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      if (ts >= startHari) hariIni += nominal;
      if (ts >= startMinggu) mingguIni += nominal;
      if (ts >= startBulan) bulanIni += nominal;
    });

    return { hariIni, mingguIni, bulanIni, pending: snapPending.size, totalDiterima };
  } catch (error) {
    console.error('Error:', error);
    return { hariIni: 0, mingguIni: 0, bulanIni: 0, pending: 0, totalDiterima: 0 };
  }
};

export const getSetoranRecentAll = async (limitN = 30) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.SETORAN),
      orderBy('createdAt', 'desc'),
      limit(limitN)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const approveSetoranBatch = async (setoranList) => {
  if (!db) throw new Error('Firestore not initialized');
  const promises = setoranList.map(s => approveSetoran(s.id, s.kenclengId, s.nominal));
  await Promise.all(promises);
};

export const getKenclengWithStats = async () => {
  if (!db) return [];
  try {
    const [kenclengSnap, setoranSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.KENCLENG), orderBy('saldo', 'desc'))),
      getDocs(query(collection(db, COLLECTIONS.SETORAN), where('status', '==', STATUS_SETORAN.DITERIMA)))
    ]);

    const setoranByKencleng = {};
    setoranSnap.docs.forEach(doc => {
      const data = doc.data();
      if (!setoranByKencleng[data.kenclengId]) setoranByKencleng[data.kenclengId] = { count: 0, lastDate: null };
      setoranByKencleng[data.kenclengId].count++;
      const ts = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      if (!setoranByKencleng[data.kenclengId].lastDate || ts > setoranByKencleng[data.kenclengId].lastDate) {
        setoranByKencleng[data.kenclengId].lastDate = ts;
      }
    });

    return kenclengSnap.docs.map(d => {
      const k = { id: d.id, ...d.data() };
      const stats = setoranByKencleng[k.id] || { count: 0, lastDate: null };
      return { ...k, jumlahSetoran: stats.count, lastSetoran: stats.lastDate };
    });
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};