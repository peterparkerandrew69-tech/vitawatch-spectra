import AppLayout from '@/components/layout/AppLayout';
export const metadata = { title: 'Caregiver Panel — Vitawatch Spectra' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
