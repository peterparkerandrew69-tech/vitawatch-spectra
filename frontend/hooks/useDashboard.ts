'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

export interface DashboardData {
  wellness_score: number;
  vitals: Array<{
    label: string;
    value: string;
    unit: string;
    icon: string;
    color: string;
    trend: 'up' | 'down' | 'stable';
    status: string;
  }>;
  ecg_points: number[];
  baseline: any;
  data_provenance: {
    is_live: boolean;
    source: string;
    status_label: 'LIVE SENSOR DATA' | 'CONNECTED — NO RECENT DATA' | 'DEMO / SIMULATED DATA' | 'DEVICE OFFLINE' | 'BACKEND DISCONNECTED';
    last_reading_time: string | null;
  };
  device: any;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const [summaryRes, activityRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardActivity().catch(() => ({ status: 'error', data: [] })),
      ]);

      if (summaryRes?.data) {
        setData(summaryRes.data);
      }
      if (activityRes?.data) {
        setActivities(activityRes.data);
      }
    } catch (err: any) {
      console.warn('Dashboard fetch notice:', err.message);
      setError(err.message || 'Unable to connect to VitaWatch backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 8000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return {
    data,
    activities,
    isLoading,
    error,
    refresh: fetchDashboard,
  };
}
