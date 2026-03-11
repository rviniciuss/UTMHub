'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Upload, Download, Trash2, Copy, Check, Search, Filter,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight, X, AlertCircle,
  CheckCircle2, Layers, List,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useLanguage } from '@/context/LanguageContext';
import { UTMEntry } from '@/lib/types';
import {
  getEntries, importUTMList, toggleActive, setAllActive,
  deleteEntry, clearAllEntries, exportEntriesToCSV,
} from '@/lib/utmEntries';
import { cn } from '@/lib/utils';

// ─── tiny helpers ────────────────────────────────────────────────────────────
function uniq<T>(arr: T[]): T[] { return [...new Set(arr)]; }

// ─── Stats bar ───────────────────────────────────────────────────────────────
function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-2.5 rounded-lg border', color)}>
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-[10px] mt-0.5 opacity-70">{label}</span>
    </div>
  );
}

// ─── Status toggle ───────────────────────────────────────────────────────────
function StatusToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all',
        active
          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
          : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-400'
      )}
      title={active ? 'Clique para desativar' : 'Clique para ativar'}
    >
      {active
        ? <><ToggleRight className="w-3.5 h-3.5" /> Ativo</>
        : <><ToggleLeft className="w-3.5 h-3.5" /> Inativo</>}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GeneratorPage() {
  const { t } = useLanguage();

  // ── data
  const [entries, setEntries] = useState<UTMEntry[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; failed: number } | null>(null);

  // ── filters
  const [search, setSearch] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'niche'>('niche');

  // ── ui
  const [showImport, setShowImport] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [collapsedNiches, setCollapsedNiches] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => setEntries(getEntries()), []);
  useEffect(() => { refresh(); }, [refresh]);

  // ── derived
  const niches = useMemo(() => uniq(entries.map(e => e.parameter)).sort(), [entries]);
  const platforms = useMemo(() => uniq(entries.map(e => e.platform)).sort(), [entries]);

  const filtered = useMemo(() => {
    let r = entries;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(e =>
        e.utm.toLowerCase().includes(q) ||
        e.countryCode.toLowerCase().includes(q) ||
        e.countryName.toLowerCase().includes(q) ||
        e.parameter.toLowerCase().includes(q)
      );
    }
    if (filterNiche) r = r.filter(e => e.parameter === filterNiche);
    if (filterPlatform) r = r.filter(e => e.platform === filterPlatform);
    if (filterStatus === 'active') r = r.filter(e => e.active);
    if (filterStatus === 'inactive') r = r.filter(e => !e.active);
    return r;
  }, [entries, search, filterNiche, filterPlatform, filterStatus]);

  const activeCount = entries.filter(e => e.active).length;
  const inactiveCount = entries.length - activeCount;
  const nicheCount = niches.length;

  // ── handlers
  const handleImport = () => {
    const lines = pasteText.split('\n').filter(l => l.trim());
    const result = importUTMList(lines);
    setImportResult(result);
    refresh();
    if (result.imported > 0) {
      setPasteText('');
      setTimeout(() => { setShowImport(false); setImportResult(null); }, 2000);
    }
  };

  const handleToggle = (id: string) => { toggleActive(id); refresh(); };
  const handleDelete = (id: string) => { deleteEntry(id); refresh(); };

  const handleCopy = async (utm: string, id: string) => {
    await navigator.clipboard.writeText(utm);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = async () => {
    const text = filtered.map(e => e.utm).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedId('__all__');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSetAll = (active: boolean) => {
    const ids = filtered.map(e => e.id);
    setAllActive(active, ids);
    refresh();
  };

  const handleClear = () => {
    if (confirm('Deletar todos os UTMs importados? Esta ação não pode ser desfeita.')) {
      clearAllEntries();
      refresh();
    }
  };

  const toggleNicheCollapse = (niche: string) => {
    setCollapsedNiches(prev => {
      const next = new Set(prev);
      next.has(niche) ? next.delete(niche) : next.add(niche);
      return next;
    });
  };

  // ── niche groups for grouped view
  const nicheGroups = useMemo(() => {
    const map: Record<string, UTMEntry[]> = {};
    for (const entry of filtered) {
      if (!map[entry.parameter]) map[entry.parameter] = [];
      map[entry.parameter].push(entry);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AppShell title="Gerador UTM" subtitle="Importe e gerencie seus UTMs">
      <div className="p-6 max-w-6xl space-y-5">

        {/* ── Import panel ──────────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            onClick={() => { setShowImport(v => !v); setImportResult(null); }}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--muted)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-[var(--foreground)]">
                Colar lista de UTMs
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                — Cole um UTM por linha
              </span>
            </div>
            {showImport
              ? <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" />
              : <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />}
          </button>

          {showImport && (
            <div className="border-t border-[var(--border)] p-5 space-y-3 animate-fade-in">
              <p className="text-xs text-[var(--muted-foreground)]">
                Formato: <code className="bg-[var(--muted)] px-1 rounded font-mono">CODIGO-Parametro-PLATAFORMA</code>
                {' '}— ex: <code className="bg-[var(--muted)] px-1 rounded font-mono text-violet-400">ARM-Namoro2-FB</code>
              </p>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={`ARM-Namoro2-FB\nAREU-Namoro2-FB\nDE-Namoro2-FB\nVI-Namoro2-FB`}
                rows={7}
                className="w-full px-3 py-2.5 text-sm font-mono bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 resize-y"
              />
              {importResult && (
                <div className={cn(
                  'flex items-center gap-2 text-xs px-3 py-2 rounded-lg border',
                  importResult.imported > 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                )}>
                  {importResult.imported > 0
                    ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span>
                    {importResult.imported > 0 && <><strong>{importResult.imported}</strong> importados · </>}
                    {importResult.skipped > 0 && <><strong>{importResult.skipped}</strong> duplicados ignorados · </>}
                    {importResult.failed > 0 && <><strong>{importResult.failed}</strong> inválidos</>}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  disabled={!pasteText.trim()}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pasteText.trim()
                      ? 'bg-violet-600 hover:bg-violet-500 text-white'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Importar
                </button>
                <button
                  onClick={() => { setPasteText(''); setImportResult(null); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Empty state ───────────────────────────────── */}
        {entries.length === 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Nenhum UTM importado ainda</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Clique em &quot;Colar lista de UTMs&quot; acima para começar
              </p>
            </div>
          </div>
        )}

        {entries.length > 0 && (
          <>
            {/* ── Stats bar ─────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
              <StatBox label="Total" value={entries.length} color="bg-[var(--muted)] border-[var(--border)] text-[var(--foreground)]" />
              <StatBox label="Ativos" value={activeCount} color="bg-emerald-500/10 border-emerald-500/30 text-emerald-400" />
              <StatBox label="Inativos" value={inactiveCount} color="bg-red-500/10 border-red-500/30 text-red-400" />
              <StatBox label="Nichos" value={nicheCount} color="bg-violet-500/10 border-violet-500/30 text-violet-400" />
              <StatBox label="Plataformas" value={platforms.length} color="bg-blue-500/10 border-blue-500/30 text-blue-400" />
            </div>

            {/* ── Toolbar ───────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar UTM, código ou país..."
                  className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Niche filter */}
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--muted-foreground)]" />
                <select
                  value={filterNiche}
                  onChange={e => setFilterNiche(e.target.value)}
                  className="pl-7 pr-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 appearance-none"
                >
                  <option value="">Todos os nichos</option>
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Platform filter */}
              <select
                value={filterPlatform}
                onChange={e => setFilterPlatform(e.target.value)}
                className="px-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Todas plataformas</option>
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            {/* ── Action bar ────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center gap-0.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setViewMode('niche')}
                  className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all', viewMode === 'niche' ? 'bg-violet-600 text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]')}
                >
                  <Layers className="w-3.5 h-3.5" /> Por Nicho
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all', viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]')}
                >
                  <List className="w-3.5 h-3.5" /> Lista
                </button>
              </div>

              <button
                onClick={() => handleSetAll(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
              >
                <ToggleRight className="w-3.5 h-3.5" /> Ativar todos
              </button>
              <button
                onClick={() => handleSetAll(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-400 border border-[var(--border)] hover:border-red-500/30 transition-colors"
              >
                <ToggleLeft className="w-3.5 h-3.5" /> Desativar todos
              </button>

              <div className="flex-1" />

              <button
                onClick={handleCopyAll}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  copiedId === '__all__'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]'
                )}
              >
                {copiedId === '__all__' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === '__all__' ? 'Copiado!' : 'Copiar todos'}
              </button>

              <button
                onClick={() => exportEntriesToCSV(filtered)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Exportar CSV
              </button>

              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-[var(--muted-foreground)] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar tudo
              </button>
            </div>

            {/* ── Results count ─────────────────────────── */}
            {filtered.length !== entries.length && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Mostrando <strong className="text-[var(--foreground)]">{filtered.length}</strong> de {entries.length} UTMs
              </p>
            )}

            {/* ── NICHE VIEW ────────────────────────────── */}
            {viewMode === 'niche' && (
              <div className="space-y-3">
                {nicheGroups.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[var(--muted-foreground)]">Nenhum resultado encontrado.</div>
                ) : (
                  nicheGroups.map(([niche, rows]) => {
                    const collapsed = collapsedNiches.has(niche);
                    const activeInNiche = rows.filter(r => r.active).length;
                    return (
                      <div key={niche} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                        {/* Niche header */}
                        <button
                          onClick={() => toggleNicheCollapse(niche)}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-[var(--muted)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-violet-400">{niche}</span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {rows.length} UTM{rows.length !== 1 ? 's' : ''}
                            </span>
                            <span className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full font-medium',
                              activeInNiche === rows.length
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : activeInNiche === 0
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-amber-500/15 text-amber-400'
                            )}>
                              {activeInNiche}/{rows.length} ativos
                            </span>
                          </div>
                          {collapsed
                            ? <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                            : <ChevronUp className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />}
                        </button>

                        {!collapsed && (
                          <div className="border-t border-[var(--border)] overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                                  <th className="px-4 py-2 text-left font-medium">UTM</th>
                                  <th className="px-4 py-2 text-left font-medium">Código</th>
                                  <th className="px-4 py-2 text-left font-medium">País / Região</th>
                                  <th className="px-4 py-2 text-left font-medium">Plataforma</th>
                                  <th className="px-4 py-2 text-left font-medium">Status</th>
                                  <th className="px-4 py-2 text-left font-medium"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border)]">
                                {rows.map(entry => (
                                  <EntryRow
                                    key={entry.id}
                                    entry={entry}
                                    copiedId={copiedId}
                                    onCopy={handleCopy}
                                    onToggle={handleToggle}
                                    onDelete={handleDelete}
                                  />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── LIST VIEW ─────────────────────────────── */}
            {viewMode === 'list' && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                        <th className="px-4 py-3 text-left font-medium">UTM</th>
                        <th className="px-4 py-3 text-left font-medium">Código</th>
                        <th className="px-4 py-3 text-left font-medium">País / Região</th>
                        <th className="px-4 py-3 text-left font-medium">Nicho</th>
                        <th className="px-4 py-3 text-left font-medium">Plataforma</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-[var(--muted-foreground)]">
                            Nenhum resultado encontrado.
                          </td>
                        </tr>
                      ) : (
                        filtered.map(entry => (
                          <EntryRow
                            key={entry.id}
                            entry={entry}
                            copiedId={copiedId}
                            showNiche
                            onCopy={handleCopy}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AppShell>
  );
}

// ─── Entry row component ──────────────────────────────────────────────────────
function EntryRow({
  entry, copiedId, showNiche = false, onCopy, onToggle, onDelete,
}: {
  entry: UTMEntry;
  copiedId: string | null;
  showNiche?: boolean;
  onCopy: (utm: string, id: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className={cn('group transition-colors', entry.active ? 'hover:bg-[var(--muted)]/50' : 'opacity-50 hover:opacity-70 hover:bg-[var(--muted)]/30')}>
      <td className="px-4 py-2.5">
        <code className={cn(
          'font-mono px-2 py-0.5 rounded select-all text-[11px]',
          entry.active ? 'bg-violet-500/10 text-violet-300' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
        )}>
          {entry.utm}
        </code>
      </td>
      <td className="px-4 py-2.5 font-mono font-bold text-violet-400">{entry.countryCode}</td>
      <td className="px-4 py-2.5 text-[var(--foreground)]">{entry.countryName}</td>
      {showNiche && <td className="px-4 py-2.5 font-medium text-[var(--foreground)]">{entry.parameter}</td>}
      <td className="px-4 py-2.5">
        <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono font-bold">
          {entry.platform}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <StatusToggle active={entry.active} onToggle={() => onToggle(entry.id)} />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onCopy(entry.utm, entry.id)}
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center transition-colors',
              copiedId === entry.id
                ? 'text-emerald-400'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
            title="Copiar"
          >
            {copiedId === entry.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
            title="Remover"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
