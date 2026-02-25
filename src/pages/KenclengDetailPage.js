// src/pages/KenclengDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import RiwayatSetoran from '../components/kencleng/RiwayatSetoran';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Spinner } from '../components/common/Loading';
import { getKenclengById, getRiwayatSetoran } from '../services/kenclengService';
import { generateQRCodeDataURL, generateQRData } from '../utils/qrGenerator';
import { formatRupiah, formatProgress } from '../utils/formatter';
import { useAuth } from '../hooks/useAuth';

const KenclengDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kencleng, setKencleng] = useState(null);
  const [setoran, setSetoran] = useState([]);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const load = async () => {
      const k = await getKenclengById(id);
      if (!k) { navigate('/'); return; }
      setKencleng(k);

      // Generate QR
      const qrData = generateQRData(k.id, k.userId, k.nama);
      const url = await generateQRCodeDataURL(qrData);
      setQrUrl(url);

      // Load setoran
      const s = await getRiwayatSetoran(id);
      setSetoran(s);
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="app-layout">
        <Header title="Detail Kencleng" showBack />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (!kencleng) return null;

  const progress = formatProgress(kencleng.saldo, kencleng.target);
  const isFull = progress >= 100;
  const isOwner = user?.uid === kencleng.userId;

  return (
    <div className="app-layout">
      <Header title={kencleng.nama} showBack />

      <div className="page-content">
        {/* Hero card */}
        <div
          style={{
            background: isFull
              ? 'linear-gradient(135deg, var(--kuning), #c7870f)'
              : 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 20px',
            color: '#fff',
            marginBottom: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>Total Terkumpul</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: 4 }}>
            {formatRupiah(kencleng.saldo || 0)}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.85 }}>
            Target: {formatRupiah(kencleng.target)} {isFull && '🎉'}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.8, marginBottom: 6 }}>
              <span>Progress</span>
              <span style={{ fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#fff',
                  borderRadius: 4,
                  transition: 'width 1s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: kencleng.status === 'aktif' ? 'var(--hijau-pale)' : 'var(--abu-100)',
              color: kencleng.status === 'aktif' ? 'var(--hijau)' : 'var(--abu-400)',
            }}
          >
            {kencleng.status === 'aktif' ? '🟢 Aktif' : '⭕ Nonaktif'}
          </span>
          {isFull && (
            <span
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: 'var(--kuning-pale)',
                color: 'var(--kuning)',
              }}
            >
              🎉 Target Tercapai
            </span>
          )}
        </div>

        {/* QR Code section — only show to owner */}
        {isOwner && (
          <Card style={{ marginBottom: 16, textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--abu-700)', marginBottom: 12 }}>
              QR Code Kencleng
            </h3>
            {showQR && qrUrl ? (
              <div>
                <img
                  src={qrUrl}
                  alt="QR Kencleng"
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--abu-100)',
                    marginBottom: 12,
                  }}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--abu-400)', marginBottom: 12 }}>
                  Tunjukkan QR ini saat menyetor ke pengurus RT
                </p>
                <Button variant="ghost" size="sm" onClick={() => setShowQR(false)}>
                  Sembunyikan
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setShowQR(true)} icon="📱">
                Tampilkan QR Code
              </Button>
            )}
          </Card>
        )}

        {/* Riwayat setoran */}
        <div>
          <h3
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--abu-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12,
            }}
          >
            Riwayat Setoran
          </h3>
          <RiwayatSetoran data={setoran} />
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default KenclengDetailPage;
