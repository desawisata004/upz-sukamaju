import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import ScanQR from '../../components/kencleng/ScanQR';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { getKenclengById, createSetoran } from '../../services/kenclengService';
import { formatRupiah } from '../../utils/formatter';
import { useAuth } from '../../hooks/useAuth';
import { METODE_SETORAN } from '../../config/constants';

const InputManual = ({ kencleng, onSuccess, onCancel }) => {
  const { userData } = useAuth();
  const [nominal, setNominal] = useState('');
  const [metode, setMetode] = useState(METODE_SETORAN.TUNAI);
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async () => {
    const num = parseInt(nominal.replace(/[^0-9]/g, '') || '0', 10);
    if (num < 1000) {
      setAlert({ type: 'error', message: 'Minimal setoran Rp 1.000' });
      return;
    }

    setLoading(true);
    try {
      await createSetoran({
        kenclengId: kencleng.id,
        userId: kencleng.userId,
        nominal: num,
        metode,
        catatan: catatan.trim(),
        inputBy: userData?.uid || 'rt',
        foto: foto // base64 atau URL
      });
      setAlert({ type: 'success', message: '✅ Setoran berhasil dicatat!' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setAlert({ type: 'error', message: '❌ Gagal: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFoto = () => {
    // Implementasi ambil foto
    alert('Fitur ambil foto akan diimplementasikan');
  };

  const NOMINAL_PRESETS = [5000, 10000, 20000, 50000, 100000];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Info Kencleng */}
      <Card style={{ background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>ID Kencleng</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{kencleng.id}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>RT {kencleng.rt}/{kencleng.rw}</div>
          </div>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{kencleng.nama}</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.85 }}>
          Saldo bulan lalu: {formatRupiah(kencleng.saldo || 0)}
        </div>
      </Card>

      {/* Form Setoran */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 8 }}>
          Jumlah Setoran (Rp)
        </label>
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: nominal ? 'var(--hijau)' : 'var(--abu-300)', textAlign: 'center', padding: '12px 0' }}>
          {nominal ? formatRupiah(parseInt(nominal.replace(/[^0-9]/g, '') || '0', 10)) : 'Rp 0'}
        </div>
        <input
          type="number"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          placeholder="Masukkan nominal..."
          style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem', marginBottom: 10 }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {NOMINAL_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setNominal(String(p))}
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--abu-200)', background: parseInt(nominal) === p ? 'var(--hijau)' : '#fff', color: parseInt(nominal) === p ? '#fff' : 'var(--abu-700)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {formatRupiah(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Foto Bukti */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 8 }}>
          Foto Bukti (opsional)
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleFoto}
            style={{ flex: 1, padding: '12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            📸 AMBIL FOTO
          </button>
          <button
            onClick={() => alert('Fitur gallery akan diimplementasikan')}
            style={{ flex: 1, padding: '12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            📁 GALLERY
          </button>
        </div>
        {foto && (
          <div style={{ marginTop: 10, position: 'relative' }}>
            <img src={foto} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
            <button onClick={() => setFoto(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}>✕</button>
          </div>
        )}
      </div>

      {/* Metode Setoran */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 8 }}>
          Metode Setor
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { id: METODE_SETORAN.TUNAI, label: 'Tunai', icon: '💵' },
            { id: METODE_SETORAN.TRANSFER, label: 'Transfer', icon: '🏦' },
            { id: METODE_SETORAN.QRIS, label: 'QRIS', icon: '📱' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMetode(m.id)}
              style={{ flex: 1, padding: '10px', background: metode === m.id ? 'var(--hijau)' : '#fff', color: metode === m.id ? '#fff' : 'var(--abu-700)', border: `1.5px solid ${metode === m.id ? 'var(--hijau)' : 'var(--abu-200)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Catatan */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 8 }}>
          Catatan
        </label>
        <input
          type="text"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Uang receh dari warung..."
          style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
        />
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} style={{ flexShrink: 0 }}>
            Batal
          </Button>
        )}
        <Button fullWidth onClick={handleSubmit} loading={loading} icon="💰" disabled={!nominal}>
          SIMPAN SETORAN
        </Button>
      </div>
    </div>
  );
};

const RTSetoranPage = () => {
  const [mode, setMode] = useState('pilih'); // pilih | scan | manual
  const [kencleng, setKencleng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [manualId, setManualId] = useState('');

  const handleScanSuccess = async (data) => {
    setLoading(true);
    try {
      const k = await getKenclengById(data.kenclengId);
      if (!k) {
        setAlert({ type: 'error', message: 'Kencleng tidak ditemukan.' });
        return;
      }
      setKencleng(k);
      setMode('manual');
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat data kencleng.' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualId.trim()) {
      setAlert({ type: 'error', message: 'Masukkan ID Kencleng' });
      return;
    }

    setLoading(true);
    try {
      const k = await getKenclengById(manualId.trim());
      if (!k) {
        setAlert({ type: 'error', message: 'Kencleng tidak ditemukan.' });
        return;
      }
      setKencleng(k);
      setMode('manual');
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat data kencleng.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetoranSuccess = () => {
    setAlert({ type: 'success', message: '✅ Setoran berhasil dicatat!' });
    setMode('pilih');
    setKencleng(null);
    setManualId('');
  };

  return (
    <div className="app-layout">
      <Header
        title="INPUT SETORAN HARIAN"
        subtitle="Ketua RT 01 - Sukamaju"
        showBack={mode !== 'pilih'}
      />

      <div className="page-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={3000}
          />
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        )}

        {!loading && mode === 'pilih' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card
              onClick={() => setMode('scan')}
              style={{ textAlign: 'center', padding: '32px 20px', cursor: 'pointer' }}
              hoverable
            >
              <div style={{ fontSize: '4rem', marginBottom: 12 }}>📷</div>
              <h3 style={{ marginBottom: 8 }}>SCAN QR KENCLENG</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)' }}>
                Arahkan kamera ke QR Code kencleng warga
              </p>
            </Card>

            <div style={{ textAlign: 'center', position: 'relative' }}>
              <span style={{ background: 'var(--coklat-pale)', padding: '0 12px', color: 'var(--abu-400)', fontSize: '0.8rem' }}>atau</span>
              <hr style={{ border: 'none', borderTop: '1px solid var(--abu-200)', marginTop: -9 }} />
            </div>

            <Card style={{ padding: '24px 20px' }}>
              <h3 style={{ marginBottom: 16 }}>⌨️ INPUT MANUAL ID</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Contoh: KCLG-0102-001"
                  style={{ flex: 1, padding: '12px 16px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontFamily: 'monospace' }}
                />
                <button
                  onClick={handleManualSubmit}
                  style={{ padding: '0 24px', background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cari
                </button>
              </div>
            </Card>
          </div>
        )}

        {!loading && mode === 'scan' && (
          <ScanQR onScanSuccess={handleScanSuccess} onCancel={() => setMode('pilih')} />
        )}

        {!loading && mode === 'manual' && kencleng && (
          <InputManual
            kencleng={kencleng}
            onSuccess={handleSetoranSuccess}
            onCancel={() => {
              setMode('pilih');
              setKencleng(null);
              setManualId('');
            }}
          />
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default RTSetoranPage;