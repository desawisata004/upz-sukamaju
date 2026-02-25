// src/pages/index.js — Home page for Warga
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeKencleng } from '../hooks/useRealtime';
import { formatRupiah, formatProgress, initials } from '../utils/formatter';
import { APP_NAME, RT_NAME } from '../config/constants';
import { SkeletonCard } from '../components/common/Loading';
import { createKencleng } from '../services/kenclengService';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/common/Alert';

const KenclengCard = ({ k, onClick }) => {
  const progress = formatProgress(k.saldo, k.target);
  const isFull = progress >= 100;

  return (
    <Card
      onClick={onClick}
      style={{
        background: isFull
          ? 'linear-gradient(135deg, #f8f0d8, var(--kuning-pale))'
          : '#fff',
        border: isFull ? '1px solid var(--kuning)33' : '1px solid transparent',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--hitam)', marginBottom: 2 }}>
            {k.nama}
          </h3>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: isFull ? 'var(--kuning)' : 'var(--hijau)',
              background: isFull ? 'var(--kuning-pale)' : 'var(--hijau-pale)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {isFull ? '🎉 Tercapai' : k.status}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--hijau)', fontFamily: 'var(--font-display)' }}>
            {formatRupiah(k.saldo)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--abu-400)', marginTop: 2 }}>
            dari {formatRupiah(k.target)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, background: 'var(--abu-100)', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: isFull
              ? 'var(--kuning)'
              : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))',
            borderRadius: 4,
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          fontSize: '0.75rem',
          color: 'var(--abu-400)',
        }}
      >
        <span>Progress</span>
        <span style={{ fontWeight: 700, color: isFull ? 'var(--kuning)' : 'var(--abu-500)' }}>
          {progress}%
        </span>
      </div>
    </Card>
  );
};

const HomePage = () => {
  const { userData, user } = useAuth();
  const { data: kenclengList, loading } = useRealtimeKencleng(user?.uid);
  const [showCreate, setShowCreate] = useState(false);
  const [namaKencleng, setNamaKencleng] = useState('');
  const [creating, setCreating] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const totalSaldo = kenclengList.reduce((a, k) => a + (k.saldo || 0), 0);

  const handleCreate = async () => {
    if (!namaKencleng.trim()) return;
    setCreating(true);
    try {
      await createKencleng({
        userId: user.uid,
        nama: namaKencleng.trim(),
        target: 500000,
      });
      setNamaKencleng('');
      setShowCreate(false);
      setAlert({ type: 'success', message: 'Kencleng berhasil dibuat!' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(160deg, var(--hijau) 0%, var(--coklat) 100%)',
          padding: '28px 20px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative bg */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: 20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none',
          }}
        />

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: 2 }}>
              {RT_NAME}
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                color: '#fff',
                fontSize: '1.4rem',
                fontStyle: 'italic',
              }}
            >
              {APP_NAME}
            </h1>
          </div>

          {/* Avatar */}
          <div
            style={{
              width: 44,
              height: 44,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
            onClick={() => navigate('/profil')}
          >
            {initials(userData?.nama || '?')}
          </div>
        </div>

        {/* Balance Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', marginBottom: 4 }}>
            Total Tabungan
          </p>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              color: '#fff',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            {formatRupiah(totalSaldo)}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: 6 }}>
            {kenclengList.length} kencleng aktif
          </p>
        </div>
      </div>

      {/* Page content — overlapping the header */}
      <div
        style={{
          flex: 1,
          padding: '0 16px',
          marginTop: -20,
          paddingBottom: 90,
        }}
      >
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={3000}
          />
        )}

        {/* Quick actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { icon: '📷', label: 'Scan QR', path: '/scan', color: 'var(--hijau)' },
            { icon: '📋', label: 'Riwayat', path: '/riwayat', color: 'var(--coklat)' },
            { icon: '🏆', label: 'Peringkat', path: '/leaderboard', color: '#d4900d' },
            { icon: '➕', label: 'Buat Kencleng', action: () => setShowCreate(true), color: 'var(--info)' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action || (() => navigate(item.path))}
              style={{
                background: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  background: item.color + '18',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--hitam)' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Create kencleng form */}
        {showCreate && (
          <Card style={{ marginBottom: 16, animation: 'slideUp 0.3s ease' }}>
            <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Buat Kencleng Baru</h3>
            <input
              type="text"
              value={namaKencleng}
              onChange={(e) => setNamaKencleng(e.target.value)}
              placeholder="Nama kencleng..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1.5px solid var(--abu-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                marginBottom: 12,
                fontFamily: 'var(--font-body)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--hijau)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--abu-200)'; }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={() => setShowCreate(false)} style={{ flexShrink: 0 }}>
                Batal
              </Button>
              <Button fullWidth onClick={handleCreate} loading={creating}>
                Buat
              </Button>
            </div>
          </Card>
        )}

        {/* Kencleng list */}
        <div>
          <h2
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--abu-700)',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Kencleng Saya
          </h2>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : kenclengList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🪣</div>
              <p style={{ fontWeight: 600, color: 'var(--abu-700)' }}>Belum ada kencleng</p>
              <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>
                Buat kencleng pertama Anda untuk mulai menabung
              </p>
              <Button onClick={() => setShowCreate(true)} icon="➕">
                Buat Kencleng
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {kenclengList.map((k) => (
                <KenclengCard
                  key={k.id}
                  k={k}
                  onClick={() => navigate(`/kencleng/${k.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default HomePage;
