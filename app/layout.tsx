import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Public Dashboard Starter',
  description: 'Starter dashboard for monitoring investments via Public.com API (mock-first).'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen grid grid-cols-[260px_1fr]">
            <Sidebar />
            <div className="flex flex-col">
              <Topbar />
              <main className="p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
