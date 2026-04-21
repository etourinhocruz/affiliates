import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Handshake,
  History,
  Pencil,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type DealVersion = {
  start_date: string;
  cpa: number;
  rev: number;
};

type Deal = {
  id: string;
  name: string;
  house: string;
  target: string;
  parent_deal_id: string | null;
  history: DealVersion[];
  status: 'active' | 'scheduled';
  created_at: string;
};

const HOUSE_META: Record<string, { label: string; logo: string }> = {
  superbet: { label: 'SuperBet', logo: '/superbet-logo-0.png' },
  betmgm: { label: 'BetMGM', logo: '/BETMGM-Logo-Stylish-Presentation-PNG.png' },
  esportivabet: { label: 'EsportivaBet', logo: '/ESPORTIVA_PNG.png' },
  betfair: { label: 'BetFair', logo: '/betfair-logo-0-1536x1536.png' },
  novibet: { label: 'NoviBet', logo: '/novibet-seeklogo.png' },
};

const TARGET_OPTIONS: { group: string; items: string[] }[] = [
  {
    group: 'Agências',
    items: [
      'Agência Tubarões Media',
      'Agência HighRoller BR',
      'Agência Sports Hub',
      'Equipe VIP BR',
    ],
  },
  {
    group: 'Gerentes',
    items: ['Marcus Trader', 'Camila Ventura'],
  },
  {
    group: 'Afiliados',
    items: [
      'Rodrigo Alves',
      'Juliana Costa',
      'Ricardo Picks',
      'Bruno Tipster',
    ],
  },
  {
    group: 'Sub-Afiliados',
    items: ['Carlos Simões', 'Ana Lima', 'Diego Matos'],
  },
  {
    group: 'Genérico',
    items: ['Affiliates'],
  },
];

const SELECT_CLASS =
  'w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white';

const SELECT_OPTION_CLASS =
  'bg-white text-gray-800 dark:bg-[#121212] dark:text-slate-200';

const fallbackDeals: Deal[] = [
  {
    id: 'root-1',
    name: 'Master Tubarões - SuperBet',
    house: 'superbet',
    target: 'Agência Tubarões Media',
    parent_deal_id: null,
    history: [
      { start_date: '2026-01-01', cpa: 350, rev: 35 },
      { start_date: '2026-02-01', cpa: 380, rev: 35 },
    ],
    status: 'active',
    created_at: '2026-01-01',
  },
  {
    id: 'sub-1',
    name: 'VIP Tubarões - Rodrigo Alves',
    house: 'superbet',
    target: 'Rodrigo Alves',
    parent_deal_id: 'root-1',
    history: [
      { start_date: '2026-01-01', cpa: 300, rev: 30 },
      { start_date: '2026-02-01', cpa: 320, rev: 30 },
    ],
    status: 'active',
    created_at: '2026-01-01',
  },
];

function sortHistory(history: DealVersion[]): DealVersion[] {
  return [...history].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
  );
}

