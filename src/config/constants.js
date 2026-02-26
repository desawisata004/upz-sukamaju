export const APP_NAME = process.env.REACT_APP_NAME || 'Kencleng Digital';
export const RT_NAME = process.env.REACT_APP_RT_NAME || 'RT 05/RW 03';

export const ROLES = {
  WARGA: 'warga',
  RT: 'rt',
  ADMIN: 'admin',
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

export const NOMINAL_PRESETS = [5000, 10000, 20000, 50000, 100000];
export const NOMINAL_PRESETS_TARIK = [50000, 100000, 200000, 500000];

export const TARGET_TABUNGAN = 500000;
export const MAX_SETORAN = 10000000;
export const MIN_SETORAN = 1000;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  RT_DASHBOARD: '/rt/dashboard',
  RT_SETORAN: '/rt/setoran',
  RT_PENARIKAN: '/rt/penarikan',
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
};