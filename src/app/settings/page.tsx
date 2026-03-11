'use client';

import { useState } from 'react';
import { Settings, Database, Palette, Download, Upload, Trash2, CheckCircle, Info } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useCampaigns } from '@/context/CampaignContext';
import { exportToCSV } from '@/lib/utils';
import { Campaign } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { campaigns, refresh } = useCampaigns();
  const [saved, setSaved] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    exportToCSV(campaigns);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL campaigns? This cannot be undone.')) {
      localStorage.removeItem('utm_hub_campaigns');
      refresh();
    }
  };

  const handleImport = () => {
    try {
      setImportError('');
      const data = JSON.parse(importText);
      if (!Array.isArray(data)) throw new Error('Expected an array of campaigns');
      const required = ['campaign_name', 'niche', 'country', 'utm_parameter', 'platform', 'status'];
      for (const item of data) {
        for (const key of required) {
          if (!item[key]) throw new Error(`Missing field: ${key}`);
        }
      }
      const existing: Campaign[] = JSON.parse(localStorage.getItem('utm_hub_campaigns') || '[]');
      const merged = [
        ...data.map((d: Partial<Campaign>) => ({
          ...d,
          id: d.id || Math.random().toString(36).slice(2),
          created_at: d.created_at || new Date().toISOString(),
        })),
        ...existing,
      ];
      // Deduplicate by UTM
      const seen = new Set<string>();
      const deduped = merged.filter((c: { utm_parameter?: string }) => {
        const utm = c.utm_parameter || '';
        if (seen.has(utm)) return false;
        seen.add(utm);
        return true;
      });
      localStorage.setItem('utm_hub_campaigns', JSON.stringify(deduped));
      refresh();
      setImportText('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid JSON format');
    }
  };

  return (
    <AppShell title="Settings" subtitle="Manage your UTM Hub preferences and data">
      <div className="p-6 max-w-3xl space-y-6">
        {/* Data Management */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            Data Management
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Export, import, or clear your campaign data.
          </p>

          <div className="space-y-3">
            {/* Export */}
            <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Export Campaigns</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Download all {campaigns.length} campaigns as CSV
                </p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            {/* Import */}
            <div className="p-3 bg-[var(--muted)] rounded-lg space-y-2">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Bulk Import (JSON)</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Paste a JSON array of campaign objects to bulk import
                </p>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`[{"campaign_name": "...", "niche": "Finance", "country": "Brazil", "utm_parameter": "utmsourceXBRFIN", "platform": "Meta Ads", "status": "Active"}]`}
                rows={4}
                className="w-full px-3 py-2 text-xs font-mono bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
              {importError && (
                <p className="text-xs text-red-400">{importError}</p>
              )}
              {saved && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Campaigns imported successfully!
                </p>
              )}
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  importText.trim()
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : 'bg-[var(--border)] text-[var(--muted-foreground)] cursor-not-allowed'
                )}
              >
                <Upload className="w-3.5 h-3.5" />
                Import JSON
              </button>
            </div>

            {/* Clear all */}
            <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-400">Clear All Data</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Permanently delete all campaign data from local storage
                </p>
              </div>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-400" />
            Appearance
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Customize the look and feel of UTM Hub.
          </p>
          <div className="p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-xs text-[var(--muted-foreground)]">
              Use the sun/moon icon in the top-right header to toggle between dark and light mode.
              Your preference is saved automatically.
            </p>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <Settings className="w-4 h-4 text-violet-400" />
            Integrations
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Connect to external services for enhanced features.
          </p>
          <div className="space-y-2">
            {[
              { name: 'Supabase Database', desc: 'Sync campaigns to PostgreSQL cloud database', status: 'Configure in .env.local', icon: Database },
              { name: 'Meta Ads API', desc: 'Pull live campaign metrics automatically', status: 'Coming soon', icon: Info },
              { name: 'Google Ads API', desc: 'Sync Google Adsense campaign data', status: 'Coming soon', icon: Info },
              { name: 'Google Analytics', desc: 'Track UTM performance metrics', status: 'Coming soon', icon: Info },
            ].map(({ name, desc, status, icon: Icon }) => (
              <div key={name} className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">{name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] whitespace-nowrap">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Database Schema */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            Supabase Setup
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Run this SQL in your Supabase project to enable cloud sync.
          </p>
          <pre className="text-xs font-mono bg-[var(--muted)] border border-[var(--border)] rounded-lg p-3 overflow-x-auto text-[var(--foreground)] leading-relaxed">
{`CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  country TEXT NOT NULL,
  utm_parameter TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_utm
  ON campaigns(utm_parameter);
CREATE INDEX idx_campaigns_country
  ON campaigns(country);
CREATE INDEX idx_campaigns_niche
  ON campaigns(niche);

ALTER TABLE campaigns
  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON campaigns
  FOR ALL USING (true);`}
          </pre>
          <p className="text-xs text-[var(--muted-foreground)] mt-3">
            Then add your keys to <code className="bg-[var(--muted)] px-1 rounded">.env.local</code>:
          </p>
          <pre className="text-xs font-mono bg-[var(--muted)] border border-[var(--border)] rounded-lg p-3 mt-2 text-violet-400">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
          </pre>
        </div>
      </div>
    </AppShell>
  );
}
