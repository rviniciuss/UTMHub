import { UTMEntry } from './types';
import { getCodeName } from './groups';

const STORE_KEY = 'utm_hub_entries';
const PLATFORMS = ['FB', 'TT', 'GG', 'NATIVE'];

/** Parse a single UTM string like "ARM-Namoro2-FB" into its components.
 *  Format: COUNTRYCODE-PARAMETER-PLATFORM
 *  Platform is always the last dash-separated token and must be a known value.
 *  Country code is the first token.
 *  Everything in between is the parameter (may contain dashes). */
export function parseUTMString(raw: string): Omit<UTMEntry, 'id' | 'active' | 'createdAt'> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parts = trimmed.split('-');
  if (parts.length < 3) return null;

  const platformRaw = parts[parts.length - 1].toUpperCase();
  if (!PLATFORMS.includes(platformRaw)) return null;

  const countryCode = parts[0].toUpperCase();
  const parameter = parts.slice(1, parts.length - 1).join('-');
  if (!countryCode || !parameter) return null;

  return {
    utm: trimmed,
    countryCode,
    countryName: getCodeName(countryCode),
    parameter,
    platform: platformRaw === 'NATIVE' ? 'Native' : platformRaw,
  };
}

export function getEntries(): UTMEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORE_KEY);
    return stored ? (JSON.parse(stored) as UTMEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: UTMEntry[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(entries));
}

/** Import a list of UTM strings. Skips duplicates (by utm string).
 *  Returns { imported, skipped, failed }. */
export function importUTMList(lines: string[]): { imported: number; skipped: number; failed: number } {
  const existing = getEntries();
  const existingUtms = new Set(existing.map(e => e.utm.toUpperCase()));
  let imported = 0, skipped = 0, failed = 0;

  const newEntries: UTMEntry[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parsed = parseUTMString(line.trim());
    if (!parsed) { failed++; continue; }
    if (existingUtms.has(parsed.utm.toUpperCase())) { skipped++; continue; }
    existingUtms.add(parsed.utm.toUpperCase());
    newEntries.push({
      ...parsed,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      active: true,
      createdAt: new Date().toISOString(),
    });
    imported++;
  }

  saveEntries([...newEntries, ...existing]);
  return { imported, skipped, failed };
}

export function toggleActive(id: string): void {
  const entries = getEntries();
  saveEntries(entries.map(e => e.id === id ? { ...e, active: !e.active } : e));
}

export function setAllActive(active: boolean, ids?: string[]): void {
  const entries = getEntries();
  saveEntries(entries.map(e => (!ids || ids.includes(e.id)) ? { ...e, active } : e));
}

export function deleteEntry(id: string): void {
  saveEntries(getEntries().filter(e => e.id !== id));
}

export function clearAllEntries(): void {
  localStorage.removeItem(STORE_KEY);
}

export function exportEntriesToCSV(entries: UTMEntry[]): void {
  const header = 'UTM,Código País,País / Região,Parâmetro,Plataforma,Status\n';
  const rows = entries
    .map(e => `${e.utm},${e.countryCode},"${e.countryName}",${e.parameter},${e.platform},${e.active ? 'Ativo' : 'Inativo'}`)
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `utms_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
