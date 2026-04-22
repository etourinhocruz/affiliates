import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  X,
  Check,
  Clock,
  XCircle,
  Copy,
  CheckCheck,
  Cloud,
  Building2,
  Search,
  Megaphone,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type CampaignStatus = 'Pendente' | 'Ativa' | 'Desativada';

type Campaign = {
  id: string;
  name: string;
  house: string;
  status: CampaignStatus;
  trackingLink: string;
  pixelUrl?: string;
  clicks: number;
  ftds: number;
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

const STATUS_TABS: { key: 'all' | CampaignStatus; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'Ativa', label: 'Ativas' },
  { key: 'Pendente', label: 'Pendentes' },
  { key: 'Desativada', label: 'Desativadas' },
];

const mockCampaigns: Campaign[] = [
  {
    id: 'c-001',
    name: 'TikTok Ads 01',
    house: 'Superbet',
    status: 'Ativa',
    trackingLink: 'https://go.superbet.com/?btag=mansaogreen-tkt01',
    clicks: 4820,
    ftds: 148,
  },
  {
    id: 'c-002',
    name: 'Instagram Bio',
    house: 'BetMGM',
    status: 'Ativa',
    trackingLink: 'https://track.betmgm.com/?ref=mansaogreen-igbio',
    clicks: 3210,
    ftds: 96,
  },
  {
    id: 'c-003',
    name: 'Telegram VIP',
    house: 'Novibet',
    status: 'Pendente',
    trackingLink: '',
    clicks: 0,
    ftds: 0,
  },
  {
    id: 'c-004',
    name: 'YouTube Review Canal Alpha',
    house: 'Betfair',
    status: 'Ativa',
    trackingLink: 'https://promo.betfair.com/aff?c=mgreen-ytalpha',
    clicks: 1840,
    ftds: 58,
  },
  {
    id: 'c-005',
    name: 'Facebook Ads Reels',
    house: 'EsportivaBet',
    status: 'Pendente',
    trackingLink: '',
    clicks: 0,
    ftds: 0,
  },
  {
    id: 'c-006',
    name: 'Blog SEO Apostas BR',
    house: 'Superbet',
    status: 'Desativada',
    trackingLink: '',
    clicks: 920,
    ftds: 12,
  },
];

