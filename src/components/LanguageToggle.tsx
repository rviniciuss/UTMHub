'use client';

import { useLanguage } from '@/context/LanguageContext';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg p-0.5">
      <button
        onClick={() => setLocale('pt')}
        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
          locale === 'pt'
            ? 'bg-violet-600 text-white'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
        }`}
        title="Português"
      >
        PT
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
          locale === 'en'
            ? 'bg-violet-600 text-white'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
