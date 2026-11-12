import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/providers/app-provider';

export const metadata: Metadata = {
  title: 'AdaptiveLearn AI — Trait-Based Assessment & Personalized Learning',
  description:
    'Closed-loop academic intelligence platform featuring authoring-time question packages, progressive 2-hint examinations, Bloom taxonomy trait analytics, and grounded personalized interventions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F4F5FA] text-gray-900 min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
