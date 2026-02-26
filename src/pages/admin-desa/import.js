import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ImportPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleImport = async () => {
    if (!file) {
      setAlert({ type: 'error', message: 'Pilih file Excel terlebih dahulu' });
      return;
    }

    setLoading(true);
    // Simulasi import
    setTimeout(() => {
      setAlert({ type: 'success', message: '✅ Data berhasil diimport' });
      setLoading(false);
      setFile(null);
    }, 2000);
  };

  return (
    <div className="app-layout">
      <Header title="Import Data" subtitle="Import warga & kencleng dari Excel" showBack />
      
      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <Card>
          <h3 style={{ marginBottom: 16 }}>📥 Import Data Warga & Kencleng</h3>
          
          <div style={{ 
            border: '2px dashed var(--abu-200)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '40px 20px', 
            textAlign: 'center',
            marginBottom: 20,
            background: 'var(--abu-100)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
            <p style={{ marginBottom: 16 }}>Upload file Excel (.xlsx, .xls)</p>
            
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'var(--hijau)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Pilih File
            </label>
            
            {file && (
              <div style={{ marginTop: 12, fontSize: '0.9rem' }}>
                📄 {file.name}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 8 }}>Template Format:</h4>
            <div style={{ 
              background: 'var(--abu-100)', 
              padding: 12, 
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontFamily: 'monospace'
            }}>
              <div>nama, rt, rw, alamat, target</div>
              <div>Ahmad S., 01, 02, Kp. Sukajadi, 500000</div>
              <div>Siti A., 01, 02, Kp. Sukajadi, 500000</div>
            </div>
          </div>

          <Button 
            onClick={handleImport} 
            loading={loading}
            disabled={!file}
          >
            {loading ? 'Mengimport...' : 'Import Data'}
          </Button>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 8 }}>📋 Catatan:</h4>
          <ul style={{ fontSize: '0.8rem', color: 'var(--abu-500)', paddingLeft: 20 }}>
            <li>File harus dalam format Excel (.xlsx atau .xls)</li>
            <li>Kolom yang wajib: nama, rt</li>
            <li>Target default: Rp 500.000 jika tidak diisi</li>
            <li>Data akan diverifikasi sebelum disimpan</li>
          </ul>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default ImportPage;