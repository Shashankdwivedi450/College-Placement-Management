import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  registerStudent: (data: any) => Promise<void>;
  registerCompany: (data: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cpms_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!localStorage.getItem('cpms_auth_token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
    } catch (err) {
      console.warn('Session restoration failed, clearing token');
      localStorage.removeItem('cpms_auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If no token exists on first load, initialize with the default Student demo user
    // so the applet is immediately interactive and demonstrated without requiring manual login
    const initAuth = async () => {
      const savedToken = localStorage.getItem('cpms_auth_token');
      if (savedToken) {
        await refreshUser();
      } else {
        // Automatically sign in as student demo
        try {
          const res = await api.login({
            email: 'student@example.com',
            password: 'Student@123',
            role: 'Student'
          });
          localStorage.setItem('cpms_auth_token', res.token);
          setToken(res.token);
          setUser(res.user);
        } catch (e) {
          console.log('Demo initialization skipped');
        } finally {
          setLoading(false);
        }
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    const res = await api.login({ email, password, role });
    localStorage.setItem('cpms_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const registerStudent = async (data: any) => {
    const res = await api.registerStudent(data);
    localStorage.setItem('cpms_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const registerCompany = async (data: any) => {
    const res = await api.registerCompany(data);
    localStorage.setItem('cpms_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('cpms_auth_token');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      let email = 'student@example.com';
      let password = 'Student@123';

      if (role === 'Recruiter') {
        email = 'recruiter@example.com';
        password = 'Recruiter@123';
      } else if (role === 'Admin') {
        email = 'admin@college.com';
        password = 'Admin@123';
      }

      await login(email, password, role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerStudent,
        registerCompany,
        logout,
        quickDemoLogin,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
