'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BrainCircuit, Eye, ShieldAlert, Sliders } from 'lucide-react';

const mobileLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ai-analytics', label: 'AI Intel', icon: BrainCircuit },
  { href: '/ar-interaction', label: 'AR Lab', icon: Eye },
  { href: '/emergency', label: 'Emergency', icon: ShieldAlert, highlight: true },
  { href: '/settings', label: 'Settings', icon: Sliders },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Don't show on landing page
  if (pathname === '/') return null;

  return (
    <nav className="mobile-nav">
      {mobileLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`mobile-nav-link ${isActive ? 'active' : ''} ${link.highlight ? 'text-alert-red font-bold' : ''}`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-neon-blue/20 text-neon-blue' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[0.65rem] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
