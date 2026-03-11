'use client';

import { AppShell } from '@/components/AppShell';
import { StatsCard } from '@/components/StatsCard';
import { FilterBar } from '@/components/FilterBar';
import { CampaignTable } from '@/components/CampaignTable';
import { useCampaigns } from '@/context/CampaignContext';
import { Activity, Globe, Tag, CheckCircle, PauseCircle, TestTube } from 'lucide-react';

export default function DashboardPage() {
  const { campaigns } = useCampaigns();

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'Active').length,
    testing: campaigns.filter((c) => c.status === 'Testing').length,
    paused: campaigns.filter((c) => c.status === 'Paused').length,
    countries: new Set(campaigns.map((c) => c.country)).size,
    niches: new Set(campaigns.map((c) => c.niche)).size,
  };

  return (
    <AppShell
      title="Dashboard"
      subtitle="Organize and track your campaign parameters across countries and niches."
    >
      <div className="p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard
            title="Total UTMs"
            value={stats.total}
            icon={Activity}
            color="violet"
          />
          <StatsCard
            title="Active"
            value={stats.active}
            icon={CheckCircle}
            color="emerald"
          />
          <StatsCard
            title="Testing"
            value={stats.testing}
            icon={TestTube}
            color="amber"
          />
          <StatsCard
            title="Paused"
            value={stats.paused}
            icon={PauseCircle}
            color="rose"
          />
          <StatsCard
            title="Countries"
            value={stats.countries}
            icon={Globe}
            color="blue"
          />
          <StatsCard
            title="Niches"
            value={stats.niches}
            icon={Tag}
            color="violet"
          />
        </div>

        {/* Campaign table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <FilterBar />
          </div>
          <CampaignTable />
          <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              Showing all campaigns · Last updated just now
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              UTM Hub v1.0
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
