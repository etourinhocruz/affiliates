import { useEffect, useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  CheckCircle2,
  Coins,
  Flame,
  Gamepad2,
  Hourglass,
  Link2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Deal } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

type BadgeTone = 'neon' | 'amber' | 'sky' | 'rose' | 'teal';

type BrandConfig = {
  bg: string;
  glow: string;
  ring: string;
  badges: { label: string; icon: typeof Flame; tone: BadgeTone }[];
};

const brandConfig: Record<string, BrandConfig> = {
  SUPERBET: {
    bg: 'bg-[radial-gradient(circle_at_50%_40%,rgba(220,38,38,0.28),rgba(15,15,18,0.95)_65%,#09090B_100%)]',
    glow: 'hover:shadow-[0_24px_60px_-20px_rgba(220,38,38,0.55),0_0_36px_rgba(220,38,38,0.18)]',
    ring: 'hover:border-red-400/50',
    badges: [
      { label: 'Top Conversão', icon: Flame, tone: 'rose' },
      { label: 'Gamificação', icon: Gamepad2, tone: 'neon' },
    ],
  },
  BETFAIR: {
    bg: 'bg-[radial-gradient(circle_at_50%_40%,rgba(255,184,12,0.24),rgba(15,15,18,0.95)_65%,#09090B_100%)]',
    glow: 'hover:shadow-[0_24px_60px_-20px_rgba(255,184,12,0.5),0_0_34px_rgba(255,184,12,0.18)]',
    ring: 'hover:border-amber-300/50',
    badges: [
      { label: 'Clássico Premium', icon: Trophy, tone: 'amber' },
      { label: 'Alta Retenção', icon: TrendingUp, tone: 'neon' },
    ],
  },
  NOVIBET: {
    bg: 'bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.22),rgba(15,15,18,0.95)_65%,#09090B_100%)]',
    glow: 'hover:shadow-[0_24px_60px_-20px_rgba(16,185,129,0.55),0_0_34px_rgba(16,185,129,0.2)]',
    ring: 'hover:border-emerald-400/50',
    badges: [
      { label: 'CPA Progressivo', icon: Zap, tone: 'neon' },
      { label: 'Alto Payout', icon: Sparkles, tone: 'teal' },
    ],
  },
  'BET MGM': {
    bg: 'bg-[radial-gradient(circle_at_50%_40%,rgba(250,204,21,0.22),rgba(20,20,20,0.95)_60%,#060606_100%)]',
    glow: 'hover:shadow-[0_24px_60px_-20px_rgba(250,204,21,0.5),0_0_36px_rgba(250,204,21,0.18)]',
    ring: 'hover:border-yellow-300/50',
    badges: [
      { label: 'Marca Global', icon: Trophy, tone: 'amber' },
      { label: 'Cassino Ao Vivo', icon: Sparkles, tone: 'sky' },
    ],
  },
  'ESPORTIVA BET': {
    bg: 'bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.22),rgba(15,15,18,0.95)_65%,#09090B_100%)]',
    glow: 'hover:shadow-[0_24px_60px_-20px_rgba(59,130,246,0.5),0_0_34px_rgba(59,130,246,0.18)]',
    ring: 'hover:border-sky-400/50',
    badges: [
      { label: 'Mobile First', icon: Zap, tone: 'sky' },
      { label: 'Alta FTD', icon: Flame, tone: 'rose' },
    ],
  },
  KTO: {
    bg: 'bg-[radial-gradient(circle_at_50%_40%,rgba(57,255,20,0.2),rgba(15,15,18,0.95)_65%,#09090B_100%)]',
    glow: 'hover:shadow-[0_24px_60px_-20px_rgba(57,255,20,0.55),0_0_34px_rgba(57,255,20,0.22)]',
    ring: 'hover:border-neon-400/50',
    badges: [
      { label: 'Novo no Programa', icon: Sparkles, tone: 'neon' },
      { label: 'Comissão Elevada', icon: TrendingUp, tone: 'amber' },
    ],
  },
};

const defaultBrand: BrandConfig = {
  bg: 'bg-[radial-gradient(circle_at_50%_40%,rgba(57,255,20,0.14),rgba(15,15,18,0.95)_65%,#09090B_100%)]',
  glow: 'hover:shadow-[0_24px_60px_-20px_rgba(57,255,20,0.45)]',
  ring: 'hover:border-neon-400/50',
  badges: [{ label: 'Parceiro Oficial', icon: Sparkles, tone: 'neon' }],
};

const toneMap: Record<BadgeTone, string> = {
  neon: 'border-neon-400/40 bg-neon-400/10 text-neon-300',
  amber: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  sky: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  rose: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
  teal: 'border-teal-400/40 bg-teal-400/10 text-teal-200',
};

