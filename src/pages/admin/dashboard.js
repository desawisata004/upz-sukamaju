// src/pages/admin/dashboard.js
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import { getAllKencleng } from '../../services/kenclengService';
import { formatRupiah } from '../../utils/formatter';
import { SkeletonCard } from '../../components/common/Loading';
import { RT_NAME } from '../../config/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard = () => {
  const [kenclengList, setKenclengList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllKencleng()
      .then(setKenclengList)
      .finally(() => setLoading(false));
  }, []);

  const totalSaldo = kenclengList.reduce((a, k) => a + (k.saldo || 0), 0);
  const totalTarget = kenclengList.reduce((a, k) => a + (k.target || 0), 0);
  const pctTotal = totalTarget > 0 ? Math.round((totalSaldo / totalTarget) * 100) : 0;
  const kenclengFull = kenclengList.filter((k) => (k.saldo || 0) >= (k.target || 0));

  // Chart data — top 8
  const chartData = kenclengList.slice(0, 8).map((k) => ({
    name: k.nama.length > 10 ? k.nama.slice(0, 10) + '…' : k.nama,
    saldo: k.saldo || 0,
    target: k.target || 500000,
  }));

  return (
    <div className="app-layout">
      <Header
        title="Admin Dashboard"
        subtitle={RT_NAME}
        rightAction={
          <span
            style={{
              background: 'var(--hijau-pale)',
              color: 'var(--hijau)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            Admin
          </span>
        }
      />

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { icon: '💳', label: 'Total Tabungan', value: formatRupiah(totalSaldo), color: 'var(--hijau)' },
                { icon: '📊', label: 'Pencapaian', value: `${pctTotal}%`, color: 'var(--kuning)' },
                { icon: '🪣', label: 'Total Kencleng', value: kenclengList.length, color: 'var(--coklat)' },
                { icon: '🎉', label: 'Target Tercapai', value: kenclengFull.length, color: '#d4900d' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: '#fff',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    boxShadow: 'var(--shadow-sm)',
                    borderLeft: `3px solid ${s.color}`,
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--hitam)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--abu-500)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Overall progress */}
            <div
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Progress Total RT</span>
                <span style={{ fontWeight: 800, color: 'var(--hijau)' }}>{pctTotal}%</span>
              </div>
              <div style={{ height: 12, background: 'var(--abu-100)', borderRadius: 6, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pctTotal}%`,
                    background: 'linear-gradient(90deg, var(--hijau), var(--kuning))',
                    borderRadius: 6,
                    transition: 'width 1s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--abu-400)' }}>
                <span>{formatRupiah(totalSaldo)} terkumpul</span>
                <span>Target {formatRupiah(totalTarget)}</span>
              </div>
            </div>

            {/* Bar chart */}
            {chartData.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: 20,
                }}
              >
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--abu-700)' }}>
                  Saldo per Kencleng
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--abu-400)' }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip
                      formatter={(v) => formatRupiah(v)}
                      contentStyle={{
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    />
                    <Bar dataKey="saldo" radius={[4,4,0,0]}>
                      {chartData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.saldo >= entry.target ? '#e8a020' : '#1a6b3c'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default AdminDashboard;
