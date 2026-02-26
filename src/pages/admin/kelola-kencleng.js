// Tambahkan di bagian atas dengan import lain
import { 
  getAllKencleng, 
  updateKenclengStatus, 
  createKencleng,
  deleteKencleng 
} from '../../services/kenclengService';

// Komponen Modal Hapus (tambahkan sebelum komponen utama)
const DeleteConfirmationModal = ({ kencleng, onClose, onConfirm, loading }) => (
  <div 
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(28,26,22,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 600,
      padding: '20px',
      animation: 'fadeIn 0.2s ease',
    }}
    onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
  >
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 24px',
        width: '100%',
        maxWidth: 360,
        animation: 'slideUp 0.3s ease',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
      <h3 style={{ marginBottom: 8 }}>Hapus Kencleng?</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)', marginBottom: 8 }}>
        <strong>{kencleng?.nama}</strong> akan dinonaktifkan.
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--danger)', marginBottom: 24 }}>
        Kencleng dengan riwayat setoran tidak dapat dihapus permanen.
      </p>
      
      <div style={{ 
        background: 'var(--abu-100)', 
        borderRadius: 'var(--radius-md)', 
        padding: '12px', 
        marginBottom: 20, 
        textAlign: 'left' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--abu-500)' }}>Saldo</span>
          <span style={{ fontWeight: 700, color: 'var(--hijau)' }}>
            {kencleng?.saldo ? formatRupiah(kencleng.saldo) : 'Rp 0'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--abu-500)' }}>Target</span>
          <span style={{ fontWeight: 600 }}>
            {kencleng?.target ? formatRupiah(kencleng.target) : 'Rp 0'}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 10 }}>
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
            fontFamily: 'var(--font-body)',
          }}
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            background: 'var(--danger)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'var(--font-body)',
          }}
        >
          {loading ? '⏳...' : '🗑️ Hapus'}
        </button>
      </div>
    </div>
  </div>
);

// Update komponen KenclengAdminItem untuk menambahkan tombol hapus
const KenclengAdminItem = ({ k, onStatusChange, onShowQR, onDelete }) => {
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
            fontFamily: 'var(--font-body)',
          }}
        >
          📱 QR
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
              fontFamily: 'var(--font-body)',
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
              fontFamily: 'var(--font-body)',
            }}
          >
            Aktifkan
          </button>
        )}
        
        <button
          onClick={() => onDelete(k)}
          style={{
            padding: '6px 14px',
            background: '#fdeaea',
            color: 'var(--danger)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  );
};

// Di dalam komponen AdminKelola, tambahkan state untuk delete
const AdminKelola = () => {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [qrKencleng, setQrKencleng] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState('');

  // ... (kode lainnya tetap sama)

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      await deleteKencleng(deleteTarget.id);
      setAlert({ type: 'success', message: `✅ Kencleng ${deleteTarget.nama} dinonaktifkan.` });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Di bagian render, tambahkan modal hapus
  return (
    <div className="app-layout">
      {/* ... kode lainnya ... */}
      
      {deleteTarget && (
        <DeleteConfirmationModal
          kencleng={deleteTarget}
          loading={deleteLoading}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
      
      {/* ... kode lainnya ... */}
    </div>
  );
};