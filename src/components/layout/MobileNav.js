import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../config/constants';

const navItems = {
  [ROLES.WARGA]: [
    { path: ROUTES.WARGA_PORTAL, icon: '🏠', label: 'Portal' },
    { path: ROUTES.WARGA_RIWAYAT, icon: '📋', label: 'Riwayat' },
    { path: ROUTES.WARGA_LAPORAN, icon: '📊', label: 'Laporan' },
    { path: '/profil', icon: '👤', label: 'Profil' },
  ],
  [ROLES.RT]: [
    { path: ROUTES.RT_DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: ROUTES.RT_SETORAN, icon: '💰', label: 'Setoran' },
    { path: ROUTES.RT_VERIFIKASI, icon: '✅', label: 'Verifikasi' },
    { path: ROUTES.RT_PENARIKAN, icon: '💸', label: 'Tarik' },
    { path: '/profil', icon: '👤', label: 'Profil' },
  ],
  [ROLES.ADMIN_DESA]: [
    { path: ROUTES.ADMIN_DESA_DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: ROUTES.ADMIN_DESA_KELOLA, icon: '🪣', label: 'Kencleng' },
    { path: ROUTES.ADMIN_DESA_KELOLA_WARGA, icon: '👥', label: 'Warga' },
    { path: ROUTES.ADMIN_DESA_KELOLA_RT, icon: '🏛️', label: 'RT' },
    { path: ROUTES.ADMIN_DESA_LAPORAN, icon: '📈', label: 'Laporan' },
  ],
};

const MobileNav = () => {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = userData?.role || ROLES.WARGA;
  const items = navItems[role] || navItems[ROLES.WARGA];

  if (location.pathname === '/login') return null;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid var(--abu-100)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 4px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--hijau)' : 'var(--abu-400)',
              fontSize: '0.7rem',
              fontWeight: isActive ? 600 : 400,
              padding: '4px 8px',
              flex: 1,
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;