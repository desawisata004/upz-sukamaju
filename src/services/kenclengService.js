// Tambahkan di bagian atas setelah imports
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

// UPDATE fungsi createSetoran
export const createSetoran = async ({ kenclengId, userId, nominal, catatan, inputBy }) => {
  if (!db) throw new Error('Firestore not initialized');
  
  // Validasi nominal
  const validatedNominal = validateSetoranNominal(nominal);
  
  const data = {
    kenclengId,
    userId,
    nominal: validatedNominal,
    catatan: catatan || '',
    status: STATUS_SETORAN.PENDING,
    inputBy: inputBy || 'system',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const ref = await addDoc(collection(db, COLLECTIONS.SETORAN), data);
  return { id: ref.id, ...data };
};

// UPDATE fungsi approveSetoran dengan batch
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
  const kenclengRef = doc(db, COLLECTIONS.KENCLENG, kenclengId);
  batch.update(kenclengRef, {
    saldo: increment(nominal),
    updatedAt: serverTimestamp(),
  });
  
  await batch.commit();
};

// UPDATE fungsi approveSetoranBatch
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
    
    const kenclengRef = doc(db, COLLECTIONS.KENCLENG, s.kenclengId);
    batch.update(kenclengRef, {
      saldo: increment(s.nominal),
      updatedAt: serverTimestamp(),
    });
  }
  
  await batch.commit();
};

// UPDATE fungsi approvePenarikan dengan batch
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

  const kenclengRef = doc(db, COLLECTIONS.KENCLENG, kenclengId);
  batch.update(kenclengRef, {
    saldo: increment(-nominal),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

// Tambahkan fungsi deleteKencleng (soft delete)
export const deleteKencleng = async (id) => {
  if (!db) throw new Error('Firestore not initialized');
  
  // Cek apakah ada setoran terkait
  const setoranQuery = query(
    collection(db, COLLECTIONS.SETORAN),
    where('kenclengId', '==', id),
    limit(1)
  );
  const setoranSnap = await getDocs(setoranQuery);
  
  if (!setoranSnap.empty) {
    throw new Error('Tidak dapat menghapus kencleng yang sudah memiliki riwayat setoran');
  }
  
  // Soft delete - update status menjadi nonaktif
  await updateDoc(doc(db, COLLECTIONS.KENCLENG, id), {
    status: STATUS_KENCLENG.NONAKTIF,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};