import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type AdminWriteBody =
  | { table: 'agencies'; action: 'insert'; payload: Record<string, unknown> }
  | { table: 'agencies'; action: 'update'; id: string; patch: Record<string, unknown> }
  | { table: 'admin_users'; action: 'update'; id: string; patch: Record<string, unknown> }
  | { table: 'admin_users'; action: 'delete'; id: string }
  | { table: 'admin_deals'; action: 'insert'; payload: Record<string, unknown> }
  | { table: 'admin_deals'; action: 'update'; id: string; patch: Record<string, unknown> }
  | { table: 'imported_metrics'; action: 'batch_insert'; rows: Record<string, unknown>[] };

export async function adminWrite<T = unknown>(body: AdminWriteBody): Promise<T | null> {
  const res = await fetch(`${supabaseUrl}/functions/v1/admin-write`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? 'admin-write failed');
  return (json?.data as T) ?? null;
}

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