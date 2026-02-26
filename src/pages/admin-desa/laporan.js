// src/pages/admin-desa/laporan.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { 
  getAllKencleng, 
  getSetoranStats,
  getTrendBulanan,
  getAllPenarikan 
} from '../../services/kenclengService';
import { formatRupiah, formatTanggal } from '../../utils/formatter';
import { DESA_NAME, KECAMATAN_NAME } from '../../config/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#1a6b3c', '#e8a020', '#c0392b', '#2471a3', '#9e9890'];

const LaporanPage = () => {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [kenclengList, setKenclengList] = useState([]);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [penarikanList, setPenarikanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [periode, setPeriode] = useState('bulan'); // bulan | tahun

  const loadData = async () => {
    setLoading(true);
    try {
      const [kl, st, td, pl] = await Promise.all([
        getAllKencleng(),
        getSetoranStats(),
        getTrendBulanan(12),
        getAllPenarikan(100)
      ]);
      setKenclengList(kl);
      setStats(st);
      setTrendData(td);
      setPenarikanList(pl);
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Statistik per RT
  const statsPerRT = kenclengList.reduce((acc, k) => {
    const rt = k.rt || '00';
    if (!acc[rt]) {
      acc[rt] = { rt, jumlahKencleng: 0, totalSaldo: 0, totalTarget: 0 };
    }
    acc[rt].jumlahKencleng++;
    acc[rt].totalSaldo += k.saldo || 0;
    acc[rt].totalTarget += k.target || 500000;
    return acc;
  }, {});

  const rtData = Object.values(statsPerRT).map(rt => ({
    ...rt,
    persentase: rt.totalTarget > 0 ? Math.round((rt.totalSaldo / rt.totalTarget) * 100) : 0
  }));

  // Statistik status kencleng
  const statusData = [
    { name: 'Aktif', value: kenclengList.filter(k => k.status === 'aktif').length },
    { name: 'Nonaktif', value: kenclengList.filter(k => k.status !== 'aktif').length }
  ];

  // Statistik penarikan
  const penarikanStats = {
    pending: penarikanList.filter(p => p.status === 'pending').length,
    disetujui: penarikanList.filter(p => p.status === 'disetujui').length,
    ditolak: penarikanList.filter(p => p.status === 'ditolak').length,
    selesai: penarikanList.filter(p => p.status === 'selesai').length,
    totalNominal: penarikanList.reduce((a, p) => a + (p.nominal || 0), 0)
  };

  const TABS = [
    { id: 'ringkasan', label: '📊 Ringkasan' },
    { id: 'per-rt', label: '🏘️ Per RT' },
    { id: 'trend', label: '📈 Tren' },
    { id: 'penarikan', label: '💸 Penarikan' }
  ];

  return (
    <div className="app-layout">
      <Header 
        title="Laporan & Statistik"
        subtitle={`${DESA_NAME} · ${KECAMATAN_NAME}`}
        showBack
        rightAction={
          <button
            onClick={loadData}
            style={{ background: 'var(--hijau-pale)', color: 'var(--hijau)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            🔄 Refresh
          </button>
        }
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={3000} />}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === tab.id ? 'var(--hijau)' : '#fff',
                color: activeTab === tab.id ? '#fff' : 'var(--abu-500)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* TAB RINGKASAN */}
            {activeTab === 'ringkasan' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <Card padding="16px">
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Total Kencleng</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--hijau)' }}>{kenclengList.length}</div>
                  </Card>
                  <Card padding="16px">
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Total Saldo</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(kenclengList.reduce((a, k) => a + (k.saldo || 0), 0))}</div>
                  </Card>
                  <Card padding="16px">
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Total Target</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--kuning)' }}>{formatRupiah(kenclengList.reduce((a, k) => a + (k.target || 500000), 0))}</div>
                  </Card>
                  <Card padding="16px">
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Pencapaian</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--info)' }}>
                      {Math.round((kenclengList.reduce((a, k) => a + (k.saldo || 0), 0) / kenclengList.reduce((a, k) => a + (k.target || 500000), 0)) * 100)}%
                    </div>
                  </Card>
                </div>

                {/* Status Chart */}
                <Card style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Status Kencleng</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Stats Setoran */}
                {stats && (
                  <Card>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Statistik Setoran</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Hari Ini</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatRupiah(stats.hariIni)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Minggu Ini</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatRupiah(stats.mingguIni)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Bulan Ini</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatRupiah(stats.bulanIni)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Pending</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--kuning)' }}>{stats.pending}</div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* TAB PER RT */}
            {activeTab === 'per-rt' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {rtData.map(rt => (
                  <Card key={rt.rt} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>RT {rt.rt}</span>
                        <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--abu-400)' }}>{rt.jumlahKencleng} kencleng</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(rt.totalSaldo)}</span>
                    </div>

                    <div style={{ height: 8, background: 'var(--abu-100)', borderRadius: 4, marginBottom: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${rt.persentase}%`,
                          background: rt.persentase >= 100 ? 'var(--kuning)' : 'var(--hijau)',
                          borderRadius: 4
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--abu-400)' }}>
                      <span>Target: {formatRupiah(rt.totalTarget)}</span>
                      <span>{rt.persentase}%</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* TAB TREND */}
            {activeTab === 'trend' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button
                    onClick={() => setPeriode('bulan')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      background: periode === 'bulan' ? 'var(--hijau)' : '#fff',
                      color: periode === 'bulan' ? '#fff' : 'var(--abu-500)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Bulanan
                  </button>
                  <button
                    onClick={() => setPeriode('tahun')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      background: periode === 'tahun' ? 'var(--hijau)' : '#fff',
                      color: periode === 'tahun' ? '#fff' : 'var(--abu-500)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Tahunan
                  </button>
                </div>

                <Card style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Tren Setoran 12 Bulan</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--abu-100)" />
                      <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: 'var(--abu-400)' }} />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip formatter={(v) => formatRupiah(v)} />
                      <Area type="monotone" dataKey="total" stroke="#1a6b3c" fill="#1a6b3c20" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Jumlah Transaksi per Bulan</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--abu-100)" />
                      <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: 'var(--abu-400)' }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#e8a020" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            )}

            {/* TAB PENARIKAN */}
            {activeTab === 'penarikan' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {/* Stats Penarikan */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <Card padding="16px">
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Total Penarikan</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{penarikanList.length}</div>
                  </Card>
                  <Card padding="16px">
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Total Nominal</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{formatRupiah(penarikanStats.totalNominal)}</div>
                  </Card>
                  <Card padding="16px">
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Pending</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--kuning)' }}>{penarikanStats.pending}</div>
                  </Card>
                  <Card padding="16px">
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Disetujui</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--hijau)' }}>{penarikanStats.disetujui}</div>
                  </Card>
                </div>

                {/* Daftar Penarikan Terbaru */}
                <Card>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Penarikan Terbaru</h3>
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {penarikanList.slice(0, 10).map((p, idx) => (
                      <div
                        key={p.id}
                        style={{
                          padding: '12px 0',
                          borderBottom: idx < 9 ? '1px solid var(--abu-100)' : 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{formatRupiah(p.nominal)}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>
                            {p.createdAt ? formatTanggal(p.createdAt) : '-'}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: p.status === 'disetujui' ? 'var(--hijau-pale)' : 
                                       p.status === 'ditolak' ? '#fdeaea' : 'var(--kuning-pale)',
                            color: p.status === 'disetujui' ? 'var(--hijau)' : 
                                   p.status === 'ditolak' ? 'var(--danger)' : 'var(--kuning)'
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default LaporanPage;