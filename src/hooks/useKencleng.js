// src/hooks/useKencleng.js
import { useState, useEffect } from 'react';
import { getKenclengByUser } from '../services/kenclengService';

export const useKencleng = (userId) => {
  const [kenclengList, setKenclengList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getKenclengByUser(userId);
      setKenclengList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const totalSaldo = kenclengList.reduce((acc, k) => acc + (k.saldo || 0), 0);
  const aktif = kenclengList.filter((k) => k.status === 'aktif');

  return { kenclengList, loading, error, refresh, totalSaldo, aktif };
};
