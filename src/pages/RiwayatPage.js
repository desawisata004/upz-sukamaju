// src/pages/RiwayatPage.js
import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import RiwayatSetoran from '../components/kencleng/RiwayatSetoran';
import { useAuth } from '../hooks/useAuth';
import { getKenclengByUser, getRiwayatSetoran } from '../services/kenclengService';
import { Spinner } from '../components/common/Loading';

const RiwayatPage = () => {
  const { user } = useAuth();
  const [kenclengList, setKenclengList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [setoran, setSetoran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSetoran, setLoadingSetoran] = useState(false);

  useEffect(() => {
    if (!user) return;
    getKenclengByUser(user.uid).then((list) => {
      setKenclengList(list);
      if (list.length > 0) setSelected(list[0]);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    setLoadingSetoran(true);
    getRiwayatSetoran(selected.id)
      .then(setSetoran)
      .finally(() => setLoadingSetoran(false));
  }, [selected]);

  return (
    <div className="app-layout">
      <Header title="Riwayat Setoran" />
      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* Kencleng selector */}
            {kenclengList.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 4,
                  marginBottom: 16,
                  scrollbarWidth: 'none',
                }}
              >
                {kenclengList.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setSelected(k)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '1.5px solid',
                      borderColor: selected?.id === k.id ? 'var(--hijau)' : 'var(--abu-200)',
                      background: selected?.id === k.id ? 'var(--hijau)' : '#fff',
                      color: selected?.id === k.id ? '#fff' : 'var(--abu-700)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-body)',
                      transition: 'all var(--transition)',
                    }}
                  >
                    {k.nama}
                  </button>
                ))}
              </div>
            )}

            <RiwayatSetoran data={setoran} loading={loadingSetoran} />
          </>
        )}
      </div>
      <MobileNav />
    </div>
  );
};

export default RiwayatPage;
