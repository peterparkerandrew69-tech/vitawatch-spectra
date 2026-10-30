'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Eye, 
  ShieldAlert, 
  Stethoscope, 
  Microscope, 
  Sliders, 
  Sparkles, 
  Activity,
  ChevronRight,
  Radio
} from 'lucide-react';

const navSections = [
  {
    title: 'Overview',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, glow: 'rgba(0, 212, 255, 0.4)' },
      { href: '/ai-analytics', label: 'AI Analytics', icon: BrainCircuit, glow: 'rgba(168, 85, 247, 0.4)' },
    ],
  },
  {
    title: 'Interaction',
    links: [
      { href: '/ar-interaction', label: 'AR Cognitive Lab', icon: Eye, glow: 'rgba(6, 253, 216, 0.4)' },
      { href: '/emergency', label: 'Emergency Center', icon: ShieldAlert, glow: 'rgba(255, 51, 102, 0.4)', badge: 'SOS' },
    ],
  },
  {
    title: 'Management',
    links: [
      { href: '/caregiver', label: 'Caregiver Panel', icon: Stethoscope, glow: 'rgba(0, 255, 136, 0.4)' },
      { href: '/research', label: 'Research Portal', icon: Microscope, glow: 'rgba(147, 51, 234, 0.4)' },
      { href: '/settings', label: 'Settings', icon: Sliders, glow: 'rgba(255, 184, 0, 0.4)' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group text-decoration-none">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(168,85,247,0.25))',
                border: '1px solid rgba(0,212,255,0.4)',
                boxShadow: '0 0 20px rgba(0,212,255,0.25)',
              }}>
              <Activity className="w-5 h-5 text-neon-cyan animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-blue)' }}>
                VITAWATCH SPECTRA
              </div>
              <div className="text-[0.62rem] tracking-widest font-mono flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                SPECTRA WELLNESS OS
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title} className="mb-2">
              <div className="sidebar-section-title">{section.title}</div>
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`sidebar-link group flex items-center justify-between ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isActive 
                            ? 'bg-neon-blue/20 text-white shadow-[0_0_12px_rgba(0,212,255,0.4)]' 
                            : 'bg-white/[0.03] text-slate-400 group-hover:text-white group-hover:bg-white/[0.08]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{link.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {link.badge && (
                        <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full bg-alert-red/20 text-alert-red border border-alert-red/30">
                          {link.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-neon-blue' : 'text-slate-500'}`} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* AI Assistant Badge */}
        <div className="p-4 m-3 mb-4 rounded-xl border border-neon-cyan/20 relative overflow-hidden group" style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(168,85,247,0.08))',
        }}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/10 rounded-full blur-xl pointer-events-none group-hover:bg-neon-cyan/20 transition-all duration-500" />
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-neon-cyan/20 flex items-center justify-center text-neon-cyan">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide" style={{ color: 'var(--neon-cyan)' }}>AI Engine Online</span>
            <span className="ml-auto flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[0.7rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Real-time biometric analysis active. 0 anomalies detected.
          </p>
        </div>
      </aside>
    </>
  );
}
