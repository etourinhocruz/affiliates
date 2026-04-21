import type { DailyMetric, Conversion } from '../lib/supabase';

export const fallbackMetrics: DailyMetric[] = [
  { id: '1', date: '2026-04-14', revenue: 4820.5, clicks: 1240, conversions: 58 },
  { id: '2', date: '2026-04-15', revenue: 5310, clicks: 1380, conversions: 64 },
  { id: '3', date: '2026-04-16', revenue: 4980.75, clicks: 1195, conversions: 55 },
  { id: '4', date: '2026-04-17', revenue: 6120.3, clicks: 1530, conversions: 72 },
  { id: '5', date: '2026-04-18', revenue: 7050.9, clicks: 1720, conversions: 83 },
  { id: '6', date: '2026-04-19', revenue: 6840.2, clicks: 1645, conversions: 79 },
  { id: '7', date: '2026-04-20', revenue: 7890.6, clicks: 1880, conversions: 91 },
];

export const fallbackConversions: Conversion[] = [
  { id: 'a', user_ref: 'USR-48291', campaign: 'BetKing - Signup FTD', status: 'approved', commission: 245, converted_at: new Date(Date.now() - 12 * 60_000).toISOString() },
  { id: 'b', user_ref: 'USR-39104', campaign: 'LuckySpin - CPA R$ 180', status: 'approved', commission: 180, converted_at: new Date(Date.now() - 47 * 60_000).toISOString() },
  { id: 'c', user_ref: 'USR-77812', campaign: 'RoyalBet - RevShare', status: 'pending', commission: 92.5, converted_at: new Date(Date.now() - 80 * 60_000).toISOString() },
];
