// src/pages/rt/dashboard.js — UPGRADED
import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import {
  getAllKencleng,
  getPendingSetoran,
  getSetoranStats,
  getTrendBulanan,
  getKenclengWithStats,
} from '../../services/kenclengService';
import { formatRupiah, formatTimeAgo } from '../../utils/formatter';
import { SkeletonCard } from '../../components/common/Loading';
import { useNavigate } from 'react-router-dom';
import { RT_NAME } from '../../config/constants';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

const StatCard = ({ icon, label, value, sub, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff', borderRadius: 'var(--radius-lg)', padding: '16px',
      boxShadow: 'var(--shadow-sm)', borderTop: `3px solid ${color}`,
      cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.15s, box-shadow 0.15s',
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

const PeriodBadge = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', border: 'none', background: active ? 'var(--hijau)' : 'var(--abu-100)', color: active ? '#fff' : 'var(--abu-500)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{label}</button>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: '10px 14px', fontSize: '0.8rem' }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: 'var(--abu-700)' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {formatRupiah(p.value)}</p>)}
    </div>
  );
};

const SectionHeader = ({ title, action, actionLabel }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
    <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
    {action && <button onClick={action} style={{ fontSize: '0.8rem', color: 'var(--hijau)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{actionLabel} →</button>}
  </div>
);

const RTDashboardPage = () => {
  const [kenclengList, setKenclengList] = useState([]);
  const [kenclengStats, setKenclengStats] = useState([]);
  const [pendingSetoran, setPendingSetoran] = useState([]);
  const [setoranStats, setSetoranStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [trendPeriod, setTrendPeriod] = useState(6);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [kl, ps, stats, ks] = await Promise.all([
        getAllKencleng(), getPendingSetoran(), getSetoranStats(), getKenclengWithStats(),
      ]);
      setKenclengList(kl); setPendingSetoran(ps); setSetoranStats(stats); setKenclengStats(ks);
    } finally { setLoading(false); }
  }, []);

  const loadTrend = useCallback(async (n) => {
    setLoadingTrend(true);
    try { setTrendData(await getTrendBulanan(n)); }
    finally { setLoadingTrend(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadTrend(trendPeriod); }, [trendPeriod, loadTrend]);

  const totalSaldo = kenclengList.reduce((a, k) => a + (k.saldo || 0), 0);
  const totalTarget = kenclengList.reduce((a, k) => a + (k.target || 0), 0);
  const pct = totalTarget > 0 ? Math.round((totalSaldo / totalTarget) * 100) : 0;
  const kenclengAktif = kenclengList.filter(k => k.status === 'aktif').length;
  const kenclengFull = kenclengList.filter(k => (k.saldo || 0) >= (k.target || 1)).length;
  const kenclengBelumSetoran = kenclengStats.filter(k => k.jumlahSetoran === 0 && k.status === 'aktif');
  const pieData = [
    { name: 'Penuh', value: kenclengFull, color: '#e8a020' },
    { name: 'Proses', value: Math.max(0, kenclengAktif - kenclengFull), color: '#1a6b3c' },
    { name: 'Belum Setor', value: kenclengBelumSetoran.length, color: '#c5bfb5' },
  ].filter(d => d.value > 0);

  return (
    <div className="app-layout">
      <Header title="Dashboard RT" subtitle={RT_NAME}
        rightAction={
          <button onClick={loadData} style={{ background: 'var(--hijau-pale)', color: 'var(--hijau)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            🔄 Refresh
          </button>
        }
      />

      <div className="page-content">

        {/* Pending Alert */}
        {!loading && pendingSetoran.length > 0 && (
          <div onClick={() => navigate('/rt/setoran')} style={{ background: 'linear-gradient(135deg, #fdeaea, #fff)', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ width: 40, height: 40, background: '#fdeaea', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>{pendingSetoran.length} Setoran Menunggu Konfirmasi</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--abu-500)' }}>Total: {formatRupiah(pendingSetoran.reduce((a, s) => a + (s.nominal || 0), 0))} · Ketuk untuk konfirmasi</div>
            </div>
            <span style={{ color: 'var(--danger)', fontSize: '1.1rem' }}>→</span>
          </div>
        )}

        {/* Tab Nav */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[{ id: 'overview', label: '📊 Ringkasan' }, { id: 'kencleng', label: '🪣 Kencleng' }, { id: 'trend', label: '📈 Tren' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '9px 4px', background: activeTab === tab.id ? 'var(--hijau)' : '#fff', color: activeTab === tab.id ? '#fff' : 'var(--abu-500)', border: `1.5px solid ${activeTab === tab.id ? 'var(--hijau)' : 'var(--abu-200)'}`, borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>{tab.label}</button>
          ))}
        </div>

        {/* === OVERVIEW === */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <StatCard icon="💰" label="Total Terkumpul" value={formatRupiah(totalSaldo)} color="var(--hijau)" />
                <StatCard icon="🪣" label="Kencleng Aktif" value={kenclengAktif} sub={`${kenclengFull} sudah penuh`} color="var(--kuning)" />
                <StatCard icon="⏳" label="Setoran Pending" value={pendingSetoran.length} sub={pendingSetoran.length > 0 ? 'Perlu konfirmasi' : 'Semua clear ✓'} color={pendingSetoran.length > 0 ? 'var(--danger)' : 'var(--hijau)'} onClick={() => navigate('/rt/setoran')} />
                <StatCard icon="📊" label="Pencapaian" value={`${pct}%`} sub={`dari ${formatRupiah(totalTarget)}`} color="var(--info)" />
              </div>
            )}

            {setoranStats && (
              <>
                <SectionHeader title="Setoran Diterima" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                  {[{ label: 'Hari Ini', value: setoranStats.hariIni, icon: '☀️' }, { label: 'Minggu Ini', value: setoranStats.mingguIni, icon: '📅' }, { label: 'Bulan Ini', value: setoranStats.bulanIni, icon: '🗓️' }].map(s => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '12px 10px', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--hijau)', fontFamily: 'var(--font-display)' }}>{formatRupiah(s.value)}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--abu-400)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!loading && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Progress Keseluruhan RT</span>
                  <span style={{ fontWeight: 800, color: pct >= 100 ? 'var(--kuning)' : 'var(--hijau)', fontSize: '0.9rem' }}>{pct}%</span>
                </div>
                <div style={{ height: 10, background: 'var(--abu-100)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--kuning)' : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))', borderRadius: 5, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--abu-400)' }}>
                  <span>{formatRupiah(totalSaldo)} terkumpul</span>
                  <span>Target {formatRupiah(totalTarget)}</span>
                </div>
              </div>
            )}

            {!loading && pieData.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
                <SectionHeader title="Distribusi Status Kencleng" />
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Tooltip formatter={(v) => `${v} kencleng`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {!loading && kenclengBelumSetoran.length > 0 && (
              <div style={{ background: 'var(--kuning-pale)', border: '1px solid var(--kuning)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: 'var(--kuning)', fontSize: '0.88rem', marginBottom: 4 }}>⚠️ {kenclengBelumSetoran.length} Kencleng Belum Pernah Setor</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginBottom: 10 }}>
                  {kenclengBelumSetoran.slice(0, 3).map(k => k.nama).join(', ')}{kenclengBelumSetoran.length > 3 ? ` +${kenclengBelumSetoran.length - 3} lainnya` : ''}
                </div>
                <button onClick={() => navigate('/rt/setoran')} style={{ background: 'var(--kuning)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Input Setoran →</button>
              </div>
            )}
          </div>
        )}

        {/* === KENCLENG === */}
        {activeTab === 'kencleng' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <SectionHeader title={`Semua Kencleng (${kenclengStats.length})`} action={() => navigate('/admin/kelola-kencleng')} actionLabel="Kelola" />
            {loading ? [1,2,3,4].map(i => <SkeletonCard key={i} style={{ marginBottom: 10 }} />) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {kenclengStats.map((k) => {
                  const p = Math.min(100, Math.round(((k.saldo||0) / (k.target||500000)) * 100));
                  const isFull = p >= 100;
                  return (
                    <div key={k.id} style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)', borderLeft: `3px solid ${isFull ? 'var(--kuning)' : k.jumlahSetoran === 0 ? 'var(--abu-300)' : 'var(--hijau)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{k.nama}</span>
                          {isFull && <span style={{ marginLeft: 6, fontSize: '0.7rem', background: 'var(--kuning-pale)', color: 'var(--kuning)', padding: '1px 7px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>PENUH 🎉</span>}
                          {k.jumlahSetoran === 0 && <span style={{ marginLeft: 6, fontSize: '0.7rem', background: 'var(--abu-100)', color: 'var(--abu-400)', padding: '1px 7px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Belum setor</span>}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--hijau)', fontSize: '0.88rem' }}>{formatRupiah(k.saldo || 0)}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--abu-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ height: '100%', width: `${p}%`, background: isFull ? 'var(--kuning)' : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))', borderRadius: 3 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--abu-400)' }}>
                        <span>{p}% dari {formatRupiah(k.target)}</span>
                        <span>{k.jumlahSetoran > 0 ? `${k.jumlahSetoran}× · terakhir ${formatTimeAgo(k.lastSetoran)}` : 'Belum ada setoran'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === TREND === */}
        {activeTab === 'trend' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tren Setoran</h3>
              <div style={{ display: 'flex', gap: 6 }}>{[3, 6, 12].map(n => <PeriodBadge key={n} label={`${n}B`} active={trendPeriod === n} onClick={() => setTrendPeriod(n)} />)}</div>
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-700)', marginBottom: 12 }}>Total Diterima per Bulan</div>
              {loadingTrend ? <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-md)' }} /> : (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a6b3c" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#1a6b3c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: '#9e9890' }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="total" name="Total" stroke="#1a6b3c" strokeWidth={2} fill="url(#colorTotal)" dot={{ r: 3, fill: '#1a6b3c' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-700)', marginBottom: 12 }}>Jumlah Transaksi per Bulan</div>
              {loadingTrend ? <div className="skeleton" style={{ height: 130, borderRadius: 'var(--radius-md)' }} /> : (
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: '#9e9890' }} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <Tooltip formatter={v => `${v} transaksi`} contentStyle={{ fontSize: '0.8rem', borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(28,26,22,0.10)' }} />
                    <Bar dataKey="count" name="Transaksi" radius={[4,4,0,0]}>
                      {trendData.map((_, i) => <Cell key={i} fill={i === trendData.length - 1 ? '#e8a020' : '#2d9155'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {!loadingTrend && trendData.length >= 2 && (() => {
              const last = trendData[trendData.length - 1];
              const prev = trendData[trendData.length - 2];
              const growth = prev.total > 0 ? Math.round(((last.total - prev.total) / prev.total) * 100) : 0;
              return (
                <div style={{ background: growth >= 0 ? 'var(--hijau-pale)' : '#fdeaea', borderRadius: 'var(--radius-lg)', padding: '14px 16px', border: `1px solid ${growth >= 0 ? '#1a6b3c' : '#c0392b'}22` }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: growth >= 0 ? 'var(--hijau)' : 'var(--danger)' }}>
                    {growth >= 0 ? '📈' : '📉'} {growth >= 0 ? '+' : ''}{growth}% dibanding bulan lalu
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginTop: 4 }}>
                    Bulan ini: {formatRupiah(last.total)} ({last.count} transaksi) · Bulan lalu: {formatRupiah(prev.total)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
      <MobileNav />
    </div>
  );
};

export default RTDashboardPage;
