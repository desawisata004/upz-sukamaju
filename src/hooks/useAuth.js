// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthChange, getUserData } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};
    
    const initAuth = async () => {
      try {
        unsubscribe = onAuthChange(async (firebaseUser) => {
          setUser(firebaseUser);
          if (firebaseUser) {
            try {
              const data = await getUserData(firebaseUser.uid);
              setUserData(data);
            } catch (err) {
              console.error('Error fetching user data:', err);
              setUserData(null);
            }
          } else {
            setUserData(null);
          }
          setLoading(false);
          setError(null);
        });
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, error, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};