function currentVersion(history: DealVersion[]): DealVersion | null {
  const sorted = sortHistory(history);
  const now = Date.now();
  let active: DealVersion | null = null;
  for (const v of sorted) {
    if (new Date(v.start_date).getTime() <= now) active = v;
  }
  return active ?? sorted[sorted.length - 1] ?? null;
}

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function DealsManagementPage() {
  const [deals, setDeals] = useState<Deal[]>(fallbackDeals);
  const [search, setSearch] = useState('');
  const [houseFilter, setHouseFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ROOT' | 'SUB'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'scheduled'>('ALL');
  const [updatingVersion, setUpdatingVersion] = useState<Deal | null>(null);
  const [editingBase, setEditingBase] = useState<Deal | null>(null);
  const [historyFor, setHistoryFor] = useState<Deal | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('admin_deals')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length) setDeals(data as Deal[]);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const dealsById = useMemo(() => {
    const map: Record<string, Deal> = {};
    deals.forEach((d) => (map[d.id] = d));
    return map;
  }, [deals]);

  const houses = useMemo(() => {
    const set = new Set(deals.map((d) => d.house).filter(Boolean));
    return Array.from(set);
  }, [deals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.filter((d) => {
      if (houseFilter !== 'ALL' && d.house !== houseFilter) return false;
      if (typeFilter === 'ROOT' && d.parent_deal_id) return false;
      if (typeFilter === 'SUB' && !d.parent_deal_id) return false;
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.target.toLowerCase().includes(q)
      );
    });
  }, [deals, search, houseFilter, typeFilter, statusFilter]);

  const handleAppendVersion = async (deal: Deal, version: DealVersion) => {
    const nextHistory = sortHistory([...deal.history, version]);
    const nextStatus: Deal['status'] =
      new Date(version.start_date).getTime() > Date.now() ? 'scheduled' : 'active';
    setDeals((list) =>
      list.map((d) =>
        d.id === deal.id ? { ...d, history: nextHistory, status: nextStatus } : d,
      ),
    );
    setUpdatingVersion(null);
    setToast(
      nextStatus === 'scheduled'
        ? `Nova condição agendada para ${formatDate(version.start_date)}.`
        : 'Nova condição aplicada.',
    );
    await supabase
      .from('admin_deals')
      .update({ history: nextHistory, status: nextStatus })
      .eq('id', deal.id);
  };

  const handleEditBase = async (
    deal: Deal,
    patch: {
      name: string;
      house: string;
      target: string;
      parent_deal_id: string | null;
    },
  ) => {
    setDeals((list) => list.map((d) => (d.id === deal.id ? { ...d, ...patch } : d)));
    setEditingBase(null);
    setToast('Acordo atualizado com sucesso.');
    await supabase.from('admin_deals').update(patch).eq('id', deal.id);
  };

  const handleCreateDeal = async (payload: {
    name: string;
    house: string;
    target: string;
    parent_deal_id: string | null;
    cpa: number;
    rev: number;
    start_date: string;
  }) => {
    const history: DealVersion[] = [
      { start_date: payload.start_date, cpa: payload.cpa, rev: payload.rev },
    ];
    const status: Deal['status'] =
      new Date(payload.start_date).getTime() > Date.now() ? 'scheduled' : 'active';
    const optimistic: Deal = {
      id: `tmp-${Date.now()}`,
      name: payload.name,
      house: payload.house,
      target: payload.target,
      parent_deal_id: payload.parent_deal_id,
      history,
      status,
      created_at: new Date().toISOString(),
    };
    setDeals((list) => [optimistic, ...list]);
    setAddOpen(false);
    setToast(`Acordo ${payload.name} criado.`);
    const { data } = await supabase
      .from('admin_deals')
      .insert({
        name: payload.name,
        house: payload.house,
        target: payload.target,
        parent_deal_id: payload.parent_deal_id,
        history,
        status,
      })
      .select()
      .maybeSingle();
    if (data) {
      setDeals((list) => list.map((d) => (d.id === optimistic.id ? (data as Deal) : d)));
    }
  };

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
            <Handshake className="h-3 w-3" />
            Super Admin · Gestão de Acordos
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Versionamento de Deals
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Acompanhe a hierarquia de acordos, margens de repasse e evolução temporal de cada condição.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/80 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-white/5 dark:bg-[#1E1E24]/80 dark:shadow-none lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por acordo ou afiliado..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <FilterSelect
          value={houseFilter}
          onChange={setHouseFilter}
          options={[
            { key: 'ALL', label: 'Todas as Casas' },
            ...houses.map((h) => ({
              key: h,
              label: HOUSE_META[h]?.label ?? h,
            })),
          ]}
        />
        <FilterSelect
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as 'ALL' | 'ROOT' | 'SUB')}
          options={[
            { key: 'ALL', label: 'Tipo: Todos' },
            { key: 'ROOT', label: 'Tipo: Raiz' },
            { key: 'SUB', label: 'Tipo: Sub-Acordo' },
          ]}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as 'ALL' | 'active' | 'scheduled')}
          options={[
            { key: 'ALL', label: 'Status: Todos' },
            { key: 'active', label: 'Status: Ativo' },
            { key: 'scheduled', label: 'Status: Agendado' },
          ]}
        />

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300"
        >
          <Plus className="h-4 w-4" />
          Novo Acordo
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Acordos Ativos
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              {filtered.length} acordos encontrados · clique na linha para expandir a timeline
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-black/30 dark:text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Acordo & Casa</th>
                <th className="px-3 py-3 text-left font-semibold">Afiliado / Agência</th>
                <th className="px-3 py-3 text-left font-semibold">Acordo Pai</th>
                <th className="px-3 py-3 text-right font-semibold">Deal Atual</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    Nenhum acordo encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
              {filtered.map((d) => {
                const current = currentVersion(d.history);
                const parent = d.parent_deal_id ? dealsById[d.parent_deal_id] : null;
                const isOpen = !!expanded[d.id];
                return (
                  <Fragment key={d.id}>
                    <tr
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [d.id]: !e[d.id] }))
                      }
                      className="cursor-pointer border-b border-gray-100 transition hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <ChevronRight
                            className={`h-4 w-4 text-gray-400 transition-transform dark:text-slate-500 ${
                              isOpen ? 'rotate-90 text-neon-500 dark:text-neon-400' : ''
                            }`}
                          />
                          <HouseAvatar house={d.house} />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {d.name}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-500">
                              {HOUSE_META[d.house]?.label ?? d.house}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-left text-gray-800 dark:text-slate-200">
                        {d.target}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-left">
                        {parent ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-400/10 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-400/30 dark:text-sky-300">
                            <Handshake className="h-3 w-3" />
                            {parent.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-400/30 dark:text-amber-300">
                            Raiz
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right">
                        {current ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="tabular-nums font-bold text-gray-900 dark:text-white">
                              CPA: {formatBRL(current.cpa)}
                            </span>
                            <span className="tabular-nums text-[11px] font-semibold text-neon-700 dark:text-neon-300">
                              Rev: {current.rev}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            title="Editar Acordo"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBase(d);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton
                            title="Nova Versão (agendar/aplicar)"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUpdatingVersion(d);
                            }}
                          >
                            <CalendarClock className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton
                            title="Ver Histórico"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoryFor(d);
                            }}
                          >
                            <History className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="p-0">
                        <div
                          className={`grid overflow-hidden transition-all duration-500 ease-out ${
                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="min-h-0">
                            <div className="border-b border-gray-100 bg-gray-50 px-5 py-5 dark:border-white/5 dark:bg-black/30">
                              <Timeline history={d.history} compact />
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

      {updatingVersion && (
        <UpdateDealModal
          deal={updatingVersion}
          onClose={() => setUpdatingVersion(null)}
          onApply={(v) => handleAppendVersion(updatingVersion, v)}
        />
      )}

      {editingBase && (
        <EditBaseDealModal
          deal={editingBase}
          parents={deals.filter((d) => !d.parent_deal_id && d.id !== editingBase.id)}
          onClose={() => setEditingBase(null)}
          onSave={(patch) => handleEditBase(editingBase, patch)}
        />
      )}

      {historyFor && (
        <HistoryModal deal={historyFor} onClose={() => setHistoryFor(null)} />
      )}

      {addOpen && (
        <NewDealModal
          parents={deals.filter((d) => !d.parent_deal_id)}
          onClose={() => setAddOpen(false)}
          onCreate={handleCreateDeal}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 animate-rise">
          <div className="flex items-center gap-2.5 rounded-full border border-neon-400/40 bg-slate-900/95 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(57,255,20,0.35)] backdrop-blur-xl dark:bg-[#14141A]/95">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neon-400/20 text-neon-300">
              <Check className="h-3.5 w-3.5" />
            </span>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="relative">
      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm font-semibold text-gray-800 transition focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 lg:w-52"
      >
        {options.map((o) => (
          <option
            key={o.key}
            value={o.key}
            className="bg-white text-gray-800 dark:bg-[#1E1E24] dark:text-slate-200"
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function HouseAvatar({ house }: { house: string }) {
  const meta = HOUSE_META[house];
  if (meta?.logo) {
    return (
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-gray-200 dark:bg-black/40 dark:ring-white/10">
        <img src={meta.logo} alt={meta.label} className="h-full w-full object-contain p-1" />
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white ring-1 ring-white/10">
      {house.slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status: Deal['status'] }) {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
        active
          ? 'bg-emerald-900/20 text-[#39FF14] ring-neon-400/40 dark:bg-emerald-950/40'
          : 'bg-amber-500/10 text-amber-700 ring-amber-400/40 dark:text-amber-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? 'bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.9)]'
            : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]'
        }`}
      />
      {active ? 'Ativo' : 'Agendado'}
    </span>
  );
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-neon-300"
    >
      {children}
    </button>
  );
}

