'use client';

import { useState, useEffect } from 'react';
import { Zap, Copy, Check, AlertTriangle, CheckCircle, Plus, RefreshCw, Info } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useCampaigns } from '@/context/CampaignContext';
import { NICHES, COUNTRIES } from '@/lib/types';
import { generateUTM, copyToClipboard, cn } from '@/lib/utils';
import { AddCampaignModal } from '@/components/AddCampaignModal';
import { Campaign } from '@/lib/types';

const FORMAT_PRESETS = [
  { label: 'Default', format: 'utmsourceX{COUNTRY}{NICHE}{BTN}', example: 'utmsourceXBRFINBTN' },
  { label: 'Short', format: '{COUNTRY}{NICHE}{BTN}', example: 'BRFINBTN' },
  { label: 'Detailed', format: 'utm_{COUNTRY}_{NICHE}_{BTN}', example: 'utm_BR_FIN_BTN' },
  { label: 'Custom', format: '', example: 'Custom format' },
];

export default function GeneratorPage() {
  const { checkDuplicate } = useCampaigns();
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('');
  const [button, setButton] = useState('BTN');
  const [customFormat, setCustomFormat] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [generated, setGenerated] = useState('');
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefillCampaign, setPrefillCampaign] = useState<Partial<Campaign> | null>(null);

  const activeFormat = selectedPreset === 3 ? customFormat : FORMAT_PRESETS[selectedPreset].format;

  const generate = () => {
    if (!niche || !country || !button) return;
    const countryObj = COUNTRIES.find(c => c.name === country);
    const utm = generateUTM(niche, countryObj?.code || country, button, activeFormat || undefined);
    setGenerated(utm);
    setHistory(prev => [utm, ...prev.filter(h => h !== utm)].slice(0, 10));
    const dup = checkDuplicate(utm);
    setIsDuplicate(dup);
  };

  useEffect(() => {
    if (niche && country && button) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niche, country, button, selectedPreset, customFormat]);

  const handleCopy = async () => {
    if (!generated) return;
    await copyToClipboard(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generated || isDuplicate) return;
    setPrefillCampaign({
      utm_parameter: generated,
      niche,
      country,
    });
    setShowAddModal(true);
  };

  const isReady = niche && country && button;

  return (
    <AppShell title="UTM Generator" subtitle="Generate smart UTM parameters automatically">
      <div className="p-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Generator Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Format presets */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                UTM Format
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {FORMAT_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() => setSelectedPreset(i)}
                    className={cn(
                      'flex flex-col items-start p-3 rounded-lg border text-left transition-all',
                      selectedPreset === i
                        ? 'border-violet-500/50 bg-violet-500/10'
                        : 'border-[var(--border)] hover:bg-[var(--muted)]'
                    )}
                  >
                    <span className={cn('text-xs font-semibold', selectedPreset === i ? 'text-violet-400' : 'text-[var(--foreground)]')}>
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 font-mono truncate w-full">
                      {preset.format || 'Your custom format'}
                    </span>
                  </button>
                ))}
              </div>

              {selectedPreset === 3 && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-xs text-[var(--muted-foreground)]">
                    Custom format using {'{COUNTRY}'}, {'{NICHE}'}, {'{BTN}'}
                  </label>
                  <input
                    type="text"
                    value={customFormat}
                    onChange={(e) => setCustomFormat(e.target.value)}
                    placeholder="e.g. {COUNTRY}_{NICHE}_{BTN}"
                    className="w-full px-3 py-2 text-sm font-mono bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Campaign Parameters</h3>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Niche <span className="text-red-400">*</span>
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="">Select niche</option>
                  {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Country <span className="text-red-400">*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Button / Placement Code
                </label>
                <input
                  type="text"
                  value={button}
                  onChange={(e) => setButton(e.target.value.toUpperCase())}
                  placeholder="BTN, HERO, FOOTER, etc."
                  className="w-full px-3 py-2 text-sm font-mono bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <button
                onClick={generate}
                disabled={!isReady}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isReady
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
                )}
              >
                <RefreshCw className="w-4 h-4" />
                Generate UTM
              </button>
            </div>

            {/* Generated output */}
            {generated && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">Generated UTM</h3>
                  {isDuplicate === true && (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Already registered
                    </span>
                  )}
                  {isDuplicate === false && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Available
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                  <code className="flex-1 font-mono text-sm text-violet-300 break-all">{generated}</code>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-violet-500/20 flex items-center justify-center text-violet-400 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {isDuplicate === false && (
                  <button
                    onClick={handleSave}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Save to Campaigns
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* How it works */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                How It Works
              </h3>
              <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  <p>Select your <strong className="text-[var(--foreground)]">niche</strong> (Finance, Crypto, etc.)</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  <p>Choose the <strong className="text-[var(--foreground)]">country</strong> for targeting</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <p>Enter a <strong className="text-[var(--foreground)]">button/placement code</strong></p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">4</span>
                  <p>The system generates a unique UTM and checks for duplicates</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[var(--muted)] rounded-lg">
                <p className="text-[10px] text-[var(--muted-foreground)] font-medium mb-1">Example</p>
                <p className="text-xs text-[var(--foreground)]">Niche: Finance → <code className="text-violet-400">FIN</code></p>
                <p className="text-xs text-[var(--foreground)]">Country: Brazil → <code className="text-violet-400">BR</code></p>
                <p className="text-xs text-[var(--foreground)]">Button: BTN → <code className="text-violet-400">BTN</code></p>
                <p className="text-xs text-violet-400 mt-1 font-mono">utmsourceXBRFINBTN</p>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 animate-fade-in">
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Recent Generations</h3>
                <div className="space-y-1.5">
                  {history.map((utm, i) => {
                    const isDup = checkDuplicate(utm);
                    return (
                      <div key={i} className="flex items-center gap-2 group">
                        <code className="flex-1 text-[11px] font-mono text-[var(--muted-foreground)] truncate">
                          {utm}
                        </code>
                        <span className={cn('flex-shrink-0 w-1.5 h-1.5 rounded-full', isDup ? 'bg-red-400' : 'bg-emerald-400')} />
                        <button
                          onClick={() => copyToClipboard(utm)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3 text-[var(--muted-foreground)]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Available
                  </span>
                  {' · '}
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Registered
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddCampaignModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setPrefillCampaign(null); }}
        editCampaign={prefillCampaign}
      />
    </AppShell>
  );
}
