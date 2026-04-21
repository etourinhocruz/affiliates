import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  DollarSign,
  Star,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react';
import type { DailyMetric } from '../lib/supabase';

type Props = {
  data: DailyMetric[];
  segmentKey?: string;
  segmentScale?: number;
  segmentLabel?: string;
};

const COLORS = {
  cadastros: '#39FF14',
  ftd: '#38BDF8',
  qftd: '#1D4ED8',
  comissao: '#A855F7',
};

const PERIODS = [
  { key: '7d', label: 'Últimos 7 dias', days: 7 },
  { key: '15d', label: 'Últimos 15 dias', days: 15 },
  { key: '30d', label: 'Últimos 30 dias', days: 30 },
];

type Row = {
  date: string;
  label: string;
  cadastros: number;
  ftd: number;
  qftd: number;
  comissao: number;
};

function buildMockSeries(days: number): Row[] {
  const today = new Date();
  const out: Row[] = [];
  const baseCad = 95;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const seed = (d.getDate() * 13 + 7) % 11;
    const cadastros = baseCad + seed * 6 + (i % 3) * 4;
    const ftd = Math.round(cadastros * (0.32 + (seed % 5) * 0.01));
    const qftd = Math.round(ftd * (0.74 + (seed % 4) * 0.02));
    const comissao = Math.round(qftd * (42 + (seed % 6) * 3));
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      cadastros,
      ftd,
      qftd,
      comissao,
    });
  }
  return out;
}

