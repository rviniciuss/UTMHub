'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Database, Palette, Download, Upload, Trash2, CheckCircle, Info,
  Plus, Pencil, X, Globe, RotateCcw,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useCampaigns } from '@/context/CampaignContext';
import { useLanguage } from '@/context/LanguageContext';
import { exportToCSV } from '@/lib/utils';
import { Campaign } from '@/lib/types';
import { CountryGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getGroups, saveGroups, addGroup, updateGroup, deleteGroup, resetGroups, DEFAULT_GROUPS } from '@/lib/groups';

// ────────────────────────────────────────────────
// Group editor row
// ────────────────────────────────────────────────
interface GroupRowProps {
  group: CountryGroup;
  onEdit: (g: CountryGroup) => void;
  onDelete: (id: string) => void;
  t: (k: string) => string;
}

function GroupRow({ group, onEdit, onDelete, t }: GroupRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">{group.name}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {group.codes.length === 0 ? (
            <span className="text-[10px] text-[var(--muted-foreground)] italic">{t('No codes')}</span>
          ) : (
            group.codes.map(code => (
              <span key={code} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 font-mono font-medium">
                {code}
              </span>
            ))
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(group)}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-violet-500/15 text-[var(--muted-foreground)] hover:text-violet-400 transition-colors"
          title={t('Edit Group')}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(group.id)}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-red-500/15 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
          title={t('Delete Group')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Group form (add / edit)
// ────────────────────────────────────────────────
interface GroupFormProps {
  initial?: CountryGroup;
  onSave: (name: string, codes: string[]) => void;
  onCancel: () => void;
  t: (k: string) => string;
}

function GroupForm({ initial, onSave, onCancel, t }: GroupFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [codesText, setCodesText] = useState(initial?.codes.join(', ') ?? '');

  const handleSave = () => {
    const n = name.trim().toUpperCase();
    if (!n) return;
    const codes = codesText
      .split(/[\s,]+/)
      .map(c => c.trim().toUpperCase())
      .filter(Boolean);
    onSave(n, codes);
  };

  return (
    <div className="p-3 bg-[var(--muted)] border border-violet-500/30 rounded-lg space-y-2.5 animate-fade-in">
      <div>
        <label className="block text-xs font-medium text-[var(--foreground)] mb-1">{t('Group Name')}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value.toUpperCase())}
          placeholder="ARABE-MUNDO"
          className="w-full px-3 py-2 text-sm font-mono bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--foreground)] mb-1">{t('Country Codes')}</label>
        <input
          type="text"
          value={codesText}
          onChange={e => setCodesText(e.target.value.toUpperCase())}
          placeholder="ARM, AREU, ARIS, ARKU, AROM"
          className="w-full px-3 py-2 text-sm font-mono bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{t('Country codes separated by commas')}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            name.trim()
              ? 'bg-violet-600 hover:bg-violet-500 text-white'
              : 'bg-[var(--border)] text-[var(--muted-foreground)] cursor-not-allowed'
          )}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {t('Save')}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {t('Cancel')}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Settings page
