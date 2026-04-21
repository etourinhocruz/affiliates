import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Download,
  Calendar,
  Filter,
  Coins,
  TrendingUp,
  Gem,
  Check,
  CalendarDays,
  Users,
  Trophy,
  Flame,
  Wallet,
  LineChart,
  Sparkles,
  Building2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type Campaign = {
  houseName: string;
  campaignName: string;
  cadastros: number;
  ftd: number;
  qftd: number;
  depositoTotal: number;
  netRevenue: number;
  revLiquido: number;
};

type ReportDay = {
  id: string;
  date: string;
  cadastros: number;
  ftd: number;
  qftd: number;
  depositoTotal: number;
  netRevenue: number;
  revLiquido: number;
  campaigns: Campaign[];
};

type HouseDef = {
  key: string;
  name: string;
  logoUrl?: string;
  initials: string;
  bg: string;
};

const HOUSES: HouseDef[] = [
  { key: 'Superbet', name: 'Superbet', logoUrl: '/superbet-logo-0.png', initials: 'SB', bg: 'bg-red-950' },
  { key: 'Betfair', name: 'Betfair', logoUrl: '/betfair-logo-0-1536x1536.png', initials: 'BF', bg: 'bg-yellow-900' },
  { key: 'Novibet', name: 'Novibet', logoUrl: '/novibet-seeklogo.png', initials: 'NB', bg: 'bg-emerald-900' },
  { key: 'EsportivaBet', name: 'EsportivaBet', logoUrl: '/ESPORTIVA_PNG.png', initials: 'EB', bg: 'bg-blue-950' },
  { key: 'BetMGM', name: 'BetMGM', logoUrl: '/BETMGM-Logo-Stylish-Presentation-PNG.png', initials: 'MG', bg: 'bg-amber-900' },
];

