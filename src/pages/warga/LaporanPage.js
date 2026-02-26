import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import { useKencleng } from '../../hooks/useKencleng';
import { getRiwayatSetoran } from '../../services/kenclengService';
import { formatRupiah, formatTanggal } from '../../utils/formatter';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#1a6b3c', '#e8a020', '#2471a3', '#9e9890'];

const LaporanPage = () => {
  const { user } = useAuth();
  const { kenclengList, loading: loadingKencleng } = useKencleng(user?.uid);
  const [selectedKencleng, setSelectedKencleng] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [periode, setPeriode] = useState('bulan'); // bulan | tahun

  useEffect(() => {
    if (kenclengList.length > 0 && !selectedKencleng) {
      setSelectedKencleng(kenclengList[0]);
    }
  }, [kenclengList, selectedKencleng]);

  useEffect(() => {
    if (!selectedKencleng) return;
    
    const loadRiwayat = async () => {
      setLoading(true);
      try {
        const data = await getRiwayatSetoran(selectedKencleng.id);
        setRiwayat(data);
      } catch (error) {
        setAlert({ type: 'error', message: 'Gagal memuat riwayat: ' + error.message });
      } finally {
        setLoading(false);
      }
    };
    
    loadRiwayat();
  }, [selectedKencleng]);

  // Filter riwayat yang sudah diterima
  const riwayatDiterima = riwayat.filter(r => r.status === 'diterima');

  // Statistik
  const totalSetoran = riwayatDiterima.length;
  const totalNominal = riwayatDiterima.reduce((acc, r) => acc + (r.nominal || 0), 0);
  const rataRata = totalSetoran > 0 ? Math.round(totalNominal / totalSetoran) : 0;

  // Data untuk chart per bulan
  const chartData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const bulan = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const bulanStr = bulan.toLocaleDateString('id-ID', { month: 'short' });
    
    const totalBulan = riwayatDiterima
      .filter(r => {
        const tgl = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
        return tgl.getMonth() === bulan.getMonth() && tgl.getFullYear() === bulan.getFullYear();
      })
      .reduce((acc, r) => acc + (r.nominal || 0), 0);
    
    chartData.push({
      bulan: bulanStr,
      total: totalBulan
    });
  }

  // Data untuk chart berdasarkan metode (jika ada)
  const metodeMap = {};
  riwayatDiterima.forEach(r => {
    const metode = r.metode || 'tunai';
    if (!metodeMap[metode]) metodeMap[metode] = 0;
    metodeMap[metode] += r.nominal || 0;
  });

  const pieData = Object.entries(metodeMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Progress bulan ini
  const bulanIni = now.getMonth();
  const tahunIni = now.getFullYear();
  const totalBulanIni = riwayatDiterima
    .filter(r => {
      const tgl = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
      return tgl.getMonth() === bulanIni && tgl.getFullYear() === tahunIni;
    })
    .reduce((acc, r) => acc + (r.nominal || 0), 0);

  const target = selectedKencleng?.target || 500000;
  const progressBulanIni = target > 0 ? Math.min(100, Math.round((totalBulanIni / target) * 100)) : 0;

  if (loadingKencleng) {
    return (
      <div className="app-layout">
        <Header title="Laporan Kencleng" showBack />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner />
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header title="Laporan Kencleng" showBack />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={3000} />}

        {kenclengList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p style={{ fontWeight: 600 }}>Belum ada kencleng</p>
            <p style={{ fontSize: '0.875rem' }}>Buat kencleng terlebih dahulu untuk melihat laporan</p>
          </div>
        ) : (
          <>
            {/* Pilih Kencleng */}
            {kenclengList.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
                {kenclengList.map(k => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKencleng(k)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '1.5px solid',
                      borderColor: selectedKencleng?.id === k.id ? 'var(--hijau)' : 'var(--abu-200)',
                      background: selectedKencleng?.id === k.id ? 'var(--hijau)' : '#fff',
                      color: selectedKencleng?.id === k.id ? '#fff' : 'var(--abu-700)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {k.nama}
                  </button>
                ))}
              </div>
            )}

            {selectedKencleng && (
              <>
                {/* Info Kencleng */}
                <Card style={{ background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', color: '#fff', marginBottom: 16 }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>{selectedKencleng.nama}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>
                    {formatRupiah(selectedKencleng.saldo || 0)}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.85 }}>
                    Target: {formatRupiah(selectedKencleng.target || 500000)}
                  </div>
                </Card>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                  <Card padding="12px" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Total Setoran</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--hijau)' }}>{totalSetoran}</div>
                  </Card>
                  <Card padding="12px" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Total Nominal</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(totalNominal)}</div>
                  </Card>
                  <Card padding="12px" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Rata-rata</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(rataRata)}</div>
                  </Card>
                </div>

                {/* Progress Bulan Ini */}
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Progress Bulan Ini</span>
                    <span style={{ fontWeight: 700, color: progressBulanIni >= 100 ? 'var(--kuning)' : 'var(--hijau)' }}>
                      {progressBulanIni}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--abu-100)', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progressBulanIni}%`,
                        background: progressBulanIni >= 100 ? 'var(--kuning)' : 'var(--hijau)',
                        borderRadius: 4,
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--abu-400)' }}>
                    <span>{formatRupiah(totalBulanIni)} terkumpul</span>
                    <span>Target {formatRupiah(target)}</span>
                  </div>
                </Card>

                {/* Chart Bulanan */}
                <Card style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Tren Setoran 6 Bulan</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: 'var(--abu-400)' }} />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip formatter={(v) => formatRupiah(v)} />
                      <Bar dataKey="total" fill="#1a6b3c" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Pie Chart Metode (jika ada data) */}
                {pieData.length > 0 && (
                  <Card style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Setoran per Metode</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => formatRupiah(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Riwayat Terbaru */}
                <Card>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Setoran Terbaru</h3>
                  {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                      <Spinner />
                    </div>
                  ) : riwayatDiterima.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: 'var(--abu-400)' }}>
                      Belum ada setoran
                    </div>
                  ) : (
                    <div>
                      {riwayatDiterima.slice(0, 5).map((r, idx) => (
                        <div
                          key={r.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: idx < 4 ? '1px solid var(--abu-100)' : 'none'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>{formatRupiah(r.nominal)}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>
                              {r.createdAt ? formatTanggal(r.createdAt) : '-'}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>
                            {r.metode || 'Tunai'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default LaporanPage;