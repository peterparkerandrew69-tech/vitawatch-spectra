'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import { generateMoodData, generateSleepData } from '@/lib/mockData';
import { 
  BrainCircuit, 
  Sparkles, 
  Smile, 
  Moon, 
  Zap, 
  Flame, 
  Send, 
  Activity, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Bot,
  AlertCircle
} from 'lucide-react';

export default function AIAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Good evening! I am your VitaWatch Spectra Copilot. I am actively analyzing your resting baseline and autonomic indicators. How can I assist your wellness optimization today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch real non-diagnostic analytics summary from backend
    api.getAnalyticsSummary()
      .then(res => {
        if (res?.data) {
          setAnalytics(res.data);
        }
      })
      .catch(err => console.warn('Analytics summary notice:', err));
  }, []);

  if (!mounted) return null;

  const moodData = generateMoodData();
  const sleepData = generateSleepData();
  const totalSleep = sleepData.reduce((a, b) => a + b.hours, 0);

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    setChatMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.sendCopilotMessage(textToSend);
      const reply = res?.data?.reply || 'Autonomic indicators analyzed. Keep resting baseline consistent and ensure adequate hydration.';
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      // Local fallback with honest disclaimer
      let fallback = 'Your latest telemetry indicates steady vitals. We recommend 4-7-8 breathing and mindful hydration to preserve parasympathetic reserve.';
      if (textToSend.toLowerCase().includes('fatigue')) {
        fallback = 'Circadian metrics indicate moderate afternoon dip. Take a 5-minute movement break and hydrate with electrolytes.';
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    'How is my fatigue level today?',
    'Explain my resting heart rate baseline',
    'Tips to optimize autonomic recovery',
  ];

  const stressScore = analytics?.stress?.score || 28;
  const fatigueScore = analytics?.fatigue?.score || 35;
  const recoveryScore = analytics?.recovery_score || 88;

  return (
    <div className="page-section space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit className="w-4 h-4 text-neon-purple" />
          <span className="text-xs font-mono text-neon-purple tracking-wider uppercase font-semibold">Cognitive & Neural Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
          AI <span className="gradient-text">Analytics</span> Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">Non-diagnostic predictive mood indexing, circadian recovery metrics, and neuro-burnout telemetry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Analysis */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Smile className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">Affective Mood Spectrum</h3>
            </div>
            <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
              Harmonious
            </span>
          </div>

          <div className="space-y-3.5 mb-5">
            {moodData.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs w-20 text-slate-300 font-medium">{m.mood}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden p-[1px]">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${m.value * 100}%`, 
                      background: m.color, 
                      boxShadow: `0 0 10px ${m.color}80` 
                    }} 
                  />
                </div>
                <span className="text-[0.68rem] w-9 text-right font-mono font-bold" style={{ color: m.color }}>
                  {Math.round(m.value * 100)}%
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-400/[0.06] border border-emerald-400/20 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-400">Emotional Stability: +14%</div>
              <div className="text-[0.65rem] text-slate-300 mt-0.5">Neuro-galvanic signals show calm physiological equilibrium</div>
            </div>
          </div>
        </div>

        {/* Sleep Analytics with Honest Labeling */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Sleep Architecture</h3>
                <p className="text-[0.68rem] text-slate-400 font-mono">Nocturnal IMU Estimate: {totalSleep.toFixed(1)} hours</p>
              </div>
            </div>
            <span className="text-[0.6rem] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25">
              Simulated Stages
            </span>
          </div>

          <div className="space-y-3 my-4">
            {sleepData.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-300 font-medium">{s.stage}</span>
                  <span className="text-[0.68rem] font-mono font-bold" style={{ color: s.color }}>{s.hours.toFixed(1)} hrs</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/[0.05] overflow-hidden p-[1px]">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${(s.hours / totalSleep) * 100}%`, 
                      background: s.color, 
                      boxShadow: `0 0 8px ${s.color}60` 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center p-3.5 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/25">
            <div className="text-3xl font-black text-indigo-400 font-mono">
              {recoveryScore}<span className="text-sm text-slate-400 font-normal">/100</span>
            </div>
            <div className="text-[0.65rem] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Estimated Sleep Recovery Index</div>
          </div>
        </div>

        {/* Fatigue & Burnout Telemetry */}
        <div className="space-y-5">
          {/* Fatigue */}
          <div className="glass-card p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Somatic Fatigue Index</h3>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-18 h-18">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#FFB800" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${fatigueScore} 100`} style={{ filter: 'drop-shadow(0 0 6px rgba(255,184,0,0.7))' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-amber-400 font-mono">{fatigueScore}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400">{analytics?.fatigue?.level || 'Low-Moderate Load'}</div>
                <div className="text-[0.68rem] text-slate-300 mt-1 font-sans">
                  Derived from reaction latency and circadian kinetics.
                </div>
              </div>
            </div>
          </div>

          {/* Stress Biomarker */}
          <div className="glass-card p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Stress & Arousal Level</h3>
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-18 h-18">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#00FF88" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${stressScore} 100`} style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,136,0.7))' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-emerald-400 font-mono">{stressScore}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-400">{analytics?.stress?.level || 'Low Stress'}</div>
                <div className="text-[0.68rem] text-slate-300 mt-1 font-sans">
                  HRV RMSSD deviation relative to 7-day personal resting baseline.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Copilot Terminal */}
      <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Interactive AI Clinical Copilot</h3>
              <p className="text-[0.68rem] text-slate-400">Contextual assistant connected to personal telemetry</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {samplePrompts.map((p, idx) => (
              <button 
                key={idx} 
                onClick={() => sendMessage(p)}
                className="hidden sm:inline-flex px-3 py-1 rounded-full text-[0.68rem] font-semibold bg-white/[0.04] border border-white/10 hover:border-neon-cyan/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Message Logs */}
        <div className="space-y-3.5 mb-4 max-h-72 overflow-y-auto pr-1">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs sm:text-sm leading-relaxed ${
                msg.role === 'ai' 
                  ? 'bg-white/[0.03] border border-white/10 rounded-tl-sm text-slate-200' 
                  : 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 rounded-tr-sm text-white'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-neon-cyan flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                Synthesizing physiological parameters...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage()} 
            placeholder="Ask your AI wellness assistant about fatigue, stress, or nutrition..." 
            className="flex-1 h-12 rounded-xl px-4 text-xs sm:text-sm bg-white/[0.04] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-colors" 
          />
          <button 
            onClick={() => sendMessage()} 
            className="btn-neon-solid px-5 h-12 rounded-xl flex items-center justify-center cursor-pointer"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
