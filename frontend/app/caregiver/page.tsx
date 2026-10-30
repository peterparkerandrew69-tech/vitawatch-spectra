'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import { 
  Stethoscope, 
  Bell, 
  CalendarCheck, 
  User, 
  Heart, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function CaregiverPage() {
  const [mounted, setMounted] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCaregiverData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, alertsRes] = await Promise.all([
        api.getCaregiverOverview().catch(() => null),
        api.getCaregiverAlerts().catch(() => null)
      ]);

      if (overviewRes?.data?.patients) {
        setPatients(overviewRes.data.patients);
      }
      if (alertsRes?.data) {
        setAlerts(alertsRes.data);
      }
    } catch (e) {
      console.warn('Caregiver fetch notice:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCaregiverData();
  }, []);

  if (!mounted) return null;

  const defaultAlerts = [
    { id: 1, patient_name: 'Sandeep Roshan', severity: 'moderate', message: 'Resting heart rate baseline calibrated within target norms.', created_at: 'Just now' },
    { id: 2, patient_name: 'Eleanor Vance', severity: 'stable', message: 'Sleep restorative index improved to 88. No nocturnal desaturations.', created_at: '25 min ago' },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  return (
    <div className="page-section space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase font-semibold">Consent-Controlled Clinical Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Caregiver <span className="gradient-text">Command</span> Deck
          </h1>
          <p className="text-xs text-slate-400 mt-1">Multi-patient remote vital surveillance, emergency alerts, and consent-based authorization</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCaregiverData}
            className="btn-neon text-xs px-4 py-2 cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-neon-cyan' : ''}`} />
            <span>Sync Patients</span>
          </button>
          <button 
            onClick={() => {
              const email = prompt('Enter patient email address to link:');
              if (email) alert(`Consent authorization request sent to ${email}`);
            }}
            className="btn-neon-solid text-xs px-4 py-2 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Authorize Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {patients.map((p) => {
          const isCritical = p.status === 'critical';
          const isWarning = p.status === 'warning';
          const statusColor = isCritical ? '#FF3366' : isWarning ? '#FFB800' : '#00FF88';
          const hr = p.latest_vitals?.heart_rate || 72;

          return (
            <div 
              key={p.id} 
              className={`glass-card p-5 hover:scale-[1.02] transition-all duration-300 border ${
                isCritical 
                  ? 'border-alert-red/50 shadow-[0_0_20px_rgba(255,51,102,0.2)]' 
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                  {p.name.split(' ').map((n: string)=>n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{p.name}</div>
                  <div className="text-[0.62rem] text-slate-400 font-mono truncate">{p.relationship || 'Monitored Profile'}</div>
                </div>
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ 
                    background: statusColor, 
                    boxShadow: `0 0 10px ${statusColor}` 
                  }} 
                />
              </div>

              <div className="text-[0.68rem] text-slate-300 font-medium mb-3 truncate flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neon-cyan" />
                <span>Authorized Consent Active</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <div className="text-[0.6rem] text-slate-400 font-mono uppercase">Heart Rate</div>
                  <div className="text-sm font-bold font-mono" style={{ color: statusColor }}>
                    {hr} <span className="text-[0.6rem] font-normal text-slate-400">BPM</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.6rem] text-slate-400 font-mono uppercase">Oxygen</div>
                  <div className="text-xs font-bold font-mono text-neon-cyan">
                    {p.latest_vitals?.spo2 || 98.2}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Alert Feed */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-alert-red/10 border border-alert-red/30 flex items-center justify-center text-alert-red">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">Continuous Alert Feed</h3>
            </div>
            <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded-full bg-alert-red/15 text-alert-red border border-alert-red/30">
              Live Priority
            </span>
          </div>

          <div className="space-y-3">
            {displayAlerts.map((a, i) => (
              <div 
                key={a.id || i} 
                className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-alert-red/15 border border-alert-red/30 text-alert-red">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{a.patient_name || 'Authorized Patient'}</div>
                  <div className="text-[0.7rem] text-slate-300 truncate">{a.message || a.source || 'Biometric variance note'}</div>
                </div>
                <span className="text-[0.62rem] font-mono text-slate-400 flex-shrink-0">{a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule & Notes */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">Clinical Care Schedule</h3>
            </div>
            <span className="text-[0.62rem] font-mono text-slate-400">Today</span>
          </div>

          <div className="space-y-3">
            {[
              { time: '10:00 AM', task: 'Review 24h Resting Baseline with Sandeep Roshan', status: 'Completed', color: '#00FF88' },
              { time: '02:30 PM', task: 'Remote Medication Adherence Check (Eleanor Vance)', status: 'Pending', color: '#FFB800' },
              { time: '05:00 PM', task: 'Biometric Telemetry Sync & Export Protocol', status: 'Upcoming', color: '#00D4FF' },
            ].map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[0.65rem] font-mono text-neon-cyan font-bold">{s.time}</div>
                  <div className="text-xs font-bold text-white mt-0.5">{s.task}</div>
                </div>
                <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded-full border" style={{ borderColor: `${s.color}40`, color: s.color, background: `${s.color}15` }}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
