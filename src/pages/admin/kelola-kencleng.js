import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import { getAllKencleng, updateKenclengStatus, createKencleng } from '../../services/kenclengService';
import { getWargaUsers } from '../../services/userService';
import { generateQRCodeDataURL, generateQRData } from '../../utils/qrGenerator';
import { formatRupiah, formatProgress } from '../../utils/formatter';
import { STATUS_KENCLENG, TARGET_TABUNGAN } from '../../config/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';

const KenclengAdminItem = ({ k, onStatusChange, onShowQR }) => {
  const progress = formatProgress(k.saldo, k.target);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {k.nama}
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              background: k.status === STATUS_KENCLENG.AKTIF ? 'var(--hijau-pale)' : '#f5f5f5',
              color: k.status === STATUS_KENCLENG.AKTIF ? 'var(--hijau)' : 'var(--abu-400)',
            }}
          >
            {k.status}
          </span>
        </div>
        <div style={{ fontWeight: 800, color: 'var(--hijau)', fontSize: '1rem', marginLeft: 8 }}>
          {formatRupiah(k.saldo || 0)}
        </div>
      </div>

      <div style={{ height: 6, background: 'var(--abu-100)', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: progress >= 100 ? 'var(--kuning)' : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))',
            borderRadius: 3,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--abu-400)', marginBottom: 12 }}>
        <span>Target: {formatRupiah(k.target)}</span>
        <span>{progress}%</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => onShowQR(k)}
          style={{
            padding: '6px 14px',
            background: 'var(--hijau-pale)',
            color: 'var(--hijau)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📱 QR Code
        </button>

        {k.status === STATUS_KENCLENG.AKTIF ? (
          <button
            onClick={() => onStatusChange(k.id, STATUS_KENCLENG.NONAKTIF)}
            style={{
              padding: '6px 14px',
              background: '#fdeaea',
              color: 'var(--danger)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Nonaktifkan
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(k.id, STATUS_KENCLENG.AKTIF)}
            style={{
              padding: '6px 14px',
              background: 'var(--hijau-pale)',
              color: 'var(--hijau)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Aktifkan
          </button>
        )}
      </div>
    </div>
  );
};

const QRModal = ({ kencleng, onClose }) => {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (!kencleng) return;
    const data = generateQRData(kencleng.id, kencleng.userId, kencleng.nama);
    generateQRCodeDataURL(data).then(setQrUrl);
  }, [kencleng]);

  if (!kencleng) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28,26,22,0.6)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 500,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '28px 24px 48px',
          width: '100%',
          maxWidth: 480,
          animation: 'slideUp 0.3s ease',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: 'var(--abu-200)',
            borderRadius: 2,
            margin: '-12px auto 20px',
          }}
        />

        <h3 style={{ marginBottom: 4 }}>{kencleng.nama}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)', marginBottom: 20 }}>
          QR Code untuk setoran
        </p>

        {qrUrl ? (
          <img
            src={qrUrl}
            alt="QR Code Kencleng"
            style={{
              width: 220,
              height: 220,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--abu-100)',
              boxShadow: 'var(--shadow-md)',
            }}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner />
          </div>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--abu-400)', margin: '16px 0 20px' }}>
          Tunjukkan QR ini kepada pengurus RT saat menyetor
        </p>

        <Button variant="ghost" onClick={onClose} fullWidth>
          Tutup
        </Button>
      </div>
    </div>
  );
};

const TambahKenclengModal = ({ show, onClose, onSuccess, users }) => {
  const [form, setForm] = useState({
    userId: '',
    nama: '',
    target: TARGET_TABUNGAN
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async () => {
    if (!form.userId) {
      setAlert({ type: 'error', message: 'Pilih warga pemilik kencleng' });
      return;
    }
    if (!form.nama.trim()) {
      setAlert({ type: 'error', message: 'Nama kencleng harus diisi' });
      return;
    }
    if (form.target < 1000) {
      setAlert({ type: 'error', message: 'Target minimal Rp 1.000' });
      return;
    }

    setLoading(true);
    try {
      await createKencleng({
        userId: form.userId,
        nama: form.nama.trim(),
        target: form.target
      });
      
      setAlert({ type: 'success', message: '✅ Kencleng berhasil ditambahkan!' });
      
      setForm({ userId: '', nama: '', target: TARGET_TABUNGAN });
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28,26,22,0.6)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 500,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '24px 20px 40px',
          width: '100%',
          maxWidth: 480,
          animation: 'slideUp 0.3s ease',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: 'var(--abu-200)',
            borderRadius: 2,
            margin: '-8px auto 20px',
          }}
        />

        <h3 style={{ fontSize: '1.3rem', marginBottom: 20, textAlign: 'center' }}>
          ➕ Tambah Kencleng Baru
        </h3>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={3000}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--abu-500)',
              marginBottom: 6,
              textTransform: 'uppercase',
            }}>
              Pilih Warga <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              value={form.userId}
              onChange={(e) => setForm({...form, userId: e.target.value})}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid var(--abu-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
              }}
            >
              <option value="">-- Pilih Warga --</option>
              {users.map(user => (
                <option key={user.uid} value={user.uid}>
                  {user.nama} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--abu-500)',
              marginBottom: 6,
              textTransform: 'uppercase',
            }}>
              Nama Kencleng <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({...form, nama: e.target.value})}
              placeholder="Contoh: Kencleng Keluarga"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid var(--abu-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--abu-500)',
              marginBottom: 6,
              textTransform: 'uppercase',
            }}>
              Target Tabungan (Rp)
            </label>
            <input
              type="number"
              value={form.target}
              onChange={(e) => setForm({...form, target: Number(e.target.value)})}
              placeholder="500000"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid var(--abu-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
              }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--abu-400)', marginTop: 4 }}>
              Default: Rp 500.000
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--abu-100)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--hijau)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? 'Menyimpan...' : '➕ Tambah Kencleng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminKelola = () => {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [qrKencleng, setQrKencleng] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [kenclengData, usersData] = await Promise.all([
        getAllKencleng(),
        getWargaUsers()
      ]);
      setList(kenclengData);
      setUsers(usersData);
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateKenclengStatus(id, status);
      setAlert({ type: 'success', message: '✅ Status kencleng diperbarui.' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  const handleTambahSuccess = () => {
    setAlert({ type: 'success', message: '✅ Kencleng berhasil ditambahkan!' });
    loadData();
  };

  const filtered = list.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Header 
        title="Kelola Kencleng" 
        showBack
        rightAction={
          <button
            onClick={() => setShowTambahModal(true)}
            style={{
              background: 'var(--hijau)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>➕</span>
            <span>Tambah</span>
          </button>
        }
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

        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari kencleng..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1.5px solid var(--abu-200)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--hijau)' }}>
                {list.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--abu-500)' }}>Total Kencleng</div>
            </div>
            <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--kuning)' }}>
                {users.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--abu-500)' }}>Warga Terdaftar</div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>Tidak ada kencleng ditemukan</p>
              </div>
            ) : (
              filtered.map((k) => (
                <KenclengAdminItem
                  key={k.id}
                  k={k}
                  onStatusChange={handleStatusChange}
                  onShowQR={setQrKencleng}
                />
              ))
            )}
          </div>
        )}
      </div>

      {qrKencleng && (
        <QRModal kencleng={qrKencleng} onClose={() => setQrKencleng(null)} />
      )}

      <TambahKenclengModal
        show={showTambahModal}
        onClose={() => setShowTambahModal(false)}
        onSuccess={handleTambahSuccess}
        users={users}
      />

      <MobileNav />
    </div>
  );
};

export default AdminKelola;