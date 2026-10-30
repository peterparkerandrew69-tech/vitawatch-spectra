'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api-client';
import { 
  Eye, 
  Target, 
  Zap, 
  Trophy, 
  Brain, 
  Clock, 
  Award, 
  RotateCcw, 
  Sparkles,
  Flame,
  CheckCircle2,
  Medal
} from 'lucide-react';

function ReactionTest({ onTrialRecorded }: { onTrialRecorded?: () => void }) {
  const [state, setState] = useState<'idle'|'waiting'|'ready'|'result'>('idle');
  const [rt, setRt] = useState(0);
  const [best, setBest] = useState(999);
  const [history, setHistory] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const start = useRef(0);

  const begin = useCallback(() => {
    setState('waiting');
    timer.current = setTimeout(() => { 
      setState('ready'); 
      start.current = Date.now(); 
    }, 1500 + Math.random() * 2500);
  }, []);

  const click = useCallback(async () => {
    if (state === 'idle' || state === 'result') {
      begin();
    } else if (state === 'waiting') { 
      if (timer.current) clearTimeout(timer.current); 
      setState('idle'); 
    } else if (state === 'ready') {
      const t = Date.now() - start.current;
      setRt(t); 
      setHistory(p => [...p, t].slice(-10));
      if (t < best) setBest(t);
      setState('result');

      // Persist trial to backend API
      try {
        const score = Math.max(100, Math.round(2000 - t * 4));
        await api.recordCognitiveSession({
          task_type: 'reaction_speed',
          difficulty: 'medium',
          reaction_time_ms: t,
          score,
          accuracy_percent: 98.0,
          notes: 'AR Reaction challenge recorded via Spectra dashboard'
        });
        if (onTrialRecorded) onTrialRecorded();
      } catch (e) {
        console.warn('Could not record cognitive session:', e);
      }
    }
  }, [state, begin, best, onTrialRecorded]);

  return (
    <div className="glass-card p-6 col-span-full lg:col-span-2 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">AR Visual Reflex Benchmark</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Neuromuscular response speed under optical latency</p>
          </div>
        </div>
        <span className="text-[0.68rem] font-mono px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
          Persisted to SQLite
        </span>
      </div>

      {/* Interactive Trigger Pad */}
      <div 
        onClick={click} 
        className={`rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 select-none flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${
          state === 'waiting' 
            ? 'bg-alert-red/10 border-2 border-alert-red shadow-[0_0_30px_rgba(255,51,102,0.3)]' 
            : state === 'ready' 
            ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_50px_rgba(0,255,136,0.6)] animate-pulse' 
            : state === 'result'
            ? 'bg-neon-blue/10 border-2 border-neon-blue/50'
            : 'bg-white/[0.02] border-2 border-white/10 hover:border-cyan-400/50'
        }`}
        style={{ minHeight: 220 }}
      >
        {state === 'idle' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center text-neon-cyan mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <Target className="w-7 h-7" />
            </div>
            <div className="text-lg font-bold text-white tracking-wide">Click To Initiate Calibration</div>
            <p className="text-xs text-slate-400 mt-1">Wait for visual cue to flash green, then tap immediately</p>
          </>
        )}

        {state === 'waiting' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-alert-red/20 border border-alert-red/40 flex items-center justify-center text-alert-red mb-3 animate-spin">
              <Clock className="w-7 h-7" />
            </div>
            <div className="text-xl font-black text-alert-red tracking-wider">HOLD... WAIT FOR GREEN</div>
            <p className="text-xs text-slate-400 mt-1">Premature click aborts current trial</p>
          </>
        )}

        {state === 'ready' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-400/30 border border-emerald-400 flex items-center justify-center text-emerald-300 mb-3 animate-bounce shadow-[0_0_30px_rgba(0,255,136,0.8)]">
              <Zap className="w-8 h-8" />
            </div>
            <div className="text-3xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(0,255,136,1)]">
              CLICK NOW!
            </div>
          </>
        )}

        {state === 'result' && (
          <>
            <div className="text-5xl font-black font-mono tracking-tight" style={{ color: rt < 250 ? '#00FF88' : rt < 350 ? '#FFB800' : '#FF3366' }}>
              {rt}<span className="text-2xl ml-1 text-slate-400">ms</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              {rt < 210 ? 'Top 1% Reflex Index — Superhuman' : rt < 260 ? 'Optimal Athletic Performance' : 'Standard Baseline Response'}
            </div>
            <div className="btn-neon text-xs px-5 py-2 mt-4 flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Tap to retake
            </div>
          </>
        )}
      </div>

      {/* Trial Statistics Strip */}
      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-3.5 mt-5">
          {[
            { label: 'Personal Best', value: `${best}ms`, color: '#00FF88', icon: Trophy },
            { label: 'Average (Recent)', value: `${Math.round(history.reduce((a,b)=>a+b,0)/history.length)}ms`, color: '#00D4FF', icon: Target },
            { label: 'Total Trials', value: `${history.length}`, color: '#A855F7', icon: Award },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: s.color }}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-bold">{s.label}</span>
                </div>
                <div className="text-xl font-black font-mono text-white">{s.value}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Leaderboard({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    api.getCognitiveLeaderboard()
      .then(res => {
        if (res?.data && res.data.length > 0) {
          setEntries(res.data);
        } else {
          // Fallback demo leaderboard
          setEntries([
            { rank: 1, display_name: 'Sandeep R.', score: 1850, reaction_time_ms: 218.4, is_current_user: true },
            { rank: 2, display_name: 'Dr. Elena R.', score: 1680, reaction_time_ms: 235.2, is_current_user: false },
            { rank: 3, display_name: 'Marcus K.', score: 1420, reaction_time_ms: 254.1, is_current_user: false },
          ]);
        }
      })
      .catch(() => {
        setEntries([
          { rank: 1, display_name: 'Sandeep R.', score: 1850, reaction_time_ms: 218.4, is_current_user: true },
          { rank: 2, display_name: 'Dr. Elena R.', score: 1680, reaction_time_ms: 235.2, is_current_user: false },
        ]);
      });
  }, [refreshKey]);

  return (
    <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">Reflex Leaderboard</h3>
        </div>
        <span className="text-[0.62rem] font-mono text-slate-400">Persisted Records</span>
      </div>

      <div className="space-y-2">
        {entries.slice(0, 6).map((e, idx) => {
          const rank = e.rank || idx + 1;
          const isTop3 = rank <= 3;
          const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
          return (
            <div 
              key={e.session_id || idx} 
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors border ${
                e.is_current_user 
                  ? 'bg-neon-blue/15 border-neon-blue/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="w-6 text-center font-mono font-bold text-xs">
                {isTop3 ? (
                  <Medal className="w-4 h-4 mx-auto" style={{ color: medalColors[rank - 1] }} />
                ) : (
                  <span className="text-slate-500">#{rank}</span>
                )}
              </div>

              <span className={`text-xs font-semibold flex-1 ${e.is_current_user ? 'text-neon-cyan font-bold' : 'text-slate-200'}`}>
                {e.display_name} {e.is_current_user && '(You)'}
              </span>

              <div className="text-right">
                <span className="text-xs font-black font-mono text-neon-blue">
                  {e.score || Math.round(2000 - e.reaction_time_ms * 4)} <span className="text-[0.6rem] font-normal text-slate-400">pts</span>
                </span>
                <div className="text-[0.62rem] font-mono text-slate-400">{e.reaction_time_ms}ms</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ARInteractionPage() {
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleTrialRecorded = () => {
    setRefreshKey(k => k + 1);
  };

  const challenges = [
    { title: 'Sub-220ms Reflex', desc: 'Register 5 consecutive reaction trials under 220ms', progress: 3, total: 5, icon: Zap, color: '#FFB800' },
    { title: 'Harmonic Stability', desc: '10 consecutive trials with standard deviation < 15ms', progress: 7, total: 10, icon: Target, color: '#00D4FF' },
    { title: 'Cognitive Endurance', desc: 'Complete 25 AR reflex trials within 1 hour', progress: 18, total: 25, icon: Brain, color: '#A855F7' },
  ];

  const scores = [
    { label: 'Reflex Speed', score: 88, color: '#00D4FF' },
    { label: 'Latency Stability', score: 76, color: '#A855F7' },
    { label: 'Visual Vigilance', score: 94, color: '#00FF88' },
    { label: 'Neuromotor Sync', score: 82, color: '#FFB800' },
  ];

  return (
    <div className="page-section space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="w-4 h-4 text-neon-cyan" />
          <span className="text-xs font-mono text-neon-cyan tracking-wider uppercase font-semibold">Neuromotor Conditioning</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
          AR <span className="gradient-text">Cognitive</span> Lab
        </h1>
        <p className="text-xs text-slate-400 mt-1">Augmented sensory reaction testing, neuro-latency mapping, and motor agility metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ReactionTest onTrialRecorded={handleTrialRecorded} />
        <Leaderboard refreshKey={refreshKey} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide">Neuromotor Protocols</h3>
            <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
              3 Active
            </span>
          </div>

          <div className="space-y-3.5">
            {challenges.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${c.color}20`, color: c.color }}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">{c.title}</span>
                    </div>
                    <span className="text-[0.68rem] font-mono font-bold" style={{ color: c.color }}>{c.progress}/{c.total}</span>
                  </div>
                  <p className="text-[0.68rem] text-slate-300 mb-2 leading-relaxed">{c.desc}</p>
                  <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden p-[1px]">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${(c.progress / c.total) * 100}%`, 
                        background: c.color, 
                        boxShadow: `0 0 8px ${c.color}60` 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cognitive Index */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide">Neural Agility Breakdown</h3>
            <Brain className="w-4 h-4 text-neon-blue" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {scores.map((item, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.5" 
                      fill="none" 
                      stroke={item.color} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeDasharray={`${item.score} ${100 - item.score}`} 
                      style={{ filter: `drop-shadow(0 0 6px ${item.color}90)` }} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black font-mono" style={{ color: item.color }}>{item.score}</span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-200">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
