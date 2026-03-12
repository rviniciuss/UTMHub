'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Campaign, CampaignFilters, SortConfig, Platform } from '@/lib/types';
import {
  getCampaigns,
  addCampaign as addLocal,
  updateCampaign as updateLocal,
  deleteCampaign as deleteLocal,
  duplicateCampaign as duplicateLocal,
  checkDuplicate as checkDuplicateLocal,
  filterCampaigns,
  sortCampaigns,
} from '@/lib/store';
import { getEntries, deleteEntry } from '@/lib/utmEntries';
import { UTMEntry } from '@/lib/types';

const PLATFORM_MAP: Record<string, Platform> = {
  FB: 'Meta Ads',
  TT: 'Meta Ads',
  GG: 'Google Adsense',
  NATIVE: 'Both',
};

function entryToCampaign(entry: UTMEntry): Campaign {
  return {
    id: `entry_${entry.id}`,
    campaign_name: entry.utm,
    niche: entry.parameter,
    country: entry.countryName,
    utm_parameter: entry.utm,
    platform: PLATFORM_MAP[entry.platform.toUpperCase()] ?? 'Both',
    status: entry.active ? 'Active' : 'Paused',
    created_at: entry.createdAt,
    _fromEntry: true,
  };
}

function getAllCampaigns(): Campaign[] {
  const campaigns = getCampaigns();
  const entries = getEntries().map(entryToCampaign);
  return [...campaigns, ...entries];
}

interface CampaignContextValue {
  campaigns: Campaign[];
  filteredCampaigns: Campaign[];
  filters: CampaignFilters;
  sort: SortConfig;
  isLoading: boolean;
  setFilters: (filters: CampaignFilters) => void;
  setSort: (sort: SortConfig) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'created_at'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => Campaign | null;
  checkDuplicate: (utm: string, excludeId?: string) => boolean;
  refresh: () => void;
}

const defaultFilters: CampaignFilters = {
  search: '',
  country: '',
  niche: '',
  platform: '',
  status: '',
};

const defaultSort: SortConfig = {
  field: 'created_at',
  order: 'desc',
};

const CampaignContext = createContext<CampaignContextValue | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filters, setFilters] = useState<CampaignFilters>(defaultFilters);
  const [sort, setSort] = useState<SortConfig>(defaultSort);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setCampaigns(getAllCampaigns());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredCampaigns = React.useMemo(() => {
    const filtered = filterCampaigns(campaigns, filters);
    return sortCampaigns(filtered, sort);
  }, [campaigns, filters, sort]);

  const addCampaign = useCallback((campaign: Omit<Campaign, 'id' | 'created_at'>) => {
    const newCampaign = addLocal(campaign);
    setCampaigns(getAllCampaigns());
    return newCampaign;
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    if (!id.startsWith('entry_')) {
      updateLocal(id, updates);
    }
    setCampaigns(getAllCampaigns());
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    if (id.startsWith('entry_')) {
      deleteEntry(id.replace('entry_', ''));
    } else {
      deleteLocal(id);
    }
    setCampaigns(getAllCampaigns());
  }, []);

  const duplicateCampaign = useCallback((id: string) => {
    if (id.startsWith('entry_')) return null;
    const dup = duplicateLocal(id);
    setCampaigns(getAllCampaigns());
    return dup;
  }, []);

  const checkDuplicate = useCallback((utm: string, excludeId?: string) => {
    return checkDuplicateLocal(utm, excludeId);
  }, []);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        filteredCampaigns,
        filters,
        sort,
        isLoading,
        setFilters,
        setSort,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        duplicateCampaign,
        checkDuplicate,
        refresh,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaigns must be used within CampaignProvider');
  return ctx;
}
