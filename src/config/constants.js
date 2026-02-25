// src/config/constants.js

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
  PENUH: 'penuh',
};

export const STATUS_SETORAN = {
  PENDING: 'pending',
  DITERIMA: 'diterima',
  DITOLAK: 'ditolak',
};

export const NOMINAL_PRESETS = [5000, 10000, 20000, 50000, 100000];

export const TARGET_TABUNGAN = 500000; // default target per kencleng

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  RT_DASHBOARD: '/rt/dashboard',
  RT_SETORAN: '/rt/setoran',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_KELOLA: '/admin/kelola-kencleng',
};

export const COLLECTIONS = {
  USERS: 'users',
  KENCLENG: 'kencleng',
  SETORAN: 'setoran',
  NOTIFICATIONS: 'notifications',
};
