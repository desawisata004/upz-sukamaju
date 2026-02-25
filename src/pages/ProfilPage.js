// src/pages/ProfilPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/auth';
import { initials, formatTanggalShort } from '../utils/formatter';
import { ROUTES, ROLES } from '../config/constants';

const InfoRow = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid var(--abu-100)',
    }}
  >
    <span style={{ fontSize: '0.85rem', color: 'var(--abu-500)' }}>{label}</span>
    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--hitam)', maxWidth: '60%', textAlign: 'right' }}>
      {value || '-'}
    </span>
  </div>
);

const ProfilPage = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const roleLabel = {
    [ROLES.WARGA]: '👥 Warga',
    [ROLES.RT]: '🏛️ Pengurus RT',
    [ROLES.ADMIN]: '⚙️ Admin',
  };

  return (
    <div className="app-layout">
      <Header title="Profil Saya" />
      <div className="page-content">
        {/* Avatar section */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#fff',
              marginBottom: 12,
              boxShadow: '0 8px 24px rgba(26,107,60,0.25)',
            }}
          >
            {initials(userData?.nama)}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--hitam)' }}>
            {userData?.nama}
          </h2>
          <span
            style={{
              display: 'inline-block',
              marginTop: 6,
              padding: '4px 12px',
              background: 'var(--hijau-pale)',
              color: 'var(--hijau)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            {roleLabel[userData?.role] || 'Warga'}
          </span>
        </div>

        {/* Info card */}
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Informasi Akun
          </h3>
          <InfoRow label="Nama Lengkap" value={userData?.nama} />
          <InfoRow label="Email" value={userData?.email} />
          <InfoRow label="No. HP" value={userData?.noHp} />
          <InfoRow label="Alamat" value={userData?.alamat} />
          <InfoRow label="Bergabung" value={formatTanggalShort(userData?.createdAt)} />
        </Card>

        {/* Shortcuts for non-warga */}
        {userData?.role !== ROLES.WARGA && (
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Menu Pengurus
            </h3>
            {userData?.role === ROLES.ADMIN && (
              <button
                onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--abu-100)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  textAlign: 'left',
                }}
              >
                <span>📊</span>
                <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>Admin Dashboard</span>
                <span style={{ color: 'var(--abu-300)' }}>→</span>
              </button>
            )}
            <button
              onClick={() => navigate(ROUTES.RT_SETORAN)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                textAlign: 'left',
              }}
            >
              <span>💰</span>
              <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>Konfirmasi Setoran</span>
              <span style={{ color: 'var(--abu-300)' }}>→</span>
            </button>
          </Card>
        )}

        <Button
          variant="ghost"
          fullWidth
          onClick={handleLogout}
          loading={loggingOut}
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
          icon="🚪"
        >
          Keluar
        </Button>
      </div>

      <MobileNav />
    </div>
  );
};

export default ProfilPage;
