import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoadingPage } from './components/common/Loading';
import { ROLES, ROUTES } from './config/constants';
import './styles/globals.css';

const LoginPage = lazy(() => import('./pages/login'));
const HomePage = lazy(() => import('./pages/index'));
const RTDashboard = lazy(() => import('./pages/rt/dashboard'));
const RTSetoran = lazy(() => import('./pages/rt/setoran'));
const AdminDashboard = lazy(() => import('./pages/admin/dashboard'));
const AdminKelola = lazy(() => import('./pages/admin/kelola-kencleng'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ScanPage = lazy(() => import('./pages/ScanPage'));
const RiwayatPage = lazy(() => import('./pages/RiwayatPage'));
const ProfilPage = lazy(() => import('./pages/ProfilPage'));
const KenclengDetailPage = lazy(() => import('./pages/KenclengDetailPage'));

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
    if (userData.role === ROLES.ADMIN) return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    if (userData.role === ROLES.RT) return <Navigate to={ROUTES.RT_DASHBOARD} replace />;
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Suspense fallback={<LoadingPage />}>
    <Routes>
      <Route path={ROUTES.LOGIN} element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path={ROUTES.HOME} element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
      <Route path="/riwayat" element={<ProtectedRoute><RiwayatPage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
      <Route path="/kencleng/:id" element={<ProtectedRoute><KenclengDetailPage /></ProtectedRoute>} />
      <Route path={ROUTES.RT_DASHBOARD} element={<ProtectedRoute roles={[ROLES.RT, ROLES.ADMIN]}><RTDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.RT_SETORAN} element={<ProtectedRoute roles={[ROLES.RT, ROLES.ADMIN]}><RTSetoran /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_KELOLA} element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminKelola /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
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