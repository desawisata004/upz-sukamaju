import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { getAllKencleng } from '../../services/kenclengService';
import { generateQRCodeDataURL, generateQRData } from '../../utils/qrGenerator';

const CetakQRPage = () => {
  const [kenclengList, setKenclengList] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [alert, setAlert] = useState(null);
  const [qrImages, setQrImages] = useState({});

  useEffect(() => {
    loadKencleng();
  }, []);

  const loadKencleng = async () => {
    setLoading(true);
    try {
      const data = await getAllKencleng();
      setKenclengList(data.filter(k => k.status === 'aktif'));
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === kenclengList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(kenclengList.map(k => k.id)));
    }
  };

  const handleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const generateQRs = async () => {
    if (selectedIds.size === 0) {
      setAlert({ type: 'error', message: 'Pilih kencleng terlebih dahulu' });
      return;
    }

    setGenerating(true);
    const selectedKencleng = kenclengList.filter(k => selectedIds.has(k.id));
    const newQrImages = {};

    for (const k of selectedKencleng) {
      try {
        const qrData = generateQRData(k.id, k.userId, k.nama);
        const qrUrl = await generateQRCodeDataURL(qrData);
        newQrImages[k.id] = qrUrl;
      } catch (error) {
        console.error('Error generating QR for', k.id, error);
      }
    }

    setQrImages(newQrImages);
    setGenerating(false);
  };

  const printQRs = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak QR Kencleng</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .qr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .qr-item { text-align: center; page-break-inside: avoid; }
            .qr-item img { width: 150px; height: 150px; }
            .qr-item .nama { font-weight: bold; margin-top: 5px; }
            .qr-item .id { font-size: 0.8rem; color: #666; }
            @media print {
              body { margin: 0; padding: 10px; }
              .qr-grid { gap: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="qr-grid">
            ${Object.entries(qrImages).map(([id, url]) => {
              const kencleng = kenclengList.find(k => k.id === id);
              return `
                <div class="qr-item">
                  <img src="${url}" />
                  <div class="nama">${kencleng?.nama || '-'}</div>
                  <div class="id">${id}</div>
                </div>
              `;
            }).join('')}
          </div>
          <script>
            window.onload = () => { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="app-layout">
      <Header title="Cetak QR Kencleng" showBack />
      
      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Pilih Kencleng ({selectedIds.size} dipilih)</h3>
            <div>
              <button
                onClick={handleSelectAll}
                style={{ padding: '6px 12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', marginRight: 8 }}
              >
                {selectedIds.size === kenclengList.length ? 'Unselect All' : 'Select All'}
              </button>
              <button
                onClick={generateQRs}
                disabled={generating || selectedIds.size === 0}
                style={{ padding: '6px 12px', background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}
              >
                {generating ? '⏳' : 'Generate QR'}
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spinner />
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {kenclengList.map(k => (
                <label
                  key={k.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid var(--abu-100)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(k.id)}
                    onChange={() => handleSelect(k.id)}
                    style={{ marginRight: 12, width: 18, height: 18 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{k.nama}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--abu-400)' }}>
                      {k.id} · RT {k.rt}/{k.rw}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--hijau)' }}>
                    {formatRupiah(k.saldo || 0)}
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>

        {Object.keys(qrImages).length > 0 && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>QR Code Siap Cetak</h3>
              <Button onClick={printQRs} size="sm">
                🖨️ Cetak
              </Button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {Object.entries(qrImages).map(([id, url]) => {
                const kencleng = kenclengList.find(k => k.id === id);
                return (
                  <div key={id} style={{ textAlign: 'center' }}>
                    <img src={url} alt={`QR ${id}`} style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', marginTop: 4 }}>{kencleng?.nama}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>{id}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default CetakQRPage;