type FormState = { house: string; name: string };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [statusTab, setStatusTab] = useState<'all' | CampaignStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length) {
        setCampaigns(
          data.map((r: Record<string, unknown>) => ({
            id: r.id as string,
            name: (r.name as string) ?? '',
            house: (r.house as string) ?? '',
            status: (r.status as CampaignStatus) ?? 'Pendente',
            trackingLink: (r.tracking_link as string) ?? '',
            pixelUrl: (r.pixel_url as string) ?? '',
            clicks: (r.clicks as number) ?? 0,
            ftds: (r.ftds as number) ?? 0,
          }))
        );
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (selectedHouse !== 'all' && c.house !== selectedHouse) return false;
      if (statusTab !== 'all' && c.status !== statusTab) return false;
      if (
        search &&
        !(
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.house.toLowerCase().includes(search.toLowerCase())
        )
      )
        return false;
      return true;
    });
  }, [campaigns, selectedHouse, statusTab, search]);

  const counts = useMemo(() => {
    const base = { all: campaigns.length, Ativa: 0, Pendente: 0, Desativada: 0 };
    campaigns.forEach((c) => {
      base[c.status] += 1;
    });
    return base;
  }, [campaigns]);

  const handleCreate = async (form: FormState) => {
    const newCampaign: Campaign = {
      id: `c-${Date.now()}`,
      name: form.name,
      house: form.house,
      status: 'Pendente',
      trackingLink: '',
      clicks: 0,
      ftds: 0,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userId) {
      await supabase.from('campaigns').insert({
        user_id: userId,
        name: form.name,
        house: form.house,
        status: 'Pendente',
        tracking_link: '',
        clicks: 0,
        ftds: 0,
      });
    }

    setModalOpen(false);
  };

  const handleCopy = async (c: Campaign) => {
    if (!c.trackingLink) return;
    try {
      await navigator.clipboard.writeText(c.trackingLink);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // noop
    }
  };

  return (
    <div className="pb-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Gerenciador de Campanhas
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Solicite novos links de rastreio e acompanhe o status de cada origem de tráfego.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="group inline-flex items-center gap-2 rounded-xl bg-neon-400 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_24px_rgba(57,255,20,0.35)] transition hover:bg-neon-300 hover:shadow-[0_0_30px_rgba(57,255,20,0.55)]"
        >
          <Plus className="h-4 w-4 transition group-hover:rotate-90" />
          Solicitar Campanha
        </button>
      </div>

      <div className="mb-5 -mx-1 overflow-x-auto px-1">
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

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-[#1E1E24]/70 p-1">
          {STATUS_TABS.map((t) => {
            const active = statusTab === t.key;
            const count = t.key === 'all' ? counts.all : counts[t.key as CampaignStatus];
            return (
              <button
                key={t.key}
                onClick={() => setStatusTab(t.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-neon-400 text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.3)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t.label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    active ? 'bg-black/20 text-slate-900' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <label className="relative inline-flex w-full max-w-sm items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar campanha..."
            className="w-full rounded-xl border border-white/10 bg-[#1E1E24] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-neon-400/50 focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#1E1E24]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 font-semibold">Campanha & Casa</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Link de Rastreio</th>
                <th className="px-3 py-3 font-semibold">Performance</th>
                <th className="px-5 py-3 text-right font-semibold">Material</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div className="rounded-2xl bg-neon-400/10 p-3 text-neon-300">
                        <Megaphone className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        Nenhuma campanha encontrada
                      </p>
                      <p className="text-xs text-slate-400">
                        Ajuste os filtros ou solicite uma nova campanha para começar a
                        rastrear seu tráfego.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const house = HOUSES.find((h) => h.key === c.house);
                const isActive = c.status === 'Ativa';
                return (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 text-slate-200 transition hover:bg-gray-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-white/10 ${
                            house?.bg ?? 'bg-slate-800'
                          }`}
                        >
                          {house?.logoUrl ? (
                            <img
                              src={house.logoUrl}
                              alt={house.name}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-[11px] font-bold text-white">
                              {house?.initials ?? c.house.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{c.name}</span>
                          <span className="text-xs text-slate-400">{c.house}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-3 py-4">
                      {isActive ? (
                        <div className="flex items-center gap-2">
                          <code className="max-w-[220px] truncate rounded-md bg-black/30 px-2 py-1 text-xs text-slate-300">
                            {c.trackingLink}
                          </code>
                          <button
                            onClick={() => handleCopy(c)}
                            className="inline-flex items-center gap-1 rounded-md border border-neon-400/30 bg-neon-400/10 px-2 py-1 text-xs font-semibold text-neon-300 transition hover:border-neon-400 hover:bg-neon-400/20"
                          >
                            {copiedId === c.id ? (
                              <>
                                <CheckCheck className="h-3.5 w-3.5" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs italic text-slate-500">
                            {c.status === 'Pendente'
                              ? 'Aguardando liberação...'
                              : 'Indisponível'}
                          </span>
                          <button
                            disabled
                            className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-white/5 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-600"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copiar
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Cliques
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {c.clicks.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-white/5" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            FTDs
                          </p>
                          <p className="text-sm font-semibold text-neon-300">{c.ftds}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        disabled={!isActive}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          isActive
                            ? 'border-white/10 bg-slate-800 text-slate-200 hover:border-neon-400/30 hover:bg-slate-700 hover:text-white'
                            : 'cursor-not-allowed border-white/5 bg-slate-900 text-slate-600'
                        }`}
                      >
                        <Cloud className="h-4 w-4" />
                        Criativos
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <RequestModal onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  if (status === 'Ativa') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-400/30 bg-neon-400/10 px-2.5 py-1 text-[11px] font-semibold text-neon-300">
        <Check className="h-3 w-3" />
        Ativa
      </span>
    );
  }
  if (status === 'Pendente') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
        <Clock className="h-3 w-3" />
        Pendente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
      <XCircle className="h-3 w-3" />
      Desativada
    </span>
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

function RequestModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (form: FormState) => void;
}) {
  const [house, setHouse] = useState('');
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const [houseOpen, setHouseOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const valid = house.trim() !== '' && name.trim() !== '';
  const selected = HOUSES.find((h) => h.key === house);

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSubmit({ house, name: name.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#39FF14]/20 bg-[#14141A]/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_rgba(57,255,20,0.08)] backdrop-blur-2xl animate-fade-in"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_-10%,rgba(57,255,20,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/40 to-transparent" />

        <div className="relative flex items-start justify-between px-7 pt-7 pb-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-400/10 ring-1 ring-neon-400/30 shadow-[0_0_18px_rgba(57,255,20,0.22)]">
              <Sparkles className="h-5 w-5 text-neon-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Solicitar Nova Campanha
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Crie um novo link de rastreio para uma de suas parcerias ativas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative space-y-5 px-7 pb-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Selecione a Casa de Aposta
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setHouseOpen((o) => !o)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-black/40 px-3 py-3 text-left text-sm text-white transition hover:border-white/20 ${
                  touched && !house
                    ? 'border-rose-400/50'
                    : houseOpen
                      ? 'border-neon-400/60 shadow-[0_0_0_4px_rgba(57,255,20,0.08)]'
                      : 'border-white/10'
                }`}
              >
                {selected ? (
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg ring-1 ring-white/10 ${selected.bg}`}
                    >
                      {selected.logoUrl ? (
                        <img
                          src={selected.logoUrl}
                          alt={selected.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-white">
                          {selected.initials}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold">{selected.name}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Escolha uma casa parceira ativa...</span>
                )}
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-slate-400 transition ${
                    houseOpen ? 'rotate-180 text-neon-300' : ''
                  }`}
                />
              </button>

              {houseOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#0F0F14]/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <ul className="max-h-64 overflow-y-auto py-1">
                    {HOUSES.map((h) => {
                      const isSel = h.key === house;
                      return (
                        <li key={h.key}>
                          <button
                            type="button"
                            onClick={() => {
                              setHouse(h.key);
                              setHouseOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-neon-400/10 ${
                              isSel ? 'bg-neon-400/10 text-neon-300' : 'text-slate-200'
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg ring-1 ring-white/10 ${h.bg}`}
                            >
                              {h.logoUrl ? (
                                <img
                                  src={h.logoUrl}
                                  alt={h.name}
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-white">
                                  {h.initials}
                                </span>
                              )}
                            </span>
                            <span className="flex-1 font-semibold">{h.name}</span>
                            {isSel && <Check className="h-4 w-4" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Nome da Campanha
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: TikTok Ads, Bio do Instagram"
              className={`w-full rounded-xl border bg-black/40 px-3 py-3 text-sm text-white placeholder:text-slate-500 transition focus:outline-none ${
                touched && !name
                  ? 'border-rose-400/50'
                  : 'border-white/10 focus:border-neon-400/60 focus:shadow-[0_0_0_4px_rgba(57,255,20,0.08)]'
              }`}
            />
          </div>
        </div>

        <div className="relative mt-6 flex items-center justify-end gap-3 border-t border-white/5 bg-black/20 px-7 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-xl bg-neon-400 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_24px_rgba(57,255,20,0.4)] transition hover:bg-neon-300 hover:shadow-[0_0_32px_rgba(57,255,20,0.6)]"
          >
            <Check className="h-4 w-4" />
            Confirmar Solicitação
          </button>
        </div>
      </div>
    </div>
  );
}
