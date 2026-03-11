import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Campaign, COUNTRIES } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUTM(niche: string, country: string, button: string, format?: string): string {
  const nicheCode = niche.toUpperCase().slice(0, 3);
  const countryCode = country.toUpperCase().slice(0, 3);
  const btnCode = button.toUpperCase().replace(/\s+/g, '');

  if (format) {
    return format
      .replace('{NICHE}', nicheCode)
      .replace('{COUNTRY}', countryCode)
      .replace('{BTN}', btnCode)
      .toUpperCase();
  }

  return `utmsourceX${countryCode}${nicheCode}${btnCode}`;
}

export function getCountryFlag(countryName: string): string {
  const country = COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code.toLowerCase() === countryName.toLowerCase()
  );
  return country?.flag || '🌍';
}

export function getStatusColor(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'Active':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
      };
    case 'Testing':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
      };
    case 'Paused':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        dot: 'bg-red-400',
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        dot: 'bg-slate-400',
      };
  }
}

export function getPlatformColor(platform: string): { bg: string; text: string } {
  switch (platform) {
    case 'Meta Ads':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400' };
    case 'Google Adsense':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400' };
    case 'Both':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400' };
  }
}

export function exportToCSV(campaigns: Campaign[]): void {
  const headers = ['Campaign Name', 'Niche', 'Country', 'UTM Parameter', 'Platform', 'Status', 'Created Date'];
  const rows = campaigns.map((c) => [
    c.campaign_name,
    c.niche,
    c.country,
    c.utm_parameter,
    c.platform,
    c.status,
    new Date(c.created_at).toLocaleDateString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `utm-campaigns-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
