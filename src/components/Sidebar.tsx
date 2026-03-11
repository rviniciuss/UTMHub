'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  Globe,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generator', label: 'UTM Generator', icon: Zap },
  { href: '/countries', label: 'Countries', icon: Globe },
  { href: '/niches', label: 'Niches', icon: Tag },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen transition-all duration-300 ease-in-out border-r',
        'bg-[var(--card)] border-[var(--border)]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 h-16 px-4 border-b border-[var(--border)]',
        collapsed && 'justify-center px-0'
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <div className="text-sm font-bold text-[var(--foreground)]">UTM Hub</div>
            <div className="text-[10px] text-[var(--muted-foreground)] leading-none">Campaign Manager</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                collapsed ? 'justify-center' : '',
                active
                  ? 'bg-violet-600/15 text-violet-400 border border-violet-600/20'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
              )}
            >
              <Icon className={cn('flex-shrink-0', active ? 'w-4 h-4 text-violet-400' : 'w-4 h-4')} />
              {!collapsed && (
                <span className="animate-fade-in truncate">{label}</span>
              )}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-[var(--border)] animate-fade-in">
          <div className="rounded-lg bg-violet-600/10 border border-violet-600/20 p-3">
            <p className="text-[11px] text-violet-400 font-medium mb-0.5">Pro Tip</p>
            <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
              Use the UTM Generator for instant parameter creation.
            </p>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-20 z-10 w-6 h-6 rounded-full border flex items-center justify-center',
          'bg-[var(--card)] border-[var(--border)] hover:bg-violet-600 hover:border-violet-600',
          'text-[var(--muted-foreground)] hover:text-white transition-all duration-150 shadow-sm'
        )}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
