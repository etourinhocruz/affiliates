import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  Flame,
  LineChart,
  Network,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import AnimatedNumber from '../AnimatedNumber';
import { supabase } from '../../lib/supabase';

type Member = {
  id: string;
  name: string;
  email: string;
  tier: string;
  ftds: number;
  net_revenue: number;
  commission: number;
  conversion_rate: number;
  status: 'active' | 'paused';
};

const fallback: Member[] = [
  { id: 'm1', name: 'Rodrigo Alves', email: 'rodrigo.alves@gmail.com', tier: 'Afiliado Gold', ftds: 1210, net_revenue: 42800, commission: 12840, conversion_rate: 18.4, status: 'active' },
  { id: 'm2', name: 'Marina Queiroz', email: 'marina.q@tuboreomedia.com', tier: 'Afiliado Gold', ftds: 984, net_revenue: 33600, commission: 9820, conversion_rate: 16.7, status: 'active' },
  { id: 'm3', name: 'Diego Martins', email: 'diego.m@tuboreomedia.com', tier: 'Afiliado', ftds: 612, net_revenue: 19700, commission: 5810, conversion_rate: 12.1, status: 'active' },
  { id: 'm4', name: 'Camila Rocha', email: 'camila.rocha@gmail.com', tier: 'Afiliado', ftds: 498, net_revenue: 16420, commission: 4720, conversion_rate: 11.3, status: 'active' },
  { id: 'm5', name: 'Bruno Tavares', email: 'bruno@partners.br', tier: 'Afiliado Júnior', ftds: 184, net_revenue: 6120, commission: 1650, conversion_rate: 7.8, status: 'paused' },
  { id: 'm6', name: 'Isabela Mota', email: 'isa.mota@tuboreomedia.com', tier: 'Afiliado', ftds: 302, net_revenue: 10240, commission: 2980, conversion_rate: 9.4, status: 'active' },
];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const formatInt = (v: number) => Math.round(v).toLocaleString('pt-BR');

