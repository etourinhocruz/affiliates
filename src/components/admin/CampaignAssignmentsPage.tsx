import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  Filter,
  Link2,
  RefreshCw,
  Search,
  Target,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export type CampaignAssignment = {
  id: string;
  bet_house: string;
  site_id: string;
  site_name: string;
  acid: string;
  affiliate_id: string | null;
  affiliate_name: string | null;
  status: 'unassigned' | 'assigned' | 'pending';
  ftd: number;
  revenue: number;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

type AffiliateOption = {
  id: string;
  name: string;
  email: string;
};

const HOUSES: { key: string; label: string }[] = [
  { key: 'superbet', label: 'Superbet' },
  { key: 'betmgm', label: 'BetMGM' },
  { key: 'esportivabet', label: 'EsportivaBet' },
  { key: 'betfair', label: 'BetFair' },
  { key: 'novibet', label: 'Novibet' },
];

function houseLabel(key: string): string {
  return HOUSES.find((h) => h.key === key)?.label ?? key;
}

export default function CampaignAssignmentsPage() {
  const [assignments, setAssignments] = useState<CampaignAssignment[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [houseFilter, setHouseFilter] = useState<string>('ALL');
  const [affiliateFilter, setAffiliateFilter] = useState<string>('ALL');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [search, setSearch] = useState('');
  const [assignTarget, setAssignTarget] = useState<CampaignAssignment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('campaign_assignments')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setAssignments(data as CampaignAssignment[]);
    setLoading(false);
  };

  const fetchAffiliates = async () => {
    const { data } = await supabase
      .from('admin_users')
      .select('id,name,email,role')
      .in('role', ['AFFILIATE', 'SUB_AFFILIATE'])
      .order('name', { ascending: true });
    if (data) {
      setAffiliates(
        data.map((u) => ({
          id: String(u.id),
          name: String(u.name ?? ''),
          email: String(u.email ?? ''),
        })),
      );
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchAffiliates();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (assignments || []).filter((a) => {
      if (houseFilter !== 'ALL' && a.bet_house !== houseFilter) return false;
      if (onlyUnassigned && a.status !== 'unassigned') return false;
      if (affiliateFilter !== 'ALL' && (a.affiliate_id ?? '') !== affiliateFilter) return false;
      if (!q) return true;
      return (
        a.site_id.toLowerCase().includes(q) ||
        a.site_name.toLowerCase().includes(q) ||
        a.acid.toLowerCase().includes(q) ||
        (a.affiliate_name ?? '').toLowerCase().includes(q)
      );
    });
  }, [assignments, search, houseFilter, affiliateFilter, onlyUnassigned]);

  const kpis = useMemo(() => {
    const total = assignments.length;
    const assigned = assignments.filter((a) => a.status === 'assigned').length;
    const unassigned = assignments.filter((a) => a.status === 'unassigned').length;
    const pending = assignments.filter((a) => a.status === 'pending').length;
    return { total, assigned, unassigned, pending };
  }, [assignments]);

  const handleAssign = async (target: CampaignAssignment, affiliate: AffiliateOption) => {
    const nextStatus: CampaignAssignment['status'] = 'assigned';
    const { error } = await supabase
      .from('campaign_assignments')
      .update({
        affiliate_id: affiliate.id,
        affiliate_name: affiliate.name,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', target.id);

    if (!error) {
      setAssignments((list) =>
        list.map((a) =>
          a.id === target.id
            ? {
                ...a,
                affiliate_id: affiliate.id,
                affiliate_name: affiliate.name,
                status: nextStatus,
              }
            : a,
        ),
      );
      setToast(`Campanha atribuída a ${affiliate.name}.`);
    } else {
      setToast('Não foi possível salvar a atribuição.');
    }
    setAssignTarget(null);
  };

  return (
    <div className="pb-10 text-slate-100 animate-rise">
      <header className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-300 ring-1 ring-neon-400/30">
          <Target className="h-3 w-3" />
          Super Admin · Atribuição
        </span>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Atribuição de Campanhas
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Vincule cada ACID ingerido dos uploads ao afiliado correto. A granularidade é sempre o ACID.
            </p>
          </div>
          <button
            onClick={fetchAssignments}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-neon-400/40 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label="Campanhas" value={kpis.total} tone="slate" />
        <KpiTile label="Atribuídas" value={kpis.assigned} tone="neon" />
        <KpiTile label="Pendentes" value={kpis.pending} tone="amber" />
        <KpiTile label="Não atribuídas" value={kpis.unassigned} tone="rose" />
      </section>

      <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#1E1E24]/80 p-3 backdrop-blur-xl md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Site ID, Site Name, ACID ou afiliado..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20"
          />
        </div>

        <FilterSelect
          label="Casa"
          value={houseFilter}
          onChange={setHouseFilter}
          options={[
            { value: 'ALL', label: 'Todas as casas' },
            ...HOUSES.map((h) => ({ value: h.key, label: h.label })),
          ]}
        />

        <FilterSelect
          label="Afiliado"
          value={affiliateFilter}
          onChange={setAffiliateFilter}
          options={[
            { value: 'ALL', label: 'Todos os afiliados' },
            ...affiliates.map((a) => ({ value: a.id, label: a.name || a.email })),
          ]}
        />

        <button
          onClick={() => setOnlyUnassigned((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            onlyUnassigned
              ? 'border-neon-400/60 bg-neon-400/15 text-neon-200 shadow-[0_0_18px_rgba(57,255,20,0.2)]'
              : 'border-white/10 bg-white/5 text-slate-300 hover:border-neon-400/40 hover:text-white'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Só não atribuídas
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/5 bg-[#1E1E24]/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="bg-black/30 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Bet House</th>
                <th className="px-3 py-3 text-left font-semibold">Site ID</th>
                <th className="px-3 py-3 text-left font-semibold">Site Name</th>
                <th className="px-3 py-3 text-left font-semibold">ACID</th>
                <th className="px-3 py-3 text-left font-semibold">Status</th>
                <th className="px-3 py-3 text-left font-semibold">Afiliado Vinculado</th>
                <th className="px-5 py-3 text-right font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {(filtered || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400 ring-1 ring-white/10">
                        <Target className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {assignments.length === 0
                          ? 'Nenhuma campanha ingerida no momento'
                          : 'Nenhuma campanha encontrada para os filtros atuais'}
                      </p>
                      <p className="text-xs text-slate-400">
                        As campanhas aparecerão automaticamente aqui após cada upload de dados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-white/5 text-slate-200 transition hover:bg-white/5"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-left">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
                        {houseLabel(a.bet_house)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-left font-mono text-xs text-slate-300">
                      {a.site_id || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-left">
                      {a.site_name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-left font-mono text-xs font-semibold text-white">
                      {a.acid || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-left">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-left">
                      {a.affiliate_name ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                          <Link2 className="h-3.5 w-3.5 text-neon-300" />
                          {a.affiliate_name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <button
                        onClick={() => setAssignTarget(a)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                          a.status === 'assigned'
                            ? 'border-white/10 bg-white/5 text-slate-200 hover:border-neon-400/40 hover:text-white'
                            : 'border-neon-400/40 bg-neon-400/10 text-neon-300 hover:border-neon-400/60 hover:bg-neon-400/20 hover:text-white'
                        }`}
                      >
                        {a.status === 'assigned' ? 'Reatribuir' : 'Atribuir'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {assignTarget && (
        <AssignModal
          assignment={assignTarget}
          affiliates={affiliates}
          onClose={() => setAssignTarget(null)}
          onConfirm={(aff) => handleAssign(assignTarget, aff)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 animate-rise">
          <div className="flex items-center gap-2.5 rounded-full border border-neon-400/40 bg-[#14141A]/95 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(57,255,20,0.35)] backdrop-blur-xl">
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

function KpiTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'slate' | 'neon' | 'amber' | 'rose';
}) {
  const toneMap = {
    slate: 'text-white',
    neon: 'text-neon-300 drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]',
    amber: 'text-amber-300',
    rose: 'text-rose-300',
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-[#1E1E24]/80 p-4 backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneMap[tone]}`}>
        {value.toLocaleString('pt-BR')}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-14 pr-9 text-sm font-semibold text-white transition focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#14141A]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

function StatusPill({ status }: { status: CampaignAssignment['status'] }) {
  if (status === 'assigned') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neon-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-300 ring-1 ring-neon-400/40">
        <span className="h-1.5 w-1.5 rounded-full bg-neon-400 shadow-[0_0_6px_rgba(57,255,20,0.9)]" />
        Atribuída
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/40">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
        Pendente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300 ring-1 ring-rose-400/40">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
      Não atribuída
    </span>
  );
}

function AssignModal({
  assignment,
  affiliates,
  onClose,
  onConfirm,
}: {
  assignment: CampaignAssignment;
  affiliates: AffiliateOption[];
  onClose: () => void;
  onConfirm: (aff: AffiliateOption) => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AffiliateOption | null>(
    assignment.affiliate_id
      ? {
          id: assignment.affiliate_id,
          name: assignment.affiliate_name ?? '',
          email: '',
        }
      : null,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return affiliates;
    return affiliates.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
    );
  }, [affiliates, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#14141A] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-400/10 text-neon-300 ring-1 ring-neon-400/30">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-base font-semibold text-white">
                {assignment.status === 'assigned' ? 'Reatribuir campanha' : 'Atribuir campanha'}
              </h4>
              <p className="mt-0.5 text-xs text-slate-400">
                {houseLabel(assignment.bet_house)} · ACID{' '}
                <span className="font-mono text-slate-200">{assignment.acid}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar afiliado..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20"
            />
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-white/5 bg-black/20">
            {(filtered || []).length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-500">
                Nenhum afiliado disponível.
              </p>
            ) : (
              <ul className="divide-y divide-white/5">
                {filtered.map((a) => {
                  const isSelected = selected?.id === a.id;
                  return (
                    <li key={a.id}>
                      <button
                        onClick={() => setSelected(a)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition ${
                          isSelected ? 'bg-neon-400/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{a.name || '—'}</p>
                          <p className="truncate text-[11px] text-slate-400">{a.email}</p>
                        </div>
                        {isSelected && (
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-neon-400/20 text-neon-300">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/5 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
