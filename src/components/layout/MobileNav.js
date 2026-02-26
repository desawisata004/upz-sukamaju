import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../config/constants';

const navItems = {
  [ROLES.WARGA]: [
    { path: ROUTES.HOME, icon: '🏠', label: 'Beranda' },
    { path: '/scan', icon: '📷', label: 'Scan' },
    { path: '/riwayat', icon: '📋', label: 'Riwayat' },
    { path: '/leaderboard', icon: '🏆', label: 'Peringkat' },
    { path: '/profil', icon: '👤', label: 'Profil' },
  ],
  [ROLES.RT]: [
    { path: ROUTES.RT_DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: ROUTES.RT_SETORAN, icon: '💰', label: 'Setoran' },
    { path: ROUTES.RT_PENARIKAN, icon: '💸', label: 'Tarik' },
    { path: '/leaderboard', icon: '🏆', label: 'Peringkat' },
    { path: '/profil', icon: '👤', label: 'Profil' },
  ],
  [ROLES.ADMIN]: [
    { path: ROUTES.ADMIN_DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: ROUTES.ADMIN_KELOLA, icon: '🪣', label: 'Kencleng' },
    { path: '/admin/kelola-warga', icon: '👥', label: 'Warga' },
    { path: ROUTES.RT_PENARIKAN, icon: '💸', label: 'Tarik' },
    { path: '/profil', icon: '👤', label: 'Profil' },
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
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        background: '#fff',
        borderTop: '1px solid var(--abu-100)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 200,
        boxShadow: '0 -4px 20px rgba(28,26,22,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              padding: '8px 2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--hijau)' : 'var(--abu-400)',
              transition: 'all var(--transition)',
              position: 'relative',
              minWidth: 0,
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '20%',
                  right: '20%',
                  height: 3,
                  background: 'var(--hijau)',
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}
            <span
              style={{
                fontSize: 'clamp(1.1rem, 5vw, 1.3rem)',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontSize: 'clamp(0.55rem, 2.5vw, 0.65rem)',
                fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;