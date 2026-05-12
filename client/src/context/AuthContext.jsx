import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../apis/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user and token on mount
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.error('Auth verification failed', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      const token = res.data.token;
      localStorage.setItem('token', token);
      
      // Get user details
      const userRes = await API.get('/auth/me');
      setUser(userRes.data.data);
      localStorage.setItem('user', JSON.stringify(userRes.data.data));
      return { success: true };
    }
    return { success: false, error: res.data.error };
  };

  const signup = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    if (res.data.success) {
      const token = res.data.token;
      localStorage.setItem('token', token);
      
      // Get user details
      const userRes = await API.get('/auth/me');
      setUser(userRes.data.data);
      localStorage.setItem('user', JSON.stringify(userRes.data.data));
      return { success: true };
    }
    return { success: false, error: res.data.error };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
