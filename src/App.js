// src/App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoadingPage } from './components/common/Loading';
import { ROLES, ROUTES } from './config/constants';
import './styles/globals.css';

// Lazy loaded pages dengan error handling
const LoginPage = lazy(() => import('./pages/login').catch(() => ({ default: () => <div>Error loading page</div> })));
const HomePage = lazy(() => import('./pages/index').catch(() => ({ default: () => <div>Error loading page</div> })));
const RTDashboard = lazy(() => import('./pages/rt/dashboard').catch(() => ({ default: () => <div>Error loading page</div> })));
const RTSetoran = lazy(() => import('./pages/rt/setoran').catch(() => ({ default: () => <div>Error loading page</div> })));
const AdminDashboard = lazy(() => import('./pages/admin/dashboard').catch(() => ({ default: () => <div>Error loading page</div> })));
const AdminKelola = lazy(() => import('./pages/admin/kelola-kencleng').catch(() => ({ default: () => <div>Error loading page</div> })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').catch(() => ({ default: () => <div>Error loading page</div> })));
const ScanPage = lazy(() => import('./pages/ScanPage').catch(() => ({ default: () => <div>Error loading page</div> })));
const RiwayatPage = lazy(() => import('./pages/RiwayatPage').catch(() => ({ default: () => <div>Error loading page</div> })));
const ProfilPage = lazy(() => import('./pages/ProfilPage').catch(() => ({ default: () => <div>Error loading page</div> })));
const KenclengDetailPage = lazy(() => import('./pages/KenclengDetailPage').catch(() => ({ default: () => <div>Error loading page</div> })));

// Route guards
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
      {/* Public */}
      <Route
        path={ROUTES.LOGIN}
        element={<PublicRoute><LoginPage /></PublicRoute>}
      />

      {/* Warga */}
      <Route
        path={ROUTES.HOME}
        element={<ProtectedRoute><HomePage /></ProtectedRoute>}
      />
      <Route
        path="/scan"
        element={<ProtectedRoute><ScanPage /></ProtectedRoute>}
      />
      <Route
        path="/riwayat"
        element={<ProtectedRoute><RiwayatPage /></ProtectedRoute>}
      />
      <Route
        path="/leaderboard"
        element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>}
      />
      <Route
        path="/profil"
        element={<ProtectedRoute><ProfilPage /></ProtectedRoute>}
      />
      <Route
        path="/kencleng/:id"
        element={<ProtectedRoute><KenclengDetailPage /></ProtectedRoute>}
      />

      {/* RT */}
      <Route
        path={ROUTES.RT_DASHBOARD}
        element={<ProtectedRoute roles={[ROLES.RT, ROLES.ADMIN]}><RTDashboard /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.RT_SETORAN}
        element={<ProtectedRoute roles={[ROLES.RT, ROLES.ADMIN]}><RTSetoran /></ProtectedRoute>}
      />

      {/* Admin */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.ADMIN_KELOLA}
        element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminKelola /></ProtectedRoute>}
      />

      {/* Fallback */}
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