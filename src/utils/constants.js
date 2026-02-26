// Konstanta aplikasi
export const APP_CONSTANTS = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Kencleng Digital',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  DESA_NAME: process.env.NEXT_PUBLIC_DESA_NAME || 'Desa Sukamaju',
  KECAMATAN: process.env.NEXT_PUBLIC_KECAMATAN || 'Ciamis'
};

// Metode setoran
export const METODE_SETORAN = [
  { value: 'tunai', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer Bank' },
  { value: 'qris', label: 'QRIS' }
];

// Status setoran
export const STATUS_SETORAN = {
  pending: { label: 'Menunggu', color: 'warning' },
  verified: { label: 'Terverifikasi', color: 'success' },
  rejected: { label: 'Ditolak', color: 'danger' }
};

// Program 5 Ciamis
export const PROGRAM_CIAMIS = [
  { id: 'peduli', label: 'Ciamis Peduli', icon: 'Heart', color: 'red' },
  { id: 'cerdas', label: 'Ciamis Cerdas', icon: 'Book', color: 'blue' },
  { id: 'sehat', label: 'Ciamis Sehat', icon: 'Heart', color: 'green' },
  { id: 'sejahtera', label: 'Ciamis Sejahtera', icon: 'Briefcase', color: 'purple' },
  { id: 'agamis', label: 'Ciamis Agamis', icon: 'Moon', color: 'yellow' }
];

// Target bulanan default
export const TARGET_BULANAN = 100000; // Rp 100.000 per rumah

// Role pengguna
export const USER_ROLES = {
  WARGA: 'warga',
  RT: 'rt',
  ADMIN_DESA: 'admin_desa',
  BAZNAS: 'baznas'
};