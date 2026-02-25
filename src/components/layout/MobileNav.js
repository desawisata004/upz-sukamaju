// src/components/layout/MobileNav.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../config/constants';

const navItems = {
  [ROLES.WARGA]: [
    { path: ROUTES.HOME, icon: '🏠', label: 'Beranda' },
    { path: '/scan', icon: '📷', label: 'Scan QR' },
    { path: '/riwayat', icon: '📋', label: 'Riwayat' },
    { path: '/leaderboard', icon: '🏆', label: 'Peringkat' },
    { path: '/profil', icon: '👤', label: 'Profil' },
  ],
  [ROLES.RT]: [
    { path: ROUTES.RT_DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: ROUTES.RT_SETORAN, icon: '💰', label: 'Setoran' },
    { path: '/scan', icon: '📷', label: 'Scan QR' },
    { path: '/leaderboard', icon: '🏆', label: 'Peringkat' },
    { path: '/profil', icon: '👤', label: 'Profil' },
  ],
  [ROLES.ADMIN]: [
    { path: ROUTES.ADMIN_DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: ROUTES.ADMIN_KELOLA, icon: '🪣', label: 'Kencleng' },
    { path: ROUTES.RT_SETORAN, icon: '💰', label: 'Setoran' },
    { path: '/leaderboard', icon: '🏆', label: 'Peringkat' },
    { path: '/profil', icon: '👤', label: 'Profil' },
  ],
};

const MobileNav = () => {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = userData?.role || ROLES.WARGA;
  const items = navItems[role] || navItems[ROLES.WARGA];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: '#fff',
        borderTop: '1px solid var(--abu-100)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 200,
        boxShadow: '0 -4px 20px rgba(28,26,22,0.08)',
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
              gap: 3,
              padding: '8px 4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--hijau)' : 'var(--abu-400)',
              transition: 'all var(--transition)',
              position: 'relative',
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 3,
                  background: 'var(--hijau)',
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}
            <span
              style={{
                fontSize: '1.3rem',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform var(--transition)',
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.01em',
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