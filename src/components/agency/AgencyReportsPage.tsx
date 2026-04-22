import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, TrendingDown, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Member = {
  id: string;
  name: string;
  tier: string;
  ftds: number;
  net_revenue: number;
  commission: number;
  conversion_rate: number;
};

const fallback: Member[] = [
  { id: 'm1', name: 'Rodrigo Alves', tier: 'Afiliado Gold', ftds: 1210, net_revenue: 42800, commission: 12840, conversion_rate: 18.4 },
  { id: 'm2', name: 'Marina Queiroz', tier: 'Afiliado Gold', ftds: 984, net_revenue: 33600, commission: 9820, conversion_rate: 16.7 },
  { id: 'm3', name: 'Diego Martins', tier: 'Afiliado', ftds: 612, net_revenue: 19700, commission: 5810, conversion_rate: 12.1 },
  { id: 'm4', name: 'Camila Rocha', tier: 'Afiliado', ftds: 498, net_revenue: 16420, commission: 4720, conversion_rate: 11.3 },
  { id: 'm5', name: 'Bruno Tavares', tier: 'Afiliado Júnior', ftds: 184, net_revenue: 6120, commission: 1650, conversion_rate: 7.8 },
  { id: 'm6', name: 'Isabela Mota', tier: 'Afiliado', ftds: 302, net_revenue: 10240, commission: 2980, conversion_rate: 9.4 },
];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const formatInt = (v: number) => Math.round(v).toLocaleString('pt-BR');

export default function AgencyReportsPage() {
  const [members, setMembers] = useState<Member[]>(fallback);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('agency_members')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length) setMembers(data as Member[]);
    })();
  }, []);

  const factor = period === '7d' ? 0.25 : period === '90d' ? 2.6 : 1;
  const scaled = useMemo(
    () =>
      members.map((m) => ({
        ...m,
        ftds: Math.round(m.ftds * factor),
        net_revenue: Number(m.net_revenue) * factor,
        commission: Number(m.commission) * factor,
      })),
    [members, factor],
  );

  const maxRev = Math.max(...scaled.map((m) => Number(m.net_revenue)), 1);

  const totals = useMemo(
    () => ({
      ftds: scaled.reduce((a, m) => a + m.ftds, 0),
      rev: scaled.reduce((a, m) => a + Number(m.net_revenue), 0),
      commission: scaled.reduce((a, m) => a + Number(m.commission), 0),
    }),
    [scaled],
  );

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600 ring-1 ring-sky-400/30 dark:text-sky-300">
            <BarChart3 className="h-3 w-3" />
            Agency Suite · Relatórios
          </span>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Relatórios Agregados
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Compare a performance de cada afiliado e exporte dados para seu board.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white text-xs font-semibold dark:border-white/10 dark:bg-slate-900/60">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-2 transition ${
                  period === p
                    ? 'bg-[#39FF14] text-slate-950'
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Summary label="FTDs" value={formatInt(totals.ftds)} tone="sky" trendText="+8,4% vs período anterior" positive />
        <Summary label="Net Revenue" value={formatBRL(totals.rev)} tone="neon" trendText="+12,1% vs período anterior" positive />
        <Summary label="Comissão distribuída" value={formatBRL(totals.commission)} tone="amber" trendText="-2,3% vs período anterior" positive={false} />
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Net revenue por afiliado
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
          Comparativo relativo ao maior contribuidor do período.
        </p>
        <div className="mt-5 space-y-4">
          {scaled.map((m) => {
            const pct = (Number(m.net_revenue) / maxRev) * 100;
            return (
              <div key={m.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-900 dark:text-white">{m.name}</span>
                  <span className="tabular-nums text-gray-500 dark:text-slate-400">
                    {formatBRL(Number(m.net_revenue))}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#39FF14] via-emerald-400 to-sky-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Summary({
  label,
  value,
  tone,
  trendText,
  positive,
}: {
  label: string;
  value: string;
  tone: 'neon' | 'sky' | 'amber';
  trendText: string;
  positive: boolean;
}) {
  const ring =
    tone === 'neon'
      ? 'ring-neon-400/30'
      : tone === 'sky'
        ? 'ring-sky-400/30'
        : 'ring-amber-400/30';
  const text =
    tone === 'neon'
      ? 'text-[#39FF14]'
      : tone === 'sky'
        ? 'text-sky-600 dark:text-sky-300'
        : 'text-amber-600 dark:text-amber-300';
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 ring-1 dark:border-white/5 dark:bg-[#1E1E24] ${ring}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${text}`}>{value}</p>
      <p
        className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${
          positive ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'
        }`}
      >
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {trendText}
      </p>
    </div>
  );
}
