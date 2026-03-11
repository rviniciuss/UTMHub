export type Platform = 'Meta Ads' | 'Google Adsense' | 'Both';
export type Status = 'Active' | 'Testing' | 'Paused';
export type UTMPlatform = 'FB' | 'TT' | 'GG' | 'Native';

export const UTM_PLATFORMS: UTMPlatform[] = ['FB', 'TT', 'GG', 'Native'];

export interface CountryGroup {
  id: string;
  name: string;
  codes: string[];
}

export interface ParsedCampaign {
  cartaz: number;
  groupName: string;
  parameter: string;
  platform: string;
  rawLine: string;
  error?: string;
}

export interface GeneratedUTM {
  cartaz: number;
  groupName: string;
  countryCode: string;
  parameter: string;
  platform: string;
  utm: string;
}

export interface Campaign {
  id: string;
  campaign_name: string;
  niche: string;
  country: string;
  utm_parameter: string;
  platform: Platform;
  status: Status;
  created_at: string;
}

export interface CampaignFilters {
  search: string;
  country: string;
  niche: string;
  platform: string;
  status: string;
}

export type SortField = keyof Campaign;
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export const NICHES = [
  'Finance',
  'Fitness',
  'Crypto',
  'Health',
  'Supplements',
  'Software',
  'E-commerce',
  'Insurance',
  'Real Estate',
  'Education',
  'Travel',
  'Gaming',
] as const;

export const PLATFORMS: Platform[] = ['Meta Ads', 'Google Adsense', 'Both'];
export const STATUSES: Status[] = ['Active', 'Testing', 'Paused'];

export const COUNTRIES = [
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
] as const;
