import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Flame, MousePointerClick, PieChart, UserPlus, Wallet } from 'lucide-react';
import AnimatedNumber from '../AnimatedNumber';
import { supabase } from '../../lib/supabase';

type Stat = {
  id: string;
  month: string;
  clicks: number;
  signups: number;
  ftds: number;
  commission: number;
};

const fallback: Stat[] = [
  { id: '1', month: 'Novembro/2025', clicks: 4210, signups: 612, ftds: 142, commission: 3180 },
  { id: '2', month: 'Dezembro/2025', clicks: 5820, signups: 870, ftds: 224, commission: 4950 },
  { id: '3', month: 'Janeiro/2026', clicks: 6320, signups: 1020, ftds: 268, commission: 6210 },
  { id: '4', month: 'Fevereiro/2026', clicks: 7210, signups: 1180, ftds: 312, commission: 7320 },
  { id: '5', month: 'Março/2026', clicks: 8210, signups: 1305, ftds: 368, commission: 8860 },
  { id: '6', month: 'Abril/2026', clicks: 3120, signups: 510, ftds: 138, commission: 3240 },
];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const formatInt = (v: number) => Math.round(v).toLocaleString('pt-BR');

export default function SubOverviewPage() {
  const [stats, setStats] = useState<Stat[]>(fallback);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('sub_affiliate_stats')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length) setStats(data as Stat[]);
    })();
  }, []);

  const current = stats[stats.length - 1] ?? fallback[fallback.length - 1];
  const previous = stats[stats.length - 2] ?? current;

  const delta = useMemo(() => {
    const d = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);
    return {
      clicks: d(current.clicks, previous.clicks),
      ftds: d(current.ftds, previous.ftds),
      commission: d(Number(current.commission), Number(previous.commission)),
    };
  }, [current, previous]);

  const maxClicks = Math.max(...stats.map((s) => s.clicks), 1);

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
          <PieChart className="h-3 w-3" />
          Sub-Afiliado · Visão Resumida
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Sua performance em um relance
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Resumo simplificado do tráfego enviado e das comissões geradas no mês atual.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SimpleKpi
          icon={<MousePointerClick className="h-5 w-5" />}
          label="Cliques"
          value={<AnimatedNumber value={current.clicks} format={formatInt} />}
          delta={delta.clicks}
        />
        <SimpleKpi
          icon={<UserPlus className="h-5 w-5" />}
          label="Cadastros"
          value={<AnimatedNumber value={current.signups} format={formatInt} />}
          delta={0}
          subtitle={`${((current.signups / current.clicks) * 100).toFixed(1)}% conversão`}
        />
        <SimpleKpi
          icon={<Flame className="h-5 w-5" />}
          label="FTDs"
          value={<AnimatedNumber value={current.ftds} format={formatInt} />}
          delta={delta.ftds}
        />
        <SimpleKpi
          icon={<Wallet className="h-5 w-5" />}
          label="Comissão"
          value={<AnimatedNumber value={Number(current.commission)} format={formatBRL} />}
          delta={delta.commission}
          accent
        />
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Tráfego dos últimos 6 meses
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Cliques enviados e quantos deles viraram FTDs.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {stats.map((s) => {
            const h = Math.max((s.clicks / maxClicks) * 100, 8);
            return (
              <div key={s.id} className="flex flex-col items-center">
                <div className="flex h-40 w-full items-end overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-[#39FF14] to-emerald-300 shadow-[0_0_14px_rgba(57,255,20,0.35)]"
                    style={{ height: `${h}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  {s.month.split('/')[0].slice(0, 3)}
                </p>
                <p className="text-[11px] font-bold tabular-nums text-gray-900 dark:text-white">
                  {formatInt(s.ftds)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-[#1E1E24]">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Próximo pagamento</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Comissão acumulada do período em aberto.
          </p>
          <p className="mt-4 text-3xl font-bold tabular-nums text-[#39FF14] drop-shadow-[0_0_18px_rgba(57,255,20,0.35)]">
            {formatBRL(Number(current.commission))}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Liberação estimada para o dia 05.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-sky-500/10 via-white to-neon-400/10 p-5 dark:border-white/5 dark:from-sky-500/10 dark:via-[#1E1E24] dark:to-neon-400/10">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Dica para crescer
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
            Seu ticket médio cresce 22% quando você publica mais de 3 vezes por semana. Programe conteúdos para sábado e domingo.
          </p>
          <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#39FF14] hover:underline">
            Ver plano de conteúdo <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </section>
    </div>
  );
}

function SimpleKpi({
  icon,
  label,
  value,
  delta,
  subtitle,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  delta: number;
  subtitle?: string;
  accent?: boolean;
}) {
  const showDelta = delta !== 0;
  const up = delta >= 0;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        accent
          ? 'border-neon-400/30 bg-gradient-to-br from-[#101820] via-[#0F1A24] to-[#0B1218] ring-1 ring-neon-400/20'
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
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        {showDelta && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
              up ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {up ? '+' : ''}
            {delta.toFixed(1)}%
          </span>
        )}
        {subtitle && <span className={accent ? 'text-slate-400' : 'text-gray-500 dark:text-slate-400'}>{subtitle}</span>}
        {!showDelta && !subtitle && (
          <span className={accent ? 'text-slate-400' : 'text-gray-500 dark:text-slate-400'}>
            Mês corrente
          </span>
        )}
      </div>
    </div>
  );
}
