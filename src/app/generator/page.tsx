'use client';

import { useState, useCallback } from 'react';
import {
  Zap, Copy, Check, Download, Trash2, AlertTriangle, Info, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useLanguage } from '@/context/LanguageContext';
import { getGroupByName, getGroups } from '@/lib/groups';
import { ParsedCampaign, GeneratedUTM } from '@/lib/types';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────
// Parser
// ────────────────────────────────────────────────
const PLATFORM_PATTERN = /-(FB|TT|GG|Native)\b/i;

function parseLine(line: string): ParsedCampaign | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Extract cartaz number
  const cartazMatch = trimmed.match(/Cartaz\s+(\d+)/i);
  const cartaz = cartazMatch ? parseInt(cartazMatch[1], 10) : 0;

  // Extract group name from [GROUP-NAME]
  const groupMatch = trimmed.match(/\[([^\]]+)\]/);
  const groupName = groupMatch ? groupMatch[1].trim().toUpperCase() : '';

  // Extract platform (FB, TT, GG, Native) - case insensitive
  const platformMatch = trimmed.match(PLATFORM_PATTERN);
  const platform = platformMatch ? platformMatch[1].toUpperCase() : '';

  // Extract parameter: pattern is CODE-PARAMETER-PLATFORM
  // We take whatever is between a hyphen-delimited code and the platform
  // e.g. "ARM-Namoro2-FB" → parameter = Namoro2
  let parameter = '';
  const platformRaw = platformMatch ? platformMatch[1] : '';
  // Match: word-PARAMETER-PLATFORM
  const paramRegex = new RegExp(`([A-Za-z0-9]+)-${platformRaw}\\b`, 'i');
  const paramMatch = trimmed.match(paramRegex);
  if (paramMatch) {
    parameter = paramMatch[1];
  }

  if (!groupName || !parameter || !platform) return null;

  return { cartaz, groupName, parameter, platform: platform.toUpperCase(), rawLine: line };
}

function parseCampaignText(text: string): ParsedCampaign[] {
  const lines = text.split('\n');
  const results: ParsedCampaign[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parsed = parseLine(line);
    if (parsed) {
      results.push(parsed);
    } else {
      // Return error entry so user knows which line failed
      results.push({
        cartaz: 0,
        groupName: '',
        parameter: '',
        platform: '',
        rawLine: line,
        error: line,
      });
    }
  }
  return results;
}

// ────────────────────────────────────────────────
// UTM generation
// ────────────────────────────────────────────────
function generateUTMs(parsed: ParsedCampaign[]): GeneratedUTM[] {
  const results: GeneratedUTM[] = [];
  for (const campaign of parsed) {
    if (campaign.error || !campaign.groupName) continue;
    const group = getGroupByName(campaign.groupName);
    if (!group || group.codes.length === 0) continue;
    for (const code of group.codes) {
      results.push({
        cartaz: campaign.cartaz,
        groupName: campaign.groupName,
        countryCode: code,
        parameter: campaign.parameter,
        platform: campaign.platform,
        utm: `${code}-${campaign.parameter}-${campaign.platform}`,
      });
    }
  }
  return results;
}

