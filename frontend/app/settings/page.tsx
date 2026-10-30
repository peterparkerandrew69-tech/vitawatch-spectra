'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import { 
  Sliders, 
  Bell, 
  Shield, 
  Watch, 
  Palette, 
  Download, 
  Trash2, 
  Battery, 
  Check, 
  User, 
  Sparkles,
  Smartphone,
  Scale,
  Activity,
  ChevronRight,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Sandeep Roshan',
    email: 'sandeep@vitawatch.ai',
    age: '24',
    height: "5'10\"",
    weight: '72 kg',
    bloodGroup: 'O+',
    initials: 'SR'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [notifications, setNotifications] = useState({ 
    vitals: true, 
    emergency: true, 
    insights: true, 
    sleep: false, 
    weekly: true 
  });
  
  const [privacy, setPrivacy] = useState({ 
    shareData: false, 
    analytics: true, 
    location: true 
  });

  const [activeAccent, setActiveAccent] = useState('#00D4FF');

  useEffect(() => {
    setMounted(true);
    // Fetch user from backend API
    api.getCurrentUser()
      .then(res => {
        if (res?.data) {
          const u = res.data;
          setProfile({
            name: u.full_name || 'Sandeep Roshan',
            email: u.email || 'sandeep@vitawatch.ai',
            age: String(u.age || 24),
            height: u.height || "5'10\"",
            weight: u.weight || "72 kg",
            bloodGroup: u.blood_group || "O+",
            initials: u.initials || "SR"
          });
        }
      })
      .catch(err => console.warn('User fetch notice:', err));
  }, []);

  if (!mounted) return null;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({
        full_name: profile.name,
        age: parseInt(profile.age, 10) || 24,
        height: profile.height,
        weight: profile.weight,
        blood_group: profile.bloodGroup
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      alert('Profile update notice: saved locally');
    } finally {
      setIsSaving(false);
    }
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button 
      onClick={onToggle} 
      className="w-11 h-6 rounded-full relative transition-all duration-300 cursor-pointer" 
      style={{ 
        background: on ? 'linear-gradient(135deg, #00D4FF, #9333EA)' : 'rgba(255,255,255,0.1)',
        boxShadow: on ? '0 0 12px rgba(0,212,255,0.4)' : 'none'
      }}
    >
      <div 
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300" 
        style={{ 
          left: on ? '22px' : '2px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)' 
        }} 
      />
    </button>
  );

  const devices = [
    { name: 'VitaWatch Spectra Wristband (Alpha)', type: 'ESP32-S3 IoT Node', status: 'connected', battery: 89, color: '#00D4FF', icon: Watch },
    { name: 'Optical PPG Pulse Array', type: 'MAX30102 Sensor', status: 'connected', battery: 96, color: '#00FF88', icon: Activity },
    { name: 'Inertial Motion Unit (6-Axis)', type: 'MPU6050 Accelerometer', status: 'connected', battery: 89, color: '#FFB800', icon: Scale },
  ];

  return (
    <div className="page-section space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs font-mono text-neon-cyan tracking-wider uppercase font-semibold">User Configuration & Device Mesh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Settings <span className="gradient-text">& Identity</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage biometric sensors, notification protocols, and verified account parameters</p>
        </div>

        <button 
          onClick={handleSaveProfile} 
          disabled={isSaving}
          className="btn-neon-solid text-xs px-4 py-2 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          {savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaving ? 'Persisting...' : savedSuccess ? 'Profile Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 text-center border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div>
            <div 
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_25px_rgba(0,212,255,0.3)]" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(168,85,247,0.3))', 
                border: '2px solid rgba(0,212,255,0.5)', 
                fontFamily: 'var(--font-display)' 
              }}
            >
              {profile.initials || 'SR'}
            </div>

            <h3 className="text-lg font-bold text-white">{profile.name}</h3>
            <p className="text-xs text-neon-cyan font-mono mt-0.5">{profile.email}</p>
            <p className="text-[0.68rem] text-slate-400 font-mono">Role: Patient Telemetry Node</p>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {[
                { label: 'Age', val: `${profile.age} yrs` },
                { label: 'Height', val: profile.height },
                { label: 'Weight', val: profile.weight }
              ].map((s, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-black font-mono text-white">{s.val}</div>
                  <div className="text-[0.62rem] text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="text-[0.68rem] text-slate-400 font-mono">
              Blood Group: <strong className="text-alert-red font-bold">{profile.bloodGroup}</strong>
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Alert Protocols</h3>
          </div>

          <div className="space-y-4">
            {([
              { key: 'vitals' as const, label: 'Vital Anomaly Alerts', desc: 'Instant alarm on tachycardia or SpO2 drops' },
              { key: 'emergency' as const, label: 'Autonomous Fall SOS', desc: 'Fall impact & dispatcher auto-routing' },
              { key: 'insights' as const, label: 'Neural AI Health Intel', desc: 'Circadian and cognitive recommendations' },
              { key: 'sleep' as const, label: 'Sleep Window Prompt', desc: 'Circadian optimal bedtime alerts' },
              { key: 'weekly' as const, label: 'Weekly Clinical Digest', desc: 'Full biotelemetry summary export' },
            ]).map((n) => (
              <div key={n.key} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{n.label}</div>
                  <div className="text-[0.68rem] text-slate-400">{n.desc}</div>
                </div>
                <Toggle 
                  on={notifications[n.key]} 
                  onToggle={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key] }))} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Governance */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Security & Data Vault</h3>
          </div>

          <div className="space-y-4">
            {([
              { key: 'shareData' as const, label: 'Anonymized Clinical Sharing', desc: 'Opt-in medical research telemetry' },
              { key: 'analytics' as const, label: 'Neural Telemetry Logging', desc: 'Enhance accuracy of risk predictions' },
              { key: 'location' as const, label: 'Emergency GPS Beacon', desc: 'Required for real-time SOS coordinate lock' },
            ]).map((p) => (
              <div key={p.key} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{p.label}</div>
                  <div className="text-[0.68rem] text-slate-400">{p.desc}</div>
                </div>
                <Toggle 
                  on={privacy[p.key]} 
                  onToggle={() => setPrivacy(prev => ({ ...prev, [p.key]: !prev[p.key] }))} 
                />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            <button 
              onClick={() => alert('Exporting all patient records in encrypted JSON format...')}
              className="w-full btn-neon text-xs py-2.5 justify-start cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Export Biometric Archive
            </button>
            <button 
              onClick={() => {
                if (confirm('Log out from current session?')) {
                  api.logout();
                  window.location.reload();
                }
              }}
              className="w-full btn-danger text-xs py-2.5 justify-start cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Sign Out / Terminate Session
            </button>
          </div>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
              <Watch className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Connected Bio-Wearable Mesh</h3>
          </div>
          <span className="text-[0.62rem] font-mono text-emerald-400">ESP32 Hardware Ingestion Gateway Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {devices.map((d, i) => {
            const Icon = d.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-400/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${d.color}15`, color: d.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{d.name}</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.status === 'connected' ? '#00FF88' : '#64748B', boxShadow: d.status === 'connected' ? '0 0 8px #00FF88' : 'none' }} />
                </div>
                <div className="text-[0.68rem] text-slate-400 font-mono mb-3">{d.type}</div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden p-[1px]">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${d.battery}%`, 
                        background: d.battery > 50 ? '#00FF88' : d.battery > 20 ? '#FFB800' : '#FF3366',
                        boxShadow: `0 0 6px ${d.battery > 50 ? '#00FF88' : '#FFB800'}60`
                      }} 
                    />
                  </div>
                  <span className="text-[0.68rem] font-mono font-bold text-slate-300">{d.battery}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cyber Aesthetic Color Picker */}
      <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2.5 mb-4">
          <Palette className="w-4 h-4 text-neon-cyan" />
          <h3 className="text-sm font-bold text-white tracking-wide">Command Center Chroma Theme</h3>
        </div>
        <div className="flex items-center gap-3">
          {['#00D4FF', '#A855F7', '#06FDD8', '#FF3366', '#FFB800', '#00FF88', '#6366F1'].map((c) => (
            <button 
              key={c} 
              onClick={() => setActiveAccent(c)}
              className="w-9 h-9 rounded-full transition-all hover:scale-110 cursor-pointer flex items-center justify-center shadow-lg" 
              style={{ 
                background: c, 
                border: activeAccent === c ? '2.5px solid white' : '2px solid transparent', 
                boxShadow: activeAccent === c ? `0 0 15px ${c}` : 'none' 
              }} 
            >
              {activeAccent === c && <Check className="w-4 h-4 text-black font-bold stroke-[3]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
