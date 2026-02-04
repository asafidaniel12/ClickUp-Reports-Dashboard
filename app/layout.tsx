import type { Metadata } from 'next';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Sidebar } from '@/components/layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'REV360 | ClickUp Reports',
  description: 'Dashboard de relatórios do ClickUp - Controle de horas da equipe',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50">
        <QueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-64">
              <div className="p-4 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
