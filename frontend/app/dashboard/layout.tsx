import AppLayout from '@/components/layout/AppLayout';

export const metadata = {
  title: 'Dashboard — Vitawatch Spectra',
  description: 'Real-time health monitoring dashboard with AI-powered vitals, wellness score, and predictive analytics.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
