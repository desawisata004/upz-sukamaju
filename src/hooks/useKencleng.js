import { useState, useEffect } from 'react';
import { getKenclengByUser } from '../services/kenclengService';
import { STATUS_KENCLENG } from '../config/constants';

export const useKencleng = (userId) => {
  const [kenclengList, setKenclengList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getKenclengByUser(userId);
      setKenclengList(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [userId]);

  const totalSaldo = kenclengList.reduce((acc, k) => acc + (k.saldo || 0), 0);
  const aktif = kenclengList.filter((k) => k.status === STATUS_KENCLENG.AKTIF);
  const penuh = kenclengList.filter((k) => (k.saldo || 0) >= (k.target || 0));

  return { 
    kenclengList, 
    loading, 
    error, 
    refresh, 
    totalSaldo, 
    aktif,
    penuh,
    count: kenclengList.length
  };
};