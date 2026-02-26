// src/pages/index.js
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
        background: isFull ? 'linear-gradient(135deg, #f8f0d8, var(--kuning-pale))' : '#fff',
        border: isFull ? '1px solid var(--kuning)33' : '1px solid transparent',
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ 
            fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', 
            color: 'var(--hitam)', 
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {k.nama}
          </h3>
          <span className="badge" style={{
            background: isFull ? 'var(--kuning-pale)' : 'var(--hijau-pale)',
            color: isFull ? 'var(--kuning)' : 'var(--hijau)',
          }}>
            {isFull ? '🎉 Tercapai' : k.status}
          </span>
        </div>
        <div style={{ textAlign: 'right', marginLeft: 8 }}>
          <div style={{ 
            fontSize: 'clamp(1rem, 4vw, 1.25rem)', 
            fontWeight: 800, 
            color: 'var(--hijau)', 
            fontFamily: 'var(--font-display)',
            whiteSpace: 'nowrap'
          }}>
            {formatRupiah(k.saldo)}
          </div>
          <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', color: 'var(--abu-400)' }}>
            dari {formatRupiah(k.target)}
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className={`progress-fill ${isFull ? 'progress-fill-full' : ''}`}
          style={{ width: `${progress}%` }} 
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted">Progress</span>
        <span className="text-xs" style={{ 
          fontWeight: 700, 
          color: isFull ? 'var(--kuning)' : 'var(--abu-500)' 
        }}>
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
      <div
        style={{
          background: 'linear-gradient(160deg, var(--hijau) 0%, var(--coklat) 100%)',
          padding: 'clamp(20px, 6vw, 28px) clamp(16px, 4vw, 20px) clamp(40px, 8vw, 48px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {RT_NAME}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              color: '#fff',
              fontSize: 'clamp(1.2rem, 5vw, 1.4rem)',
              fontStyle: 'italic',
            }}>
              {APP_NAME}
            </h1>
          </div>

          <div
            style={{
              width: 'clamp(40px, 10vw, 44px)',
              height: 'clamp(40px, 10vw, 44px)',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(0.9rem, 4vw, 1rem)',
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

        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(16px, 4vw, 20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Total Tabungan
          </p>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 8vw, 2.2rem)',
            color: '#fff',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            wordBreak: 'break-word',
          }}>
            {formatRupiah(totalSaldo)}
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {kenclengList.length} kencleng aktif
          </p>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: '-clamp(16px, 4vw, 20px)' }}>
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={3000}
          />
        )}

        <div className="grid-2 mb-3">
          {[
            { icon: '📷', label: 'Scan QR', path: '/scan', color: 'var(--hijau)' },
            { icon: '📋', label: 'Riwayat', path: '/riwayat', color: 'var(--coklat)' },
            { icon: '🏆', label: 'Peringkat', path: '/leaderboard', color: '#d4900d' },
            { icon: '➕', label: 'Buat', action: () => setShowCreate(true), color: 'var(--info)' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action || (() => navigate(item.path))}
              className="card card-clickable"
              style={{
                padding: 'clamp(12px, 3vw, 16px)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(6px, 2vw, 10px)',
              }}
            >
              <span
                style={{
                  width: 'clamp(32px, 8vw, 36px)',
                  height: 'clamp(32px, 8vw, 36px)',
                  background: item.color + '18',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <span style={{ 
                fontWeight: 600, 
                fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                color: 'var(--hitam)'
              }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {showCreate && (
          <Card style={{ marginBottom: 16 }}>
            <h3 className="mb-2">Buat Kencleng Baru</h3>
            <input
              type="text"
              value={namaKencleng}
              onChange={(e) => setNamaKencleng(e.target.value)}
              placeholder="Nama kencleng..."
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                Batal
              </Button>
              <Button fullWidth onClick={handleCreate} loading={creating}>
                Buat
              </Button>
            </div>
          </Card>
        )}

        <div>
          <h2 className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase' }}>
            Kencleng Saya
          </h2>

          {loading ? (
            <div className="flex flex-col gap-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : kenclengList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🪣</div>
              <p style={{ fontWeight: 600 }}>Belum ada kencleng</p>
              <p className="text-sm mb-3">Buat kencleng pertama Anda</p>
              <Button onClick={() => setShowCreate(true)} icon="➕">
                Buat Kencleng
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
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