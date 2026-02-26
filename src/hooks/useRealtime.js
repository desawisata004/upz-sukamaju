import { useState, useEffect, useRef } from 'react';
import { subscribeKencleng, subscribeSetoran } from '../services/kenclengService';

export const useRealtimeKencleng = (userId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      try {
        unsubscribeRef.current();
      } catch (e) {
        console.error('Error cleaning up previous subscription:', e);
      }
      unsubscribeRef.current = null;
    }

    if (!userId) {
      setLoading(false);
      setData([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      unsubscribeRef.current = subscribeKencleng(userId, (items) => {
        setData(items);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error subscribing to kencleng:', error);
      setError(error.message);
      setLoading(false);
    }
    
    return () => {
      if (unsubscribeRef.current && typeof unsubscribeRef.current === 'function') {
        try {
          unsubscribeRef.current();
        } catch (e) {
          console.error('Error unsubscribing:', e);
        }
        unsubscribeRef.current = null;
      }
    };
  }, [userId]);

  return { data, loading, error };
};

export const useRealtimeSetoran = (kenclengId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      try {
        unsubscribeRef.current();
      } catch (e) {
        console.error('Error cleaning up previous subscription:', e);
      }
      unsubscribeRef.current = null;
    }

    if (!kenclengId) {
      setLoading(false);
      setData([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      unsubscribeRef.current = subscribeSetoran(kenclengId, (items) => {
        setData(items);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error subscribing to setoran:', error);
      setError(error.message);
      setLoading(false);
    }
    
    return () => {
      if (unsubscribeRef.current && typeof unsubscribeRef.current === 'function') {
        try {
          unsubscribeRef.current();
        } catch (e) {
          console.error('Error unsubscribing:', e);
        }
        unsubscribeRef.current = null;
      }
    };
  }, [kenclengId]);

  return { data, loading, error };
};