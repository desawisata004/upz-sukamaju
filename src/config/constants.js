export const APP_NAME = process.env.REACT_APP_NAME || 'Kencleng Digital';
export const DESA_NAME = process.env.REACT_APP_DESA_NAME || 'Desa Sukamaju';
export const KECAMATAN_NAME = process.env.REACT_APP_KECAMATAN_NAME || 'Kecamatan Sukajaya';
export const KABUPATEN_NAME = process.env.REACT_APP_KABUPATEN_NAME || 'Kabupaten Sukabumi';

// Tambahkan RT_NAME
export const RT_NAME = process.env.REACT_APP_RT_NAME || 'RT 01 / RW 02';

export const ROLES = {
  WARGA: 'warga',
  RT: 'rt',
  ADMIN: 'admin', // Untuk backward compatibility
  ADMIN_DESA: 'admin_desa', // Admin Desa/UPZ
};

export const STATUS_KENCLENG = {
  AKTIF: 'aktif',
  NONAKTIF: 'nonaktif',
};

export const STATUS_SETORAN = {
  PENDING: 'pending',
  DITERIMA: 'diterima',
  DITOLAK: 'ditolak',
};

export const STATUS_PENARIKAN = {
  PENDING: 'pending',
  DISETUJUI: 'disetujui',
  DITOLAK: 'ditolak',
  SELESAI: 'selesai',
};

export const JENIS_PENARIKAN = {
  SEBAGIAN: 'sebagian',
  PENUH: 'penuh',
};

export const METODE_SETORAN = {
  TUNAI: 'tunai',
  TRANSFER: 'transfer',
  QRIS: 'qris',
};

export const NOMINAL_PRESETS = [5000, 10000, 20000, 50000, 100000];
export const NOMINAL_PRESETS_TARIK = [50000, 100000, 200000, 500000];

export const TARGET_TABUNGAN = 500000;
export const MAX_SETORAN = 10000000;
export const MIN_SETORAN = 1000;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  WARGA_PORTAL: '/warga/portal',
  WARGA_RIWAYAT: '/warga/riwayat',
  WARGA_LAPORAN: '/warga/laporan',
  RT_DASHBOARD: '/rt/dashboard',
  RT_SETORAN: '/rt/setoran',
  RT_PENARIKAN: '/rt/penarikan',
  RT_VERIFIKASI: '/rt/verifikasi',
  ADMIN_DESA_DASHBOARD: '/admin-desa/dashboard',
  ADMIN_DESA_KELOLA: '/admin-desa/kelola-kencleng',
  ADMIN_DESA_KELOLA_WARGA: '/admin-desa/kelola-warga',
  ADMIN_DESA_KELOLA_RT: '/admin-desa/kelola-rt',
  ADMIN_DESA_IMPORT: '/admin-desa/import',
  ADMIN_DESA_CETAK_QR: '/admin-desa/cetak-qr',
  ADMIN_DESA_LAPORAN: '/admin-desa/laporan',
  // Legacy routes untuk backward compatibility
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_KELOLA: '/admin/kelola-kencleng',
  ADMIN_KELOLA_WARGA: '/admin/kelola-warga',
};

export const COLLECTIONS = {
  USERS: 'users',
  KENCLENG: 'kencleng',
  SETORAN: 'setoran',
  PENARIKAN: 'penarikan',
  NOTIFICATIONS: 'notifications',
  RT: 'rt',
  DESA: 'desa',
};