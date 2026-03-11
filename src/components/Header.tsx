'use client';

import { Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState } from 'react';
import { AddCampaignModal } from './AddCampaignModal';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--card)] flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-[var(--foreground)]">{title}</h1>
          {subtitle && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <LanguageToggle />

          {/* Add UTM button */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('Add New UTM')}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--muted-foreground)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--muted-foreground)]" />
            )}
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            M
          </div>
        </div>
      </header>

      <AddCampaignModal open={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}
