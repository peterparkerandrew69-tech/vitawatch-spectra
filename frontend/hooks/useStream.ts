'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';

export interface TelemetryStreamPacket {
  timestamp: string;
  heart_rate: number;
  spo2: number;
  skin_temp_c: number;
  gsr: number;
  accel: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  signal_quality: number;
  provenance: 'LIVE_SENSOR' | 'CONNECTED_NO_RECENT' | 'DEMO_SIMULATION';
  is_simulated: boolean;
  is_fresh: boolean;
  device_status: string;
  active_emergency: any;
  stress: any;
  tick: number;
}

export function useStream() {
  const [packet, setPacket] = useState<TelemetryStreamPacket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        const url = api.getStreamUrl();
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          setIsConnected(true);
          setStreamError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data: TelemetryStreamPacket = JSON.parse(event.data);
            setPacket(data);
          } catch (e) {
            console.warn('Error parsing stream data:', e);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          setStreamError('Stream disconnected. Reconnecting...');
          if (eventSource) {
            eventSource.close();
          }
          reconnectTimeout = setTimeout(connect, 4000);
        };
      } catch (err: any) {
        setStreamError(err.message || 'Stream connection error');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return {
    packet,
    isConnected,
    streamError,
  };
}
