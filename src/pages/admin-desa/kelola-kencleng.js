import React, { useEffect, useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { getAllKencleng, getAllRT, createKencleng } from '../../services/kenclengService';
import { generateQRCodeDataURL, generateQRData } from '../../utils/qrGenerator';
import { formatRupiah, formatTanggal } from '../../utils/formatter';
import { DESA_NAME, KECAMATAN_NAME, KABUPATEN_NAME } from '../../config/constants';

const KenclengTable = ({ kenclengList, onShowQR, onDetail }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return kenclengList.slice(start, start + itemsPerPage);
  }, [kenclengList, currentPage]);

  const totalPages = Math.ceil(kenclengList.length / itemsPerPage);

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr style={{ background: 'var(--hijau)', color: '#fff' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>No</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID Kencleng</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Kepala Keluarga</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>RT/RW</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Setoran Bulan Ini</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((k, idx) => {
              const no = (currentPage - 1) * itemsPerPage + idx + 1;
              return (
                <tr key={k.id} style={{ borderBottom: '1px solid var(--abu-200)' }}>
                  <td style={{ padding: '16px 12px' }}>{no}</td>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                    <span style={{ fontFamily: 'monospace' }}>{k.id}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ fontWeight: 600 }}>{k.nama}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--abu-400)' }}>{k.alamat || '-'}</div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>{k.rt || '-'}/{k.rw || '-'}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(k.setoranBulanIni || 0)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Bulan ini</div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => onShowQR(k)}
                        style={{ padding: '4px 10px', background: 'var(--hijau-pale)', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        📱 QR
                      </button>
                      <button
                        onClick={() => onDetail(k)}
                        style={{ padding: '4px 10px', background: 'var(--abu-100)', color: 'var(--abu-700)', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        📊 Detail
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--abu-200)' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--abu-400)' }}>
          Hal {currentPage} dari {totalPages} · Total {kenclengList.length} kencleng
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ padding: '6px 12px', background: currentPage === 1 ? 'var(--abu-100)' : 'var(--hijau)', color: currentPage === 1 ? 'var(--abu-400)' : '#fff', border: 'none', borderRadius: 'var(--radius-full)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ padding: '6px 12px', background: currentPage === totalPages ? 'var(--abu-100)' : 'var(--hijau)', color: currentPage === totalPages ? 'var(--abu-400)' : '#fff', border: 'none', borderRadius: 'var(--radius-full)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next →
          </button>
        </div>
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 24px',
          width: '100%',
          maxWidth: 400,
          animation: 'slideUp 0.3s ease',
          textAlign: 'center',
        }}
      >
        <h3 style={{ marginBottom: 4 }}>{kencleng.nama}</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginBottom: 4 }}>
          ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{kencleng.id}</span>
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginBottom: 16 }}>
          RT {kencleng.rt}/{kencleng.rw}
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
              margin: '0 auto 16px',
            }}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner />
          </div>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--abu-400)', margin: '8px 0 16px' }}>
          Tunjukkan QR ini ke Ketua RT saat menyetor
        </p>

        <Button variant="ghost" onClick={onClose} fullWidth>
          Tutup
        </Button>
      </div>
    </div>
  );
};

