import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });

  // save token
  localStorage.setItem('token', res.data.token);

  // set user (if returned)
  if (res.data.user) {
    setUser(res.data.user);
  }

  return res.data;
};







  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const can = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);