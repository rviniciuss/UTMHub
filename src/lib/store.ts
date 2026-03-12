'use client';

import { Campaign, CampaignFilters, SortConfig } from './types';
import { generateId } from './utils';

// v2 key intentionally discards any legacy sample/demo data stored under the old key
const STORAGE_KEY = 'utm_hub_campaigns_v2';

export function getCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Campaign[]) : [];
  } catch {
    return [];
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
