import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
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

export default function SubReportsPage() {
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

  const sorted = useMemo(() => [...stats].reverse(), [stats]);
  const totals = useMemo(
    () => ({
      clicks: stats.reduce((a, s) => a + s.clicks, 0),
      ftds: stats.reduce((a, s) => a + s.ftds, 0),
      commission: stats.reduce((a, s) => a + Number(s.commission), 0),
    }),
    [stats],
  );

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
            <BarChart3 className="h-3 w-3" />
            Sub-Afiliado · Relatórios
          </span>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Relatórios de Conversão
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Consulte os seus dados mês a mês para planejar suas próximas ações.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Total label="Cliques totais" value={formatInt(totals.clicks)} />
        <Total label="FTDs acumulados" value={formatInt(totals.ftds)} />
        <Total label="Comissão acumulada" value={formatBRL(totals.commission)} highlight />
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1E1E24]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-black/30 dark:text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Período</th>
                <th className="px-3 py-3 text-right font-semibold">Cliques</th>
                <th className="px-3 py-3 text-right font-semibold">Cadastros</th>
                <th className="px-3 py-3 text-right font-semibold">FTDs</th>
                <th className="px-3 py-3 text-right font-semibold">Conversão</th>
                <th className="px-5 py-3 text-right font-semibold">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const conv = s.clicks ? (s.ftds / s.clicks) * 100 : 0;
                return (
                  <tr key={s.id} className="border-b border-gray-100 dark:border-white/5">
                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-gray-900 dark:text-white">
                      {s.month}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-700 dark:text-slate-200">
                      {formatInt(s.clicks)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-700 dark:text-slate-200">
                      {formatInt(s.signups)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-900 dark:text-white">
                      {formatInt(s.ftds)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-700 dark:text-slate-200">
                      {conv.toFixed(2)}%
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums font-semibold text-[#1C8A14] dark:text-[#39FF14]">
                      {formatBRL(Number(s.commission))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Total({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? 'border-neon-400/30 bg-gradient-to-br from-[#101820] via-[#0F1A24] to-[#0B1218] ring-1 ring-neon-400/20' : 'border-gray-200 bg-white dark:border-white/5 dark:bg-[#1E1E24]'}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${highlight ? 'text-neon-300' : 'text-gray-500 dark:text-slate-400'}`}>
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${highlight ? 'text-[#39FF14] drop-shadow-[0_0_18px_rgba(57,255,20,0.35)]' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}
