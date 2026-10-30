'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: 'patient' | 'caregiver' | 'researcher';
  initials: string;
  age?: number;
  height?: string;
  weight?: string;
  blood_group?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    try {
      // Check current user if token exists
      const res = await api.getCurrentUser();
      if (res?.data) {
        setUser(res.data);
      }
    } catch {
      // Auto-login default dev user if not logged in to make prototype immediate and seamless
      try {
        const loginRes = await api.login('sandeep@vitawatch.ai', 'Spectra2026!');
        if (loginRes?.data?.user) {
          setUser(loginRes.data.user);
        }
      } catch (e) {
        console.warn('Auto-login dev user notice:', e);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      if (res?.data?.user) {
        setUser(res.data.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    refresh: initAuth,
  };
}
