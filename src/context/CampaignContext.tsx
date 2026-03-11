'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Campaign, CampaignFilters, SortConfig } from '@/lib/types';
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
    const data = getCampaigns();
    setCampaigns(data);
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
    setCampaigns(getCampaigns());
    return newCampaign;
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    updateLocal(id, updates);
    setCampaigns(getCampaigns());
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    deleteLocal(id);
    setCampaigns(getCampaigns());
  }, []);

  const duplicateCampaign = useCallback((id: string) => {
    const dup = duplicateLocal(id);
    setCampaigns(getCampaigns());
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
