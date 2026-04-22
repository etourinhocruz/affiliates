import { useMemo, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  DollarSign,
  Gauge,
  Handshake,
  Layers,
  PieChart,
  ShieldCheck,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const HOUSE_CATALOG: { key: string; label: string }[] = [
  { key: 'all', label: 'Todas as Casas' },
  { key: 'superbet', label: 'SuperBet' },
  { key: 'betmgm', label: 'BetMGM' },
  { key: 'esportivabet', label: 'EsportivaBet' },
  { key: 'betfair', label: 'BetFair' },
  { key: 'novibet', label: 'NoviBet' },
];

type PartnerType = 'all' | 'AFFILIATE' | 'AGENCY';

const PARTNER_TYPES: { key: PartnerType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'AFFILIATE', label: 'Afiliado' },
  { key: 'AGENCY', label: 'Agência' },
];

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function SuperAdminDashboard() {
  const { selectedHouse, setSelectedHouse } = useUser();
  const [partnerType, setPartnerType] = useState<PartnerType>('all');
  const [dateStart, setDateStart] = useState<string>(todayISO(29));
  const [dateEnd, setDateEnd] = useState<string>(todayISO(0));

  const houseLabel = useMemo(
    () => HOUSE_CATALOG.find((h) => h.key === selectedHouse)?.label,
    [selectedHouse],
  );

  const platformMargin = 0;

  return (
    <div className="pb-10 text-slate-900 animate-rise dark:text-slate-100">
      <header className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
            <ShieldCheck className="h-3 w-3" />
            Super Admin Console
          </span>
          {houseLabel && selectedHouse !== 'all' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600 ring-1 ring-sky-400/30 dark:text-sky-300">
              <Zap className="h-3 w-3" />
              Filtro: {houseLabel}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Visão Geral
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Monitoramento consolidado das operações globais da Mansão Green Affiliates.
        </p>
      </header>

      <FilterBar
        selectedHouse={selectedHouse}
        onHouseChange={setSelectedHouse}
        partnerType={partnerType}
        onPartnerTypeChange={setPartnerType}
        dateStart={dateStart}
        dateEnd={dateEnd}
        onDateStartChange={setDateStart}
        onDateEndChange={setDateEnd}
      />

      <OverviewMetricsGrid />

      <section className="mt-6">
        <div className="group relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-white/5 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-400/30 dark:bg-[#1E1E24] dark:shadow-[0_0_50px_rgba(57,255,20,0.06)] dark:backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-400/0 to-transparent transition duration-300 group-hover:via-neon-400/70" />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-slate-400">
              Margem de Lucro
            </p>
            <div className="rounded-lg bg-neon-400/10 p-2 text-neon-300 ring-1 ring-neon-400/30">
              <PieChart className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-neon-600 dark:text-neon-300 dark:drop-shadow-[0_0_12px_rgba(57,255,20,0.35)]">
            {platformMargin.toFixed(1)}%
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
            Lucro líquido / GGR · Período selecionado
          </p>
        </div>
      </section>
    </div>
  );
}

type FilterBarProps = {
  selectedHouse: string;
  onHouseChange: (v: string) => void;
  partnerType: PartnerType;
  onPartnerTypeChange: (v: PartnerType) => void;
  dateStart: string;
  dateEnd: string;
  onDateStartChange: (v: string) => void;
  onDateEndChange: (v: string) => void;
};

function FilterBar({
  selectedHouse,
  onHouseChange,
  partnerType,
  onPartnerTypeChange,
  dateStart,
  dateEnd,
  onDateStartChange,
  onDateEndChange,
}: FilterBarProps) {
  return (
    <section className="mb-6 rounded-2xl border border-white/5 bg-[#1E1E24]/80 p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SelectField
          label="Casa de Aposta"
          icon={<Zap className="h-4 w-4" />}
          value={selectedHouse}
          onChange={onHouseChange}
          options={HOUSE_CATALOG.map((h) => ({ value: h.key, label: h.label }))}
        />

        <SelectField
          label="Tipo de Parceiro"
          icon={<Users className="h-4 w-4" />}
          value={partnerType}
          onChange={(v) => onPartnerTypeChange(v as PartnerType)}
          options={PARTNER_TYPES.map((p) => ({ value: p.key, label: p.label }))}
        />

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Intervalo de Datas
          </label>
          <div className="flex items-center gap-2">
            <DateField value={dateStart} onChange={onDateStartChange} />
            <span className="text-xs font-semibold text-slate-500">até</span>
            <DateField value={dateEnd} onChange={onDateEndChange} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-9 text-sm font-semibold text-white transition focus:border-neon-400/60 focus:outline-none focus:shadow-[0_0_0_4px_rgba(57,255,20,0.08)]"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#14141A]">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </div>
  );
}

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        <Calendar className="h-4 w-4" />
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm font-semibold text-white transition focus:border-neon-400/60 focus:outline-none focus:shadow-[0_0_0_4px_rgba(57,255,20,0.08)] [color-scheme:dark]"
      />
    </div>
  );
}

