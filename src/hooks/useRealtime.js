// src/hooks/useRealtime.js
import { useState, useEffect } from 'react';
import { subscribeKencleng, subscribeSetoran } from '../services/kenclengService';

export const useRealtimeKencleng = (userId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    let unsubscribe = () => {};
    
    try {
      unsubscribe = subscribeKencleng(userId, (items) => {
        setData(items);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [userId]);

  return { data, loading };
};

export const useRealtimeSetoran = (kenclengId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kenclengId) {
      setLoading(false);
      return;
    }
    
    let unsubscribe = () => {};
    
    try {
      unsubscribe = subscribeSetoran(kenclengId, (items) => {
        setData(items);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [kenclengId]);

  return { data, loading };
};