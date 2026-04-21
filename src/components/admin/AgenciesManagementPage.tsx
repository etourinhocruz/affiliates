import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Check,
  UploadCloud,
  Crown,
  Filter,
  Globe,
  Image as ImageIcon,
  Network,
  Plus,
  Settings2,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  UserCog,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Agency = {
  id: string;
  name: string;
  domain: string;
  logo_url: string | null;
  owner_email: string;
  affiliates_count: number;
  total_ftd_generated: number;
  created_at: string;
};

type TreeMember = {
  id: string;
  name: string;
  email: string;
  role: 'AGENCY' | 'MANAGER' | 'AFFILIATE' | 'SUB_AFFILIATE' | 'SUPER_ADMIN';
  parent_agency: string;
  total_ftds: number;
  created_at: string;
};

const fallbackAgencies: Agency[] = [
  {
    id: 'ag1',
    name: 'Agência Tubarões Media',
    domain: 'painel.tubaroesmedia.com',
    logo_url: null,
    owner_email: 'contato@tuboreomedia.com',
    affiliates_count: 42,
    total_ftd_generated: 4820,
    created_at: '2025-12-14',
  },
  {
    id: 'ag2',
    name: 'Agência HighRoller BR',
    domain: 'afiliados.highroller.br',
    logo_url: null,
    owner_email: 'ops@highroller.br',
    affiliates_count: 28,
    total_ftd_generated: 3610,
    created_at: '2026-01-08',
  },
  {
    id: 'ag3',
    name: 'Agência Sports Hub',
    domain: 'rede.sportshub.com',
    logo_url: null,
    owner_email: 'hub@sportshub.com',
    affiliates_count: 16,
    total_ftd_generated: 340,
    created_at: '2026-03-22',
  },
  {
    id: 'ag4',
    name: 'Equipe VIP BR',
    domain: 'painel.vipbr.com',
    logo_url: null,
    owner_email: 'vip@vipbr.com',
    affiliates_count: 9,
    total_ftd_generated: 620,
    created_at: '2026-02-02',
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatInt(value: number): string {
  return value.toLocaleString('pt-BR');
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => p.length > 1 || /[A-Za-zÀ-ú]/.test(p));
  if (!parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AgenciesManagementPage() {
  const [agencies, setAgencies] = useState<Agency[]>(fallbackAgencies);
  const [addOpen, setAddOpen] = useState(false);
  const [whiteLabelFor, setWhiteLabelFor] = useState<Agency | null>(null);
  const [treeFor, setTreeFor] = useState<Agency | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length) setAgencies(data as Agency[]);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const handleCreateAgency = async (payload: { name: string; owner_email: string }) => {
    const domain = `painel.${payload.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/agência |agencia /g, '')
      .replace(/[^a-z0-9]+/g, '')}.com`;
    const optimistic: Agency = {
      id: `tmp-${Date.now()}`,
      name: payload.name,
      domain,
      logo_url: null,
      owner_email: payload.owner_email,
      affiliates_count: 0,
      total_ftd_generated: 0,
      created_at: new Date().toISOString(),
    };
    setAgencies((list) => [optimistic, ...list]);
    setAddOpen(false);
    setToast(`Agência ${payload.name} criada.`);
    const { data } = await supabase
      .from('agencies')
      .insert({
        name: payload.name,
        domain,
        owner_email: payload.owner_email,
      })
      .select()
      .maybeSingle();
    if (data) {
      setAgencies((list) => list.map((a) => (a.id === optimistic.id ? (data as Agency) : a)));
    }
  };

  const handleSaveWhiteLabel = async (id: string, patch: { domain: string; logo_url: string | null }) => {
    setAgencies((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    setWhiteLabelFor(null);
    setToast('Personalização salva.');
    await supabase.from('agencies').update(patch).eq('id', id);
  };

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
            <Building2 className="h-3 w-3" />
            Super Admin · Gestão de Agências
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Rede de Agências Parceiras
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Controle domínios white-label, hierarquia e performance agregada das agências.
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300"
        >
          <Plus className="h-4 w-4" />
          Nova Agência
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {agencies.map((a) => (
          <AgencyCard
            key={a.id}
            agency={a}
            onConfigure={() => setWhiteLabelFor(a)}
            onTree={() => setTreeFor(a)}
          />
        ))}
      </div>

      {addOpen && (
        <NewAgencyModal onClose={() => setAddOpen(false)} onCreate={handleCreateAgency} />
      )}

      {whiteLabelFor && (
        <WhiteLabelModal
          agency={whiteLabelFor}
          onClose={() => setWhiteLabelFor(null)}
          onSave={(patch) => handleSaveWhiteLabel(whiteLabelFor.id, patch)}
        />
      )}

      {treeFor && (
        <UserTreeModal
          agency={treeFor}
          onClose={() => setTreeFor(null)}
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

function AgencyCard({
  agency,
  onConfigure,
  onTree,
}: {
  agency: Agency;
  onConfigure: () => void;
  onTree: () => void;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-neon-400/40 dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none dark:hover:border-neon-400/40">
      <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-neon-400/5 blur-3xl transition-opacity group-hover:bg-neon-400/15" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 ring-1 ring-white/10 dark:from-[#272732] dark:to-[#14141A]">
          {agency.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency.name}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="text-base font-bold text-white">{getInitials(agency.name)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neon-600 dark:text-neon-300">
            Agência Parceira
          </p>
          <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
            {agency.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500 dark:text-slate-400">
            <Globe className="h-3 w-3 flex-shrink-0" />
            {agency.domain || '—'}
          </p>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-gray-200 pt-4 dark:border-white/5">
        <CardStat
          icon={<Users className="h-3.5 w-3.5" />}
          label="Afiliados Ativos"
          value={formatInt(agency.affiliates_count)}
        />
        <CardStat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="FTDs Totais"
          value={formatInt(agency.total_ftd_generated)}
          neon
        />
      </div>

      <p className="relative mt-3 text-[11px] text-gray-500 dark:text-slate-400">
        Criada em{' '}
        <span className="font-semibold text-gray-700 dark:text-slate-200">
          {formatDate(agency.created_at)}
        </span>
      </p>

      <div className="relative mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={onConfigure}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-neon-300"
        >
          <Settings2 className="h-3.5 w-3.5" />
          White-Label
        </button>
        <button
          onClick={onTree}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-neon-300"
        >
          <Network className="h-3.5 w-3.5" />
          Árvore de Usuários
        </button>
      </div>
    </div>
  );
}

function CardStat({
  icon,
  label,
  value,
  neon = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  neon?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 dark:border-white/5 dark:bg-white/[0.03]">
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
        {icon}
        {label}
      </span>
      <p
        className={`mt-1 text-lg font-extrabold tabular-nums ${
          neon
            ? 'text-neon-600 dark:text-neon-300 dark:drop-shadow-[0_0_10px_rgba(57,255,20,0.35)]'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function NewAgencyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (payload: { name: string; owner_email: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const disabled = !name.trim() || !email.trim();
  return (
    <Modal
      onClose={onClose}
      title="Nova Agência"
      subtitle="Cadastre uma nova agência parceira na plataforma."
      icon={<Building2 className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <Field label="Nome da Agência">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Agência Tubarões Media"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </Field>
        <Field label="E-mail do Responsável">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="responsavel@agencia.com"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
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
          onClick={() => onCreate({ name, owner_email: email })}
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Plus className="h-4 w-4" />
          Criar agência
        </button>
      </div>
    </Modal>
  );
}

function WhiteLabelModal({
  agency,
  onClose,
  onSave,
}: {
  agency: Agency;
  onClose: () => void;
  onSave: (patch: { domain: string; logo_url: string | null }) => void;
}) {
  const [domain, setDomain] = useState(agency.domain);
  const [logo, setLogo] = useState<string | null>(agency.logo_url);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      onClose={onClose}
      title="Configuração White-Label"
      subtitle={agency.name}
      icon={<Settings2 className="h-4 w-4" />}
      wide
    >
      <div className="space-y-5">
        <Field label="Domínio Personalizado">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus-within:border-neon-400/50 focus-within:ring-2 focus-within:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70">
            <Globe className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-slate-500" />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="afiliados.agencia.com"
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
            Este domínio será usado pelos afiliados desta rede para acessar o painel.
          </p>
        </Field>

        <Field label="Logo Personalizada">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) readFile(f);
            }}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
              dragOver
                ? 'border-neon-400 bg-neon-400/5'
                : 'border-gray-300 bg-gray-50 hover:border-neon-400/60 hover:bg-neon-400/5 dark:border-white/10 dark:bg-white/[0.03]'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f);
              }}
              className="hidden"
            />
            {logo ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 dark:bg-[#14141A] dark:ring-white/10">
                  <img src={logo} alt="Logo" className="h-full w-full object-contain p-2" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      fileRef.current?.click();
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-neon-300"
                  >
                    Trocar imagem
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLogo(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-transparent px-3 py-1.5 text-[11px] font-semibold text-rose-500 transition hover:bg-rose-500/10 dark:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Arraste a logo ou clique para selecionar
                </p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  PNG, JPG ou SVG · máx. 2 MB
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-500">
                  <ImageIcon className="h-3 w-3" />
                  Substitui a logo da Mansão Green para os usuários desta rede
                </span>
              </>
            )}
          </label>
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
          onClick={() => onSave({ domain, logo_url: logo })}
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300"
        >
          <Check className="h-4 w-4" />
          Salvar Personalização
        </button>
      </div>
    </Modal>
  );
}

function UserTreeModal({
  agency,
  onClose,
}: {
  agency: Agency;
  onClose: () => void;
}) {
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [sort, setSort] = useState<'date' | 'performance'>('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('admin_users')
        .select('id, name, email, role, parent_agency, total_ftds, created_at')
        .or(`parent_agency.eq.${agency.name},name.eq.${agency.name}`);
      if (data) setMembers(data as TreeMember[]);
      setLoading(false);
    })();
  }, [agency.name]);

  const owner = useMemo(
    () =>
      members.find((m) => m.name === agency.name && m.role === 'AGENCY') ?? {
        id: `owner-${agency.id}`,
        name: agency.name,
        email: agency.owner_email,
        role: 'AGENCY' as const,
        parent_agency: 'Nenhuma',
        total_ftds: agency.total_ftd_generated,
        created_at: agency.created_at,
      },
    [members, agency],
  );

  const compare = useMemo(
    () =>
      sort === 'date'
        ? (a: TreeMember, b: TreeMember) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : (a: TreeMember, b: TreeMember) => b.total_ftds - a.total_ftds,
    [sort],
  );

  const managers = useMemo(
    () => members.filter((m) => m.role === 'MANAGER').sort(compare),
    [members, compare],
  );

  const directAffiliates = useMemo(
    () =>
      members
        .filter((m) => m.role === 'AFFILIATE' && m.parent_agency === agency.name)
        .sort(compare),
    [members, compare, agency.name],
  );

  const subsByAffiliate = useMemo(() => {
    const map: Record<string, TreeMember[]> = {};
    members
      .filter((m) => m.role === 'SUB_AFFILIATE')
      .sort(compare)
      .forEach((m) => {
        const key = m.parent_agency;
        if (!map[key]) map[key] = [];
        map[key].push(m);
      });
    return map;
  }, [members, compare]);

  return (
    <Modal
      onClose={onClose}
      title="Árvore de Usuários"
      subtitle={agency.name}
      icon={<Network className="h-4 w-4" />}
      wide
      xwide
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
          <Filter className="h-3 w-3" /> Ordenar por
        </p>
        <div className="flex items-center gap-1.5 rounded-lg bg-white p-1 ring-1 ring-gray-200 dark:bg-[#14141A] dark:ring-white/5">
          <SortPill active={sort === 'date'} onClick={() => setSort('date')}>
            Data de Atribuição
          </SortPill>
          <SortPill active={sort === 'performance'} onClick={() => setSort('performance')}>
            Performance
          </SortPill>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500 dark:text-slate-400">
          Carregando hierarquia...
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          <TreeNode
            icon={<Crown className="h-4 w-4 text-amber-400" />}
            title={owner.name}
            subtitle={owner.email}
            date={owner.created_at}
            ftds={owner.total_ftds}
            roleTone="agency"
          >
            {managers.map((mg) => (
              <TreeNode
                key={mg.id}
                icon={<UserCog className="h-4 w-4 text-sky-400" />}
                title={mg.name}
                subtitle={mg.email}
                date={mg.created_at}
                ftds={mg.total_ftds}
                roleTone="manager"
              />
            ))}
            {directAffiliates.map((aff) => (
              <TreeNode
                key={aff.id}
                icon={<UserRound className="h-4 w-4 text-neon-400" />}
                title={aff.name}
                subtitle={aff.email}
                date={aff.created_at}
                ftds={aff.total_ftds}
                roleTone="affiliate"
              >
                {(subsByAffiliate[aff.name] ?? []).map((sub) => (
                  <TreeNode
                    key={sub.id}
                    icon={<Users className="h-4 w-4 text-slate-400" />}
                    title={sub.name}
                    subtitle={sub.email}
                    date={sub.created_at}
                    ftds={sub.total_ftds}
                    roleTone="sub"
                  />
                ))}
              </TreeNode>
            ))}
            {managers.length === 0 && directAffiliates.length === 0 && (
              <p className="ml-6 py-3 text-xs text-gray-500 dark:text-slate-400">
                Sem membros vinculados a esta agência ainda.
              </p>
            )}
          </TreeNode>
        </div>
      )}
    </Modal>
  );
}

function SortPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
        active
          ? 'bg-neon-400/15 text-neon-700 ring-1 ring-neon-400/30 dark:text-neon-300'
          : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

function TreeNode({
  icon,
  title,
  subtitle,
  date,
  ftds,
  roleTone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  date: string;
  ftds: number;
  roleTone: 'agency' | 'manager' | 'affiliate' | 'sub';
  children?: React.ReactNode;
}) {
  const toneMap = {
    agency: 'from-amber-400/15 to-amber-400/5 ring-amber-400/30',
    manager: 'from-sky-400/15 to-sky-400/5 ring-sky-400/30',
    affiliate: 'from-neon-400/15 to-neon-400/5 ring-neon-400/30',
    sub: 'from-slate-400/15 to-slate-400/5 ring-slate-400/30',
  };
  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-r px-3 py-2.5 ring-1 dark:border-transparent ${toneMap[roleTone]}`}
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900/70 ring-1 ring-white/10 dark:bg-black/50">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
          {subtitle && (
            <p className="truncate text-[11px] text-gray-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-3 text-[10px] uppercase tracking-wider">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 font-semibold text-gray-600 ring-1 ring-gray-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
            {formatDate(date)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-neon-400/10 px-2 py-0.5 font-bold text-neon-700 ring-1 ring-neon-400/30 dark:text-neon-300">
            {formatInt(ftds)} FTDs
          </span>
        </div>
      </div>
      {children && (
        <div className="mt-2 space-y-2 border-l border-dashed border-gray-300 pl-6 dark:border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  subtitle,
  icon,
  onClose,
  children,
  wide = false,
  xwide = false,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  xwide?: boolean;
}) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  const maxW = xwide ? 'max-w-3xl' : wide ? 'max-w-xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${maxW} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#14141A]`}
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-white/5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              {icon ?? <Shield className="h-4 w-4" />}
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
        <div className="px-5 py-5">{children}</div>
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
