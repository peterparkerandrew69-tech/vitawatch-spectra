/**
 * VitaWatch Spectra Centralized API Client
 * Seamlessly interfaces the Next.js frontend with the modular Flask backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('vitawatch_token');
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vitawatch_token', token);
    }
  }

  public removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vitawatch_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired or invalid
        this.removeAuthToken();
      }

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(json.message || `HTTP ${response.status}: Request failed`);
      }

      return json;
    } catch (err: any) {
      console.warn(`[ApiClient] Request error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- HEALTH ---
  async getHealth() {
    return this.request<{
      status: string;
      application: string;
      backend: string;
      database: string;
      mode: string;
    }>('/api/health');
  }

  // --- AUTHENTICATION ---
  async login(email: string, password: string) {
    const res = await this.request<{
      status: string;
      data: { token: string; user: any };
      message: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.token) {
      this.setAuthToken(res.data.token);
    }
    return res;
  }

  async register(email: string, password: string, fullName: string, role = 'patient') {
    const res = await this.request<{
      status: string;
      data: { token: string; user: any };
      message: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });

    if (res.data?.token) {
      this.setAuthToken(res.data.token);
    }
    return res;
  }

  async getCurrentUser() {
    return this.request<{ status: string; data: any }>('/api/auth/me');
  }

  async updateProfile(profileData: Record<string, any>) {
    return this.request<{ status: string; data: any }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  logout() {
    this.removeAuthToken();
  }

  // --- DASHBOARD ---
  async getDashboardSummary() {
    return this.request<{
      status: string;
      data: {
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
      };
    }>('/api/dashboard/summary');
  }

  async getDashboardActivity() {
    return this.request<{ status: string; data: any[] }>('/api/dashboard/activity');
  }

  // --- VITALS ---
  async getLatestVitals() {
    return this.request<{ status: string; data: any }>('/api/vitals/latest');
  }

  async getVitalsHistory(hours = 24) {
    return this.request<{ status: string; data: any[] }>(`/api/vitals/history?hours=${hours}`);
  }

  async postVitalReading(reading: {
    heart_rate?: number;
    spo2?: number;
    temperature?: number;
    gsr?: number;
    device_id?: string;
    is_simulated?: boolean;
  }) {
    return this.request<{ status: string; data: any }>('/api/vitals', {
      method: 'POST',
      body: JSON.stringify(reading),
    });
  }

  // --- AI ANALYTICS ---
  async getAnalyticsSummary() {
    return this.request<{ status: string; data: any }>('/api/analytics/summary');
  }

  async getStressAnalysis() {
    return this.request<{ status: string; data: any }>('/api/analytics/stress');
  }

  async getFatigueAnalysis() {
    return this.request<{ status: string; data: any }>('/api/analytics/fatigue');
  }

  async getMovementAnalysis() {
    return this.request<{ status: string; data: any }>('/api/analytics/movement');
  }

  async sendCopilotMessage(message: string) {
    return this.request<{
      status: string;
      data: { reply: string; disclaimer: string; context_timestamp: string };
    }>('/api/analytics/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // --- COGNITIVE LAB ---
  async getCognitiveSessions(taskType?: string) {
    const q = taskType ? `?task_type=${encodeURIComponent(taskType)}` : '';
    return this.request<{ status: string; data: any[] }>(`/api/cognitive/sessions${q}`);
  }

  async recordCognitiveSession(session: {
    task_type: string;
    difficulty: string;
    reaction_time_ms: number;
    score: number;
    accuracy_percent?: number;
    notes?: string;
  }) {
    return this.request<{ status: string; data: any }>('/api/cognitive/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async getCognitiveLeaderboard(taskType = 'reaction_speed') {
    return this.request<{ status: string; data: any[] }>(`/api/cognitive/leaderboard?task_type=${encodeURIComponent(taskType)}`);
  }

  // --- EMERGENCY RESPONSE ---
  async triggerEmergency(payload: {
    source: 'manual_sos' | 'voice' | 'fall_detection' | 'arrhythmia';
    location?: string;
    latitude?: number;
    longitude?: number;
    sensor_context?: string;
    severity?: string;
    target_hospital?: string;
    relatives?: string[];
  }) {
    return this.request<{ status: string; data: any; message: string }>('/api/emergency/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getEmergencyEvents() {
    return this.request<{ status: string; data: any[] }>('/api/emergency/events');
  }

  async acknowledgeEmergency(eventId: number, notes?: string) {
    return this.request<{ status: string; data: any }>(`/api/emergency/events/${eventId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async resolveEmergency(eventId: number, falseAlarm = false, notes?: string) {
    return this.request<{ status: string; data: any }>(`/api/emergency/events/${eventId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ false_alarm: falseAlarm, notes }),
    });
  }

  // --- CAREGIVER ---
  async getCaregiverOverview() {
    return this.request<{ status: string; data: any }>('/api/caregiver/overview');
  }

  async getCaregiverAlerts() {
    return this.request<{ status: string; data: any[] }>('/api/caregiver/alerts');
  }

  async getCaregiverActivity() {
    return this.request<{ status: string; data: any[] }>('/api/caregiver/activity');
  }

  // --- RESEARCH ---
  async getResearchSessions() {
    return this.request<{ status: string; data: any[] }>('/api/research/sessions');
  }

  async getResearchDatasets() {
    return this.request<{ status: string; data: any }>('/api/research/datasets');
  }

  // --- DEVICES ---
  async getDevices() {
    return this.request<{ status: string; data: any[] }>('/api/devices');
  }

  // --- REAL-TIME SSE STREAM URL ---
  getStreamUrl(): string {
    const token = this.getAuthToken();
    return `${API_BASE_URL}/api/stream/vitals${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
}

export const api = new ApiClient();
export default api;
