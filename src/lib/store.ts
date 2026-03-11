'use client';

import { Campaign, CampaignFilters, SortConfig } from './types';
import { generateId } from './utils';

const STORAGE_KEY = 'utm_hub_campaigns';

const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: generateId(),
    campaign_name: 'Finance Brazil Q1',
    niche: 'Finance',
    country: 'Brazil',
    utm_parameter: 'utmsourceXBRFINBTN',
    platform: 'Meta Ads',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: generateId(),
    campaign_name: 'Crypto USA Launch',
    niche: 'Crypto',
    country: 'USA',
    utm_parameter: 'utmsourceXUSACRYBTN',
    platform: 'Google Adsense',
    status: 'Testing',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: generateId(),
    campaign_name: 'Fitness UK Campaign',
    niche: 'Fitness',
    country: 'United Kingdom',
    utm_parameter: 'utmsourceXUKFITBTN',
    platform: 'Meta Ads',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: generateId(),
    campaign_name: 'Health Supplements Brazil',
    niche: 'Health',
    country: 'Brazil',
    utm_parameter: 'utmsourceXBRHEALTH',
    platform: 'Both',
    status: 'Paused',
    created_at: new Date(Date.now() - 86400000 * 21).toISOString(),
  },
  {
    id: generateId(),
    campaign_name: 'Software Canada Push',
    niche: 'Software',
    country: 'Canada',
    utm_parameter: 'utmsourceXCASOFTBTN',
    platform: 'Google Adsense',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: generateId(),
    campaign_name: 'E-commerce Mexico',
    niche: 'E-commerce',
    country: 'Mexico',
    utm_parameter: 'utmsourceXMXECOMBTN',
    platform: 'Meta Ads',
    status: 'Testing',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: generateId(),
    campaign_name: 'Real Estate Australia',
    niche: 'Real Estate',
    country: 'Australia',
    utm_parameter: 'utmsourceXAURESBTN',
    platform: 'Both',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: generateId(),
    campaign_name: 'Crypto Brazil Test',
    niche: 'Crypto',
    country: 'Brazil',
    utm_parameter: 'utmsourceXBRCRYPTO',
    platform: 'Meta Ads',
    status: 'Testing',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CAMPAIGNS));
      return SAMPLE_CAMPAIGNS;
    }
    return JSON.parse(stored);
  } catch {
    return SAMPLE_CAMPAIGNS;
  }
}

export function saveCampaigns(campaigns: Campaign[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export function addCampaign(campaign: Omit<Campaign, 'id' | 'created_at'>): Campaign {
  const campaigns = getCampaigns();
  const newCampaign: Campaign = {
    ...campaign,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  saveCampaigns([newCampaign, ...campaigns]);
  return newCampaign;
}

export function updateCampaign(id: string, updates: Partial<Campaign>): void {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index !== -1) {
    campaigns[index] = { ...campaigns[index], ...updates };
    saveCampaigns(campaigns);
  }
}

export function deleteCampaign(id: string): void {
  const campaigns = getCampaigns();
  saveCampaigns(campaigns.filter((c) => c.id !== id));
}

export function duplicateCampaign(id: string): Campaign | null {
  const campaigns = getCampaigns();
  const original = campaigns.find((c) => c.id === id);
  if (!original) return null;
  const duplicate: Campaign = {
    ...original,
    id: generateId(),
    campaign_name: `${original.campaign_name} (Copy)`,
    utm_parameter: `${original.utm_parameter}_copy`,
    created_at: new Date().toISOString(),
  };
  saveCampaigns([duplicate, ...campaigns]);
  return duplicate;
}

export function checkDuplicate(utmParameter: string, excludeId?: string): boolean {
  const campaigns = getCampaigns();
  return campaigns.some(
    (c) =>
      c.utm_parameter.toLowerCase() === utmParameter.toLowerCase() &&
      c.id !== excludeId
  );
}

export function filterCampaigns(campaigns: Campaign[], filters: CampaignFilters): Campaign[] {
  return campaigns.filter((campaign) => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      !filters.search ||
      campaign.campaign_name.toLowerCase().includes(searchLower) ||
      campaign.utm_parameter.toLowerCase().includes(searchLower) ||
      campaign.country.toLowerCase().includes(searchLower) ||
      campaign.niche.toLowerCase().includes(searchLower);

    const matchesCountry = !filters.country || campaign.country === filters.country;
    const matchesNiche = !filters.niche || campaign.niche === filters.niche;
    const matchesPlatform = !filters.platform || campaign.platform === filters.platform;
    const matchesStatus = !filters.status || campaign.status === filters.status;

    return matchesSearch && matchesCountry && matchesNiche && matchesPlatform && matchesStatus;
  });
}

export function sortCampaigns(campaigns: Campaign[], sort: SortConfig): Campaign[] {
  return [...campaigns].sort((a, b) => {
    const aVal = a[sort.field] as string;
    const bVal = b[sort.field] as string;
    const comparison = aVal.localeCompare(bVal);
    return sort.order === 'asc' ? comparison : -comparison;
  });
}
