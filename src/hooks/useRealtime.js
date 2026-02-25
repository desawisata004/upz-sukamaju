// src/hooks/useRealtime.js
import { useState, useEffect } from 'react';
import { subscribeKencleng, subscribeSetoran } from '../services/kenclengService';

export const useRealtimeKencleng = (userId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeKencleng(userId, (items) => {
      setData(items);
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { data, loading };
};

export const useRealtimeSetoran = (kenclengId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kenclengId) return;
    const unsub = subscribeSetoran(kenclengId, (items) => {
      setData(items);
      setLoading(false);
    });
    return unsub;
  }, [kenclengId]);

  return { data, loading };
};
