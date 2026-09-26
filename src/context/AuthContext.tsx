import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt?: string;
  addresses?: any[];
  _count?: {
    orders: number;
    reviews: number;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{
    requiresOtp?: boolean;
    verificationId?: string;
    email?: string;
    maskedEmail?: string;
    devOtp?: string;
    smtpConfigured?: boolean;
    user?: any;
    token?: string;
  }>;
  verifyOtp: (email: string, otp: string, verificationId: string) => Promise<any>;
  resendOtp: (email: string, verificationId?: string) => Promise<any>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('srijan_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('srijan_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.auth.getMe();
      setUser(res.user);
    } catch {
      localStorage.removeItem('srijan_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.requiresOtp) {
      return {
        requiresOtp: true,
        verificationId: res.verificationId,
        email: res.email,
        maskedEmail: res.maskedEmail,
        devOtp: res.devOtp,
        smtpConfigured: res.smtpConfigured,
      };
    }
    if (res.token && res.user) {
      localStorage.setItem('srijan_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return { requiresOtp: false, user: res.user, token: res.token };
  };

  const verifyOtp = async (email: string, otp: string, verificationId: string) => {
    const res = await api.auth.verifyOtp({ email, otp, verificationId });
    if (res.token && res.user) {
      localStorage.setItem('srijan_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const resendOtp = async (email: string, verificationId?: string) => {
    return await api.auth.resendOtp({ email, verificationId });
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.auth.register({ name, email, password, phone });
    localStorage.setItem('srijan_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('srijan_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        verifyOtp,
        resendOtp,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
