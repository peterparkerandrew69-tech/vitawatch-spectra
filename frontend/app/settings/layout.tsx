import AppLayout from '@/components/layout/AppLayout';
export const metadata = { title: 'Settings — Vitawatch Spectra' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