// ────────────────────────────────────────────────
export default function SettingsPage() {
  const { campaigns, refresh } = useCampaigns();
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  // Groups state
  const [groups, setGroups] = useState<CountryGroup[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CountryGroup | null>(null);
  const [groupSearch, setGroupSearch] = useState('');

  useEffect(() => {
    setGroups(getGroups());
  }, []);

  const refreshGroups = useCallback(() => {
    setGroups(getGroups());
  }, []);

  // ── Group handlers ──────────────────────────────
  const handleAddGroup = (name: string, codes: string[]) => {
    addGroup(name, codes);
    refreshGroups();
    setShowAddForm(false);
  };

  const handleUpdateGroup = (name: string, codes: string[]) => {
    if (!editingGroup) return;
    updateGroup(editingGroup.id, name, codes);
    refreshGroups();
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string) => {
    if (!confirm('Excluir este grupo?')) return;
    deleteGroup(id);
    refreshGroups();
  };

  const handleResetGroups = () => {
    if (!confirm('Restaurar todos os grupos para o padrão? Suas alterações serão perdidas.')) return;
    resetGroups();
    refreshGroups();
  };

  // ── Campaign handlers ───────────────────────────
  const handleExport = () => exportToCSV(campaigns);

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja deletar TODAS as campanhas? Esta ação não pode ser desfeita.')) {
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

  const filteredGroups = groupSearch
    ? groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
        g.codes.some(c => c.toLowerCase().includes(groupSearch.toLowerCase())))
    : groups;

  return (
    <AppShell title={t('Settings')} subtitle="Gerencie grupos de países e preferências do UTM Hub">
      <div className="p-6 max-w-3xl space-y-6">

        {/* ── Country Groups ─────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              {t('Country Groups')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetGroups}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                title={t('Reset to defaults')}
              >
                <RotateCcw className="w-3 h-3" />
                {t('Reset to defaults')}
              </button>
              <button
                onClick={() => { setShowAddForm(true); setEditingGroup(null); }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
                {t('Add Group')}
              </button>
            </div>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Configure os grupos e seus códigos de país. O gerador usará apenas esses códigos.
          </p>

          {/* Search */}
          <input
            type="text"
            value={groupSearch}
            onChange={e => setGroupSearch(e.target.value)}
            placeholder="Buscar grupo ou código..."
            className="w-full px-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 mb-3"
          />

          {/* Add form */}
          {showAddForm && !editingGroup && (
            <div className="mb-3">
              <GroupForm
                onSave={handleAddGroup}
                onCancel={() => setShowAddForm(false)}
                t={t}
              />
            </div>
          )}

          {/* Group list */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {filteredGroups.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)] text-center py-6">
                Nenhum grupo encontrado.
              </p>
            ) : (
              filteredGroups.map(group => (
                editingGroup?.id === group.id ? (
                  <div key={group.id} className="mb-1">
                    <GroupForm
                      initial={group}
                      onSave={handleUpdateGroup}
                      onCancel={() => setEditingGroup(null)}
                      t={t}
                    />
                  </div>
                ) : (
                  <GroupRow
                    key={group.id}
                    group={group}
                    onEdit={setEditingGroup}
                    onDelete={handleDeleteGroup}
                    t={t}
                  />
                )
              ))
            )}
          </div>

          <p className="text-[10px] text-[var(--muted-foreground)] mt-3">
            {groups.length} grupos · {groups.reduce((sum, g) => sum + g.codes.length, 0)} códigos no total
          </p>
        </div>

        {/* ── Data Management ────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            {t('Data Management')}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Exporte, importe ou limpe os dados de campanha.
          </p>

          <div className="space-y-3">
            {/* Export */}
            <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{t('Export Campaigns')}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Baixar {campaigns.length} campanhas como CSV
                </p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {t('Export CSV')}
              </button>
            </div>

            {/* Import */}
            <div className="p-3 bg-[var(--muted)] rounded-lg space-y-2">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{t('Bulk Import (JSON)')}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Cole um array JSON de campanhas para importar em massa
                </p>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`[{"campaign_name": "...", "niche": "Finance", "country": "Brazil", "utm_parameter": "ARM-Namoro2-FB", "platform": "Meta Ads", "status": "Active"}]`}
                rows={4}
                className="w-full px-3 py-2 text-xs font-mono bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
              {importError && <p className="text-xs text-red-400">{importError}</p>}
              {saved && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Campanhas importadas com sucesso!
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
                {t('Import JSON')}
              </button>
            </div>

            {/* Clear all */}
            <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-400">{t('Clear All Data')}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Deletar permanentemente todos os dados de campanha
                </p>
              </div>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('Clear')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Appearance ─────────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-400" />
            {t('Appearance')}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Personalize a aparência do UTM Hub.
          </p>
          <div className="p-3 bg-[var(--muted)] rounded-lg space-y-2">
            <p className="text-xs text-[var(--muted-foreground)]">
              Use o ícone sol/lua no cabeçalho para alternar entre modo claro e escuro.
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Use os botões <strong className="text-[var(--foreground)]">PT / EN</strong> no cabeçalho para alternar o idioma.
            </p>
          </div>
        </div>

        {/* ── Integrations ───────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <Settings className="w-4 h-4 text-violet-400" />
            {t('Integrations')}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Conecte serviços externos para funcionalidades avançadas.
          </p>
          <div className="space-y-2">
            {[
              { name: 'Supabase Database', desc: 'Sincronize campanhas com banco PostgreSQL na nuvem', status: 'Configurar em .env.local', icon: Database },
              { name: 'Meta Ads API', desc: 'Puxar métricas de campanha automaticamente', status: 'Em breve', icon: Info },
              { name: 'Google Ads API', desc: 'Sincronizar dados de campanha Google', status: 'Em breve', icon: Info },
              { name: 'Google Analytics', desc: 'Rastrear métricas de performance UTM', status: 'Em breve', icon: Info },
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

      </div>
    </AppShell>
  );
}
