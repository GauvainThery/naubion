import { useState, useEffect, useCallback } from 'react';
import { CacheStats, AdminApiResponse } from '@naubion/shared';
import { getApiUrl } from '../utils/api';

type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (password: string): Promise<void> => {
    const response = await fetch(getApiUrl('/api/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data: AdminApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const authToken = (data.data as { sessionToken?: string })?.sessionToken || password;
    localStorage.setItem('adminToken', authToken);
    setToken(authToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, token, login, logout };
};

export const useAdminApi = () => {
  const { token } = useAdminAuth();

  const apiCall = useCallback(
    async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
      const response = await fetch(getApiUrl(`/api/admin${endpoint}`), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers
        }
      });

      const data: AdminApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API call failed');
      }

      return data.data as T;
    },
    [token]
  );

  const fetchStats = useCallback(async (): Promise<CacheStats> => {
    return (await apiCall<CacheStats>('/cache/stats')) as CacheStats;
  }, [apiCall]);

  const runFullCleanup = useCallback(async (): Promise<{ message: string; duration: number }> => {
    return await apiCall('/jobs/cache-cleanup', { method: 'POST' });
  }, [apiCall]);

  const cleanupExpired = useCallback(async (): Promise<{
    expiredCount: number;
    duration: number;
    message: string;
  }> => {
    return await apiCall('/cache/cleanup-expired', { method: 'POST' });
  }, [apiCall]);

  const cleanupOld = useCallback(
    async (
      olderThanDays = 30
    ): Promise<{ oldCount: number; duration: number; message: string }> => {
      return await apiCall('/cache/cleanup-old', {
        method: 'POST',
        body: JSON.stringify({ olderThanDays })
      });
    },
    [apiCall]
  );

  return {
    fetchStats,
    runFullCleanup,
    cleanupExpired,
    cleanupOld
  };
};

export const useAdminStats = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchStats } = useAdminApi();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
};