function Timeline({
  history,
  compact = false,
}: {
  history: DealVersion[];
  compact?: boolean;
}) {
  const sorted = useMemo(() => sortHistory(history).slice().reverse(), [history]);
  const now = Date.now();
  const active = currentVersion(history);

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-gray-500 dark:text-slate-400">
        Nenhuma versão cadastrada.
      </p>
    );
  }

  return (
    <ol className={`relative ${compact ? '' : 'pl-4'}`}>
      {!compact && (
        <span className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-neon-400/60 via-neon-400/20 to-transparent" />
      )}
      {sorted.map((v, idx) => {
        const start = new Date(v.start_date).getTime();
        const next = sorted[idx - 1];
        const endDate = next
          ? new Date(new Date(next.start_date).getTime() - 86400000).toISOString()
          : null;
        const isActive = active && v.start_date === active.start_date;
        const isScheduled = start > now;
        const label = isScheduled ? 'Agendado' : isActive ? 'Ativo' : 'Expirado';
        const dot = isActive
          ? 'bg-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.8)]'
          : isScheduled
            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
            : 'bg-slate-500';
        return (
          <li
            key={`${v.start_date}-${idx}`}
            className={`relative mb-3 last:mb-0 ${compact ? '' : 'pl-6'}`}
          >
            {!compact && (
              <span
                className={`absolute left-0 top-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-white dark:ring-[#14141A] ${dot}`}
              />
            )}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-white/5 dark:bg-[#14141A]">
              <span
                className={`inline-flex h-2 w-2 flex-shrink-0 rounded-full ${dot}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {endDate
                    ? `De ${formatDate(v.start_date)} a ${formatDate(endDate)}`
                    : `A partir de ${formatDate(v.start_date)}`}
                </p>
                <p className="mt-0.5 text-[12px] tabular-nums text-gray-600 dark:text-slate-300">
                  CPA {formatBRL(v.cpa)} · Rev {v.rev}%
                </p>
              </div>
              <span
                className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
                  isActive
                    ? 'bg-neon-400/10 text-neon-700 ring-neon-400/30 dark:text-neon-300'
                    : isScheduled
                      ? 'bg-amber-400/10 text-amber-700 ring-amber-400/30 dark:text-amber-300'
                      : 'bg-slate-400/10 text-slate-600 ring-slate-400/20 dark:text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function UpdateDealModal({
  deal,
  onClose,
  onApply,
}: {
  deal: Deal;
  onClose: () => void;
  onApply: (v: DealVersion) => void;
}) {
  const current = currentVersion(deal.history);
  const today = new Date().toISOString().slice(0, 10);
  const [cpa, setCpa] = useState<string>(current ? String(current.cpa) : '');
  const [rev, setRev] = useState<string>(current ? String(current.rev) : '');
  const [startDate, setStartDate] = useState<string>(today);

  const parsedCpa = Number(cpa);
  const parsedRev = Number(rev);
  const disabled =
    !cpa.trim() || !rev.trim() || Number.isNaN(parsedCpa) || Number.isNaN(parsedRev);

  return (
    <Modal
      onClose={onClose}
      title="Atualizar Deal"
      subtitle={deal.name}
      icon={<Pencil className="h-4 w-4" />}
    >
      <div className="mb-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
          Deal Atual
        </p>
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-600 dark:text-slate-300">
          {current
            ? `${formatBRL(current.cpa)} / ${current.rev}% (desde ${formatDate(current.start_date)})`
            : 'Sem versão ativa cadastrada'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Novo CPA (R$)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={cpa}
              onChange={(e) => setCpa(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm tabular-nums text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            />
          </Field>
          <Field label="Novo RevShare (%)">
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={rev}
              onChange={(e) => setRev(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm tabular-nums text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            />
          </Field>
        </div>
        <Field label="Data de Início">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus-within:border-neon-400/50 focus-within:ring-2 focus-within:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212]">
            <Calendar className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none dark:text-white"
            />
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
            <AlertCircle className="h-3 w-3" />
            Datas no futuro criam uma versão agendada (não sobrescreve o vigente).
          </p>
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          disabled={disabled}
          onClick={() =>
            onApply({ start_date: startDate, cpa: parsedCpa, rev: parsedRev })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Clock className="h-4 w-4" />
          Agendar / Aplicar
        </button>
      </div>
    </Modal>
  );
}

function HistoryModal({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  return (
    <Modal
      onClose={onClose}
      title="Linha do Tempo"
      subtitle={deal.name}
      icon={<History className="h-4 w-4" />}
      wide
    >
      <Timeline history={deal.history} />
    </Modal>
  );
}

function HouseSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={SELECT_CLASS}
    >
      {Object.keys(HOUSE_META).map((h) => (
        <option key={h} value={h} className={SELECT_OPTION_CLASS}>
          {HOUSE_META[h].label}
        </option>
      ))}
    </select>
  );
}

type GroupedOption = { group: string; items: { value: string; label: string }[] };

function SearchableSelect({
  value,
  onChange,
  groups,
  placeholder,
  emptyLabel = 'Nenhum usuário encontrado.',
  clearable = false,
  clearLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  groups: GroupedOption[];
  placeholder: string;
  emptyLabel?: string;
  clearable?: boolean;
  clearLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(() => {
    for (const g of groups) {
      const hit = g.items.find((i) => i.value === value);
      if (hit) return hit.label;
    }
    return '';
  }, [groups, value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) setTerm('');
  }, [open]);

  const normalized = term.trim().toLowerCase();
  const filteredGroups = useMemo(
    () =>
      groups
        .map((g) => ({
          group: g.group,
          items: g.items.filter((i) =>
            normalized ? i.label.toLowerCase().includes(normalized) : true,
          ),
        }))
        .filter((g) => g.items.length > 0),
    [groups, normalized],
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setTerm('');
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition dark:bg-[#121212] ${
          open
            ? 'border-neon-400/60 ring-2 ring-neon-400/20 dark:border-neon-400/60'
            : 'border-gray-200 dark:border-white/10'
        }`}
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={open ? term : selectedLabel}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setTerm(e.target.value);
            if (!open) setOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-slate-500"
        />
        {value && !open && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            aria-label="Limpar"
            className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        {open ? (
          <Search className="h-4 w-4 text-neon-500 dark:text-neon-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-slate-500" />
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#1E1E24]">
          {clearable && (
            <button
              type="button"
              onClick={() => handleSelect('')}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-gray-600 transition hover:bg-[#39FF14]/10 hover:text-[#39FF14] dark:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
              {clearLabel ?? 'Limpar seleção'}
            </button>
          )}
          {filteredGroups.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
              {emptyLabel}
            </p>
          ) : (
            filteredGroups.map((g) => (
              <div key={g.group}>
                <p className="sticky top-0 bg-gray-50/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 backdrop-blur dark:bg-[#14141A]/90 dark:text-slate-400">
                  {g.group}
                </p>
                <ul>
                  {g.items.map((item) => {
                    const selected = item.value === value;
                    return (
                      <li key={item.value}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item.value)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-[#39FF14]/10 hover:text-[#39FF14] ${
                            selected
                              ? 'bg-[#39FF14]/10 text-[#39FF14]'
                              : 'text-gray-800 dark:text-slate-200'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {selected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TargetSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const groups = useMemo<GroupedOption[]>(
    () =>
      TARGET_OPTIONS.map((g) => ({
        group: g.group,
        items: g.items.map((i) => ({ value: i, label: i })),
      })),
    [],
  );
  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      groups={groups}
      placeholder="Buscar afiliado ou agência..."
    />
  );
}

function ParentSelect({
  value,
  onChange,
  parents,
}: {
  value: string;
  onChange: (v: string) => void;
  parents: Deal[];
}) {
  const groups = useMemo<GroupedOption[]>(
    () => [
      {
        group: 'Acordos Raiz',
        items: parents.map((p) => ({ value: p.id, label: p.name })),
      },
    ],
    [parents],
  );
  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      groups={groups}
      placeholder="Nenhum (acordo raiz)"
      emptyLabel="Nenhum acordo encontrado."
      clearable
      clearLabel="Nenhum (acordo raiz)"
    />
  );
}

function EditBaseDealModal({
  deal,
  parents,
  onClose,
  onSave,
}: {
  deal: Deal;
  parents: Deal[];
  onClose: () => void;
  onSave: (patch: {
    name: string;
    house: string;
    target: string;
    parent_deal_id: string | null;
  }) => void;
}) {
  const [name, setName] = useState(deal.name);
  const [house, setHouse] = useState(deal.house);
  const [target, setTarget] = useState(deal.target);
  const [parentId, setParentId] = useState<string>(deal.parent_deal_id ?? '');
  const disabled = !name.trim() || !target.trim() || !house;

  return (
    <Modal
      onClose={onClose}
      title="Editar Acordo"
      subtitle="Ajuste as informações base do acordo. Versões e histórico não são alterados aqui."
      icon={<Pencil className="h-4 w-4" />}
      wide
    >
      <div className="space-y-4">
        <Field label="Nome do Acordo">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Acordo Global BetMGM"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Casa">
            <HouseSelect value={house} onChange={setHouse} />
          </Field>
          <Field label="Afiliado / Agência">
            <TargetSelect value={target} onChange={setTarget} />
          </Field>
        </div>
        <Field label="Acordo Pai (opcional)">
          <ParentSelect value={parentId} onChange={setParentId} parents={parents} />
        </Field>
        <p className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
          <AlertCircle className="h-3 w-3" />
          Para alterar CPA / RevShare, use "Nova Versão" — as condições anteriores ficam preservadas no histórico.
        </p>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          disabled={disabled}
          onClick={() =>
            onSave({
              name: name.trim(),
              house,
              target,
              parent_deal_id: parentId || null,
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Check className="h-4 w-4" />
          Salvar alterações
        </button>
      </div>
    </Modal>
  );
}

function NewDealModal({
  parents,
  onClose,
  onCreate,
}: {
  parents: Deal[];
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    house: string;
    target: string;
    parent_deal_id: string | null;
    cpa: number;
    rev: number;
    start_date: string;
  }) => void;
}) {
  const [name, setName] = useState('');
  const [house, setHouse] = useState<string>('superbet');
  const [target, setTarget] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [cpa, setCpa] = useState('');
  const [rev, setRev] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const parsedCpa = Number(cpa);
  const parsedRev = Number(rev);
  const disabled =
    !name.trim() ||
    !target.trim() ||
    Number.isNaN(parsedCpa) ||
    Number.isNaN(parsedRev) ||
    !startDate;

  return (
    <Modal
      onClose={onClose}
      title="Novo Acordo"
      subtitle="Crie um acordo raiz ou um sub-acordo vinculado."
      icon={<Handshake className="h-4 w-4" />}
      wide
    >
      <div className="space-y-4">
        <Field label="Nome do Acordo">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Acordo Global BetMGM"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Casa">
            <HouseSelect value={house} onChange={setHouse} />
          </Field>
          <Field label="Afiliado / Agência">
            <TargetSelect value={target} onChange={setTarget} />
          </Field>
        </div>
        <Field label="Acordo Pai (opcional)">
          <ParentSelect value={parentId} onChange={setParentId} parents={parents} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="CPA (R$)">
            <input
              type="number"
              step="0.01"
              value={cpa}
              onChange={(e) => setCpa(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm tabular-nums text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            />
          </Field>
          <Field label="RevShare (%)">
            <input
              type="number"
              step="1"
              value={rev}
              onChange={(e) => setRev(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm tabular-nums text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            />
          </Field>
          <Field label="Início">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm tabular-nums text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            />
          </Field>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          disabled={disabled}
          onClick={() =>
            onCreate({
              name,
              house,
              target,
              parent_deal_id: parentId || null,
              cpa: parsedCpa,
              rev: parsedRev,
              start_date: startDate,
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Plus className="h-4 w-4" />
          Criar acordo
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  subtitle,
  icon,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  const maxW = wide ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        className={`relative z-10 w-full ${maxW} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#14141A]`}
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-white/5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              {icon ?? <Handshake className="h-4 w-4" />}
            </span>
            <div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h4>
              {subtitle && (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-800 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