const fallbackDeals: Deal[] = [
  {
    id: 'superbet',
    name: 'SUPERBET',
    banner: '',
    logo: 'SB',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 1,
    logo_url: '',
    banner_color: '',
    cpa_value: '200,00',
    rev_value: '25',
    deposito_min: '50,00',
    aposta_min: '50,00',
    additional_info: null,
  },
  {
    id: 'betmgm',
    name: 'BET MGM',
    banner: '',
    logo: 'MG',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 2,
    logo_url: '',
    banner_color: '',
    cpa_value: '180,00',
    rev_value: '25',
    deposito_min: '30,00',
    aposta_min: '30,00',
    additional_info: null,
  },
  {
    id: 'betfair',
    name: 'Betfair',
    banner: '',
    logo: 'BF',
    baseline: '',
    cpa: '',
    revshare: '30',
    sort_order: 3,
    logo_url: '',
    banner_color: '',
    cpa_value: '100,00',
    rev_value: '30',
    deposito_min: '10,00',
    aposta_min: '10,00',
    additional_info: null,
  },
  {
    id: 'novibet',
    name: 'novibet',
    banner: '',
    logo: 'NB',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 4,
    logo_url: '',
    banner_color: '',
    cpa_value: '300,00',
    rev_value: '25',
    deposito_min: '20,00',
    aposta_min: '5,00',
    additional_info: null,
  },
  {
    id: 'esportivabet',
    name: 'ESPORTIVA BET',
    banner: '',
    logo: 'EB',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 5,
    logo_url: '',
    banner_color: '',
    cpa_value: '100,00',
    rev_value: '25',
    deposito_min: '30,00',
    aposta_min: '30,00',
    additional_info: null,
  },
  {
    id: 'kto',
    name: 'KTO',
    banner: '',
    logo: 'KT',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 6,
    logo_url: '',
    banner_color: '',
    cpa_value: '220,00',
    rev_value: '30',
    deposito_min: '20,00',
    aposta_min: '10,00',
    additional_info: null,
  },
];

export default function DealsPage() {
  const { user } = useUser();
  const [deals, setDeals] = useState<Deal[]>(fallbackDeals);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length) setDeals(data as Deal[]);
    })();
  }, []);

  useEffect(() => {
    if (!user.email) return;
    (async () => {
      const { data } = await supabase
        .from('deal_requests')
        .select('deal_id')
        .eq('user_email', user.email);
      if (data) setRequested(new Set(data.map((r) => String(r.deal_id))));
    })();
  }, [user.email]);

  const requestDeal = async (deal: Deal) => {
    if (requested.has(deal.id) || pending.has(deal.id)) return;
    setPending((p) => new Set(p).add(deal.id));
    const { error } = await supabase.from('deal_requests').insert({
      user_email: user.email,
      deal_id: deal.id,
      status: 'pending',
    });
    setPending((p) => {
      const next = new Set(p);
      next.delete(deal.id);
      return next;
    });
    if (!error) {
      setRequested((prev) => new Set(prev).add(deal.id));
    }
  };

  return (
    <div className="pb-12">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-400/10 text-neon-400 ring-1 ring-neon-400/30 shadow-[0_0_18px_rgba(57,255,20,0.2)]">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Deals Disponíveis
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Marketplace Elite — escolha a casa, solicite sua afiliação e comece
              a converter.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white/80 px-4 py-2.5 text-xs backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.03]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-400/15 text-neon-500 ring-1 ring-neon-400/30 dark:text-neon-300">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-slate-400">
              Catálogo
            </p>
            <p className="font-bold text-gray-900 dark:text-white">
              {deals.length} casas ativas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal, i) => (
          <DealCard
            key={deal.id}
            deal={deal}
            delay={i * 60}
            isRequested={requested.has(deal.id)}
            isPending={pending.has(deal.id)}
            onRequest={() => requestDeal(deal)}
          />
        ))}
      </div>
    </div>
  );
}