export default function RevenueChart({
  data,
  segmentKey = 'all',
  segmentScale = 1,
  segmentLabel,
}: Props) {
  const [periodKey, setPeriodKey] = useState<string>('7d');
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(el.classList.contains('dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const axisColor = isDark ? '#64748b' : '#6B7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)';
  const tooltipBg = isDark ? 'rgba(10,10,14,0.95)' : 'rgba(255,255,255,0.98)';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const tooltipText = isDark ? '#e2e8f0' : '#0f172a';

  const period = PERIODS.find((p) => p.key === periodKey) ?? PERIODS[0];

  const chartData: Row[] = useMemo(() => {
    let base: Row[];
    if (data && data.length >= period.days) {
      const slice = data.slice(-period.days);
      base = slice.map((d) => {
        const dt = new Date(d.date);
        const cadastros = Math.max(d.clicks, 80);
        const ftd = Math.round(cadastros * 0.34);
        const qftd = Math.round(ftd * 0.78);
        return {
          date: d.date,
          label: dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          cadastros,
          ftd,
          qftd,
          comissao: Number(d.revenue) || qftd * 55,
        };
      });
    } else {
      base = buildMockSeries(period.days);
    }
    if (segmentScale === 1) return base;
    return base.map((row) => ({
      ...row,
      cadastros: Math.max(1, Math.round(row.cadastros * segmentScale)),
      ftd: Math.max(1, Math.round(row.ftd * segmentScale)),
      qftd: Math.max(1, Math.round(row.qftd * segmentScale)),
      comissao: Math.max(1, Math.round(row.comissao * segmentScale)),
    }));
  }, [data, period, segmentScale]);

  const totalComissao = chartData.reduce((s, r) => s + r.comissao, 0);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-gray-800 dark:bg-[#1E1E24] sm:p-6"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 hidden h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl dark:block" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 hidden h-64 w-64 rounded-full bg-neon-400/5 blur-3xl dark:block" />

      <div className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-neon-400/20 to-fuchsia-500/10 ring-1 ring-gray-200 dark:ring-white/10">
            <BarChart3 className="h-5 w-5 text-neon-600 dark:text-neon-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Minhas Comissões</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {period.label}
              {segmentLabel && segmentKey !== 'all' ? (
                <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-neon-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
                  {segmentLabel}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-neon-400/40 hover:text-gray-900 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
          >
            <Calendar className="h-4 w-4 text-gray-500 dark:text-slate-400" />
            {period.label}
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-500 transition dark:text-slate-400 ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open && (
            <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#14141A]">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setPeriodKey(p.key);
                    setOpen(false);
                  }}
                  className={`block w-full px-3.5 py-2 text-left text-xs transition ${
                    p.key === periodKey
                      ? 'bg-neon-400/10 text-neon-600 dark:text-neon-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <LegendItem color={COLORS.cadastros} icon={<UserPlus className="h-3.5 w-3.5" />} label="Cadastros" />
        <LegendItem color={COLORS.ftd} icon={<Wallet className="h-3.5 w-3.5" />} label="FTD" />
        <LegendItem color={COLORS.qftd} icon={<Star className="h-3.5 w-3.5" />} label="QFTD" />
        <LegendItem color={COLORS.comissao} icon={<DollarSign className="h-3.5 w-3.5" />} label="Comissão" />
        <div className="ml-auto hidden items-center gap-2 rounded-lg border border-fuchsia-200 bg-fuchsia-50 px-3 py-1.5 text-xs font-semibold text-fuchsia-700 dark:border-fuchsia-400/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 sm:inline-flex">
          <TrendingUp className="h-3.5 w-3.5" />
          Comissão total:
          <span className="text-fuchsia-800 dark:text-fuchsia-100 dark:drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
            {totalComissao.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>

      <div key={`${segmentKey}-${periodKey}`} className="relative h-80 w-full animate-rise">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 16, right: 16, left: -8, bottom: 0 }}
            barCategoryGap="22%"
          >
            <defs>
              <linearGradient id="gCad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.cadastros} stopOpacity={0.95} />
                <stop offset="100%" stopColor={COLORS.cadastros} stopOpacity={0.65} />
              </linearGradient>
              <linearGradient id="gFtd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.ftd} stopOpacity={0.95} />
                <stop offset="100%" stopColor={COLORS.ftd} stopOpacity={0.65} />
              </linearGradient>
              <linearGradient id="gQftd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95} />
                <stop offset="100%" stopColor={COLORS.qftd} stopOpacity={0.75} />
              </linearGradient>
              <filter id="glowPurple" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="label"
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="left"
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#A855F7"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={58}
              tickFormatter={(v) => `R$${Number(v).toLocaleString('pt-BR')}`}
            />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '12px',
                color: tooltipText,
                fontSize: '12px',
                boxShadow: isDark
                  ? '0 12px 40px rgba(0,0,0,0.6)'
                  : '0 12px 40px rgba(15,23,42,0.12)',
              }}
              cursor={false}
              formatter={(value: number, name: string) => {
                if (name === 'Comissão') {
                  return [
                    Number(value).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }),
                    name,
                  ];
                }
                return [Number(value).toLocaleString('pt-BR'), name];
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="cadastros"
              name="Cadastros"
              stackId="funnel"
              fill="url(#gCad)"
              radius={[0, 0, 8, 8]}
              maxBarSize={42}
            />
            <Bar
              yAxisId="left"
              dataKey="ftd"
              name="FTD"
              stackId="funnel"
              fill="url(#gFtd)"
              maxBarSize={42}
            />
            <Bar
              yAxisId="left"
              dataKey="qftd"
              name="QFTD"
              stackId="funnel"
              fill="url(#gQftd)"
              radius={[8, 8, 0, 0]}
              maxBarSize={42}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="comissao"
              name="Comissão"
              stroke={COLORS.comissao}
              strokeWidth={2.5}
              filter="url(#glowPurple)"
              dot={{ r: 4, fill: COLORS.comissao, stroke: '#fff', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: COLORS.comissao, stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendItem({
  color,
  icon,
  label,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 10px ${color}66`,
        }}
      />
      <span className="inline-flex items-center gap-1" style={{ color }}>
        {icon}
      </span>
      <span className="font-medium text-gray-700 dark:text-slate-200">{label}</span>
    </div>
  );
}

export type BarChartInternal = typeof BarChart;
