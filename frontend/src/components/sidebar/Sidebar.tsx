'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Calendar, LayoutTemplate, BarChart2, Plus } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/conteudos', label: 'Conteúdos', icon: FileText },
  { href: '/calendario', label: 'Calendário', icon: Calendar },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/analiticos', label: 'Analíticos', icon: BarChart2 },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">FDA</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Publisher</p>
            <p className="text-xs text-blue-600 font-medium">Fradema · Arrighi</p>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-gray-100">
        <Link
          href="/conteudos/novo"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors w-full"
        >
          <Plus size={15} />
          Novo conteúdo
        </Link>
      </div>

      <nav className="flex-1 p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Menu</p>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
              path.startsWith(href)
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon size={16} className={path.startsWith(href) ? 'text-blue-600' : ''} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
