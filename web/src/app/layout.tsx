import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/QueryProvider';
import './globals.css';
import UpdateChecker from './components/UpdateChecker';

export const metadata: Metadata = {
  title: 'Tauri App',
  description: 'Built with Next.js, NestJS, and Tauri',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-gray-100 min-h-screen">
        <QueryProvider>
          <UpdateChecker />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