const mockReports: ReportDay[] = [
  {
    id: '2026-04-20',
    date: '2026-04-20',
    cadastros: 312,
    ftd: 108,
    qftd: 74,
    depositoTotal: 38420,
    netRevenue: 12840,
    revLiquido: 5180,
    campaigns: [
      { houseName: 'Superbet', campaignName: 'Telegram VIP', cadastros: 98, ftd: 34, qftd: 24, depositoTotal: 12200, netRevenue: 4250, revLiquido: 1820 },
      { houseName: 'BetMGM', campaignName: 'Instagram Bio', cadastros: 88, ftd: 31, qftd: 22, depositoTotal: 11480, netRevenue: 3980, revLiquido: 1560 },
      { houseName: 'Novibet', campaignName: 'YouTube Review', cadastros: 68, ftd: 24, qftd: 16, depositoTotal: 8120, netRevenue: 2610, revLiquido: 1080 },
      { houseName: 'EsportivaBet', campaignName: 'Telegram Free', cadastros: 58, ftd: 19, qftd: 12, depositoTotal: 6620, netRevenue: 2000, revLiquido: 720 },
    ],
  },
  {
    id: '2026-04-19',
    date: '2026-04-19',
    cadastros: 268,
    ftd: 92,
    qftd: 61,
    depositoTotal: 32180,
    netRevenue: 10740,
    revLiquido: 4420,
    campaigns: [
      { houseName: 'Superbet', campaignName: 'Telegram VIP', cadastros: 82, ftd: 28, qftd: 19, depositoTotal: 10240, netRevenue: 3580, revLiquido: 1520 },
      { houseName: 'BetMGM', campaignName: 'Instagram Stories', cadastros: 74, ftd: 26, qftd: 18, depositoTotal: 9420, netRevenue: 3120, revLiquido: 1260 },
      { houseName: 'Novibet', campaignName: 'TikTok Clips', cadastros: 62, ftd: 21, qftd: 14, depositoTotal: 7280, netRevenue: 2340, revLiquido: 960 },
      { houseName: 'Betfair', campaignName: 'Blog Reviews', cadastros: 50, ftd: 17, qftd: 10, depositoTotal: 5240, netRevenue: 1700, revLiquido: 680 },
    ],
  },
  {
    id: '2026-04-18',
    date: '2026-04-18',
    cadastros: 241,
    ftd: 84,
    qftd: 56,
    depositoTotal: 28650,
    netRevenue: 9320,
    revLiquido: 3860,
    campaigns: [
      { houseName: 'Superbet', campaignName: 'Telegram VIP', cadastros: 76, ftd: 26, qftd: 18, depositoTotal: 9240, netRevenue: 3120, revLiquido: 1340 },
      { houseName: 'BetMGM', campaignName: 'Instagram Bio', cadastros: 64, ftd: 23, qftd: 15, depositoTotal: 8180, netRevenue: 2680, revLiquido: 1080 },
      { houseName: 'EsportivaBet', campaignName: 'WhatsApp List', cadastros: 54, ftd: 18, qftd: 12, depositoTotal: 6520, netRevenue: 2020, revLiquido: 780 },
      { houseName: 'Novibet', campaignName: 'YouTube Shorts', cadastros: 47, ftd: 17, qftd: 11, depositoTotal: 4710, netRevenue: 1500, revLiquido: 660 },
    ],
  },
  {
    id: '2026-04-17',
    date: '2026-04-17',
    cadastros: 218,
    ftd: 76,
    qftd: 49,
    depositoTotal: 25180,
    netRevenue: 8120,
    revLiquido: 3340,
    campaigns: [
      { houseName: 'Superbet', campaignName: 'Telegram VIP', cadastros: 72, ftd: 25, qftd: 17, depositoTotal: 8620, netRevenue: 2820, revLiquido: 1180 },
      { houseName: 'BetMGM', campaignName: 'Instagram Bio', cadastros: 58, ftd: 20, qftd: 13, depositoTotal: 7180, netRevenue: 2340, revLiquido: 960 },
      { houseName: 'Novibet', campaignName: 'TikTok Ads', cadastros: 48, ftd: 17, qftd: 11, depositoTotal: 5380, netRevenue: 1720, revLiquido: 720 },
      { houseName: 'Betfair', campaignName: 'Blog SEO', cadastros: 40, ftd: 14, qftd: 8, depositoTotal: 4000, netRevenue: 1240, revLiquido: 480 },
    ],
  },
  {
    id: '2026-04-16',
    date: '2026-04-16',
    cadastros: 196,
    ftd: 68,
    qftd: 44,
    depositoTotal: 22480,
    netRevenue: 7280,
    revLiquido: 2980,
    campaigns: [
      { houseName: 'Superbet', campaignName: 'Telegram VIP', cadastros: 64, ftd: 22, qftd: 15, depositoTotal: 7620, netRevenue: 2520, revLiquido: 1060 },
      { houseName: 'BetMGM', campaignName: 'Instagram Stories', cadastros: 52, ftd: 18, qftd: 12, depositoTotal: 6480, netRevenue: 2100, revLiquido: 860 },
      { houseName: 'EsportivaBet', campaignName: 'Telegram Free', cadastros: 44, ftd: 15, qftd: 9, depositoTotal: 4980, netRevenue: 1560, revLiquido: 600 },
      { houseName: 'Novibet', campaignName: 'YouTube Review', cadastros: 36, ftd: 13, qftd: 8, depositoTotal: 3400, netRevenue: 1100, revLiquido: 460 },
    ],
  },
];

