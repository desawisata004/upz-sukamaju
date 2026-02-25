// src/pages/rt/dashboard.js
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import { getAllKencleng, getPendingSetoran } from '../../services/kenclengService';
import { formatRupiah } from '../../utils/formatter';
import { SkeletonCard } from '../../components/common/Loading';
import { useNavigate } from 'react-router-dom';
import { RT_NAME } from '../../config/constants';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      boxShadow: 'var(--shadow-sm)',
      borderTop: `3px solid ${color}`,
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
    <div
      style={{
        fontSize: '1.4rem',
        fontWeight: 800,
        color: 'var(--hitam)',
        fontFamily: 'var(--font-display)',
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: '0.72rem', color: color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
  </div>
);

const RTDashboardPage = () => {
  const [kenclengList, setKenclengList] = useState([]);
  const [pendingSetoran, setPendingSetoran] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllKencleng(), getPendingSetoran()])
      .then(([kl, ps]) => {
        setKenclengList(kl);
        setPendingSetoran(ps);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalSaldo = kenclengList.reduce((a, k) => a + (k.saldo || 0), 0);
  const totalTarget = kenclengList.reduce((a, k) => a + (k.target || 0), 0);
  const kenclengAktif = kenclengList.filter((k) => k.status === 'aktif').length;
  const kenclengFull = kenclengList.filter((k) => k.saldo >= k.target).length;

  return (
    <div className="app-layout">
      <Header title="Dashboard RT" subtitle={RT_NAME} />

      <div className="page-content">
        {/* Stats grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <StatCard
              icon="💰"
              label="Total Terkumpul"
              value={formatRupiah(totalSaldo)}
              color="var(--hijau)"
            />
            <StatCard
              icon="🪣"
              label="Total Kencleng"
              value={kenclengAktif}
              sub={`${kenclengFull} sudah penuh`}
              color="var(--kuning)"
            />
            <StatCard
              icon="⏳"
              label="Setoran Pending"
              value={pendingSetoran.length}
              sub={pendingSetoran.length > 0 ? 'Perlu konfirmasi' : 'Semua clear'}
              color={pendingSetoran.length > 0 ? 'var(--danger)' : 'var(--hijau)'}
            />
            <StatCard
              icon="🎯"
              label="Total Target"
              value={formatRupiah(totalTarget)}
              color="var(--info)"
            />
          </div>
        )}

        {/* Pending notification */}
        {pendingSetoran.length > 0 && (
          <Card
            onClick={() => navigate('/rt/setoran')}
            style={{
              background: 'linear-gradient(135deg, #fdeaea, #fff)',
              border: '1px solid var(--danger)22',
              marginBottom: 16,
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: '#fdeaea',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                }}
              >
                🔔
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>
                  {pendingSetoran.length} Setoran Menunggu Konfirmasi
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--abu-500)' }}>
                  Ketuk untuk konfirmasi sekarang
                </div>
              </div>
              <span style={{ color: 'var(--abu-400)', fontSize: '1.2rem' }}>→</span>
            </div>
          </Card>
        )}

        {/* Recent kencleng */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Kencleng Warga
            </h3>
            <button
              onClick={() => navigate('/admin/kelola-kencleng')}
              style={{ fontSize: '0.8rem', color: 'var(--hijau)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Kelola →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              [1,2,3].map(i => <SkeletonCard key={i} />)
            ) : (
              kenclengList.slice(0, 10).map((k) => {
                const pct = Math.min(100, Math.round(((k.saldo||0) / (k.target||500000)) * 100));
                return (
                  <div
                    key={k.id}
                    style={{
                      background: '#fff',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{k.nama}</span>
                      <span style={{ fontWeight: 700, color: 'var(--hijau)', fontSize: '0.9rem' }}>
                        {formatRupiah(k.saldo || 0)}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--abu-100)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: pct >= 100 ? 'var(--kuning)' : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))',
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--abu-400)', marginTop: 4, textAlign: 'right' }}>
                      {pct}% dari {formatRupiah(k.target)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default RTDashboardPage;
