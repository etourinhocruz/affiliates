import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Download,
  Calendar,
  Check,
  CalendarDays,
  Users,
  Trophy,
  Flame,
  Wallet,
  Coins,
  MousePointerClick,
  Search,
  Percent,
  Globe,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

type Campaign = {
  houseName: string;
  campaignName: string;
  clicks: number;
  cadastros: number;
  ftd: number;
  qftd: number;
  depositoTotal: number;
  commission: number;
};

type ReportDay = {
  id: string;
  date: string;
  totalClicks: number;
  cadastros: number;
  ftd: number;
  qftd: number;
  depositoTotal: number;
  totalCommission: number;
  campaigns: Campaign[];
};

type HouseDef = {
  key: string;
  name: string;
  logoUrl?: string;
  fallbackUrl?: string;
  initials: string;
};

const HOUSES: HouseDef[] = [
  { key: 'superbet', name: 'SuperBet', logoUrl: '/superbet.png', fallbackUrl: '/superbet-logo-0.png', initials: 'SB' },
  { key: 'betmgm', name: 'BetMGM', logoUrl: '/betmgm.png', fallbackUrl: '/BETMGM-Logo-Stylish-Presentation-PNG.png', initials: 'MG' },
  { key: 'esportivabet', name: 'EsportivaBet', logoUrl: '/esportivabet.png', fallbackUrl: '/ESPORTIVA_PNG.png', initials: 'EB' },
  { key: 'betfair', name: 'BetFair', logoUrl: '/betfair.png', fallbackUrl: '/betfair-logo-0-1536x1536.png', initials: 'BF' },
  { key: 'novibet', name: 'NoviBet', logoUrl: '/novibet.png', fallbackUrl: '/novibet-seeklogo.png', initials: 'NB' },
];

const mockReports: ReportDay[] = buildMockReports();

function buildMockReports(): ReportDay[] {
  const days = [
    { date: '2026-04-20', scale: 1.0 },
    { date: '2026-04-19', scale: 0.86 },
    { date: '2026-04-18', scale: 0.77 },
    { date: '2026-04-17', scale: 0.7 },
    { date: '2026-04-16', scale: 0.63 },
    { date: '2026-04-15', scale: 0.58 },
    { date: '2026-04-14', scale: 0.52 },
  ];
  const campaignTemplates = [
    { houseName: 'SuperBet', campaignName: 'FB_Ads_Tubarões', clicks: 820, cadastros: 112, ftd: 48, qftd: 34, depositoTotal: 14200, commission: 4600 },
    { houseName: 'SuperBet', campaignName: 'Google_Search_Brand', clicks: 410, cadastros: 52, ftd: 26, qftd: 18, depositoTotal: 7820, commission: 2420 },
    { houseName: 'BetMGM', campaignName: 'Instagram_Bio', clicks: 360, cadastros: 58, ftd: 22, qftd: 16, depositoTotal: 6880, commission: 2180 },
    { houseName: 'EsportivaBet', campaignName: 'Telegram_Free', clicks: 280, cadastros: 42, ftd: 14, qftd: 9, depositoTotal: 4120, commission: 1280 },
    { houseName: 'NoviBet', campaignName: 'YouTube_Review', clicks: 220, cadastros: 36, ftd: 12, qftd: 8, depositoTotal: 3240, commission: 980 },
    { houseName: 'BetFair', campaignName: 'Blog_SEO', clicks: 180, cadastros: 24, ftd: 8, qftd: 5, depositoTotal: 2280, commission: 720 },
  ];

  return days.map((d) => {
    const campaigns: Campaign[] = campaignTemplates.map((t) => ({
      houseName: t.houseName,
      campaignName: t.campaignName,
      clicks: Math.round(t.clicks * d.scale),
      cadastros: Math.round(t.cadastros * d.scale),
      ftd: Math.round(t.ftd * d.scale),
      qftd: Math.round(t.qftd * d.scale),
      depositoTotal: Math.round(t.depositoTotal * d.scale),
      commission: Math.round(t.commission * d.scale),
    }));
    const totals = campaigns.reduce(
      (acc, c) => ({
        totalClicks: acc.totalClicks + c.clicks,
        cadastros: acc.cadastros + c.cadastros,
        ftd: acc.ftd + c.ftd,
        qftd: acc.qftd + c.qftd,
        depositoTotal: acc.depositoTotal + c.depositoTotal,
        totalCommission: acc.totalCommission + c.commission,
      }),
      { totalClicks: 0, cadastros: 0, ftd: 0, qftd: 0, depositoTotal: 0, totalCommission: 0 },
    );
    return { id: d.date, date: d.date, ...totals, campaigns };
  });
}

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

