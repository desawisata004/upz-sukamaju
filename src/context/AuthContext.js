import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Simple auth functions (bisa dikembangkan nanti)
  const login = async (email, password) => {
    // Implementasi login
    return { user: null, error: 'Not implemented' };
  };

  const logout = async () => {
    // Implementasi logout
  };

  const register = async (email, password) => {
    // Implementasi register
    return { user: null, error: 'Not implemented' };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};