'use client';

import { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  Clock, 
  User, 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  
  // Profile State
  const [profile, setProfile] = useState({
    name: 'Sandeep Roshan',
    age: '24',
    height: "5'10\"",
    weight: '72 kg',
    bloodGroup: 'O+',
    initials: 'SR'
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const notifications = [
    { id: 1, title: 'Optimal Recovery Score', desc: 'HRV baseline up by 14% following 8h deep sleep cycle.', time: '5m ago', type: 'success' },
    { id: 2, title: 'Afternoon Hydration', desc: 'Hydration index lower than expected for current ambient temp.', time: '24m ago', type: 'warning' },
    { id: 3, title: 'Biometrics Calibrated', desc: 'Optical PPG sensors calibrated with 99.8% signal clarity.', time: '1h ago', type: 'info' },
  ];

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    
    // Load profile from localStorage
    const saved = localStorage.getItem('vitawatch_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setFormData(parsed);
      } catch (e) {
        console.error(e);
      }
    }
    
    return () => clearInterval(interval);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const names = formData.name.trim().split(' ');
    const computedInitials = names.length > 1 
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : (formData.name.slice(0, 2)).toUpperCase() || 'SR';
    
    const updated = {
      ...formData,
      initials: computedInitials
    };
    
    setProfile(updated);
    localStorage.setItem('vitawatch_profile', JSON.stringify(updated));
    setModalOpen(false);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('vitawatch-profile-updated'));
    }
  };

  return (
    <div className="topbar relative">
      {/* Left: Mobile Menu + Status Indicators */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors text-slate-300"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-xs font-semibold text-slate-200">System Live</span>
          <span className="text-slate-600 text-xs">•</span>
          <span className="text-xs font-mono text-neon-cyan">6 Biometrics Active</span>
        </div>
      </div>

      {/* Right: Notifications + Time + Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 hover:bg-white/[0.08] transition-all text-slate-300 hover:text-white"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-alert-red text-[0.6rem] font-bold text-white shadow-[0_0_8px_rgba(255,51,102,0.8)]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl p-4 bg-[#0B132B]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neon-cyan" />
                  <span className="text-xs font-bold text-white tracking-wide">Live Biometric Alerts</span>
                </div>
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="text-slate-400 hover:text-white text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{n.title}</span>
                      <span className="text-[0.6rem] font-mono text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[0.7rem] text-slate-300 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 text-center">
                <span className="text-[0.65rem] font-mono text-neon-cyan/80">AI BioTelemetry v3.0 Nominal</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Clock */}
        <div className="text-right hidden sm:block">
          <div className="text-xs font-bold tabular-nums tracking-wide text-white font-mono flex items-center justify-end gap-1.5">
            <Clock className="w-3 h-3 text-neon-blue" />
            {time}
          </div>
          <div className="text-[0.65rem] text-slate-400 font-medium">{date}</div>
        </div>

        {/* Profile Avatar Pill */}
        <button 
          onClick={() => {
            setFormData({ ...profile });
            setModalOpen(true);
          }} 
          className="flex items-center gap-2.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.07] transition-all cursor-pointer group"
          title="Click to edit profile"
        >
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105" 
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.4), rgba(168,85,247,0.4))',
              border: '1px solid rgba(0,212,255,0.6)',
              color: '#FFFFFF',
              boxShadow: '0 0 10px rgba(0,212,255,0.3)'
            }}
          >
            {profile.initials}
          </div>
          <div className="hidden md:block text-left pr-1">
            <div className="text-xs font-semibold text-white leading-tight group-hover:text-neon-cyan transition-colors">
              {profile.name}
            </div>
            <div className="text-[0.6rem] text-slate-400 font-mono">
              {profile.bloodGroup} • {profile.age} yrs
            </div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors hidden sm:block" />
        </button>
      </div>

      {/* EDIT PROFILE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all duration-300">
          <div className="glass-card w-full max-w-md p-6 relative overflow-hidden animate-fade-in shadow-[0_25px_60px_rgba(0,0,0,0.8)]" style={{ border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(10,18,36,0.96)' }}>
            
            {/* Ambient Ambient Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-neon-cyan/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-neon-purple/15 blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                    Patient Health Identity
                  </h3>
                  <p className="text-[0.68rem] text-slate-400">Configure real-time telemetry baseline parameters</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[0.68rem] font-semibold uppercase tracking-wider mb-1.5 text-slate-300">Full Patient Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider mb-1.5 text-slate-300">Age</label>
                  <input 
                    type="text" 
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-neon-cyan transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider mb-1.5 text-slate-300">Blood Type</label>
                  <input 
                    type="text" 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-neon-cyan transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider mb-1.5 text-slate-300">Height</label>
                  <input 
                    type="text" 
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-neon-cyan transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider mb-1.5 text-slate-300">Weight</label>
                  <input 
                    type="text" 
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-neon-cyan transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-neon-solid text-xs px-5 py-2.5 cursor-pointer shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