type OverviewMetric = {
  key: string;
  label: string;
  icon: React.ReactNode;
  affiliate: string;
  agency: string;
  total: string;
};

const OVERVIEW_METRICS: OverviewMetric[] = [
  {
    key: 'registro',
    label: 'Registro',
    icon: <UserPlus className="h-5 w-5" />,
    affiliate: '0',
    agency: '0',
    total: '0',
  },
  {
    key: 'ftd',
    label: 'FTD',
    icon: <Target className="h-5 w-5" />,
    affiliate: '0',
    agency: '0',
    total: '0',
  },
  {
    key: 'qftd',
    label: 'QFTD',
    icon: <Gauge className="h-5 w-5" />,
    affiliate: '0',
    agency: '0',
    total: '0',
  },
  {
    key: 'deposito',
    label: 'Depósito',
    icon: <Wallet className="h-5 w-5" />,
    affiliate: 'R$ 0,00',
    agency: 'R$ 0,00',
    total: 'R$ 0,00',
  },
  {
    key: 'rev',
    label: 'REV',
    icon: <TrendingUp className="h-5 w-5" />,
    affiliate: 'R$ 0,00',
    agency: 'R$ 0,00',
    total: 'R$ 0,00',
  },
  {
    key: 'cpa',
    label: 'CPA',
    icon: <DollarSign className="h-5 w-5" />,
    affiliate: 'R$ 0,00',
    agency: 'R$ 0,00',
    total: 'R$ 0,00',
  },
  {
    key: 'rev_cpa',
    label: 'REV + CPA',
    icon: <Handshake className="h-5 w-5" />,
    affiliate: 'R$ 0,00',
    agency: 'R$ 0,00',
    total: 'R$ 0,00',
  },
];

function OverviewMetricsGrid() {
  const columns: {
    key: 'affiliate' | 'agency' | 'total';
    title: string;
    icon: React.ReactNode;
    accent: string;
  }[] = [
    {
      key: 'affiliate',
      title: 'Afiliado',
      icon: <Users className="h-4 w-4" />,
      accent: 'from-neon-400/20 to-emerald-500/10 text-neon-300',
    },
    {
      key: 'agency',
      title: 'Agência',
      icon: <ShieldCheck className="h-4 w-4" />,
      accent: 'from-sky-400/20 to-sky-500/10 text-sky-300',
    },
    {
      key: 'total',
      title: 'Total',
      icon: <Layers className="h-4 w-4" />,
      accent: 'from-amber-300/20 to-amber-500/10 text-amber-200',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key} className="flex flex-col gap-3">
            <div
              className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${col.accent} px-4 py-3 text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md`}
            >
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="inline-flex items-center justify-center gap-2">
                <span className="opacity-80">{col.icon}</span>
                <h3 className="text-sm font-extrabold uppercase tracking-[0.28em]">
                  {col.title}
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {OVERVIEW_METRICS.map((m) => (
                <OverviewMetricCard
                  key={m.key}
                  icon={m.icon}
                  label={`${m.label} - ${col.title}`}
                  value={m[col.key]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OverviewMetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/5 bg-[#14141A]/80 px-4 py-3 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-400/30 hover:shadow-[0_14px_38px_-12px_rgba(57,255,20,0.18)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-neon-400/0 to-transparent transition group-hover:via-neon-400/70" />
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-neon-400/10 text-neon-300 ring-1 ring-neon-400/30 shadow-[0_0_16px_rgba(57,255,20,0.2)] transition group-hover:bg-neon-400/15 group-hover:shadow-[0_0_22px_rgba(57,255,20,0.3)]">
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-end text-right">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </span>
        <span className="mt-0.5 w-full truncate text-xl font-extrabold tabular-nums text-white">
          {value}
        </span>
      </div>
    </div>
  );
}