const PERIOD_OPTIONS = [
  { key: 'today', label: 'Hoje' },
  { key: 'yesterday', label: 'Ontem' },
  { key: '7days', label: 'Últimos 7 dias' },
  { key: 'month', label: 'Este Mês' },
  { key: 'custom', label: 'Personalizado' },
];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function valuePlayer(deposito: number, ftd: number): number {
  return ftd > 0 ? deposito / ftd : 0;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportDay[]>(mockReports);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [period, setPeriod] = useState('7days');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('date', { ascending: false });
      if (data && data.length) {
        setReports(data as unknown as ReportDay[]);
      }
    })();
  }, []);

  const filteredReports = useMemo(() => {
    if (selectedHouse === 'all') return reports;
    return reports
      .map((r) => {
        const campaigns = r.campaigns.filter((c) => c.houseName === selectedHouse);
        const agg = campaigns.reduce(
          (acc, c) => ({
            cadastros: acc.cadastros + c.cadastros,
            ftd: acc.ftd + c.ftd,
            qftd: acc.qftd + c.qftd,
            depositoTotal: acc.depositoTotal + c.depositoTotal,
            netRevenue: acc.netRevenue + c.netRevenue,
            revLiquido: acc.revLiquido + c.revLiquido,
          }),
          { cadastros: 0, ftd: 0, qftd: 0, depositoTotal: 0, netRevenue: 0, revLiquido: 0 }
        );
        return { ...r, campaigns, ...agg };
      })
      .filter((r) => r.campaigns.length > 0);
  }, [reports, selectedHouse]);

  const kpis = useMemo(() => {
    const totals = filteredReports.reduce(
      (acc, r) => ({
        cadastros: acc.cadastros + r.cadastros,
        ftd: acc.ftd + r.ftd,
        depositoTotal: acc.depositoTotal + r.depositoTotal,
        netRevenue: acc.netRevenue + r.netRevenue,
        revLiquido: acc.revLiquido + r.revLiquido,
      }),
      { cadastros: 0, ftd: 0, depositoTotal: 0, netRevenue: 0, revLiquido: 0 }
    );
    const conversionRate = totals.cadastros > 0 ? (totals.ftd / totals.cadastros) * 100 : 0;
    const avgValuePlayer = valuePlayer(totals.depositoTotal, totals.ftd);
    return { ...totals, conversionRate, avgValuePlayer };
  }, [filteredReports]);

  const exportCSV = () => {
    const header = [
      'Data',
      'Casa',
      'Campanha',
      'Cadastros',
      'FTD',
      'QFTD',
      'Deposito',
      'NetRevenue',
      'RevLiquido',
      'ValuePlayer',
    ];
    const rows: string[][] = [];
    filteredReports.forEach((day) => {
      day.campaigns.forEach((c) => {
        rows.push([
          day.date,
          c.houseName,
          c.campaignName,
          String(c.cadastros),
          String(c.ftd),
          String(c.qftd),
          c.depositoTotal.toFixed(2),
          c.netRevenue.toFixed(2),
          c.revLiquido.toFixed(2),
          valuePlayer(c.depositoTotal, c.ftd).toFixed(2),
        ]);
      });
    });
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.key === period)?.label ?? 'Últimos 7 dias';

  return (
    <div className="pb-10">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Relatórios
        </h2>
        <p className="text-sm text-slate-400">
          Analise a performance detalhada por período, casa e campanha.
        </p>
      </div>

      <div className="mb-6 -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max items-center gap-3 pb-1">
          <HouseChip
            active={selectedHouse === 'all'}
            onClick={() => setSelectedHouse('all')}
            label="Todas as Casas"
            allChip
          />
          {HOUSES.map((h) => (
            <HouseChip
              key={h.key}
              active={selectedHouse === h.key}
              onClick={() => setSelectedHouse(h.key)}
              label={h.name}
              logoUrl={h.logoUrl}
              initials={h.initials}
              bg={h.bg}
            />
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#1E1E24]/80 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setPeriodOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-white transition hover:border-neon-400/40 hover:bg-slate-800"
            >
              <Calendar className="h-4 w-4 text-neon-400" />
              {periodLabel}
              <ChevronRight
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  periodOpen ? 'rotate-90' : ''
                }`}
              />
            </button>
            {periodOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setPeriod(opt.key);
                      setPeriodOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-neon-400/10 hover:text-neon-300 ${
                      period === opt.key ? 'text-neon-300' : 'text-slate-300'
                    }`}
                  >
                    {opt.label}
                    {period === opt.key && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-xs text-slate-400">
            <Filter className="h-4 w-4 text-neon-400" />
            Filtro:
            <span className="font-semibold text-white">
              {selectedHouse === 'all' ? 'Todas as Casas' : selectedHouse}
            </span>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-neon-400/30 hover:bg-slate-700 hover:text-white"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FunnelCard
          cadastros={kpis.cadastros}
          ftd={kpis.ftd}
          rate={kpis.conversionRate}
        />
        <FinancialCard
          deposito={kpis.depositoTotal}
          netRev={kpis.netRevenue}
        />
        <NetCommissionCard value={kpis.revLiquido} />
        <ValuePlayerCard value={kpis.avgValuePlayer} />
      </section>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#1E1E24]">
        <div className="border-b border-white/5 px-5 py-4">
          <h3 className="text-base font-semibold text-white">Performance Diária</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Clique em uma linha para ver o detalhamento por casa/campanha.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-slate-400">
                <Th icon={<CalendarDays className="h-3.5 w-3.5" />}>Data</Th>
                <Th icon={<Users className="h-3.5 w-3.5" />}>Cadastros</Th>
                <Th icon={<Flame className="h-3.5 w-3.5" />}>FTD</Th>
                <Th icon={<Trophy className="h-3.5 w-3.5" />}>QFTD</Th>
                <Th icon={<Wallet className="h-3.5 w-3.5" />}>Depósito</Th>
                <Th icon={<LineChart className="h-3.5 w-3.5" />}>Net Revenue</Th>
                <Th icon={<Coins className="h-3.5 w-3.5" />}>Rev Líquido</Th>
                <Th icon={<Gem className="h-3.5 w-3.5" />} align="right">
                  Value Player
                </Th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((day) => {
                const isOpen = !!expanded[day.id];
                const dayVp = valuePlayer(day.depositoTotal, day.ftd);
                return (
                  <Fragment key={day.id}>
                    <tr
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [day.id]: !e[day.id] }))
                      }
                      className="cursor-pointer border-b border-white/5 text-slate-200 transition hover:bg-gray-800/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={`h-4 w-4 text-slate-500 transition-transform ${
                              isOpen ? 'rotate-90 text-neon-400' : ''
                            }`}
                          />
                          <span className="font-medium text-white">
                            {formatDate(day.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">{day.cadastros.toLocaleString('pt-BR')}</td>
                      <td className="px-3 py-4">{day.ftd}</td>
                      <td className="px-3 py-4">{day.qftd}</td>
                      <td className="px-3 py-4 text-slate-200">
                        {formatBRL(day.depositoTotal)}
                      </td>
                      <td
                        className={`px-3 py-4 font-medium ${
                          day.netRevenue < 0 ? 'text-rose-400' : 'text-emerald-200/90'
                        }`}
                      >
                        {formatBRL(day.netRevenue)}
                      </td>
                      <td className="px-3 py-4 font-bold text-neon-300 drop-shadow-[0_0_6px_rgba(57,255,20,0.25)]">
                        {formatBRL(day.revLiquido)}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-amber-300">
                        {formatBRL(dayVp)}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-gray-900">
                        <td colSpan={8} className="px-5 py-4">
                          <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-white/5">
                            <table className="w-full min-w-[880px] text-xs">
                              <thead>
                                <tr className="bg-black/30 text-left text-[10px] uppercase tracking-wider text-slate-500">
                                  <th className="px-4 py-2.5 font-semibold">Casa / Campanha</th>
                                  <th className="px-3 py-2.5 font-semibold">Cadastros</th>
                                  <th className="px-3 py-2.5 font-semibold">FTD</th>
                                  <th className="px-3 py-2.5 font-semibold">QFTD</th>
                                  <th className="px-3 py-2.5 font-semibold">Depósito</th>
                                  <th className="px-3 py-2.5 font-semibold">Net Revenue</th>
                                  <th className="px-3 py-2.5 font-semibold">Rev Líquido</th>
                                  <th className="px-4 py-2.5 text-right font-semibold">
                                    Value Player
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {day.campaigns.map((c, idx) => {
                                  const cVp = valuePlayer(c.depositoTotal, c.ftd);
                                  return (
                                    <tr
                                      key={`${day.id}-${idx}`}
                                      className="border-t border-white/5 text-slate-300"
                                    >
                                      <td className="px-4 py-2.5">
                                        <div className="flex flex-col">
                                          <span className="font-semibold text-white">
                                            {c.houseName}
                                          </span>
                                          <span className="text-slate-500">
                                            {c.campaignName}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2.5">{c.cadastros}</td>
                                      <td className="px-3 py-2.5">{c.ftd}</td>
                                      <td className="px-3 py-2.5">{c.qftd}</td>
                                      <td className="px-3 py-2.5">
                                        {formatBRL(c.depositoTotal)}
                                      </td>
                                      <td
                                        className={`px-3 py-2.5 ${
                                          c.netRevenue < 0
                                            ? 'text-rose-400'
                                            : 'text-emerald-200/80'
                                        }`}
                                      >
                                        {formatBRL(c.netRevenue)}
                                      </td>
                                      <td className="px-3 py-2.5 font-bold text-neon-300">
                                        {formatBRL(c.revLiquido)}
                                      </td>
                                      <td className="px-4 py-2.5 text-right font-semibold text-amber-300">
                                        {formatBRL(cVp)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  icon,
  align = 'left',
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={`px-3 py-3 font-semibold first:px-5 last:px-5 ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      <span
        className={`inline-flex items-center gap-1.5 ${
          align === 'right' ? 'justify-end' : ''
        }`}
      >
        {icon}
        {children}
      </span>
    </th>
  );
}

