'use client';

import { useState } from 'react';
import { Tag, Copy, Check, Search, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useCampaigns } from '@/context/CampaignContext';
import { copyToClipboard, getStatusColor, cn } from '@/lib/utils';
import { Campaign } from '@/lib/types';

const NICHE_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  Finance: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', accent: 'border-emerald-500/20' },
  Crypto: { bg: 'bg-amber-500/10', text: 'text-amber-400', accent: 'border-amber-500/20' },
  Fitness: { bg: 'bg-blue-500/10', text: 'text-blue-400', accent: 'border-blue-500/20' },
  Health: { bg: 'bg-rose-500/10', text: 'text-rose-400', accent: 'border-rose-500/20' },
  Supplements: { bg: 'bg-purple-500/10', text: 'text-purple-400', accent: 'border-purple-500/20' },
  Software: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', accent: 'border-cyan-500/20' },
  'E-commerce': { bg: 'bg-orange-500/10', text: 'text-orange-400', accent: 'border-orange-500/20' },
  Insurance: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', accent: 'border-indigo-500/20' },
  'Real Estate': { bg: 'bg-teal-500/10', text: 'text-teal-400', accent: 'border-teal-500/20' },
  Education: { bg: 'bg-violet-500/10', text: 'text-violet-400', accent: 'border-violet-500/20' },
  Travel: { bg: 'bg-sky-500/10', text: 'text-sky-400', accent: 'border-sky-500/20' },
  Gaming: { bg: 'bg-pink-500/10', text: 'text-pink-400', accent: 'border-pink-500/20' },
};

function defaultNicheColor() {
  return { bg: 'bg-slate-500/10', text: 'text-slate-400', accent: 'border-slate-500/20' };
}

export default function NichesPage() {
  const { campaigns } = useCampaigns();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copiedUtm, setCopiedUtm] = useState<string | null>(null);

  // Group by niche
  const grouped = campaigns.reduce<Record<string, Campaign[]>>((acc, c) => {
    if (!acc[c.niche]) acc[c.niche] = [];
    acc[c.niche].push(c);
    return acc;
  }, {});

  const niches = Object.entries(grouped)
    .filter(([niche, items]) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        niche.toLowerCase().includes(s) ||
        items.some(
          (c) =>
            c.utm_parameter.toLowerCase().includes(s) ||
            c.country.toLowerCase().includes(s) ||
            c.campaign_name.toLowerCase().includes(s)
        )
      );
    })
    .sort((a, b) => b[1].length - a[1].length);

  const toggleExpand = (niche: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(niche)) next.delete(niche);
      else next.add(niche);
      return next;
    });
  };

  const handleCopy = async (utm: string) => {
    await copyToClipboard(utm);
    setCopiedUtm(utm);
    setTimeout(() => setCopiedUtm(null), 2000);
  };

  return (
    <AppShell title="Niches" subtitle="View and organize campaigns by niche category">
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Niches', value: Object.keys(grouped).length },
            { label: 'Total Campaigns', value: campaigns.length },
            { label: 'Top Niche', value: niches[0]?.[0] || '—' },
            { label: 'Active Campaigns', value: campaigns.filter((c) => c.status === 'Active').length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              <p className="text-xl font-bold text-[var(--foreground)] mt-1 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder='Search niches, UTMs, countries... (try "FIN", "BR")'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Niche cards */}
        <div className="space-y-3">
          {niches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Tag className="w-8 h-8 text-[var(--muted-foreground)] mb-3" />
              <p className="text-sm text-[var(--muted-foreground)]">No niches match your search</p>
            </div>
          ) : (
            niches.map(([niche, items]) => {
              const isOpen = expanded.has(niche);
              const colors = NICHE_COLORS[niche] || defaultNicheColor();
              const countries = Array.from(new Set(items.map((c) => c.country)));
              const activeCount = items.filter((c) => c.status === 'Active').length;
              const percentage = campaigns.length > 0 ? Math.round((items.length / campaigns.length) * 100) : 0;

              return (
                <div
                  key={niche}
                  className={cn(
                    'bg-[var(--card)] border rounded-xl overflow-hidden animate-fade-in',
                    isOpen ? colors.accent : 'border-[var(--border)]'
                  )}
                >
                  {/* Niche header */}
                  <button
                    onClick={() => toggleExpand(niche)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-[var(--muted)]/50 transition-colors text-left"
                  >
                    <div className={cn('w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0', colors.bg, colors.accent)}>
                      <Tag className={cn('w-4 h-4', colors.text)} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--foreground)]">{niche}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', colors.bg, colors.text)}>
                          {items.length} UTMs
                        </span>
                        {activeCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                            {activeCount} active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 max-w-40 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', colors.bg.replace('/10', ''))}
                            style={{ width: `${percentage}%`, background: 'currentColor', opacity: 0.6 }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--muted-foreground)]">{percentage}% of total</span>
                      </div>
                    </div>

                    {/* Countries */}
                    <div className="hidden md:flex gap-1.5 flex-wrap max-w-48">
                      {countries.slice(0, 3).map((country) => (
                        <span key={country} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-400">
                          {country}
                        </span>
                      ))}
                      {countries.length > 3 && (
                        <span className="text-[10px] text-[var(--muted-foreground)]">+{countries.length - 3}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <TrendingUp className={cn('w-4 h-4 hidden md:block', colors.text)} />
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t border-[var(--border)] animate-fade-in">
                      {/* Country sub-groups */}
                      <div className="p-4 space-y-3">
                        {countries.map((country) => {
                          const countryItems = items.filter((c) => c.country === country);
                          return (
                            <div key={country}>
                              <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                                <span>{country}</span>
                                <span className="text-[10px] opacity-60">({countryItems.length})</span>
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 pl-2">
                                {countryItems.map((c) => {
                                  const statusColors = getStatusColor(c.status);
                                  return (
                                    <div
                                      key={c.id}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-[var(--muted)] group"
                                    >
                                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', statusColors.dot)} />
                                      <code className="flex-1 text-xs font-mono text-violet-400 truncate">
                                        {c.utm_parameter}
                                      </code>
                                      <button
                                        onClick={() => handleCopy(c.utm_parameter)}
                                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        {copiedUtm === c.utm_parameter
                                          ? <Check className="w-3 h-3 text-emerald-400" />
                                          : <Copy className="w-3 h-3 text-[var(--muted-foreground)]" />}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
