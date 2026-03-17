import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, storeName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { session, user } = response.data;

    localStorage.setItem('token', session.access_token);
    setToken(session.access_token);
    setUser({
      id: user.id,
      email: user.email,
      role: user.user_metadata.role,
    });
  };

  const register = async (email: string, password: string, name: string, storeName: string) => {
    await api.post('/auth/register', {
      email,
      password,
      name,
      role: 'store',
      storeName,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
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