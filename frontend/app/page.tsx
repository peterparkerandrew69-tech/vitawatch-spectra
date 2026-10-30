'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { statNumbers } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';
import { 
  HeartPulse, 
  BrainCircuit, 
  ShieldAlert, 
  Eye, 
  Moon, 
  Smile, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle2, 
  Send,
  Play,
  Flame,
  Radio
} from 'lucide-react';

/* ===== ANIMATED COUNTER COMPONENT ===== */
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [visible, target]);

  return (
    <div ref={ref} className="counter-value text-3xl md:text-5xl font-black neon-text-blue">
      {prefix}{target >= 1000 ? formatNumber(Math.round(count)) : count < 1 ? count.toFixed(1) : Math.round(count).toString()}{suffix}
    </div>
  );
}

/* ===== PARTICLE BACKGROUND ===== */
function Particles() {
  return (
    <div className="particles">
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 12}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
            opacity: 0.15 + Math.random() * 0.3,
            width: `${2 + Math.random() * 2.5}px`,
            height: `${2 + Math.random() * 2.5}px`,
            background: ['#00D4FF', '#A855F7', '#06FDD8', '#00FF88'][Math.floor(Math.random() * 4)],
          }}
        />
      ))}
    </div>
  );
}

/* ===== LIVE ECG PREVIEW ===== */
function ECGPreview() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => (prev + 2) % 400);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  const generatePath = () => {
    let path = '';
    for (let i = 0; i < 400; i++) {
      const x = i;
      const cycle = (i + offset) % 80;
      let y = 50;
      if (cycle >= 30 && cycle < 33) y = 50 - (cycle - 30) * 8;
      else if (cycle >= 33 && cycle < 35) y = 26 - (cycle - 33) * 30;
      else if (cycle >= 35 && cycle < 37) y = -34 + (cycle - 35) * 55;
      else if (cycle >= 37 && cycle < 40) y = 76 - (cycle - 37) * 8.67;
      else if (cycle >= 45 && cycle < 50) y = 50 - Math.sin((cycle - 45) / 5 * Math.PI) * 10;
      else y = 50 + (Math.sin(i * 0.1) * 2);
      path += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `;
    }
    return path;
  };

  return (
    <div className="relative w-full h-full flex items-center">
      <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
            <stop offset="25%" stopColor="#00D4FF" stopOpacity="1" />
            <stop offset="70%" stopColor="#A855F7" stopOpacity="1" />
            <stop offset="100%" stopColor="#06FDD8" stopOpacity="0" />
          </linearGradient>
          <filter id="ecgGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={generatePath()} fill="none" stroke="url(#ecgGrad)" strokeWidth="2.5" filter="url(#ecgGlow)" />
      </svg>
    </div>
  );
}

/* ===== WELLNESS SCORE RING ===== */
function WellnessRing() {
  const [score, setScore] = useState(0);
  const targetScore = 89;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setScore(targetScore), 400);
    return () => clearTimeout(timer);
  }, []);

  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-neon-cyan/10 blur-xl animate-pulse" />
      
      <svg width="220" height="220" className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#06FDD8" />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="110" cy="110" r={radius} fill="none" stroke="url(#ringGrad)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)', filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.5))' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <div className="flex items-center gap-1">
          <span className="text-5xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {score}
          </span>
          <span className="text-neon-cyan text-sm font-bold">/100</span>
        </div>
        <span className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">Optimal Bio-Index</span>
      </div>
    </div>
  );
}

/* ===== MAIN LANDING PAGE ===== */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'ai',
      text: 'Good morning, Sandeep! Your HRV is 52ms (+14% vs baseline). Your circadian rhythms are aligning perfectly. Would you like a recovery plan for your 3 PM peak focus slot?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const quickPrompts = [
    'Analyze my HRV trend',
    'Am I at risk of afternoon burnout?',
    'Optimize my sleep protocol',
  ];

  const handleSendPrompt = (textToSend?: string) => {
    const query = textToSend || chatPrompt;
    if (!query.trim()) return;

    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    setChatPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (query.toLowerCase().includes('hrv')) {
        reply = 'Your 7-day HRV has climbed from 44ms to 52ms. This indicates robust parasympathetic activation and increased physiological resilience. Keep up the 10:30 PM sleep window!';
      } else if (query.toLowerCase().includes('burnout') || query.toLowerCase().includes('stress')) {
        reply = 'Cortisol markers indicate mild stress around 2:30 PM. A brief 5-minute boxed-breathing exercise (4-4-4-4) is projected to decrease systolic pressure by 6 mmHg.';
      } else {
        reply = 'Sleep efficiency scored 92% last night with 2.2h of deep restorative wave sleep. Maintain hydration levels (+500ml) today to sustain cognitive reaction times under 210ms.';
      }
      setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  const featurePillars = [
    { 
      title: 'Real-Time Vitals', 
      description: 'Continuous millisecond-level telemetry of heart rate, SpO2, blood pressure, and core temperature with instant anomaly detection.', 
      icon: HeartPulse, 
      boxClass: 'icon-box-red', 
      color: '#FF3366' 
    },
    { 
      title: 'AI Predictive Models', 
      description: 'Proprietary deep neural networks predict physiological dips, stress surges, and cardiovascular fatigue up to 72 hours ahead.', 
      icon: BrainCircuit, 
      boxClass: 'icon-box-purple', 
      color: '#A855F7' 
    },
    { 
      title: 'Autonomous Emergency SOS', 
      description: 'Automated fall trajectory detection, instant emergency dispatcher handoff, and encrypted GPS coordinate broadcast.', 
      icon: ShieldAlert, 
      boxClass: 'icon-box-red', 
      color: '#FF3366' 
    },
    { 
      title: 'AR Cognitive Lab', 
      description: 'Interactive visual reaction testing, neuromotor coordination metrics, and neuro-agility benchmarking.', 
      icon: Eye, 
      boxClass: 'icon-box-cyan', 
      color: '#06FDD8' 
    },
    { 
      title: 'Sleep Stage Intelligence', 
      description: 'Polysomnographic sleep architecture breakdown: Deep, REM, and Light stages paired with restorative quality indexing.', 
      icon: Moon, 
      boxClass: 'icon-box-blue', 
      color: '#6366F1' 
    },
    { 
      title: 'Biomarker Mood Matrix', 
      description: 'Correlate heart rate variability and electrodermal galvanic skin activity to track emotional stability and energy reserves.', 
      icon: Smile, 
      boxClass: 'icon-box-green', 
      color: '#00FF88' 
    },
  ];

  const statIcons = [Users, Activity, BrainCircuit, Zap];

  return (
    <div className="landing-page relative">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-12 pb-16">
        <Particles />
        <div className="hero-grid">
          <div className="hero-grid-inner" />
        </div>

        {/* Ambient background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="fade-in-up inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(0,212,255,0.15)]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(168,85,247,0.1))',
              border: '1px solid rgba(0,212,255,0.3)',
            }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-bold tracking-wider text-neon-cyan font-mono">
              SPECTRA BIOTELEMETRY OS 3.0 • REAL-TIME ACTIVE
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="fade-in-up fade-in-up-delay-1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.04] tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}>
            <span className="gradient-text drop-shadow-[0_0_30px_rgba(0,212,255,0.4)]">VITA</span>
            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">WATCH</span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-pink-400 to-neon-cyan">
              SPECTRA
            </span>
          </h1>

          {/* Subtitle */}
          <p className="fade-in-up fade-in-up-delay-2 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed text-slate-300 font-medium">
            The next-generation AI wellness operating system. Continuous vitals streaming, predictive health forecasts, AR cognitive testing, and emergency telemetry in one fluid interface.
          </p>

          {/* ECG Live Waveform Preview */}
          <div className="fade-in-up fade-in-up-delay-3 w-full max-w-lg mx-auto h-20 mb-8 p-2 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <ECGPreview />
          </div>

          {/* CTAs */}
          <div className="fade-in-up fade-in-up-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-neon-solid text-base px-9 py-4 group">
              <span>Launch Dashboard</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/ar-interaction" className="btn-neon text-base px-8 py-4 group">
              <Play className="w-4 h-4 text-neon-cyan fill-neon-cyan/20 group-hover:fill-neon-cyan transition-colors" />
              <span>Try AR Cognitive Lab</span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-[0.65rem] tracking-widest font-mono text-slate-400 uppercase">EXPLORE PLATFORM</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1.5 h-2.5 rounded-full bg-neon-cyan animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-8 md:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {statNumbers.map((stat, i) => {
                const Icon = statIcons[i];
                return (
                  <div key={i} className="text-center group">
                    <div className="w-10 h-10 rounded-xl mx-auto mb-3 bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                    <div className="text-xs mt-2 font-bold tracking-wider uppercase text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-bold font-mono uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Continuous Intelligence
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="gradient-text">Intelligent</span> Health Pillars
            </h2>
            <p className="text-base text-slate-300 max-w-xl mx-auto">
              Six neural-enhanced biometric modules engineered for real-time proactive care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featurePillars.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="glass-card holo-shimmer p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/40 group"
                >
                  <div className={`w-14 h-14 ${feature.boxClass} mb-5`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WELLNESS SCORE PREVIEW ===== */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-8 md:p-14 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left: Score Ring */}
              <div className="flex-shrink-0">
                <WellnessRing />
              </div>

              {/* Right: Details */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/25 text-neon-cyan text-xs font-bold font-mono uppercase tracking-wider mb-4">
                  <Activity className="w-3.5 h-3.5" />
                  Unified Health Telemetry
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Composite <span className="neon-text-cyan">Wellness</span> Matrix
                </h2>
                <p className="text-base mb-8 max-w-lg text-slate-300 leading-relaxed">
                  A real-time neural synthesis integrating photoplethysmography, sleep spindles, galvanic cortisol signals, and reaction times into a single holistic index.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Cardio Fitness', value: 94, color: '#FF3366', icon: HeartPulse },
                    { label: 'Sleep Hygiene', value: 88, color: '#6366F1', icon: Moon },
                    { label: 'Stress Buffer', value: 81, color: '#06FDD8', icon: Zap },
                    { label: 'Neuro-Reflex', value: 92, color: '#00FF88', icon: Eye },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="p-4 rounded-2xl text-center backdrop-blur-md transition-transform hover:scale-105" style={{
                        background: `${item.color}0D`,
                        border: `1px solid ${item.color}30`,
                      }}>
                        <div className="w-7 h-7 mx-auto mb-2 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20`, color: item.color }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black mb-1" style={{ color: item.color, fontFamily: 'var(--font-mono)' }}>
                          {item.value}
                        </div>
                        <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE AI ASSISTANT SHOWCASE ===== */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-neon-purple/10 border border-neon-purple/25 text-neon-purple text-xs font-bold font-mono tracking-wider">
            <Sparkles className="w-4 h-4" />
            LIVE INTERACTIVE PREVIEW
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Experience Your <span className="neon-text-purple">AI Wellness</span> Copilot
          </h2>

          <p className="text-base mb-10 max-w-2xl mx-auto text-slate-300">
            Ask any question or click a prompt below to see the clinical inference engine in action.
          </p>

          {/* Prompt Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendPrompt(prompt)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-neon-cyan/50 hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-neon-cyan" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="glass-card p-6 max-w-2xl mx-auto text-left border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-1">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 text-neon-cyan">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'ai' 
                      ? 'bg-white/[0.04] border border-white/10 rounded-tl-sm text-slate-200' 
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
                  <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-neon-cyan flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                    Analyzing physiological stream...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }} 
              className="mt-4 flex gap-3"
            >
              <input 
                type="text"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Ask your AI copilot about heart rate, stress, or sleep..." 
                className="flex-1 h-12 rounded-xl px-4 text-xs sm:text-sm bg-white/[0.04] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-colors"
              />
              <button 
                type="submit"
                className="btn-neon-solid px-5 h-12 rounded-xl flex items-center justify-center text-white cursor-pointer"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Elevate Your <span className="gradient-text">Human Performance</span>
          </h2>
          <p className="text-base mb-10 max-w-xl mx-auto text-slate-300">
            Step into the next era of predictive health intelligence. Live data streams, early risk deterrence, and AR cognitive conditioning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-neon-solid text-base px-10 py-4 group">
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/research" className="btn-neon text-base px-10 py-4">
              Explore Sensor Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-wider text-white" style={{ fontFamily: 'var(--font-display)' }}>
                VITAWATCH SPECTRA
              </span>
              <span className="text-xs text-neon-cyan font-mono ml-2">v3.0.4</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-neon-cyan transition-colors">Dashboard</Link>
            <Link href="/ai-analytics" className="hover:text-neon-cyan transition-colors">AI Analytics</Link>
            <Link href="/ar-interaction" className="hover:text-neon-cyan transition-colors">AR Cognitive Lab</Link>
            <Link href="/emergency" className="hover:text-alert-red transition-colors">Emergency Hub</Link>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            © 2026 Vitawatch Spectra. Next-Gen Biometric Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
