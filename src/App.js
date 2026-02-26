import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoadingPage } from './components/common/Loading';
import { ROLES, ROUTES } from './config/constants';
import './styles/globals.css';

// Warga Pages
const WargaPortalPage = lazy(() => import('./pages/warga/PortalPage'));
const WargaRiwayatPage = lazy(() => import('./pages/warga/RiwayatPage'));
const WargaLaporanPage = lazy(() => import('./pages/warga/LaporanPage'));

// RT Pages
const RTDashboard = lazy(() => import('./pages/rt/dashboard'));
const RTSetoran = lazy(() => import('./pages/rt/setoran'));
const RTPenarikan = lazy(() => import('./pages/rt/penarikan'));
const RTVerifikasi = lazy(() => import('./pages/rt/verifikasi'));

// Admin Desa Pages
const AdminDesaDashboard = lazy(() => import('./pages/admin-desa/dashboard'));
const AdminDesaKelolaKencleng = lazy(() => import('./pages/admin-desa/kelola-kencleng'));
const AdminDesaKelolaWarga = lazy(() => import('./pages/admin-desa/kelola-warga'));
const AdminDesaKelolaRT = lazy(() => import('./pages/admin-desa/kelola-rt'));
const AdminDesaImport = lazy(() => import('./pages/admin-desa/import'));
const AdminDesaCetakQR = lazy(() => import('./pages/admin-desa/cetak-qr'));
const AdminDesaLaporan = lazy(() => import('./pages/admin-desa/laporan'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/login'));

const ProtectedRoute = ({ children, roles }) => {
  const { user, userData, loading } = useAuth();
  
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (roles && userData && !roles.includes(userData.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, userData, loading } = useAuth();
  
  if (loading) return <LoadingPage />;
  if (user && userData) {
    if (userData.role === ROLES.ADMIN_DESA) return <Navigate to={ROUTES.ADMIN_DESA_DASHBOARD} replace />;
    if (userData.role === ROLES.RT) return <Navigate to={ROUTES.RT_DASHBOARD} replace />;
    return <Navigate to={ROUTES.WARGA_PORTAL} replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Suspense fallback={<LoadingPage />}>
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<PublicRoute><LoginPage /></PublicRoute>} />
      
      {/* Warga Routes */}
      <Route path={ROUTES.WARGA_PORTAL} element={<ProtectedRoute><WargaPortalPage /></ProtectedRoute>} />
      <Route path={ROUTES.WARGA_RIWAYAT} element={<ProtectedRoute><WargaRiwayatPage /></ProtectedRoute>} />
      <Route path={ROUTES.WARGA_LAPORAN} element={<ProtectedRoute><WargaLaporanPage /></ProtectedRoute>} />
      
      {/* RT Routes */}
      <Route path={ROUTES.RT_DASHBOARD} element={<ProtectedRoute roles={[ROLES.RT, ROLES.ADMIN_DESA]}><RTDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.RT_SETORAN} element={<ProtectedRoute roles={[ROLES.RT, ROLES.ADMIN_DESA]}><RTSetoran /></ProtectedRoute>} />
      <Route path={ROUTES.RT_PENARIKAN} element={<ProtectedRoute roles={[ROLES.RT, ROLES.ADMIN_DESA]}><RTPenarikan /></ProtectedRoute>} />
      <Route path={ROUTES.RT_VERIFIKASI} element={<ProtectedRoute roles={[ROLES.RT, ROLES.ADMIN_DESA]}><RTVerifikasi /></ProtectedRoute>} />
      
      {/* Admin Desa Routes */}
      <Route path={ROUTES.ADMIN_DESA_DASHBOARD} element={<ProtectedRoute roles={[ROLES.ADMIN_DESA]}><AdminDesaDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DESA_KELOLA} element={<ProtectedRoute roles={[ROLES.ADMIN_DESA]}><AdminDesaKelolaKencleng /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DESA_KELOLA_WARGA} element={<ProtectedRoute roles={[ROLES.ADMIN_DESA]}><AdminDesaKelolaWarga /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DESA_KELOLA_RT} element={<ProtectedRoute roles={[ROLES.ADMIN_DESA]}><AdminDesaKelolaRT /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DESA_IMPORT} element={<ProtectedRoute roles={[ROLES.ADMIN_DESA]}><AdminDesaImport /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DESA_CETAK_QR} element={<ProtectedRoute roles={[ROLES.ADMIN_DESA]}><AdminDesaCetakQR /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DESA_LAPORAN} element={<ProtectedRoute roles={[ROLES.ADMIN_DESA]}><AdminDesaLaporan /></ProtectedRoute>} />
      
      {/* Redirect root to appropriate page */}
      <Route path="/" element={<Navigate to={ROUTES.WARGA_PORTAL} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.WARGA_PORTAL} replace />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;