function DealCard({
  deal,
  delay,
  isRequested,
  isPending,
  onRequest,
}: {
  deal: Deal;
  delay: number;
  isRequested: boolean;
  isPending: boolean;
  onRequest: () => void;
}) {
  const key = deal.name.toUpperCase();
  const brand = useMemo(
    () => brandConfig[key] ?? defaultBrand,
    [key],
  );

  return (
    <article
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex animate-rise flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#1E1E24]/95 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-neon-400/40 ${brand.glow} ${brand.ring}`}
    >
      {/* Banner */}
      <div className={`relative flex h-32 items-center justify-center overflow-hidden ${brand.bg}`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {brand.badges.map((b) => {
            const Ico = b.icon;
            return (
              <span
                key={b.label}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${toneMap[b.tone]}`}
              >
                <Ico className="h-3 w-3" />
                {b.label}
              </span>
            );
          })}
        </div>

        <div className="relative z-10 flex h-full w-full items-center justify-center px-10 py-6">
          <BrandLogo deal={deal} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <h3 className="text-lg font-bold tracking-tight text-white">
          {deal.name}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Casa parceira oficial da Mansão Green Affiliates.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Metric
            icon={<BadgeDollarSign className="h-3.5 w-3.5" />}
            label="Deal CPA"
            value={
              deal.cpa_value === 'Progressivo'
                ? 'Progressivo'
                : `R$ ${deal.cpa_value}`
            }
            highlight
          />
          <Metric
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Deal Rev"
            value={hasValidRev(deal.rev_value) ? `${deal.rev_value}%` : '—'}
            muted={!hasValidRev(deal.rev_value)}
          />
          <Metric
            icon={<Coins className="h-3.5 w-3.5" />}
            label="Dep. Mín."
            value={`R$ ${deal.deposito_min}`}
          />
          <Metric
            icon={<Target className="h-3.5 w-3.5" />}
            label="Aposta Mín."
            value={`R$ ${deal.aposta_min}`}
          />
        </div>

        <div className="mt-auto pt-6">
          <ActionButton
            requested={isRequested}
            pending={isPending}
            onClick={onRequest}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-400/0 to-transparent transition-all duration-500 group-hover:via-neon-400/60" />
    </article>
  );
}

function Metric({
  icon,
  label,
  value,
  highlight = false,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 transition-colors duration-300 ${
        highlight
          ? 'border-neon-400/25 bg-neon-400/[0.06]'
          : 'border-white/5 bg-white/[0.03]'
      }`}
    >
      <div
        className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
          highlight ? 'text-neon-300/80' : 'text-slate-500'
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={`mt-1 text-[15px] font-extrabold leading-none ${
          muted
            ? 'text-slate-500'
            : highlight
              ? 'text-neon-300 drop-shadow-[0_0_10px_rgba(57,255,20,0.35)]'
              : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  requested,
  pending,
  onClick,
}: {
  requested: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  if (requested) {
    return (
      <button
        disabled
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300 opacity-90"
      >
        <Hourglass className="h-4 w-4" />
        Em Análise
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-neon-400/50 bg-gradient-to-b from-neon-300 via-neon-400 to-neon-600 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_10px_28px_-10px_rgba(57,255,20,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-300 hover:shadow-[0_14px_36px_-10px_rgba(57,255,20,0.7),0_0_28px_rgba(57,255,20,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] disabled:cursor-not-allowed disabled:opacity-80"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
      {pending ? (
        <>
          <CheckCircle2 className="h-4 w-4 animate-pulse" />
          Enviando...
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          Solicitar Afiliação
        </>
      )}
    </button>
  );
}

function hasValidRev(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-' || trimmed.toUpperCase() === 'N/A')
    return false;
  return true;
}

function BrandLogo({ deal }: { deal: Deal }) {
  const name = deal.name.toUpperCase();

  if (name === 'BET MGM') {
    return (
      <img
        src="/BETMGM-Logo-Stylish-Presentation-PNG.png"
        alt="BetMGM"
        className="max-h-20 w-auto object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)]"
      />
    );
  }
  if (name === 'SUPERBET') {
    return (
      <img
        src="/superbet-logo-0.png"
        alt="Superbet"
        className="max-h-16 w-auto object-contain drop-shadow-[0_6px_18px_rgba(220,38,38,0.35)]"
      />
    );
  }
  if (name === 'BETFAIR') {
    return (
      <img
        src="/betfair-logo-0-1536x1536.png"
        alt="betfair"
        className="max-h-16 w-auto object-contain drop-shadow-[0_6px_16px_rgba(255,184,12,0.35)]"
      />
    );
  }
  if (name === 'NOVIBET') {
    return (
      <img
        src="/novibet-seeklogo.png"
        alt="novibet"
        className="max-h-24 w-auto object-contain drop-shadow-[0_8px_18px_rgba(16,185,129,0.4)]"
      />
    );
  }
  if (name === 'ESPORTIVA BET') {
    return (
      <img
        src="/ESPORTIVA_PNG.png"
        alt="EsportivaBet"
        className="max-h-16 w-auto object-contain drop-shadow-[0_6px_16px_rgba(59,130,246,0.35)]"
      />
    );
  }

  return (
    <span className="text-3xl font-black tracking-tight text-white drop-shadow-[0_6px_20px_rgba(57,255,20,0.4)]">
      {deal.name}
    </span>
  );
}
