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
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  COLLECTIONS, 
  STATUS_KENCLENG, 
  STATUS_SETORAN,
  MIN_SETORAN,
  MAX_SETORAN 
} from '../config/constants';

// ==================== VALIDASI ====================
export const validateSetoranNominal = (nominal) => {
  const num = Number(nominal);
  if (isNaN(num) || num <= 0) {
    throw new Error('Nominal harus lebih dari 0');
  }
  if (num < MIN_SETORAN) {
    throw new Error(`Nominal minimal Rp ${MIN_SETORAN.toLocaleString('id-ID')}`);
  }
  if (num > MAX_SETORAN) {
    throw new Error(`Nominal maksimal Rp ${MAX_SETORAN.toLocaleString('id-ID')}`);
  }
  return num;
};

// ==================== KENCLENG ====================

export const createKencleng = async ({ id, userId, nama, alamat, rt, rw, target }) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const data = {
    id: id || `KCLG-${rt.padStart(2, '0')}${(rw || '00').padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    userId,
    nama,
    alamat: alamat || '',
    rt,
    rw: rw || '',
    target: target || 500000,
    saldo: 0,
    status: STATUS_KENCLENG.AKTIF,
    setoranBulanIni: 0,
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
    // Coba cari berdasarkan field 'id' dulu
    const q = query(
      collection(db, COLLECTIONS.KENCLENG),
      where('id', '==', id),
      limit(1)
    );
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    
    // Fallback ke document ID
    const docRef = doc(db, COLLECTIONS.KENCLENG, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    
    return null;
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

export const getAllRT = async () => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', 'rt')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Error getting RT:', error);
    return [];
  }
};

export const updateKenclengStatus = async (id, status) => {
  if (!db) throw new Error('Firestore not initialized');
  
  // Cari document berdasarkan field 'id'
  const q = query(
    collection(db, COLLECTIONS.KENCLENG),
    where('id', '==', id),
    limit(1)
  );
  const snap = await getDocs(q);
  
  if (snap.empty) {
    // Fallback ke document ID
    await updateDoc(doc(db, COLLECTIONS.KENCLENG, id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(doc(db, COLLECTIONS.KENCLENG, snap.docs[0].id), {
      status,
      updatedAt: serverTimestamp(),
    });
  }
};

export const deleteKencleng = async (id) => {
  if (!db) throw new Error('Firestore not initialized');
  
  // Cari document berdasarkan field 'id'
  const q = query(
    collection(db, COLLECTIONS.KENCLENG),
    where('id', '==', id),
    limit(1)
  );
  const snap = await getDocs(q);
  
  if (snap.empty) {
    throw new Error('Kencleng tidak ditemukan');
  }
  
  const docId = snap.docs[0].id;
  
  // Cek apakah ada setoran terkait
  const setoranQuery = query(
    collection(db, COLLECTIONS.SETORAN),
    where('kenclengId', '==', id),
    limit(1)
  );
  const setoranSnap = await getDocs(setoranQuery);
  
  if (!setoranSnap.empty) {
    // Soft delete - update status menjadi nonaktif
    await updateDoc(doc(db, COLLECTIONS.KENCLENG, docId), {
      status: STATUS_KENCLENG.NONAKTIF,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Hard delete jika tidak ada riwayat
    await deleteDoc(doc(db, COLLECTIONS.KENCLENG, docId));
  }
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
    }, (error) => {
      console.error('Snapshot error:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error:', error);
    return () => {};
  }
};

// ==================== SETORAN ====================

export const createSetoran = async ({ kenclengId, userId, nominal, metode, catatan, inputBy, foto }) => {
  if (!db) throw new Error('Firestore not initialized');
  
  // Validasi nominal
  const validatedNominal = validateSetoranNominal(nominal);
  
  const data = {
    kenclengId,
    userId,
    nominal: validatedNominal,
    metode: metode || 'tunai',
    catatan: catatan || '',
    foto: foto || null,
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
  
  const batch = writeBatch(db);
  
  // Update setoran status
  const setoranRef = doc(db, COLLECTIONS.SETORAN, setoranId);
  batch.update(setoranRef, {
    status: STATUS_SETORAN.DITERIMA,
    updatedAt: serverTimestamp(),
  });
  
  // Update saldo kencleng
  // Cari kencleng berdasarkan field 'id'
  const kenclengQuery = query(
    collection(db, COLLECTIONS.KENCLENG),
    where('id', '==', kenclengId),
    limit(1)
  );
  const kenclengSnap = await getDocs(kenclengQuery);
  
  if (!kenclengSnap.empty) {
    const kenclengRef = doc(db, COLLECTIONS.KENCLENG, kenclengSnap.docs[0].id);
    batch.update(kenclengRef, {
      saldo: increment(nominal),
      setoranBulanIni: increment(nominal),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Fallback ke document ID
    const kenclengRef = doc(db, COLLECTIONS.KENCLENG, kenclengId);
    batch.update(kenclengRef, {
      saldo: increment(nominal),
      setoranBulanIni: increment(nominal),
      updatedAt: serverTimestamp(),
    });
  }
  
  await batch.commit();
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
    
    // Enrich dengan data warga dan RT
    const setoranList = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      const kencleng = await getKenclengById(data.kenclengId);
      setoranList.push({
        id: doc.id,
        ...data,
        namaWarga: kencleng?.nama || '-',
        rt: kencleng?.rt || '-',
      });
    }
    
    return setoranList;
  } catch (error) {
    console.error('Error:', error);
    return [];
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
  if (!setoranList.length) return;
  
  const batch = writeBatch(db);
  
  for (const s of setoranList) {
    const setoranRef = doc(db, COLLECTIONS.SETORAN, s.id);
    batch.update(setoranRef, {
      status: STATUS_SETORAN.DITERIMA,
      updatedAt: serverTimestamp(),
    });
    
    // Update saldo kencleng
    const kenclengQuery = query(
      collection(db, COLLECTIONS.KENCLENG),
      where('id', '==', s.kenclengId),
      limit(1)
    );
    const kenclengSnap = await getDocs(kenclengQuery);
    
    if (!kenclengSnap.empty) {
      const kenclengRef = doc(db, COLLECTIONS.KENCLENG, kenclengSnap.docs[0].id);
      batch.update(kenclengRef, {
        saldo: increment(s.nominal),
        setoranBulanIni: increment(s.nominal),
        updatedAt: serverTimestamp(),
      });
    }
  }
  
  await batch.commit();
};

// ==================== PENARIKAN ====================

export const createPenarikan = async ({ kenclengId, userId, nominal, jenis, catatan, requestBy }) => {
  if (!db) throw new Error('Firestore not initialized');

  // Validasi saldo cukup
  const kencleng = await getKenclengById(kenclengId);
  if (!kencleng) throw new Error('Kencleng tidak ditemukan.');
  
  const numNominal = Number(nominal);
  if (isNaN(numNominal) || numNominal <= 0) {
    throw new Error('Nominal harus lebih dari 0');
  }
  
  if ((kencleng.saldo || 0) < numNominal) {
    throw new Error(`Saldo tidak cukup. Saldo saat ini: Rp ${(kencleng.saldo || 0).toLocaleString('id-ID')}`);
  }

  const data = {
    kenclengId,
    userId,
    nominal: numNominal,
    jenis: jenis || 'sebagian',
    catatan: catatan || '',
    status: 'pending',
    requestBy: requestBy || 'warga',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, COLLECTIONS.PENARIKAN), data);
  return { id: ref.id, ...data };
};

export const approvePenarikan = async (penarikanId, kenclengId, nominal) => {
  if (!db) throw new Error('Firestore not initialized');

  // Cek saldo sekali lagi sebelum approve
  const kencleng = await getKenclengById(kenclengId);
  if (!kencleng) throw new Error('Kencleng tidak ditemukan.');
  if ((kencleng.saldo || 0) < nominal) {
    throw new Error('Saldo tidak mencukupi untuk penarikan ini.');
  }

  const batch = writeBatch(db);
  
  const penarikanRef = doc(db, COLLECTIONS.PENARIKAN, penarikanId);
  batch.update(penarikanRef, {
    status: 'disetujui',
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update saldo kencleng
  const kenclengQuery = query(
    collection(db, COLLECTIONS.KENCLENG),
    where('id', '==', kenclengId),
    limit(1)
  );
  const kenclengSnap = await getDocs(kenclengQuery);
  
  if (!kenclengSnap.empty) {
    const kenclengRef = doc(db, COLLECTIONS.KENCLENG, kenclengSnap.docs[0].id);
    batch.update(kenclengRef, {
      saldo: increment(-nominal),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Fallback ke document ID
    const kenclengRef = doc(db, COLLECTIONS.KENCLENG, kenclengId);
    batch.update(kenclengRef, {
      saldo: increment(-nominal),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
};

export const rejectPenarikan = async (penarikanId, alasan) => {
  if (!db) throw new Error('Firestore not initialized');

  await updateDoc(doc(db, COLLECTIONS.PENARIKAN, penarikanId), {
    status: 'ditolak',
    alasanDitolak: alasan || '',
    updatedAt: serverTimestamp(),
  });
};

export const getPendingPenarikan = async () => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.PENARIKAN),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const getAllPenarikan = async (limitN = 50) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.PENARIKAN),
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

export const getPenarikanStats = async () => {
  if (!db) return { pending: 0, disetujui: 0, totalDicairkan: 0 };
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.PENARIKAN));
    let pending = 0, disetujui = 0, totalDicairkan = 0;
    snap.docs.forEach(doc => {
      const d = doc.data();
      if (d.status === 'pending') pending++;
      if (d.status === 'disetujui') { 
        disetujui++; 
        totalDicairkan += d.nominal || 0; 
      }
    });
    return { pending, disetujui, totalDicairkan };
  } catch (error) {
    console.error('Error:', error);
    return { pending: 0, disetujui: 0, totalDicairkan: 0 };
  }
};

// ==================== ANALYTICS ====================

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
    const startMinggu = new Date(now); 
    startMinggu.setDate(now.getDate() - now.getDay()); 
    startMinggu.setHours(0,0,0,0);
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

    return { 
      hariIni, 
      mingguIni, 
      bulanIni, 
      pending: snapPending.size, 
      totalDiterima 
    };
  } catch (error) {
    console.error('Error:', error);
    return { hariIni: 0, mingguIni: 0, bulanIni: 0, pending: 0, totalDiterima: 0 };
  }
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
      if (!setoranByKencleng[data.kenclengId]) {
        setoranByKencleng[data.kenclengId] = { count: 0, lastDate: null };
      }
      setoranByKencleng[data.kenclengId].count++;
      const ts = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      if (!setoranByKencleng[data.kenclengId].lastDate || ts > setoranByKencleng[data.kenclengId].lastDate) {
        setoranByKencleng[data.kenclengId].lastDate = ts;
      }
    });

    return kenclengSnap.docs.map(d => {
      const k = { id: d.id, ...d.data() };
      const stats = setoranByKencleng[k.id] || { count: 0, lastDate: null };
      return { 
        ...k, 
        jumlahSetoran: stats.count, 
        lastSetoran: stats.lastDate 
      };
    });
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// ==================== LEADERBOARD ====================

export const getLeaderboard = async () => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.KENCLENG),
      where('status', '==', STATUS_KENCLENG.AKTIF),
      orderBy('saldo', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    
    // Enrich dengan data user
    const leaderboard = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      const userQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('uid', '==', data.userId),
        limit(1)
      );
      const userSnap = await getDocs(userQuery);
      const userData = userSnap.empty ? { nama: 'Unknown' } : userSnap.docs[0].data();
      
      leaderboard.push({
        id: doc.id,
        ...data,
        nama: userData.nama || data.nama || 'Unknown',
      });
    }
    
    return leaderboard.slice(0, 20);
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};