// ────────────────────────────────────────────────
// CSV export
// ────────────────────────────────────────────────
function exportUTMsToCSV(utms: GeneratedUTM[]) {
  const header = 'Cartaz,Group,Country Code,Parameter,Platform,UTM\n';
  const rows = utms
    .map(u => `${u.cartaz},"${u.groupName}",${u.countryCode},${u.parameter},${u.platform},${u.utm}`)
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `utm_export_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
export default function GeneratorPage() {
  const { t } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState<ParsedCampaign[]>([]);
  const [generated, setGenerated] = useState<GeneratedUTM[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showParsed, setShowParsed] = useState(false);

  const handleExtract = useCallback(() => {
    const results = parseCampaignText(inputText);
    setParsed(results);
    setGenerated([]);
    setShowParsed(true);
  }, [inputText]);

  const handleGenerate = useCallback(() => {
    const utms = generateUTMs(parsed);
    setGenerated(utms);
  }, [parsed]);

  const handleCopyUTM = async (utm: string, index: number) => {
    await navigator.clipboard.writeText(utm);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = async () => {
    const text = generated.map(u => u.utm).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setParsed([]);
    setGenerated([]);
    setShowParsed(false);
  };

  // Detect groups that exist but have no codes
  const groupWarnings = parsed
    .filter(p => !p.error && p.groupName)
    .reduce<{ groupName: string; warning: string }[]>((acc, p) => {
      if (acc.find(w => w.groupName === p.groupName)) return acc;
      const group = getGroupByName(p.groupName);
      if (!group) acc.push({ groupName: p.groupName, warning: 'not_found' });
      else if (group.codes.length === 0) acc.push({ groupName: p.groupName, warning: 'empty' });
      return acc;
    }, []);

  const validParsed = parsed.filter(p => !p.error && p.groupName);
  const errorParsed = parsed.filter(p => !!p.error);
  const groups = getGroups();

  return (
    <AppShell
      title={t('UTM Generator')}
      subtitle={t('Paste Campaign Text')}
    >
      <div className="p-6 max-w-6xl space-y-6">

        {/* ── Input Section ─────────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            {t('Paste Campaign Text')}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            {t('Paste one campaign per line. Format: Cartaz N [GROUP] ... CODE-Parameter-Platform')}
          </p>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Cartaz 4 [ARABE-MUNDO] ESTÁ ATRELADO AO ARM-Namoro2-FB\nCartaz 5 [ARABE-EUROPA] ESTÁ ATRELADO AO AREU-Finance2-FB`}
            rows={6}
            className="w-full px-3 py-2.5 text-sm font-mono bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 resize-y"
          />

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={handleExtract}
              disabled={!inputText.trim()}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                inputText.trim()
                  ? 'bg-violet-600 hover:bg-violet-500 text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
              )}
            >
              <Zap className="w-4 h-4" />
              {t('Extract Campaigns')}
            </button>

            {validParsed.length > 0 && (
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Zap className="w-4 h-4" />
                {t('Generate UTMs')}
              </button>
            )}

            {(parsed.length > 0 || inputText) && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('Clear')}
              </button>
            )}
          </div>
        </div>

        {/* ── Warnings ──────────────────────────────────── */}
        {groupWarnings.length > 0 && (
          <div className="space-y-2">
            {groupWarnings.map(({ groupName, warning }) => (
              <div
                key={groupName}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs border',
                  warning === 'not_found'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  <strong>[{groupName}]</strong>:{' '}
                  {warning === 'not_found'
                    ? t('Group not found in Settings')
                    : t('Group has no country codes')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Parsed Campaigns ──────────────────────────── */}
        {parsed.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowParsed(v => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {t('Parsed Campaigns')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-medium">
                  {validParsed.length} {t('lines detected')}
                </span>
                {errorParsed.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
                    {errorParsed.length} erro{errorParsed.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {showParsed ? <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />}
            </button>

            {showParsed && (
              <div className="overflow-x-auto border-t border-[var(--border)]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                      <th className="px-4 py-2.5 text-left font-medium">{t('Cartaz')}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t('Group')}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t('Parameter')}</th>
                      <th className="px-4 py-2.5 text-left font-medium">{t('Platform')}</th>
                      <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {parsed.map((p, i) => {
                      if (p.error) {
                        return (
                          <tr key={i} className="bg-red-500/5">
                            <td colSpan={5} className="px-4 py-2.5 text-red-400 font-mono">
                              ⚠ {p.rawLine}
                            </td>
                          </tr>
                        );
                      }
                      const group = getGroupByName(p.groupName);
                      const hasGroup = !!group;
                      const hasCodes = group && group.codes.length > 0;
                      return (
                        <tr key={i} className="hover:bg-[var(--muted)]/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-[var(--foreground)]">#{p.cartaz}</td>
                          <td className="px-4 py-2.5">
                            <span className={cn(
                              'px-2 py-0.5 rounded font-mono font-medium',
                              hasCodes
                                ? 'bg-violet-500/15 text-violet-400'
                                : hasGroup
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-red-500/15 text-red-400'
                            )}>
                              {p.groupName}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[var(--foreground)]">{p.parameter}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono font-medium">
                              {p.platform}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            {hasCodes ? (
                              <span className="text-emerald-400">
                                ✓ {group!.codes.length} {t('Country')}
                              </span>
                            ) : hasGroup ? (
                              <span className="text-amber-400">⚠ {t('Group has no country codes')}</span>
                            ) : (
                              <span className="text-red-400">✗ {t('Group not found in Settings')}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Generated UTMs ────────────────────────────── */}
        {generated.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {t('Generated UTMs')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                  {generated.length} {t('UTMs generated')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    copiedAll
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]'
                  )}
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAll ? t('Copied!') : t('Copy All')}
                </button>
                <button
                  onClick={() => exportUTMsToCSV(generated)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t('Export CSV')}
                </button>
                <button
                  onClick={() => setGenerated([])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-[var(--muted-foreground)] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('Clear')}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                    <th className="px-4 py-2.5 text-left font-medium">{t('Cartaz')}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t('Country')}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t('Parameter')}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t('Platform')}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t('UTM')}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {generated.map((u, i) => (
                    <tr key={i} className="hover:bg-[var(--muted)]/50 transition-colors group">
                      <td className="px-4 py-2.5 font-medium text-[var(--foreground)]">#{u.cartaz}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-medium text-violet-400">{u.countryCode}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[var(--foreground)]">{u.parameter}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono font-medium">
                          {u.platform}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <code className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded select-all">
                          {u.utm}
                        </code>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleCopyUTM(u.utm, i)}
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all',
                            copiedIndex === i
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                          )}
                          title={t('Copy')}
                        >
                          {copiedIndex === i ? (
                            <><Check className="w-3 h-3" /> {t('Copied!')}</>
                          ) : (
                            <><Copy className="w-3 h-3" /> {t('Copy')}</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Empty states ──────────────────────────────── */}
        {parsed.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* How it works */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                {t('How It Works')}
              </h3>
              <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
                {[
                  'Cole o texto das campanhas na área acima.',
                  'Clique em "Extrair Campanhas" para detectar grupos e parâmetros.',
                  'Clique em "Gerar UTMs" para criar os códigos por país.',
                  'Copie individualmente ou exporte todos como CSV.',
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Format example */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                {t('Example input')}
              </h3>
              <pre className="text-xs font-mono bg-[var(--muted)] rounded-lg p-3 text-[var(--muted-foreground)] leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`Cartaz 4 [ARABE-MUNDO] ESTÁ ATRELADO AO ARM-Namoro2-FB
Cartaz 5 [ARABE-EUROPA] ESTÁ ATRELADO AO AREU-Finance2-FB`}
              </pre>
              <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <p className="text-[10px] text-emerald-400 font-medium mb-1.5">Saída gerada:</p>
                <div className="space-y-1 font-mono text-xs text-[var(--foreground)]">
                  {['ARM-Namoro2-FB', 'AREU-Namoro2-FB', 'ARIS-Namoro2-FB', 'ARKU-Namoro2-FB', 'AROM-Namoro2-FB'].map(utm => (
                    <div key={utm} className="text-violet-400">{utm}</div>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] text-[var(--muted-foreground)] font-medium mb-1">
                  Plataformas suportadas:
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {['FB', 'TT', 'GG', 'Native'].map(p => (
                    <span key={p} className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono text-xs font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Groups count */}
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                {groups.length} grupos configurados nas{' '}
                <a href="/settings" className="text-violet-400 hover:underline">Configurações</a>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
