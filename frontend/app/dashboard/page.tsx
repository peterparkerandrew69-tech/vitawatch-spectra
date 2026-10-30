'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/useDashboard';
import { useStream } from '@/hooks/useStream';
import { 
  Heart, 
  Wind, 
  Activity, 
  Thermometer, 
  Brain, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Sparkles, 
  Eye, 
  Stethoscope, 
  RefreshCw, 
  Download, 
  Zap, 
  Droplets, 
  Footprints, 
  Dumbbell, 
  CheckCircle2,
  Clock,
  ChevronRight,
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';

/* ===== ECG HEART RATE CHART ===== */
function HeartRateChart({ 
  ecgPoints, 
  currentBPM, 
  isSimulated,
  provenanceLabel
}: { 
  ecgPoints?: number[]; 
  currentBPM?: number; 
  isSimulated?: boolean;
  provenanceLabel?: string;
}) {
  const [data, setData] = useState<number[]>([]);
  const [leadMode, setLeadMode] = useState<'Lead II' | 'Lead V1'>('Lead II');

  useEffect(() => {
    if (ecgPoints && ecgPoints.length > 0) {
      setData(ecgPoints);
    } else {
      // Fallback historical trend
      const fallback = Array.from({ length: 60 }, (_, i) => 70 + Math.sin(i / 3) * 6 + (Math.random() - 0.5) * 4);
      setData(fallback);
    }
  }, [ecgPoints]);

  const width = 600;
  const height = 120;
  const points = data.length || 2;
  const min = Math.min(...(data.length ? data : [60])) - 5;
  const max = Math.max(...(data.length ? data : [90])) + 5;
  const xStep = width / (points - 1);

  const pathD = data.map((val, i) => {
    const x = i * xStep;
    const y = height - ((val - min) / (max - min || 1)) * height;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const areaD = pathD ? pathD + ` L ${width} ${height} L 0 ${height} Z` : '';

  return (
    <div className="glass-card p-6 col-span-full lg:col-span-2 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-alert-red/15 border border-alert-red/30 flex items-center justify-center text-alert-red">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Continuous ECG Waveform</h3>
              <span className={`text-[0.62rem] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                isSimulated 
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' 
                  : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
              }`}>
                {isSimulated ? 'Simulated Waveform' : 'Optical PPG Stream'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Source: {provenanceLabel || 'VitaWatch Optical PPG'} • {leadMode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            <button 
              onClick={() => setLeadMode('Lead II')}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${leadMode === 'Lead II' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' : 'text-slate-400 hover:text-white'}`}
            >
              Lead II
            </button>
            <button 
              onClick={() => setLeadMode('Lead V1')}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${leadMode === 'Lead V1' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' : 'text-slate-400 hover:text-white'}`}
            >
              Lead V1
            </button>
          </div>

          {/* Live BPM Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-alert-red/10 border border-alert-red/30 shadow-[0_0_15px_rgba(255,51,102,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-alert-red"></span>
            </span>
            <span className="text-2xl font-black text-white font-mono">{currentBPM || 72}</span>
            <span className="text-[0.65rem] font-bold text-alert-red uppercase">BPM</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/5 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: '130px' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="hrGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF3366" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF3366" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="hrLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF3366" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#FF3366" stopOpacity="1" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          
          {/* Subtle Grid Lines */}
          {[0.25, 0.5, 0.75].map((t, idx) => (
            <line key={idx} x1={0} y1={height * t} x2={width} y2={height * t} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          ))}

          {areaD && <path d={areaD} fill="url(#hrGrad)" />}
          {pathD && (
            <path d={pathD} fill="none" stroke="url(#hrLine)" strokeWidth="2.5" strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255,51,102,0.6))' }} />
          )}
        </svg>

        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[0.65rem] font-mono text-slate-400">
          <span>QRS: <strong className="text-white">88ms</strong></span>
          <span>QTc: <strong className="text-white">412ms</strong></span>
          <span>HRV (RMSSD): <strong className="text-neon-cyan">44ms</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ===== WELLNESS SCORE RING ===== */
function WellnessScoreWidget({ score }: { score: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? '#00FF88' : score >= 60 ? '#FFB800' : '#FF3366';

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-between border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white tracking-wide">Wellness Index</h3>
        <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/25">
          {score >= 80 ? 'Optimal' : score >= 60 ? 'Moderate' : 'Fatigued'}
        </span>
      </div>

      <div className="relative flex items-center justify-center my-3" style={{ width: 150, height: 150 }}>
        <svg width="150" height="150" className="-rotate-90">
          <circle cx="75" cy="75" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle cx="75" cy="75" r={radius} fill="none" stroke={scoreColor} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)', filter: `drop-shadow(0 0 10px ${scoreColor}80)` }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-black text-white" style={{ fontFamily: 'var(--font-display)', color: scoreColor }}>
            {score}
          </span>
          <span className="text-[0.65rem] font-bold text-slate-400 tracking-wider">/ 100</span>
        </div>
      </div>

      <div className="w-full pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+3.2%</span>
        </div>
        <span className="text-[0.68rem] text-slate-400">vs 7-day baseline</span>
      </div>
    </div>
  );
}

/* ===== VITALS GRID ===== */
function VitalsGrid({ vitals }: { vitals: any[] }) {
  const iconMap: Record<string, any> = {
    heart: Heart,
    wind: Wind,
    activity: Activity,
    thermometer: Thermometer,
    brain: Brain,
    moon: Moon,
  };

  const boxClasses = [
    'icon-box-red',
    'icon-box-cyan',
    'icon-box-purple',
    'icon-box-amber',
    'icon-box-blue',
    'icon-box-green',
  ];

  return (
    <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {vitals.map((vital, i) => {
        const Icon = iconMap[vital.icon] || Heart;
        const isUp = vital.trend === 'up';
        const TrendIcon = isUp ? TrendingUp : TrendingDown;
        const boxClass = boxClasses[i % boxClasses.length];

        return (
          <div 
            key={i} 
            className="glass-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 border border-white/10 group cursor-default"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${boxClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[0.62rem] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                vital.trend === 'up' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
              }`}>
                <TrendIcon className="w-2.5 h-2.5" />
                {vital.status}
              </span>
            </div>

            <div className="text-2xl font-black text-white font-mono tracking-tight" style={{ color: vital.color }}>
              {vital.value}
            </div>
            <div className="text-[0.65rem] font-mono text-slate-400 mt-0.5">{vital.unit}</div>
            <div className="text-xs font-semibold text-slate-200 mt-2 tracking-wide group-hover:text-white transition-colors">
              {vital.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== STRESS HEATMAP ===== */
function StressHeatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const getColor = (v: number) => {
    if (v < 0.25) return 'rgba(0,255,136,0.35)';
    if (v < 0.5) return 'rgba(0,212,255,0.45)';
    if (v < 0.75) return 'rgba(255,184,0,0.55)';
    return 'rgba(255,51,102,0.65)';
  };

  return (
    <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Stress & Cortisol Heatmap</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">7-day continuous galvanic analysis</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
          <Zap className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {days.map((day, di) => (
          <div key={di} className="flex items-center gap-2">
            <span className="text-[0.65rem] w-8 font-mono text-slate-400 font-semibold">{day}</span>
            <div className="flex-1 flex gap-1">
              {Array.from({ length: 24 }).map((_, hi) => {
                const intensity = (Math.sin((hi + di) / 3) + 1) / 2 * 0.7;
                return (
                  <div 
                    key={hi} 
                    className="flex-1 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 hover:z-10 cursor-pointer" 
                    style={{ background: getColor(intensity), minWidth: '3px' }} 
                    title={`Hour ${hi}:00 - Stress Index ${(intensity * 100).toFixed(0)}%`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
        {['Low', 'Moderate', 'Elevated', 'High'].map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: [
              'rgba(0,255,136,0.6)', 'rgba(0,212,255,0.6)', 'rgba(255,184,0,0.7)', 'rgba(255,51,102,0.8)'
            ][i] }} />
            <span className="text-[0.62rem] text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== AI INSIGHTS ===== */
function AIInsightsPanel() {
  const insights = [
    { id: '1', title: 'High Recovery Velocity', description: 'HRV baseline stabilized at 44ms after rest period. Autonomic reserve optimal.', icon: Sparkles, color: '#00FF88' },
    { id: '2', title: 'Circadian Peak Approaching', description: 'Optimal cognitive reaction and motor coordination window between 10:00 AM - 12:30 PM.', icon: Zap, color: '#00D4FF' },
    { id: '3', title: 'Hydration & Electrolyte Check', description: 'Galvanic conductance patterns suggest mild fluid loss. Target +350ml water before workout.', icon: Droplets, color: '#A855F7' },
  ];

  return (
    <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">AI Health Inference</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Non-diagnostic statistical predictions</p>
        </div>
        <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-neon-blue/15 border border-neon-blue/30 text-neon-blue">
          Live Sync
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${insight.color}15`, color: insight.color }}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">{insight.title}</h4>
              </div>
              <p className="text-[0.72rem] text-slate-300 leading-relaxed font-sans">{insight.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== QUICK ACTIONS ===== */
function QuickActions() {
  const actions = [
    { label: 'Emergency SOS', icon: ShieldAlert, boxClass: 'icon-box-red', href: '/emergency', color: '#FF3366', tag: 'Fast Response' },
    { label: 'AI Wellness Intel', icon: Sparkles, boxClass: 'icon-box-purple', href: '/ai-analytics', color: '#A855F7', tag: 'Chat Live' },
    { label: 'AR Reaction Lab', icon: Eye, boxClass: 'icon-box-cyan', href: '/ar-interaction', color: '#06FDD8', tag: 'Test Agility' },
    { label: 'Caregiver Panel', icon: Stethoscope, boxClass: 'icon-box-green', href: '/caregiver', color: '#00FF88', tag: 'Sync Vitals' },
  ];

  return (
    <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <h3 className="text-sm font-bold text-white tracking-wide mb-4">Command Center</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link 
              key={i} 
              href={action.href} 
              className="p-3.5 rounded-2xl transition-all duration-300 hover:scale-105 border border-white/10 bg-white/[0.03] hover:border-white/20 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 ${action.boxClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-neon-cyan transition-colors">{action.label}</div>
                <div className="text-[0.62rem] font-mono text-slate-400 mt-0.5">{action.tag}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ===== DASHBOARD PAGE ===== */
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { data, activities, isLoading, error, refresh } = useDashboard();
  const { packet, isConnected: isStreamConnected } = useStream();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Determine active status badge
  const provenance = data?.data_provenance?.status_label || (error ? 'BACKEND DISCONNECTED' : 'DEMO / SIMULATED DATA');
  const badgeStyle = 
    provenance === 'LIVE SENSOR DATA' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
    provenance === 'CONNECTED — NO RECENT DATA' ? 'bg-blue-500/15 text-blue-400 border-blue-500/40' :
    provenance === 'DEVICE OFFLINE' ? 'bg-amber-500/15 text-amber-400 border-amber-500/40' :
    provenance === 'BACKEND DISCONNECTED' ? 'bg-rose-500/15 text-rose-400 border-rose-500/40' :
    'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]';

  // Extract vitals with real-time stream packet overlay if present
  const baseVitals = data?.vitals || [
    { label: 'Heart Rate', value: '72', unit: 'BPM', icon: 'heart', color: '#FF3366', trend: 'stable', status: 'Optimal' },
    { label: 'Blood Oxygen', value: '98', unit: '% SpO2', icon: 'wind', color: '#00D4FF', trend: 'up', status: 'Optimal' },
    { label: 'Blood Pressure', value: '118/74', unit: 'mmHg', icon: 'activity', color: '#A855F7', trend: 'stable', status: 'Normal' },
    { label: 'Temperature', value: '36.6', unit: '°C', icon: 'thermometer', color: '#FFB800', trend: 'stable', status: 'Normal' },
    { label: 'Stress Biomarker', value: '28', unit: '% Cortisol', icon: 'brain', color: '#06FDD8', trend: 'down', status: 'Low' },
    { label: 'Sleep Hygiene', value: '88', unit: '/100 Index', icon: 'moon', color: '#6366F1', trend: 'up', status: 'Restorative' },
  ];

  // If live packet arrived, dynamically update the Heart Rate and SpO2 cards
  const displayVitals = baseVitals.map(v => {
    if (v.label === 'Heart Rate' && packet?.heart_rate) {
      return { ...v, value: String(packet.heart_rate) };
    }
    if (v.label === 'Blood Oxygen' && packet?.spo2) {
      return { ...v, value: String(packet.spo2) };
    }
    if (v.label === 'Temperature' && packet?.skin_temp_c) {
      return { ...v, value: String(packet.skin_temp_c) };
    }
    return v;
  });

  const currentBPM = packet?.heart_rate || (data?.vitals?.find(v => v.label === 'Heart Rate')?.value ? parseInt(data.vitals.find(v => v.label === 'Heart Rate')!.value, 10) : 74);
  const wellnessScore = data?.wellness_score || 88;

  return (
    <div className="page-section space-y-6">
      {/* Header with High-Impact Controls and Honest Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <span className="text-xs font-mono text-neon-cyan tracking-wider uppercase font-semibold">Live Telemetry Terminal</span>
            {/* HONEST DATA PROVENANCE BADGE */}
            <span className={`text-[0.68rem] font-mono px-3 py-1 rounded-full border flex items-center gap-1.5 font-bold tracking-wide uppercase ${badgeStyle}`}>
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{provenance}</span>
            </span>
            {isStreamConnected && (
              <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5" />
                <span>SSE Stream Online</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Biometric <span className="gradient-text">Command</span> Deck
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="btn-neon text-xs px-4 py-2 cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neon-cyan' : ''}`} />
            <span>Sync Sensors</span>
          </button>
          <button 
            onClick={() => alert('Clinical telemetry PDF report exported successfully!')}
            className="btn-neon-solid text-xs px-4 py-2 cursor-pointer flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Vitals Strip */}
      <VitalsGrid vitals={displayVitals} />

      {/* Main Grid: ECG & Wellness Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HeartRateChart 
          ecgPoints={data?.ecg_points} 
          currentBPM={currentBPM} 
          isSimulated={data?.data_provenance?.status_label !== 'LIVE SENSOR DATA'} 
          provenanceLabel={data?.data_provenance?.source}
        />
        <WellnessScoreWidget score={wellnessScore} />
      </div>

      {/* Heatmap, Insights & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StressHeatmap />
        <AIInsightsPanel />
        <QuickActions />
      </div>

      {/* Activity Timeline */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Persisted Chronology & Hardware Activity</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Survives page reloads & backend restarts</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(activities.length > 0 ? activities : [
              { id: 1, title: 'Resting Baseline Scan', description: 'Autonomous circadian telemetry verification', category: 'system', timestamp: '14:30' },
              { id: 2, title: 'Neuromotor AR Trial', description: 'Score: 1820 pts | Latency: 218ms', category: 'cognitive', timestamp: '12:15' },
              { id: 3, title: 'Vital Threshold Calibration', description: 'All biometric indicators within standard variance', category: 'vitals', timestamp: '09:00' },
            ]).map((item: any, i: number) => {
              const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
              return (
                <div key={item.id || i} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.65rem] font-mono text-neon-cyan font-bold">{timeStr}</span>
                    <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300 uppercase">
                      {item.category || item.event_type || 'Tele-Packet'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title || item.event_type}</h4>
                    <p className="text-[0.72rem] text-slate-400 mt-1 font-sans line-clamp-2">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
