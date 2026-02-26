import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { getAllKencleng, getSetoranStats, getTrendBulanan, getPendingSetoran, getPendingPenarikan } from '../../services/kenclengService';
import { getAllUsers } from '../../services/userService';
import { formatRupiah } from '../../utils/formatter';
import { DESA_NAME, KECAMATAN_NAME } from '../../config/constants';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const StatCard = ({ icon, label, value, sub, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      boxShadow: 'var(--shadow-sm)',
      borderTop: `3px solid ${color}`,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
  >
    <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--hitam)', fontFamily: 'var(--font-display)' }}>{value}</div>
    <div style={{ fontSize: '0.75rem', color: 'var(--abu-500)', marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: '0.7rem', color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
  </div>
);

const COLORS = ['#1a6b3c', '#e8a020', '#c0392b', '#2471a3', '#9e9890'];

const AdminDesaDashboard = () => {
  const navigate = useNavigate();
  const [kenclengList, setKenclengList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [pendingSetoran, setPendingSetoran] = useState([]);
  const [pendingPenarikan, setPendingPenarikan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kl, ul, st, td, ps, pp] = await Promise.all([
        getAllKencleng(),
        getAllUsers(),
        getSetoranStats(),
        getTrendBulanan(6),
        getPendingSetoran(),
        getPendingPenarikan()
      ]);
      setKenclengList(kl);
      setUsersList(ul);
      setStats(st);
      setTrendData(td);
      setPendingSetoran(ps);
      setPendingPenarikan(pp);
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Statistik
  const totalSaldo = kenclengList.reduce((a, k) => a + (k.saldo || 0), 0);
  const totalTarget = kenclengList.reduce((a, k) => a + (k.target || 500000), 0);
  const pctTotal = totalTarget > 0 ? Math.round((totalSaldo / totalTarget) * 100) : 0;
  
  const kenclengAktif = kenclengList.filter(k => k.status === 'aktif').length;
  const kenclengNonaktif = kenclengList.filter(k => k.status !== 'aktif').length;
  const kenclengFull = kenclengList.filter(k => (k.saldo || 0) >= (k.target || 500000)).length;

  const totalWarga = usersList.filter(u => u.role === 'warga').length;
  const totalRT = usersList.filter(u => u.role === 'rt').length;
  const totalAdmin = usersList.filter(u => u.role === 'admin' || u.role === 'admin_desa').length;

  // Data untuk chart status kencleng
  const statusData = [
    { name: 'Aktif', value: kenclengAktif, color: '#1a6b3c' },
    { name: 'Nonaktif', value: kenclengNonaktif, color: '#9e9890' },
  ].filter(d => d.value > 0);

  // Data untuk chart per RT
  const rtMap = {};
  kenclengList.forEach(k => {
    const rt = k.rt || '00';
    if (!rtMap[rt]) {
      rtMap[rt] = { rt, totalSaldo: 0, totalTarget: 0, count: 0 };
    }
    rtMap[rt].totalSaldo += k.saldo || 0;
    rtMap[rt].totalTarget += k.target || 500000;
    rtMap[rt].count++;
  });
  
  const rtChartData = Object.values(rtMap)
    .map(rt => ({
      name: `RT ${rt.rt}`,
      saldo: rt.totalSaldo,
      target: rt.totalTarget,
      persentase: rt.totalTarget > 0 ? Math.round((rt.totalSaldo / rt.totalTarget) * 100) : 0
    }))
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 8);

  return (
    <div className="app-layout">
      <Header
        title="Dashboard Admin Desa"
        subtitle={`${DESA_NAME} · ${KECAMATAN_NAME}`}
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

        {/* Pending Alerts */}
        {!loading && pendingSetoran.length > 0 && (
          <div
            onClick={() => navigate('/rt/setoran')}
            style={{ background: 'linear-gradient(135deg, #fdeaea, #fff)', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div style={{ width: 40, height: 40, background: '#fdeaea', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>{pendingSetoran.length} Setoran Menunggu Konfirmasi</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--abu-500)' }}>Total: {formatRupiah(pendingSetoran.reduce((a, s) => a + (s.nominal || 0), 0))}</div>
            </div>
            <span style={{ color: 'var(--danger)', fontSize: '1.1rem' }}>→</span>
          </div>
        )}

        {!loading && pendingPenarikan.length > 0 && (
          <div
            onClick={() => navigate('/rt/penarikan')}
            style={{ background: 'linear-gradient(135deg, #fdeaea, #fff)', border: '1.5px solid #c0392b', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div style={{ width: 40, height: 40, background: '#fdeaea', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💸</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#c0392b', fontSize: '0.9rem' }}>{pendingPenarikan.length} Penarikan Menunggu Persetujuan</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--abu-500)' }}>Total: {formatRupiah(pendingPenarikan.reduce((a, p) => a + (p.nominal || 0), 0))}</div>
            </div>
            <span style={{ color: '#c0392b', fontSize: '1.1rem' }}>→</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
              <StatCard icon="💰" label="Total Tabungan" value={formatRupiah(totalSaldo)} color="var(--hijau)" />
              <StatCard icon="📊" label="Pencapaian" value={`${pctTotal}%`} sub={`dari ${formatRupiah(totalTarget)}`} color="var(--kuning)" />
              <StatCard icon="🪣" label="Kencleng Aktif" value={kenclengAktif} sub={`${kenclengFull} sudah penuh`} color="var(--info)" />
              <StatCard icon="👥" label="Total Warga" value={totalWarga} sub={`${totalRT} RT · ${totalAdmin} Admin`} color="var(--hijau-muda)" />
            </div>

            {/* Progress Keseluruhan */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Progress Total Desa</span>
                <span style={{ fontWeight: 800, color: pctTotal >= 100 ? 'var(--kuning)' : 'var(--hijau)' }}>{pctTotal}%</span>
              </div>
              <div style={{ height: 10, background: 'var(--abu-100)', borderRadius: 5, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pctTotal}%`,
                    background: pctTotal >= 100 ? 'var(--kuning)' : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))',
                    borderRadius: 5,
                    transition: 'width 1.2s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--abu-400)' }}>
                <span>{formatRupiah(totalSaldo)} terkumpul</span>
                <span>Target {formatRupiah(totalTarget)}</span>
              </div>
            </Card>

            {/* Statistik Setoran */}
            {stats && (
              <Card style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Statistik Setoran</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Hari Ini</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(stats.hariIni)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Minggu Ini</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(stats.mingguIni)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Bulan Ini</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(stats.bulanIni)}</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Chart Status Kencleng */}
            {statusData.length > 0 && (
              <Card style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Status Kencleng</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Chart per RT */}
            {rtChartData.length > 0 && (
              <Card style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Saldo per RT (Top 8)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={rtChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--abu-400)' }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v) => formatRupiah(v)} />
                    <Bar dataKey="saldo" radius={[4,4,0,0]}>
                      {rtChartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.persentase >= 100 ? '#e8a020' : '#1a6b3c'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Trend Chart */}
            {trendData.length > 0 && (
              <Card style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Tren Setoran 6 Bulan</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a6b3c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1a6b3c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: 'var(--abu-400)' }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v) => formatRupiah(v)} />
                    <Area type="monotone" dataKey="total" stroke="#1a6b3c" strokeWidth={2} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>Aksi Cepat</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <button
                  onClick={() => navigate('/admin-desa/kelola-kencleng')}
                  style={{ padding: '12px', background: 'var(--hijau-pale)', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                >
                  🪣 Kelola Kencleng
                </button>
                <button
                  onClick={() => navigate('/admin-desa/kelola-warga')}
                  style={{ padding: '12px', background: 'var(--hijau-pale)', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                >
                  👥 Kelola Warga
                </button>
                <button
                  onClick={() => navigate('/admin-desa/kelola-rt')}
                  style={{ padding: '12px', background: 'var(--hijau-pale)', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                >
                  🏛️ Kelola RT
                </button>
                <button
                  onClick={() => navigate('/admin-desa/laporan')}
                  style={{ padding: '12px', background: 'var(--hijau-pale)', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                >
                  📊 Laporan
                </button>
              </div>
            </Card>
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default AdminDesaDashboard;