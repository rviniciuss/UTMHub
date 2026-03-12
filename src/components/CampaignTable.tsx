'use client';

import { useState } from 'react';
import {
  Copy, Trash2, Edit, MoreHorizontal, CopyPlus, ChevronUp, ChevronDown,
  ChevronsUpDown, Check
} from 'lucide-react';
import { Campaign, SortField } from '@/lib/types';
import { useCampaigns } from '@/context/CampaignContext';
import { copyToClipboard, formatDate, cn } from '@/lib/utils';
import { StatusBadge, PlatformBadge } from './StatusBadge';
import { AddCampaignModal } from './AddCampaignModal';

const COLUMNS: { key: SortField; label: string; width?: string }[] = [
  { key: 'campaign_name', label: 'Campaign Name' },
  { key: 'niche', label: 'Niche', width: 'w-28' },
  { key: 'country', label: 'Country', width: 'w-32' },
  { key: 'utm_parameter', label: 'UTM Parameter' },
  { key: 'platform', label: 'Platform', width: 'w-36' },
  { key: 'status', label: 'Status', width: 'w-28' },
  { key: 'created_at', label: 'Created', width: 'w-28' },
];

export function CampaignTable() {
  const { filteredCampaigns, sort, setSort, deleteCampaign, duplicateCampaign, isLoading } = useCampaigns();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);

  const handleSort = (field: SortField) => {
    setSort({
      field,
      order: sort.field === field && sort.order === 'asc' ? 'desc' : 'asc',
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sort.order === 'asc'
      ? <ChevronUp className="w-3 h-3 text-violet-400" />
      : <ChevronDown className="w-3 h-3 text-violet-400" />;
  };

  const handleCopy = async (id: string, utm: string) => {
    await copyToClipboard(utm);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this UTM parameter?')) {
      deleteCampaign(id);
    }
    setOpenMenu(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (filteredCampaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-3">
          <CopyPlus className="w-5 h-5 text-violet-400" />
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">No campaigns found</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Try adjusting your filters or add a new UTM parameter.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {COLUMNS.map(({ key, label, width }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={cn(
                    'text-left px-4 py-3 text-xs font-medium text-[var(--muted-foreground)] cursor-pointer',
                    'hover:text-[var(--foreground)] select-none',
                    width
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {label}
                    <SortIcon field={key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredCampaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="group hover:bg-[var(--muted)]/50 transition-colors animate-fade-in"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-[var(--foreground)] truncate max-w-[180px] block">
                    {campaign.campaign_name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium">
                    {campaign.niche}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-[var(--muted-foreground)]">{campaign.country}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded truncate max-w-[160px]">
                      {campaign.utm_parameter}
                    </code>
                    <button
                      onClick={() => handleCopy(campaign.id, campaign.utm_parameter)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                      title="Copy UTM"
                    >
                      {copiedId === campaign.id
                        ? <Check className="w-3 h-3 text-emerald-400" />
                        : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PlatformBadge platform={campaign.platform} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={campaign.status} />
                </td>
                <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                  {formatDate(campaign.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === campaign.id ? null : campaign.id)}
                      className="w-7 h-7 rounded-lg hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenu === campaign.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 top-8 z-20 w-44 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl py-1 animate-scale-in">
                          {!campaign._fromEntry && (
                            <>
                              <button
                                onClick={() => { setEditCampaign(campaign); setOpenMenu(null); }}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                                Edit Campaign
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { handleCopy(campaign.id, campaign.utm_parameter); setOpenMenu(null); }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                            Copy UTM
                          </button>
                          {!campaign._fromEntry && (
                            <button
                              onClick={() => { duplicateCampaign(campaign.id); setOpenMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                            >
                              <CopyPlus className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                              Duplicate
                            </button>
                          )}
                          <div className="border-t border-[var(--border)] my-1" />
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddCampaignModal
        open={!!editCampaign}
        onClose={() => setEditCampaign(null)}
        editCampaign={editCampaign}
      />
    </>
  );
}
