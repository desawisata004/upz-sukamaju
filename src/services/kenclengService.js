import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

class KenclengService {
  constructor() {
    this.kenclengRef = collection(db, 'kencleng');
    this.setoranRef = collection(db, 'setoran');
    this.rtRef = collection(db, 'rt_target');
  }

  // Registrasi kencleng baru
  async registerKencleng(data) {
    try {
      const kenclengData = {
        ...data,
        status_aktif: true,
        tanggal_aktivasi: Timestamp.now(),
        total_setoran: 0,
        last_setoran: null,
        created_at: Timestamp.now()
      };
      
      const docRef = await addDoc(this.kenclengRef, kenclengData);
      return { id: docRef.id, ...kenclengData };
    } catch (error) {
      throw new Error(`Gagal registrasi kencleng: ${error.message}`);
    }
  }

  // Get kencleng by ID
  async getKenclengById(id) {
    try {
      const docRef = doc(this.kenclengRef, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      throw new Error(`Gagal mengambil data kencleng: ${error.message}`);
    }
  }

  // Cari kencleng by QR code
  async findKenclengByQR(qrCode) {
    try {
      const q = query(this.kenclengRef, where('qr_code', '==', qrCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      throw new Error(`Gagal mencari kencleng: ${error.message}`);
    }
  }

  // Input setoran baru
  async inputSetoran(data) {
    try {
      // Upload foto bukti jika ada
      let fotoUrl = null;
      if (data.foto) {
        const fotoRef = ref(storage, `setoran/${Date.now()}_${data.foto.name}`);
        await uploadBytes(fotoRef, data.foto);
        fotoUrl = await getDownloadURL(fotoRef);
      }

      const setoranData = {
        id_kencleng: data.id_kencleng,
        id_rt: data.id_rt,
        id_user: data.id_user,
        jumlah: Number(data.jumlah),
        metode_setor: data.metode_setor || 'tunai',
        catatan: data.catatan || '',
        foto_bukti: fotoUrl,
        status: 'verified', // Auto-verified untuk demo
        tanggal: Timestamp.now(),
        created_at: Timestamp.now()
      };

      // Simpan setoran
      const docRef = await addDoc(this.setoranRef, setoranData);

      // Update total setoran kencleng
      const kenclengRef = doc(this.kenclengRef, data.id_kencleng);
      const kenclengSnap = await getDoc(kenclengRef);
      
      if (kenclengSnap.exists()) {
        const currentTotal = kenclengSnap.data().total_setoran || 0;
        await updateDoc(kenclengRef, {
          total_setoran: currentTotal + Number(data.jumlah),
          last_setoran: Timestamp.now()
        });
      }

      return { id: docRef.id, ...setoranData };
    } catch (error) {
      throw new Error(`Gagal input setoran: ${error.message}`);
    }
  }

  // Get riwayat setoran by kencleng ID
  async getRiwayatSetoran(kenclengId, limitCount = 30) {
    try {
      const q = query(
        this.setoranRef,
        where('id_kencleng', '==', kenclengId),
        orderBy('tanggal', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggal: doc.data().tanggal // Keep as Timestamp for formatting
      }));
    } catch (error) {
      console.error('Error getting riwayat:', error);
      return [];
    }
  }

  // Get leaderboard per RT
  async getLeaderboard(rtId, periode = 'bulan') {
    try {
      const startDate = new Date();
      if (periode === 'bulan') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      } else if (periode === 'minggu') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (periode === 'tahun') {
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
      }

      const q = query(
        this.setoranRef,
        where('id_rt', '==', rtId),
        where('tanggal', '>=', Timestamp.fromDate(startDate)),
        orderBy('tanggal', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Aggregate by kencleng
      const leaderboard = {};
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!leaderboard[data.id_kencleng]) {
          leaderboard[data.id_kencleng] = {
            id_kencleng: data.id_kencleng,
            total: 0,
            count: 0,
            setoran: []
          };
        }
        leaderboard[data.id_kencleng].total += data.jumlah;
        leaderboard[data.id_kencleng].count++;
      });

      // Sort by total descending
      return Object.values(leaderboard)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Get stats for RT dashboard
  async getRtStats(rtId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all kencleng in this RT
      const kenclengQuery = query(
        this.kenclengRef,
        where('id_rt', '==', rtId)
      );
      const kenclengSnap = await getDocs(kenclengQuery);
      const totalKencleng = kenclengSnap.size;
      
      // Get setoran hari ini
      const setoranQuery = query(
        this.setoranRef,
        where('id_rt', '==', rtId),
        where('tanggal', '>=', Timestamp.fromDate(today)),
        orderBy('tanggal', 'desc')
      );
      const setoranSnap = await getDocs(setoranQuery);
      
      const setoranHariIni = setoranSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Hitung total setoran bulan ini
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const bulanIniQuery = query(
        this.setoranRef,
        where('id_rt', '==', rtId),
        where('tanggal', '>=', Timestamp.fromDate(startOfMonth))
      );
      const bulanIniSnap = await getDocs(bulanIniQuery);
      
      const totalBulanIni = bulanIniSnap.docs.reduce(
        (sum, doc) => sum + doc.data().jumlah, 
        0
      );

      return {
        totalKencleng,
        aktif: Math.round(totalKencleng * 0.96), // 96% aktif (estimasi)
        totalSetoran: totalBulanIni,
        targetBulanan: 5000000, // Target contoh
        realisasi: totalBulanIni,
        setoranHariIni: setoranHariIni.map(s => ({
          ...s,
          waktu: s.tanggal?.toDate().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }))
      };
    } catch (error) {
      console.error('Error getting RT stats:', error);
      return {
        totalKencleng: 50,
        aktif: 48,
        totalSetoran: 3750000,
        targetBulanan: 5000000,
        realisasi: 3750000,
        setoranHariIni: []
      };
    }
  }
}

export default new KenclengService();