export default function AgencyOverviewPage() {
  const [members, setMembers] = useState<Member[]>(fallback);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('agency_members')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length) setMembers(data as Member[]);
    })();
  }, []);

  const totals = useMemo(() => {
    const active = members.filter((m) => m.status === 'active');
    const ftds = members.reduce((a, m) => a + Number(m.ftds), 0);
    const netRev = members.reduce((a, m) => a + Number(m.net_revenue), 0);
    const commission = members.reduce((a, m) => a + Number(m.commission), 0);
    const agencyCut = commission * 0.15;
    const avgConv = members.length
      ? members.reduce((a, m) => a + Number(m.conversion_rate), 0) / members.length
      : 0;
    return {
      activeCount: active.length,
      totalCount: members.length,
      ftds,
      netRev,
      commission,
      agencyCut,
      avgConv,
    };
  }, [members]);

  const leaderboard = useMemo(
    () => [...members].sort((a, b) => Number(b.net_revenue) - Number(a.net_revenue)).slice(0, 5),
    [members],
  );

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600 ring-1 ring-sky-400/30 dark:text-sky-300">
          <Building2 className="h-3 w-3" />
          Agency Suite · Visão Consolidada
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Performance Consolidada da Agência
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Acompanhe o desempenho agregado da sua rede de afiliados e a comissão da agência.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<Users className="h-5 w-5" />}
          label="Afiliados ativos"
          value={
            <>
              <AnimatedNumber value={totals.activeCount} format={formatInt} />
              <span className="ml-1 text-sm font-semibold text-gray-400 dark:text-slate-500">
                / {totals.totalCount}
              </span>
            </>
          }
          hint="Network sob gestão"
        />
        <Kpi
          icon={<Flame className="h-5 w-5" />}
          label="FTDs agregados"
          value={<AnimatedNumber value={totals.ftds} format={formatInt} />}
          hint={`Conversão média ${totals.avgConv.toFixed(1)}%`}
        />
        <Kpi
          icon={<Wallet className="h-5 w-5" />}
          label="Net revenue da rede"
          value={<AnimatedNumber value={totals.netRev} format={formatBRL} />}
          hint="Receita líquida gerada"
        />
        <Kpi
          icon={<LineChart className="h-5 w-5" />}
          label="Comissão da Agência"
          value={<AnimatedNumber value={totals.agencyCut} format={formatBRL} />}
          hint="Override de 15% sobre a rede"
          accent
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Top 5 afiliados
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Ordenados por net revenue nos últimos 30 dias.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              <TrendingUp className="h-3 w-3" />
              Performance
            </span>
          </div>
          <ul className="space-y-3">
            {leaderboard.map((m, idx) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/5 dark:bg-white/5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-[#39FF14] ring-1 ring-neon-400/30 dark:bg-[#121212]">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{m.tier}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">
                    {formatBRL(Number(m.net_revenue))}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    {formatInt(Number(m.ftds))} FTDs · {Number(m.conversion_rate).toFixed(1)}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Saúde da Rede
            </h3>
            <Network className="h-4 w-4 text-neon-500 dark:text-neon-300" />
          </div>
          <div className="mt-4 space-y-4">
            <HealthRow
              label="Afiliados ativos"
              value={`${totals.activeCount}/${totals.totalCount}`}
              percent={
                totals.totalCount
                  ? (totals.activeCount / totals.totalCount) * 100
                  : 0
              }
              tone="neon"
            />
            <HealthRow
              label="Conversão média"
              value={`${totals.avgConv.toFixed(1)}%`}
              percent={Math.min(totals.avgConv * 3, 100)}
              tone="sky"
            />
            <HealthRow
              label="Retenção (30d)"
              value="87%"
              percent={87}
              tone="amber"
            />
          </div>
          <div className="mt-5 rounded-xl bg-gradient-to-br from-neon-400/10 via-transparent to-sky-500/10 p-4 ring-1 ring-neon-400/20">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-600 dark:text-neon-300">
              <UserCheck className="h-3 w-3" />
              Próxima Ação
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              Reative Bruno Tavares
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Sem depósitos há 12 dias. Dispare uma campanha de reengajamento.
            </p>
            <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#39FF14] hover:underline">
              Abrir plano de ação
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition ${
        accent
          ? 'border-neon-400/30 bg-gradient-to-br from-[#101820] via-[#0F1A24] to-[#0B1218] text-white ring-1 ring-neon-400/20'
          : 'border-gray-200 bg-white dark:border-white/5 dark:bg-[#1E1E24]'
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
            accent ? 'text-neon-300' : 'text-gray-500 dark:text-slate-400'
          }`}
        >
          {label}
        </p>
        <div
          className={`rounded-lg p-2 ${
            accent
              ? 'bg-neon-400/15 text-[#39FF14]'
              : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-slate-300'
          }`}
        >
          {icon}
        </div>
      </div>
      <p
        className={`mt-3 text-2xl font-bold tabular-nums sm:text-[26px] ${
          accent ? 'text-[#39FF14] drop-shadow-[0_0_18px_rgba(57,255,20,0.35)]' : 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </p>
      <p className={`mt-2 text-xs ${accent ? 'text-slate-400' : 'text-gray-500 dark:text-slate-400'}`}>
        {hint}
      </p>
    </div>
  );
}

function HealthRow({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent: number;
  tone: 'neon' | 'sky' | 'amber';
}) {
  const bar =
    tone === 'neon'
      ? 'bg-gradient-to-r from-[#39FF14] to-emerald-300'
      : tone === 'sky'
        ? 'bg-gradient-to-r from-sky-500 to-cyan-300'
        : 'bg-gradient-to-r from-amber-400 to-orange-300';
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-slate-400">{label}</span>
        <span className="font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}
