// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthChange, getUserData } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    
    const initAuth = async () => {
      try {
        unsub = await onAuthChange(async (firebaseUser) => {
          setUser(firebaseUser);
          if (firebaseUser) {
            try {
              const data = await getUserData(firebaseUser.uid);
              setUserData(data);
            } catch (error) {
              console.error('Error fetching user data:', error);
              setUserData(null);
            }
          } else {
            setUserData(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      if (typeof unsub === 'function') {
        unsub();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};