const TambahKenclengModal = ({ show, onClose, onSuccess, rtList }) => {
  const [form, setForm] = useState({
    rtId: '',
    nama: '',
    alamat: '',
    rt: '',
    rw: '',
    target: 500000
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async () => {
    if (!form.nama.trim()) {
      setAlert({ type: 'error', message: 'Nama kepala keluarga harus diisi' });
      return;
    }
    if (!form.rt) {
      setAlert({ type: 'error', message: 'RT harus diisi' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID Kencleng: KCLG-RT-XXX
      const rtPad = form.rt.padStart(2, '0');
      const rwPad = form.rw.padStart(2, '0');
      const count = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const kenclengId = `KCLG-${rtPad}${rwPad}-${count}`;

      await createKencleng({
        id: kenclengId,
        userId: form.rtId || `rt-${form.rt}`,
        nama: form.nama.trim(),
        alamat: form.alamat.trim(),
        rt: form.rt,
        rw: form.rw,
        target: form.target
      });
      
      setAlert({ type: 'success', message: '✅ Kencleng berhasil ditambahkan!' });
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
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
          maxWidth: 480,
          animation: 'slideUp 0.3s ease',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginBottom: 20 }}>➕ Tambah Kencleng Baru</h3>

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
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 6 }}>
              Nama Kepala Keluarga <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({...form, nama: e.target.value})}
              placeholder="Contoh: Ahmad S."
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 6 }}>
              Alamat
            </label>
            <input
              type="text"
              value={form.alamat}
              onChange={(e) => setForm({...form, alamat: e.target.value})}
              placeholder="Alamat lengkap"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 6 }}>
                RT <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.rt}
                onChange={(e) => setForm({...form, rt: e.target.value})}
                placeholder="01"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 6 }}>
                RW
              </label>
              <input
                type="text"
                value={form.rw}
                onChange={(e) => setForm({...form, rw: e.target.value})}
                placeholder="02"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 6 }}>
              Target Tabungan (Rp)
            </label>
            <input
              type="number"
              value={form.target}
              onChange={(e) => setForm({...form, target: Number(e.target.value)})}
              placeholder="500000"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1, padding: '12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 1, padding: '12px', background: loading ? 'var(--abu-200)' : 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '⏳ Menyimpan...' : '➕ Tambah Kencleng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDesaKelolaKencleng = () => {
  const [kenclengList, setKenclengList] = useState([]);
  const [rtList, setRtList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [qrKencleng, setQrKencleng] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  
  // Filters
  const [filterRT, setFilterRT] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [kenclengData, rtData] = await Promise.all([
        getAllKencleng(),
        getAllRT()
      ]);
      setKenclengList(kenclengData);
      setRtList(rtData);
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredKencleng = useMemo(() => {
    let filtered = kenclengList;
    
    if (filterRT !== 'semua') {
      filtered = filtered.filter(k => k.rt === filterRT);
    }
    
    if (filterStatus !== 'semua') {
      filtered = filtered.filter(k => k.status === filterStatus);
    }
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(k => 
        (k.nama || '').toLowerCase().includes(q) ||
        (k.id || '').toLowerCase().includes(q) ||
        (k.alamat || '').toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [kenclengList, filterRT, filterStatus, search]);

  const uniqueRT = useMemo(() => {
    const rts = new Set(kenclengList.map(k => k.rt).filter(Boolean));
    return ['semua', ...Array.from(rts).sort()];
  }, [kenclengList]);

  return (
    <div className="app-layout">
      <Header 
        title="Manajemen Kencleng"
        subtitle={`${DESA_NAME} · ${KECAMATAN_NAME}`}
        showBack
        rightAction={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowTambahModal(true)}
              style={{ background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              ➕ Tambah
            </button>
            <button
              onClick={() => {}}
              style={{ background: 'var(--info)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              📥 Import
            </button>
            <button
              onClick={() => {}}
              style={{ background: 'var(--kuning)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              🖨️ Cetak QR
            </button>
          </div>
        }
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={3000} />}

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filterRT}
            onChange={(e) => setFilterRT(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--abu-200)', background: '#fff', fontSize: '0.8rem' }}
          >
            {uniqueRT.map(rt => (
              <option key={rt} value={rt}>{rt === 'semua' ? 'Semua RT' : `RT ${rt}`}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--abu-200)', background: '#fff', fontSize: '0.8rem' }}
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          <div style={{ display: 'flex', flex: 1, gap: 8 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Nama / ID / Alamat..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--abu-200)' }}
            />
            <button
              onClick={() => setSearch('')}
              style={{ padding: '8px 16px', background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}
            >
              🔍
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <Card padding="12px" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Total Kencleng</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--hijau)' }}>{kenclengList.length}</div>
          </Card>
          <Card padding="12px" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Aktif</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--hijau)' }}>{kenclengList.filter(k => k.status === 'aktif').length}</div>
          </Card>
          <Card padding="12px" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Nonaktif</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{kenclengList.filter(k => k.status !== 'aktif').length}</div>
          </Card>
          <Card padding="12px" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Jumlah RT</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)' }}>{uniqueRT.length - 1}</div>
          </Card>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : (
          <KenclengTable
            kenclengList={filteredKencleng}
            onShowQR={setQrKencleng}
            onDetail={(k) => console.log('Detail:', k)}
          />
        )}
      </div>

      {qrKencleng && (
        <QRModal kencleng={qrKencleng} onClose={() => setQrKencleng(null)} />
      )}

      <TambahKenclengModal
        show={showTambahModal}
        onClose={() => setShowTambahModal(false)}
        onSuccess={loadData}
        rtList={rtList}
      />

      <MobileNav />
    </div>
  );
};

export default AdminDesaKelolaKencleng;