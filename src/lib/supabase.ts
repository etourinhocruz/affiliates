import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DailyMetric = {
  id: string;
  date: string;
  revenue: number;
  clicks: number;
  conversions: number;
};

export type DealTier = { giros: string; comissao: string };

export type DealAdditionalInfo = {
  title: string;
  tiers: DealTier[];
} | null;

export type Deal = {
  id: string;
  name: string;
  banner: string;
  logo: string;
  baseline: string;
  cpa: string;
  revshare: string;
  sort_order: number;
  logo_url: string;
  banner_color: string;
  cpa_value: string;
  rev_value: string | null;
  deposito_min: string;
  aposta_min: string;
  additional_info: DealAdditionalInfo;
};

export type Conversion = {
  id: string;
  user_ref: string;
  campaign: string;
  status: 'approved' | 'pending' | 'rejected';
  commission: number;
  converted_at: string;
};