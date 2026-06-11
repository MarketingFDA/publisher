import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/sidebar/Sidebar';
import DevToolsPatch from '@/components/DevToolsPatch';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Publisher',
  description: 'Gerador de conteúdo para redes sociais',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
        <DevToolsPatch />
      </body>
    </html>
  );
}
