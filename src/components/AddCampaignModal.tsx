'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useCampaigns } from '@/context/CampaignContext';
import { Campaign, NICHES, PLATFORMS, STATUSES, COUNTRIES, Platform, Status } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AddCampaignModalProps {
  open: boolean;
  onClose: () => void;
  editCampaign?: Campaign | Partial<Campaign> | null;
}

const EMPTY_FORM = {
  campaign_name: '',
  niche: '',
  country: '',
  utm_parameter: '',
  platform: '' as Platform | '',
  status: 'Active' as Status,
};

export function AddCampaignModal({ open, onClose, editCampaign }: AddCampaignModalProps) {
  const { addCampaign, updateCampaign, checkDuplicate } = useCampaigns();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editCampaign) {
        setForm({
          campaign_name: editCampaign.campaign_name || '',
          niche: editCampaign.niche || '',
          country: editCampaign.country || '',
          utm_parameter: editCampaign.utm_parameter || '',
          platform: editCampaign.platform || ('' as Platform | ''),
          status: editCampaign.status || 'Active',
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setIsDuplicate(null);
    }
  }, [open, editCampaign]);

  useEffect(() => {
    if (!form.utm_parameter.trim()) {
      setIsDuplicate(null);
      return;
    }
    const timer = setTimeout(() => {
      const dup = checkDuplicate(form.utm_parameter, editCampaign?.id);
      setIsDuplicate(dup);
    }, 300);
    return () => clearTimeout(timer);
  }, [form.utm_parameter, checkDuplicate, editCampaign?.id]);

  if (!open) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.campaign_name.trim()) errs.campaign_name = 'Campaign name is required';
    if (!form.niche) errs.niche = 'Niche is required';
    if (!form.country) errs.country = 'Country is required';
    if (!form.utm_parameter.trim()) errs.utm_parameter = 'UTM parameter is required';
    if (!form.platform) errs.platform = 'Platform is required';
    if (!form.status) errs.status = 'Status is required';
    if (isDuplicate) errs.utm_parameter = 'UTM parameter already exists';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const isFullEdit = editCampaign && 'id' in editCampaign && editCampaign.id;
      if (isFullEdit) {
        updateCampaign((editCampaign as Campaign).id, form as Omit<Campaign, 'id' | 'created_at'>);
      } else {
        addCampaign(form as Omit<Campaign, 'id' | 'created_at'>);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {editCampaign && 'id' in editCampaign && editCampaign.id ? 'Edit UTM Parameter' : 'Add New UTM Parameter'}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Fill in the details to {editCampaign && 'id' in editCampaign && editCampaign.id ? 'update' : 'register'} your campaign
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--muted)] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Campaign Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.campaign_name}
              onChange={set('campaign_name')}
              placeholder="e.g. Finance Brazil Q1 2025"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border bg-[var(--muted)] text-[var(--foreground)]',
                'placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors',
                errors.campaign_name ? 'border-red-500' : 'border-[var(--border)]'
              )}
            />
            {errors.campaign_name && (
              <p className="text-xs text-red-400 mt-1">{errors.campaign_name}</p>
            )}
          </div>

          {/* Niche + Country row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Niche <span className="text-red-400">*</span>
              </label>
              <select
                value={form.niche}
                onChange={set('niche')}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-[var(--muted)] text-[var(--foreground)]',
                  'focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors',
                  errors.niche ? 'border-red-500' : 'border-[var(--border)]'
                )}
              >
                <option value="">Select niche</option>
                {NICHES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {errors.niche && (
                <p className="text-xs text-red-400 mt-1">{errors.niche}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Country <span className="text-red-400">*</span>
              </label>
              <select
                value={form.country}
                onChange={set('country')}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-[var(--muted)] text-[var(--foreground)]',
                  'focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors',
                  errors.country ? 'border-red-500' : 'border-[var(--border)]'
                )}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
              {errors.country && (
                <p className="text-xs text-red-400 mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          {/* UTM Parameter */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              UTM Parameter <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.utm_parameter}
                onChange={set('utm_parameter')}
                placeholder="e.g. utmsourceXBRFINBTN"
                className={cn(
                  'w-full px-3 py-2 pr-8 text-sm rounded-lg border bg-[var(--muted)] text-[var(--foreground)] font-mono',
                  'placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors',
                  errors.utm_parameter ? 'border-red-500' : 'border-[var(--border)]'
                )}
              />
              {form.utm_parameter && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {isDuplicate === true && (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  {isDuplicate === false && (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              )}
            </div>
            {form.utm_parameter && isDuplicate === true && (
              <p className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                <AlertTriangle className="w-3 h-3" />
                ⚠ This UTM parameter is already registered.
              </p>
            )}
            {form.utm_parameter && isDuplicate === false && (
              <p className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                <CheckCircle className="w-3 h-3" />
                ✓ Parameter available
              </p>
            )}
            {errors.utm_parameter && !isDuplicate && (
              <p className="text-xs text-red-400 mt-1">{errors.utm_parameter}</p>
            )}
          </div>

          {/* Platform + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Platform <span className="text-red-400">*</span>
              </label>
              <select
                value={form.platform}
                onChange={set('platform')}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-[var(--muted)] text-[var(--foreground)]',
                  'focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors',
                  errors.platform ? 'border-red-500' : 'border-[var(--border)]'
                )}
              >
                <option value="">Select platform</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.platform && (
                <p className="text-xs text-red-400 mt-1">{errors.platform}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                value={form.status}
                onChange={set('status')}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-[var(--muted)] text-[var(--foreground)]',
                  'focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors',
                  'border-[var(--border)]'
                )}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isDuplicate === true}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors',
                saving || isDuplicate === true
                  ? 'bg-violet-600/50 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-500'
              )}
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editCampaign && 'id' in editCampaign && editCampaign.id ? 'Save Changes' : 'Add UTM Parameter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
