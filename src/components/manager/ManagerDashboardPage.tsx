import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Flame, Target, TrendingUp, Users, Wallet } from 'lucide-react';
import AnimatedNumber from '../AnimatedNumber';
import { supabase } from '../../lib/supabase';

type Aff = {
  id: string;
  name: string;
  ftds: number;
  target_ftds: number;
  net_revenue: number;
  status: 'active' | 'paused';
};

const fallback: Aff[] = [
  { id: 'a1', name: 'Rodrigo Alves', ftds: 1210, target_ftds: 1500, net_revenue: 42800, status: 'active' },
  { id: 'a2', name: 'Camila Rocha', ftds: 498, target_ftds: 800, net_revenue: 16420, status: 'active' },
  { id: 'a3', name: 'Diego Martins', ftds: 612, target_ftds: 900, net_revenue: 19700, status: 'active' },
  { id: 'a4', name: 'Bruno Tavares', ftds: 184, target_ftds: 500, net_revenue: 6120, status: 'paused' },
  { id: 'a5', name: 'Vinícius Lopes', ftds: 356, target_ftds: 600, net_revenue: 11800, status: 'active' },
];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const formatInt = (v: number) => Math.round(v).toLocaleString('pt-BR');

export default function ManagerDashboardPage() {
  const [affiliates, setAffiliates] = useState<Aff[]>(fallback);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('manager_affiliates')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length) setAffiliates(data as Aff[]);
    })();
  }, []);

  const kpis = useMemo(() => {
    const ftds = affiliates.reduce((a, m) => a + Number(m.ftds), 0);
    const target = affiliates.reduce((a, m) => a + Number(m.target_ftds), 0);
    const rev = affiliates.reduce((a, m) => a + Number(m.net_revenue), 0);
    return {
      teamSize: affiliates.length,
      active: affiliates.filter((a) => a.status === 'active').length,
      ftds,
      target,
      progress: target ? (ftds / target) * 100 : 0,
      rev,
      managerCommission: rev * 0.08,
    };
  }, [affiliates]);

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600 ring-1 ring-amber-400/30 dark:text-amber-300">
          <Briefcase className="h-3 w-3" />
          Manager Suite · Dashboard
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Dashboard Gerencial
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Acompanhe a performance do time, a cobertura das metas e a sua comissão de gestão.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<Users className="h-5 w-5" />}
          label="Time gerenciado"
          value={
            <>
              <AnimatedNumber value={kpis.active} format={formatInt} />
              <span className="ml-1 text-sm font-semibold text-gray-400 dark:text-slate-500">
                / {kpis.teamSize}
              </span>
            </>
          }
          hint="Afiliados ativos"
        />
        <Kpi
          icon={<Flame className="h-5 w-5" />}
          label="FTDs do time"
          value={<AnimatedNumber value={kpis.ftds} format={formatInt} />}
          hint={`Meta ${formatInt(kpis.target)}`}
        />
        <Kpi
          icon={<Wallet className="h-5 w-5" />}
          label="Net revenue"
          value={<AnimatedNumber value={kpis.rev} format={formatBRL} />}
          hint="Gerado pelo time no período"
        />
        <Kpi
          icon={<TrendingUp className="h-5 w-5" />}
          label="Comissão de Gestão"
          value={<AnimatedNumber value={kpis.managerCommission} format={formatBRL} />}
          hint="8% sobre a receita líquida"
          accent
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Progresso de meta por afiliado
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Quem está entregando e quem precisa de atenção imediata.
              </p>
            </div>
          </div>
          <ul className="space-y-4">
            {affiliates.map((a) => {
              const pct = a.target_ftds ? Math.min((a.ftds / a.target_ftds) * 100, 100) : 0;
              const tone =
                pct >= 80
                  ? 'from-[#39FF14] to-emerald-300'
                  : pct >= 50
                    ? 'from-sky-500 to-cyan-300'
                    : 'from-amber-400 to-orange-300';
              return (
                <li key={a.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-white/5 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.name}</p>
                    <p className="text-xs tabular-nums text-gray-500 dark:text-slate-400">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatInt(Number(a.ftds))}
                      </span>{' '}
                      / {formatInt(Number(a.target_ftds))} FTDs
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                    <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-gray-500 dark:text-slate-400">
                    {pct >= 100
                      ? 'Meta batida!'
                      : `${pct.toFixed(0)}% da meta · faltam ${formatInt(
                          Math.max(a.target_ftds - a.ftds, 0),
                        )} FTDs`}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Meta agregada
            </h3>
            <Target className="h-4 w-4 text-neon-500 dark:text-neon-300" />
          </div>
          <div className="relative mt-5 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-44 w-44">
              <circle cx="60" cy="60" r="52" strokeWidth="10" className="stroke-gray-100 dark:stroke-white/10" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="52"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                className="stroke-[#39FF14] drop-shadow-[0_0_12px_rgba(57,255,20,0.55)]"
                strokeDasharray={`${(Math.min(kpis.progress, 100) / 100) * 326.7} 326.7`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
                {kpis.progress.toFixed(0)}%
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                Da meta do mês
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-slate-400">
            {formatInt(kpis.ftds)} de {formatInt(kpis.target)} FTDs entregues pelo time.
          </p>
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
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${accent ? 'text-neon-300' : 'text-gray-500 dark:text-slate-400'}`}>
          {label}
        </p>
        <div className={`rounded-lg p-2 ${accent ? 'bg-neon-400/15 text-[#39FF14]' : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-slate-300'}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-2xl font-bold tabular-nums sm:text-[26px] ${accent ? 'text-[#39FF14] drop-shadow-[0_0_18px_rgba(57,255,20,0.35)]' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
      <p className={`mt-2 text-xs ${accent ? 'text-slate-400' : 'text-gray-500 dark:text-slate-400'}`}>{hint}</p>
    </div>
  );
}
