import { createClient } from '@supabase/supabase-js';
import { Campaign } from './types';

// Supabase configuration
// Set these environment variables in .env.local:
// NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// SQL Schema for Supabase setup:
// CREATE TABLE campaigns (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   campaign_name TEXT NOT NULL,
//   niche TEXT NOT NULL,
//   country TEXT NOT NULL,
//   utm_parameter TEXT UNIQUE NOT NULL,
//   platform TEXT NOT NULL CHECK (platform IN ('Meta Ads', 'Google Adsense', 'Both')),
//   status TEXT NOT NULL CHECK (status IN ('Active', 'Testing', 'Paused')),
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// CREATE INDEX idx_campaigns_utm ON campaigns(utm_parameter);
// CREATE INDEX idx_campaigns_country ON campaigns(country);
// CREATE INDEX idx_campaigns_niche ON campaigns(niche);
// ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Allow all" ON campaigns FOR ALL USING (true);

export async function fetchCampaignsFromSupabase(): Promise<Campaign[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Campaign[]) || [];
}

export async function addCampaignToSupabase(campaign: Omit<Campaign, 'id' | 'created_at'>): Promise<Campaign> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single();
  if (error) throw error;
  return data as Campaign;
}

export async function updateCampaignInSupabase(id: string, updates: Partial<Campaign>): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCampaignFromSupabase(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw error;
}
