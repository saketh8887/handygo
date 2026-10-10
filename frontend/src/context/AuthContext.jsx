import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Auth token verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.data) {
      const { token: jwtToken, user: userData } = res.data.data;
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error('Invalid login response');
  };

  const register = async (registerData) => {
    const res = await api.post('/auth/register', registerData);
    if (res.data && res.data.data) {
      const { token: jwtToken, user: userData } = res.data.data;
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error('Invalid registration response');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user || !user.role) return false;
    const userRole = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;
    const checkRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return userRole.toUpperCase() === checkRole.toUpperCase();
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasRole,
    isCustomer: hasRole('ROLE_CUSTOMER'),
    isHandyman: hasRole('ROLE_HANDYMAN'),
    isAdmin: hasRole('ROLE_ADMIN'),
    isInventoryManager: hasRole('ROLE_INVENTORY_MANAGER'),
    isSupplier: hasRole('ROLE_SUPPLIER'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
