import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { getKenclengById, getRiwayatSetoran } from '../../services/kenclengService';
import { formatRupiah, formatTanggal, formatProgress } from '../../utils/formatter';
import { DESA_NAME, KECAMATAN_NAME, ROUTES } from '../../config/constants';

const RiwayatTable = ({ riwayat }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--abu-200)' }}>
          <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--abu-500)' }}>Tgl</th>
          <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--abu-500)' }}>Jumlah</th>
          <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--abu-500)' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {riwayat.map((r, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid var(--abu-100)' }}>
            <td style={{ padding: '12px 8px', fontSize: '0.8rem' }}>{r.tanggal}</td>
            <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 600, textAlign: 'right' }}>{formatRupiah(r.nominal)}</td>
            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
              <span style={{ 
                background: r.status === 'diterima' ? 'var(--hijau-pale)' : 'var(--kuning-pale)', 
                color: r.status === 'diterima' ? 'var(--hijau)' : 'var(--kuning)', 
                padding: '2px 8px', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '0.7rem', 
                fontWeight: 600 
              }}>
                {r.status === 'diterima' ? '✓ Diterima' : '⏳ Pending'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PortalPage = () => {
  const navigate = useNavigate();
  const [kenclengId, setKenclengId] = useState('');
  const [mode, setMode] = useState('input'); // input | scan | result
  const [kencleng, setKencleng] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleCari = async () => {
    if (!kenclengId.trim()) {
      setAlert({ type: 'error', message: 'Masukkan ID Kencleng' });
      return;
    }

    setLoading(true);
    try {
      const k = await getKenclengById(kenclengId.trim());
      if (!k) {
        setAlert({ type: 'error', message: 'Kencleng tidak ditemukan' });
        setLoading(false);
        return;
      }

      const riwayatData = await getRiwayatSetoran(k.id);
      
      // Format riwayat
      const formattedRiwayat = riwayatData.map(r => ({
        ...r,
        tanggal: r.createdAt ? formatTanggal(r.createdAt) : '-',
        status: r.status || 'pending'
      }));

      setKencleng(k);
      setRiwayat(formattedRiwayat);
      setMode('result');
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    // Navigate ke halaman scan
    navigate('/scan');
  };

  const totalBulanIni = riwayat
    .filter(r => r.status === 'diterima')
    .reduce((a, r) => a + r.nominal, 0);

  const progress = kencleng ? formatProgress(totalBulanIni, kencleng.target || 100000) : 0;

  return (
    <div className="app-layout">
      <Header
        title="PORTAL KENCLENG DIGITAL"
        subtitle={`${DESA_NAME} · ${KECAMATAN_NAME}`}
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={3000} />}

        {mode === 'input' && (
          <Card style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏠</div>
            <h3 style={{ marginBottom: 20 }}>MASUKKAN ID KENCLENG ANDA</h3>
            
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input
                type="text"
                value={kenclengId}
                onChange={(e) => setKenclengId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCari()}
                placeholder="Contoh: KCLG-0102-001"
                style={{ 
                  flex: 1, 
                  padding: '14px 16px', 
                  border: '1.5px solid var(--abu-200)', 
                  borderRadius: 'var(--radius-md)', 
                  fontSize: '0.9rem', 
                  fontFamily: 'monospace' 
                }}
              />
              <button
                onClick={handleCari}
                disabled={loading}
                style={{ 
                  padding: '0 24px', 
                  background: loading ? 'var(--abu-200)' : 'var(--hijau)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 'var(--radius-md)', 
                  fontWeight: 600, 
                  cursor: loading ? 'not-allowed' : 'pointer' 
                }}
              >
                {loading ? '⏳' : '🔍 Cari'}
              </button>
            </div>

            <div style={{ position: 'relative', margin: '20px 0' }}>
              <span style={{ background: 'var(--coklat-pale)', padding: '0 12px', color: 'var(--abu-400)', fontSize: '0.8rem' }}>atau</span>
              <hr style={{ border: 'none', borderTop: '1px solid var(--abu-200)', marginTop: -9 }} />
            </div>

            <Button variant="secondary" onClick={handleScan} icon="📷" fullWidth>
              SCAN QR CODE
            </Button>
          </Card>
        )}

        {mode === 'scan' && (
          <Card>
            <p style={{ textAlign: 'center', marginBottom: 16 }}>Mengarahkan ke halaman scan...</p>
            <div style={{ height: 300, background: 'var(--hitam)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              📷 Memuat kamera...
            </div>
            <Button variant="ghost" onClick={() => setMode('input')} style={{ marginTop: 16 }}>
              Kembali
            </Button>
          </Card>
        )}

        {mode === 'result' && kencleng && (
          <>
            {/* Info Kencleng */}
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>ID Kencleng</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{kencleng.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>RT/RW</div>
                  <div style={{ fontWeight: 600 }}>{kencleng.rt || '-'}/{kencleng.rw || '-'}</div>
                </div>
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>{kencleng.nama}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--abu-500)' }}>{kencleng.alamat || '-'}</div>
            </Card>

            {/* Riwayat Setoran */}
            <Card style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 12 }}>RIWAYAT SETORAN ANDA</h3>
              <RiwayatTable riwayat={riwayat} />
              <div style={{ 
                marginTop: 16, 
                paddingTop: 12, 
                borderTop: '1px solid var(--abu-100)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 600 
              }}>
                <span>Total Bulan Ini:</span>
                <span style={{ color: 'var(--hijau)' }}>{formatRupiah(totalBulanIni)}</span>
              </div>
            </Card>

            {/* Prestasi */}
            <Card>
              <h3 style={{ marginBottom: 12 }}>🏆 PRESTASI ANDA</h3>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem' }}>- Setoran rutin 4 minggu</span>
                  <span style={{ color: 'var(--kuning)' }}>✅</span>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem' }}>Target bulanan</span>
                    <span style={{ fontWeight: 600 }}>{totalBulanIni}/{formatRupiah(kencleng.target || 100000)} ({progress}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--abu-100)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${progress}%`, 
                      background: progress >= 100 ? 'var(--kuning)' : 'var(--hijau)' 
                    }} />
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                icon="📊" 
                fullWidth 
                onClick={() => alert('Fitur laporan tahunan akan segera hadir')}
              >
                LAPORAN TAHUNAN
              </Button>
            </Card>
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default PortalPage;