function HouseChip({
  active,
  onClick,
  label,
  logoUrl,
  initials,
  bg,
  allChip = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  logoUrl?: string;
  initials?: string;
  bg?: string;
  allChip?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'border-neon-400 bg-neon-400/10 text-white shadow-[0_0_18px_rgba(57,255,20,0.25)]'
          : 'border-white/10 bg-slate-900/60 text-slate-400 opacity-70 hover:opacity-100'
      }`}
    >
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ${
          active ? 'ring-neon-400/50' : 'ring-white/10'
        } ${allChip ? 'bg-gradient-to-br from-neon-400/30 to-emerald-900/60' : bg ?? 'bg-slate-800'}`}
      >
        {allChip ? (
          <Building2 className="h-4 w-4 text-neon-300" />
        ) : logoUrl ? (
          <img
            src={logoUrl}
            alt={label}
            className={`h-full w-full object-contain p-1 transition ${
              active ? '' : 'grayscale'
            }`}
          />
        ) : (
          <span className="text-[10px] font-bold text-white">{initials}</span>
        )}
      </div>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function FunnelCard({
  cadastros,
  ftd,
  rate,
}: {
  cadastros: number;
  ftd: number;
  rate: number;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#1E1E24] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Conversão Funil
        </p>
        <div className="rounded-lg bg-sky-500/10 p-2 text-sky-300">
          <Users className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <div>
          <p className="text-xs text-slate-400">Cadastros</p>
          <p className="text-xl font-bold text-white">
            {cadastros.toLocaleString('pt-BR')}
          </p>
        </div>
        <ChevronRight className="mb-1 h-4 w-4 text-slate-600" />
        <div>
          <p className="text-xs text-slate-400">FTDs</p>
          <p className="text-xl font-bold text-white">{ftd.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
        <span className="text-xs text-slate-400">Taxa de Conversão</span>
        <span className="text-sm font-bold text-sky-300">{rate.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function FinancialCard({ deposito, netRev }: { deposito: number; netRev: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#1E1E24] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Financeiro
        </p>
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-300">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Depósito Total</span>
          <span className="text-sm font-semibold text-white">{formatBRL(deposito)}</span>
        </div>
        <div className="h-px bg-white/5" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Net Revenue</span>
          <span
            className={`text-sm font-semibold ${
              netRev < 0 ? 'text-rose-400' : 'text-emerald-200/90'
            }`}
          >
            {formatBRL(netRev)}
          </span>
        </div>
      </div>
    </div>
  );
}

function NetCommissionCard({ value }: { value: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neon-400/30 bg-gradient-to-br from-neon-400/10 via-[#1E1E24] to-[#1E1E24] p-5 shadow-[0_0_24px_rgba(57,255,20,0.12)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-300">
          Receita Líquida
        </p>
        <div className="rounded-lg bg-neon-400/20 p-2 text-neon-300">
          <Coins className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-neon-300 drop-shadow-[0_0_12px_rgba(57,255,20,0.45)]">
        {formatBRL(value)}
      </p>
      <p className="mt-1 text-xs text-slate-400">Disponível para saque</p>
    </div>
  );
}

function ValuePlayerCard({ value }: { value: number }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="relative rounded-2xl border border-white/5 bg-[#1E1E24] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Player Quality
          </p>
          <button
            type="button"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onFocus={() => setShowTip(true)}
            onBlur={() => setShowTip(false)}
            className="text-slate-500 transition hover:text-amber-300"
            aria-label="Informação sobre Player Quality"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-300">
          <Gem className="h-5 w-5" />
        </div>
      </div>
      {showTip && (
        <div className="absolute right-4 top-14 z-10 w-60 rounded-lg border border-white/10 bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-300 shadow-xl">
          Média de depósito por FTD. Quanto maior, melhor a qualidade do seu tráfego.
        </div>
      )}
      <p className="mt-4 text-3xl font-extrabold text-amber-300">{formatBRL(value)}</p>
      <p className="mt-1 text-xs text-slate-400">Valor médio por FTD</p>
    </div>
  );
}
