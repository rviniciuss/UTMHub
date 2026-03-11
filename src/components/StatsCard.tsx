'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  color: 'violet' | 'emerald' | 'amber' | 'blue' | 'rose';
}

const colorMap = {
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

export function StatsCard({ title, value, change, positive, icon: Icon, color }: StatsCardProps) {
  const colors = colorMap[color];
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-violet-500/30 transition-all duration-200 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--muted-foreground)] font-medium">{title}</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1.5">{value}</p>
          {change && (
            <p className={cn('text-xs mt-1', positive ? 'text-emerald-400' : 'text-rose-400')}>
              {positive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0', colors.bg, colors.border)}>
          <Icon className={cn('w-4 h-4', colors.text)} />
        </div>
      </div>
    </div>
  );
}
