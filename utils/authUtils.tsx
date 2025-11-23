'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserInfo {
  nickname: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userInfo: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUserInfo = (): UserInfo | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const isAuthenticatedCheck = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('sessionId');
};

const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sessionId');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('isLoggedIn');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
    setIsLoading(false);
  }, []);

  const login = (userInfo: UserInfo) => {
    setUser(userInfo);
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const authValue: AuthContextType = {
    user,
    isAuthenticated: isAuthenticatedCheck() && !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다');
  }
  return context;
}

export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const isAuth = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('userData');
    return isAuth && !!userData;
  } catch {
    return false;
  }
};

export const getCurrentUser = (): UserInfo | null => {
  return getUserInfo();
};

export const redirectToLogin = (returnUrl?: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    } else {
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('returnUrl', currentPath);
    }
    
    window.location.href = '/';
  } catch (error) {
    console.error('로그인 페이지 이동 오류:', error);
    window.location.href = '/';
  }
};