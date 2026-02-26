import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import RiwayatSetoran from '../../components/kencleng/RiwayatSetoran';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import { useKencleng } from '../../hooks/useKencleng';
import { getRiwayatSetoran } from '../../services/kenclengService';
import { formatRupiah } from '../../utils/formatter';

const RiwayatPage = () => {
  const { user } = useAuth();
  const { kenclengList, loading: loadingKencleng } = useKencleng(user?.uid);
  const [selectedKencleng, setSelectedKencleng] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (kenclengList.length > 0 && !selectedKencleng) {
      setSelectedKencleng(kenclengList[0]);
    }
  }, [kenclengList, selectedKencleng]);

  useEffect(() => {
    if (!selectedKencleng) return;
    
    const loadRiwayat = async () => {
      setLoading(true);
      try {
        const data = await getRiwayatSetoran(selectedKencleng.id);
        setRiwayat(data);
      } catch (error) {
        setAlert({ type: 'error', message: 'Gagal memuat riwayat: ' + error.message });
      } finally {
        setLoading(false);
      }
    };
    
    loadRiwayat();
  }, [selectedKencleng]);

  // Statistik
  const totalSetoran = riwayat.filter(r => r.status === 'diterima').length;
  const totalNominal = riwayat
    .filter(r => r.status === 'diterima')
    .reduce((acc, r) => acc + (r.nominal || 0), 0);

  if (loadingKencleng) {
    return (
      <div className="app-layout">
        <Header title="Riwayat Setoran" showBack />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner />
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header title="Riwayat Setoran" showBack />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={3000} />}

        {kenclengList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p style={{ fontWeight: 600 }}>Belum ada kencleng</p>
            <p style={{ fontSize: '0.875rem' }}>Buat kencleng terlebih dahulu untuk melihat riwayat</p>
          </div>
        ) : (
          <>
            {/* Pilih Kencleng */}
            {kenclengList.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
                {kenclengList.map(k => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKencleng(k)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '1.5px solid',
                      borderColor: selectedKencleng?.id === k.id ? 'var(--hijau)' : 'var(--abu-200)',
                      background: selectedKencleng?.id === k.id ? 'var(--hijau)' : '#fff',
                      color: selectedKencleng?.id === k.id ? '#fff' : 'var(--abu-700)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {k.nama}
                  </button>
                ))}
              </div>
            )}

            {selectedKencleng && (
              <>
                {/* Info Kencleng */}
                <Card style={{ background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', color: '#fff', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>{selectedKencleng.nama}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
                        {formatRupiah(selectedKencleng.saldo || 0)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Total Setoran</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{totalSetoran}x</div>
                      <div style={{ fontSize: '0.8rem' }}>{formatRupiah(totalNominal)}</div>
                    </div>
                  </div>
                </Card>

                {/* Filter Status */}
                <div style={{ marginBottom: 16 }}>
                  <RiwayatSetoran 
                    data={riwayat} 
                    loading={loading}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default RiwayatPage;