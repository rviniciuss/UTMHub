'use client';

import { useState } from 'react';
import { Globe, Copy, Check, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useCampaigns } from '@/context/CampaignContext';
import { copyToClipboard, getCountryFlag, getStatusColor, cn } from '@/lib/utils';
import { Campaign } from '@/lib/types';

export default function CountriesPage() {
  const { campaigns } = useCampaigns();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copiedUtm, setCopiedUtm] = useState<string | null>(null);

  // Group by country
  const grouped = campaigns.reduce<Record<string, Campaign[]>>((acc, c) => {
    if (!acc[c.country]) acc[c.country] = [];
    acc[c.country].push(c);
    return acc;
  }, {});

  const countries = Object.entries(grouped)
    .filter(([country, items]) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        country.toLowerCase().includes(s) ||
        items.some(
          (c) =>
            c.utm_parameter.toLowerCase().includes(s) ||
            c.niche.toLowerCase().includes(s) ||
            c.campaign_name.toLowerCase().includes(s)
        )
      );
    })
    .sort((a, b) => b[1].length - a[1].length);

  const toggleExpand = (country: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

  const handleCopy = async (utm: string) => {
    await copyToClipboard(utm);
    setCopiedUtm(utm);
    setTimeout(() => setCopiedUtm(null), 2000);
  };

  return (
    <AppShell title="Countries" subtitle="View UTM parameters organized by geographic location">
      <div className="p-6 space-y-6">
        {/* Header stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Countries', value: Object.keys(grouped).length },
            { label: 'Total UTMs', value: campaigns.length },
            { label: 'Active UTMs', value: campaigns.filter((c) => c.status === 'Active').length },
            { label: 'Avg UTMs/Country', value: campaigns.length ? Math.round(campaigns.length / Math.max(Object.keys(grouped).length, 1)) : 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder='Search by country or UTM... (try "BR", "FIN")'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Country cards */}
        <div className="space-y-3">
          {countries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Globe className="w-8 h-8 text-[var(--muted-foreground)] mb-3" />
              <p className="text-sm text-[var(--muted-foreground)]">No countries match your search</p>
            </div>
          ) : (
            countries.map(([country, items]) => {
              const isOpen = expanded.has(country);
              const activeCount = items.filter((c) => c.status === 'Active').length;
              const flag = getCountryFlag(country);

              return (
                <div
                  key={country}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden animate-fade-in"
                >
                  {/* Country header */}
                  <button
                    onClick={() => toggleExpand(country)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-[var(--muted)]/50 transition-colors text-left"
                  >
                    <span className="text-2xl">{flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--foreground)]">{country}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-medium">
                          {items.length} UTMs
                        </span>
                        {activeCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                            {activeCount} active
                          </span>
                        )}
                      </div>
                      {/* UTM preview (collapsed) */}
                      {!isOpen && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {items.slice(0, 4).map((c) => (
                            <code key={c.id} className="text-[10px] font-mono text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded">
                              {c.utm_parameter}
                            </code>
                          ))}
                          {items.length > 4 && (
                            <span className="text-[10px] text-[var(--muted-foreground)]">+{items.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Niche breakdown */}
                    <div className="hidden md:flex gap-1.5 flex-wrap max-w-48">
                      {Array.from(new Set(items.map((c) => c.niche)))
                        .slice(0, 3)
                        .map((n) => (
                          <span key={n} className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">
                            {n}
                          </span>
                        ))}
                    </div>

                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t border-[var(--border)] animate-fade-in">
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((c) => {
                          const statusColors = getStatusColor(c.status);
                          return (
                            <div
                              key={c.id}
                              className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--muted)] group"
                            >
                              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', statusColors.dot)} />
                              <div className="flex-1 min-w-0">
                                <code className="text-xs font-mono text-violet-400 truncate block">
                                  {c.utm_parameter}
                                </code>
                                <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                                  {c.campaign_name} · {c.niche}
                                </p>
                              </div>
                              <button
                                onClick={() => handleCopy(c.utm_parameter)}
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center text-[var(--muted-foreground)] hover:text-violet-400"
                              >
                                {copiedUtm === c.utm_parameter
                                  ? <Check className="w-3 h-3 text-emerald-400" />
                                  : <Copy className="w-3 h-3" />}
                              </button>
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
