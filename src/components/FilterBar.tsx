'use client';

import { Search, SlidersHorizontal, X, Download } from 'lucide-react';
import { useCampaigns } from '@/context/CampaignContext';
import { NICHES, PLATFORMS, STATUSES, COUNTRIES } from '@/lib/types';
import { exportToCSV, cn } from '@/lib/utils';
import { useState } from 'react';

export function FilterBar() {
  const { campaigns, filteredCampaigns, filters, setFilters } = useCampaigns();
  const [showFilters, setShowFilters] = useState(false);

  const setFilter = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  const hasActiveFilters = filters.country || filters.niche || filters.platform || filters.status;
  const activeCount = [filters.country, filters.niche, filters.platform, filters.status].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ ...filters, country: '', niche: '', platform: '', status: '' });
  };

  return (
    <div className="space-y-3">
      {/* Top row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search campaigns, UTMs, countries, niches..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
            showFilters || hasActiveFilters
              ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {/* Export */}
        <button
          onClick={() => exportToCSV(filteredCampaigns)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        {/* Results count */}
        <span className="text-xs text-[var(--muted-foreground)] ml-auto whitespace-nowrap">
          {filteredCampaigns.length} of {campaigns.length} campaigns
        </span>
      </div>

      {/* Filters row */}
      {showFilters && (
        <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg border border-[var(--border)] animate-fade-in">
          <select
            value={filters.country}
            onChange={setFilter('country')}
            className="flex-1 px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
            ))}
          </select>

          <select
            value={filters.niche}
            onChange={setFilter('niche')}
            className="flex-1 px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">All Niches</option>
            {NICHES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <select
            value={filters.platform}
            onChange={setFilter('platform')}
            className="flex-1 px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">All Platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={setFilter('status')}
            className="flex-1 px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors whitespace-nowrap"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