export default function ReportsPage() {
  const { selectedHouse, setSelectedHouse } = useUser();
  const [reports, setReports] = useState<ReportDay[]>(mockReports);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [period, setPeriod] = useState('7days');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [search, setSearch] = useState('');

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
    const q = search.trim().toLowerCase();
    return reports
      .map((r) => {
        const byHouse =
          selectedHouse === 'all'
            ? r.campaigns
            : r.campaigns.filter((c) => c.houseName.toLowerCase() === selectedHouse);
        const bySearch = q
          ? byHouse.filter(
              (c) =>
                c.campaignName.toLowerCase().includes(q) ||
                c.houseName.toLowerCase().includes(q),
            )
          : byHouse;
        const agg = bySearch.reduce(
          (acc, c) => ({
            totalClicks: acc.totalClicks + c.clicks,
            cadastros: acc.cadastros + c.cadastros,
            ftd: acc.ftd + c.ftd,
            qftd: acc.qftd + c.qftd,
            depositoTotal: acc.depositoTotal + c.depositoTotal,
            totalCommission: acc.totalCommission + c.commission,
          }),
          { totalClicks: 0, cadastros: 0, ftd: 0, qftd: 0, depositoTotal: 0, totalCommission: 0 },
        );
        return { ...r, ...agg, campaigns: bySearch };
      })
      .filter((r) => r.campaigns.length > 0);
  }, [reports, selectedHouse, search]);

  const exportCSV = () => {
    const header = [
      'Data',
      'Casa',
      'Campanha',
      'Cliques',
      'Cadastros',
      'FTD',
      'QFTD',
      'Deposito',
      'Comissao',
    ];
    const rows: string[][] = [];
    filteredReports.forEach((day) => {
      day.campaigns.forEach((c) => {
        rows.push([
          day.date,
          c.houseName,
          c.campaignName,
          String(c.clicks),
          String(c.cadastros),
          String(c.ftd),
          String(c.qftd),
          c.depositoTotal.toFixed(2),
          c.commission.toFixed(2),
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
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Relatórios
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Analise a performance detalhada por período, casa e campanha.
        </p>
      </div>

      <div className="mb-6 -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max items-center gap-2.5 pb-1">
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
              fallbackUrl={h.fallbackUrl}
              initials={h.initials}
            />
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24]/80 dark:shadow-none sm:flex-row sm:items-center">
        <div className="relative">
          <button
            onClick={() => setPeriodOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-neon-400/40 hover:text-gray-900 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
          >
            <Calendar className="h-4 w-4 text-neon-500 dark:text-neon-400" />
            {periodLabel}
            <ChevronRight
              className={`h-4 w-4 text-gray-500 transition-transform dark:text-slate-400 ${
                periodOpen ? 'rotate-90' : ''
              }`}
            />
          </button>
          {periodOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#1E1E24]">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setPeriod(opt.key);
                    setPeriodOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-neon-400/10 hover:text-neon-600 dark:hover:text-neon-300 ${
                    period === opt.key
                      ? 'text-neon-600 dark:text-neon-300'
                      : 'text-gray-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                  {period === opt.key && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar campanha ou sub-afiliado..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-neon-400/40 hover:text-gray-900 sm:ml-auto dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-white/5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Performance Diária</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
            Clique em uma linha para ver o detalhamento por campanha.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:bg-black/30 dark:text-slate-400">
                <Th icon={<CalendarDays className="h-3.5 w-3.5" />}>Data</Th>
                <Th icon={<MousePointerClick className="h-3.5 w-3.5" />}>Cliques</Th>
                <Th icon={<Users className="h-3.5 w-3.5" />}>Cadastros</Th>
                <Th icon={<Flame className="h-3.5 w-3.5" />}>FTD</Th>
                <Th icon={<Trophy className="h-3.5 w-3.5" />}>QFTD</Th>
                <Th icon={<Percent className="h-3.5 w-3.5" />}>Conv. Click→FTD</Th>
                <Th icon={<Wallet className="h-3.5 w-3.5" />}>Depósitos</Th>
                <Th icon={<Coins className="h-3.5 w-3.5" />} align="right">
                  Comissão
                </Th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    Nenhum resultado encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
              {filteredReports.map((day) => {
                const isOpen = !!expanded[day.id];
                const convClickFtd =
                  day.totalClicks > 0 ? (day.ftd / day.totalClicks) * 100 : 0;
                return (
                  <Fragment key={day.id}>
                    <tr
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [day.id]: !e[day.id] }))
                      }
                      className="cursor-pointer border-b border-gray-100 text-gray-700 transition hover:bg-gray-50 dark:border-white/5 dark:text-slate-200 dark:hover:bg-white/5"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={`h-4 w-4 text-gray-400 transition-transform dark:text-slate-500 ${
                              isOpen ? 'rotate-90 text-neon-500 dark:text-neon-400' : ''
                            }`}
                          />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(day.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 tabular-nums">
                        {day.totalClicks.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-3 py-4 tabular-nums">
                        {day.cadastros.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-3 py-4 tabular-nums">{day.ftd}</td>
                      <td className="px-3 py-4 tabular-nums">{day.qftd}</td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20">
                          {convClickFtd.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-4 tabular-nums text-gray-700 dark:text-slate-200">
                        {formatBRL(day.depositoTotal)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        <span className="font-bold text-neon-600 dark:text-neon-300 dark:drop-shadow-[0_0_6px_rgba(57,255,20,0.25)]">
                          {formatBRL(day.totalCommission)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={8} className="p-0">
                        <div
                          className={`grid overflow-hidden transition-all duration-500 ease-out ${
                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="min-h-0">
                            <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/5 dark:bg-black/30">
                              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#14141A]">
                                <table className="w-full min-w-[880px] text-xs">
                                  <thead>
                                    <tr className="bg-gray-100 text-left text-[10px] uppercase tracking-wider text-gray-500 dark:bg-black/40 dark:text-slate-500">
                                      <th className="px-4 py-2.5 font-semibold">Campanha</th>
                                      <th className="px-3 py-2.5 font-semibold">Cliques</th>
                                      <th className="px-3 py-2.5 font-semibold">Cadastros</th>
                                      <th className="px-3 py-2.5 font-semibold">FTDs</th>
                                      <th className="px-3 py-2.5 font-semibold">QFTDs</th>
                                      <th className="px-3 py-2.5 font-semibold">Depósitos</th>
                                      <th className="px-4 py-2.5 text-right font-semibold">
                                        Comissão
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {day.campaigns.map((c, idx) => (
                                      <tr
                                        key={`${day.id}-${idx}`}
                                        className="border-t border-gray-100 text-gray-700 dark:border-white/5 dark:text-slate-300"
                                      >
                                        <td className="px-4 py-2.5">
                                          <div className="flex items-center gap-2">
                                            <ChevronRight className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                                            <div className="flex flex-col">
                                              <span className="font-semibold text-gray-900 dark:text-white">
                                                {c.campaignName}
                                              </span>
                                              <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-500">
                                                {c.houseName}
                                              </span>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2.5 tabular-nums">
                                          {c.clicks.toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-3 py-2.5 tabular-nums">
                                          {c.cadastros}
                                        </td>
                                        <td className="px-3 py-2.5 tabular-nums">{c.ftd}</td>
                                        <td className="px-3 py-2.5 tabular-nums">{c.qftd}</td>
                                        <td className="px-3 py-2.5 tabular-nums">
                                          {formatBRL(c.depositoTotal)}
                                        </td>
                                        <td className="px-4 py-2.5 text-right tabular-nums font-bold text-neon-600 dark:text-neon-300">
                                          {formatBRL(c.commission)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
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
  fallbackUrl,
  initials,
  allChip = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  logoUrl?: string;
  fallbackUrl?: string;
  initials?: string;
  allChip?: boolean;
}) {
  const [src, setSrc] = useState<string | undefined>(logoUrl);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-semibold backdrop-blur-md transition-all duration-200 ${
        active
          ? 'border-[#39FF14] bg-[#39FF14]/10 text-gray-900 shadow-[0_0_18px_rgba(57,255,20,0.22)] dark:text-white'
          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800 dark:border-gray-800 dark:bg-[#1E1E24] dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-slate-200'
      }`}
    >
      <span
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ${
          active
            ? 'ring-[#39FF14]/50 bg-white dark:bg-white/5'
            : 'ring-gray-200 bg-gray-50 dark:ring-white/10 dark:bg-white/5'
        }`}
      >
        {allChip ? (
          <Globe className="h-4 w-4 text-neon-500 dark:text-neon-300" />
        ) : src && !imgFailed ? (
          <img
            src={src}
            alt={label}
            className="h-5 max-w-[22px] object-contain"
            onError={() => {
              if (src === logoUrl && fallbackUrl) setSrc(fallbackUrl);
              else setImgFailed(true);
            }}
          />
        ) : (
          <span className="text-[9px] font-bold text-gray-700 dark:text-slate-300">
            {initials}
          </span>
        )}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
