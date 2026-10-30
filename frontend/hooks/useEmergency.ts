'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

export interface EmergencyEventItem {
  id: number;
  user_id: number;
  source: string;
  status: 'detected' | 'awaiting_confirmation' | 'confirmed' | 'alerting' | 'acknowledged' | 'resolved' | 'cancelled';
  severity: string;
  location: string;
  latitude: number;
  longitude: number;
  sensor_context?: string;
  created_at: string;
  resolved_at?: string;
  notes?: string;
  notifications?: Array<{
    id: number;
    channel: string;
    recipient: string;
    status: string;
    attempted_at: string;
  }>;
}

export interface TriggerSOSParams {
  source?: 'manual_sos' | 'voice' | 'fall_detection' | 'arrhythmia';
  location?: string;
  latitude?: number;
  longitude?: number;
  target_hospital?: string;
  relatives?: string[];
  sensor_context?: string;
}

export function useEmergency() {
  const [events, setEvents] = useState<EmergencyEventItem[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyEventItem | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.getEmergencyEvents();
      if (res?.data) {
        setEvents(res.data);
        const active = res.data.find((e: EmergencyEventItem) =>
          ['detected', 'awaiting_confirmation', 'confirmed', 'alerting'].includes(e.status)
        );
        setActiveEmergency(active || null);
      }
    } catch (err: any) {
      console.warn('Emergency events fetch notice:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const triggerSOS = async (
    paramOrSource: 'manual_sos' | 'voice' | 'fall_detection' | 'arrhythmia' | TriggerSOSParams = 'manual_sos',
    location?: string,
    coords?: { latitude: number; longitude: number },
    targetHospital?: string,
    relatives?: string[]
  ) => {
    setIsTriggering(true);
    setError(null);
    try {
      let payload: any = {
        source: 'manual_sos',
        location: 'Home / Master Bedroom',
        latitude: 13.0827,
        longitude: 80.2707,
        severity: 'critical',
      };

      if (typeof paramOrSource === 'object') {
        payload = {
          source: paramOrSource.source || 'manual_sos',
          location: paramOrSource.location || 'Home / Master Bedroom',
          latitude: paramOrSource.latitude ?? 13.0827,
          longitude: paramOrSource.longitude ?? 80.2707,
          severity: 'critical',
          target_hospital: paramOrSource.target_hospital,
          relatives: paramOrSource.relatives,
          sensor_context: paramOrSource.sensor_context,
        };
      } else {
        payload = {
          source: paramOrSource,
          location: location || 'Home / Master Bedroom',
          latitude: coords?.latitude ?? 13.0827,
          longitude: coords?.longitude ?? 80.2707,
          severity: 'critical',
          target_hospital: targetHospital,
          relatives: relatives,
        };
      }

      const res = await api.triggerEmergency(payload);
      await fetchEvents();
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to trigger emergency dispatch');
      throw err;
    } finally {
      setIsTriggering(false);
    }
  };

  const acknowledge = async (eventId: number, notes?: string) => {
    try {
      await api.acknowledgeEmergency(eventId, notes);
      await fetchEvents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resolve = async (eventId: number, isFalseAlarm = false, notes?: string) => {
    try {
      await api.resolveEmergency(eventId, isFalseAlarm, notes);
      await fetchEvents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    events,
    activeEmergency,
    isTriggering,
    error,
    triggerSOS,
    acknowledge,
    resolve,
    refresh: fetchEvents,
  };
}
