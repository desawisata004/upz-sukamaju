import React, { useState } from 'react';
import { createSetoran } from '../../services/kenclengService';
import { validateNominal } from '../../utils/validator';
import { formatRupiah } from '../../utils/formatter';
import { NOMINAL_PRESETS } from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Card from '../common/Card';

const InputSetoran = ({ kencleng, onSuccess, onCancel }) => {
  const { userData } = useAuth();
  const [nominal, setNominal] = useState('');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handlePreset = (val) => {
    setNominal(String(val));
  };

  const handleSubmit = async () => {
    const numericString = nominal.replace(/[^0-9]/g, '');
    const num = parseInt(numericString, 10);
    
    const validation = validateNominal(num);
    if (!validation.valid) {
      setAlert({ type: 'error', message: validation.message });
      return;
    }

    setLoading(true);
    try {
      await createSetoran({
        kenclengId: kencleng.id,
        userId: kencleng.userId,
        nominal: num,
        catatan: catatan.trim(),
        inputBy: userData?.uid || 'rt',
      });
      setAlert({ type: 'success', message: '✅ Setoran berhasil dicatat! Menunggu konfirmasi.' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setAlert({ type: 'error', message: '❌ Gagal mencatat setoran: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const displayNominal = nominal
    ? formatRupiah(parseInt(nominal.replace(/[^0-9]/g, '') || '0', 10))
    : 'Rp 0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card
        style={{
          background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))',
          color: '#fff',
        }}
        shadow="none"
      >
        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 4 }}>Kencleng</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{kencleng.nama}</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.85, marginTop: 4 }}>
          Saldo: {formatRupiah(kencleng.saldo || 0)}
        </div>
      </Card>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--abu-500)',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          Nominal Setoran
        </label>

        <div
          style={{
            fontSize: '2rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: nominal ? 'var(--hijau)' : 'var(--abu-300)',
            textAlign: 'center',
            padding: '16px 0 8px',
          }}
        >
          {displayNominal}
        </div>

        <input
          type="number"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          placeholder="Masukkan nominal..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1.5px solid var(--abu-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
          }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {NOMINAL_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => handlePreset(p)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--abu-200)',
                background: parseInt(nominal) === p ? 'var(--hijau)' : '#fff',
                color: parseInt(nominal) === p ? '#fff' : 'var(--abu-700)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {formatRupiah(p)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--abu-500)',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          Catatan (opsional)
        </label>
        <input
          type="text"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Setoran minggu ini..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1.5px solid var(--abu-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
          }}
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
        <Button 
          fullWidth 
          onClick={handleSubmit} 
          loading={loading} 
          icon="💰"
          disabled={!nominal}
        >
          Catat Setoran
        </Button>
      </div>
    </div>
  );
};

export default InputSetoran;