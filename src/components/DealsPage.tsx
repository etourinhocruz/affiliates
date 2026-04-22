import { useEffect, useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
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
  badges: { label: string; icon: typeof Flame; tone: BadgeTone }[];
};

const brandConfig: Record<string, BrandConfig> = {
  SUPERBET: {
    badges: [
      { label: 'Top Conversão', icon: Flame, tone: 'rose' },
      { label: 'Gamificação', icon: Gamepad2, tone: 'neon' },
    ],
  },
  BETFAIR: {
    badges: [
      { label: 'Clássico Premium', icon: Trophy, tone: 'amber' },
      { label: 'Alta Retenção', icon: TrendingUp, tone: 'neon' },
    ],
  },
  NOVIBET: {
    badges: [
      { label: 'CPA Progressivo', icon: Zap, tone: 'neon' },
      { label: 'Alto Payout', icon: Sparkles, tone: 'teal' },
    ],
  },
  'BET MGM': {
    badges: [
      { label: 'Marca Global', icon: Trophy, tone: 'amber' },
      { label: 'Cassino Ao Vivo', icon: Sparkles, tone: 'sky' },
    ],
  },
  'ESPORTIVA BET': {
    badges: [
      { label: 'Mobile First', icon: Zap, tone: 'sky' },
      { label: 'Alta FTD', icon: Flame, tone: 'rose' },
    ],
  },
};

const defaultBrand: BrandConfig = {
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
];

export default function DealsPage() {
  const { user } = useUser();
  const [deals, setDeals] = useState<Deal[]>(fallbackDeals);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [animKey, setAnimKey] = useState(0);
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

  const go = (next: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrentIndex(((next % deals.length) + deals.length) % deals.length);
    setAnimKey((k) => k + 1);
  };

  const nextDeal = () => go(currentIndex + 1, 1);
  const prevDeal = () => go(currentIndex - 1, -1);

  const deal = deals[currentIndex];

  const requestDeal = async () => {
    if (!deal || requested.has(deal.id) || pending.has(deal.id)) return;
    setPending((p) => new Set(p).add(deal.id));
    const { error } = await supabase.from('deal_requests').insert({
      user_email: user.email,
      deal_id: deal.id,
      status: 'pending',
    });
    setPending((p) => {
      const n = new Set(p);
      n.delete(deal.id);
      return n;
    });
    if (!error) setRequested((prev) => new Set(prev).add(deal.id));
  };

  return (
    <div className="pb-12">
      <div className="mb-10 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-400/10 text-neon-400 ring-1 ring-neon-400/30 shadow-[0_0_18px_rgba(57,255,20,0.2)]">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Deals Disponíveis
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Escolha a casa de apostas e solicite sua afiliação.
          </p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        <button
          onClick={prevDeal}
          aria-label="Deal anterior"
          className="absolute left-0 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-slate-300 shadow-lg backdrop-blur-lg transition-all duration-300 hover:-translate-x-[calc(50%+2px)] hover:border-neon-400/50 hover:bg-black/70 hover:text-neon-300 hover:shadow-[0_0_22px_rgba(57,255,20,0.3)] sm:p-3.5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextDeal}
          aria-label="Próximo deal"
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-slate-300 shadow-lg backdrop-blur-lg transition-all duration-300 hover:translate-x-[calc(50%+2px)] hover:border-neon-400/50 hover:bg-black/70 hover:text-neon-300 hover:shadow-[0_0_22px_rgba(57,255,20,0.3)] sm:p-3.5"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="overflow-hidden rounded-3xl">
          <DealCard
            key={animKey}
            deal={deal}
            direction={direction}
            isRequested={requested.has(deal.id)}
            isPending={pending.has(deal.id)}
            onRequest={requestDeal}
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {deals.map((d, i) => (
            <button
              key={d.id}
              onClick={() => go(i, i > currentIndex ? 1 : -1)}
              aria-label={`Ir para ${d.name}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-8 bg-neon-400 shadow-[0_0_10px_rgba(57,255,20,0.6)]'
                  : 'w-1.5 bg-slate-700/80 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          {currentIndex + 1} de {deals.length}
        </p>
      </div>
    </div>
  );
}

function DealCard({
  deal,
  direction,
  isRequested,
  isPending,
  onRequest,
}: {
  deal: Deal;
  direction: 1 | -1;
  isRequested: boolean;
  isPending: boolean;
  onRequest: () => void;
}) {
  const key = deal.name.toUpperCase();
  const brand = useMemo(() => brandConfig[key] ?? defaultBrand, [key]);

  const enterClass = direction === 1 ? 'animate-slide-in-right' : 'animate-slide-in-left';

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border border-white/5 bg-[#1E1E24]/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl ${enterClass}`}
    >
      <div className="relative flex h-56 items-center justify-center overflow-hidden sm:h-64">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
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

        <div className="relative z-10 flex h-full w-full items-center justify-center px-10">
          <BrandLogo deal={deal} />
        </div>
      </div>

      <div className="px-6 pb-7 pt-6 sm:px-8">
        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
          {deal.name}
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Casa parceira oficial da Mansão Green Affiliates.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

        <div className="mt-7">
          <ActionButton
            requested={isRequested}
            pending={isPending}
            onClick={onRequest}
          />
        </div>
      </div>
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
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-md transition-colors duration-300 hover:border-white/20">
      <div
        className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
          highlight ? 'text-neon-300/80' : 'text-slate-400'
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={`mt-1.5 text-base font-extrabold leading-none sm:text-[17px] ${
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-3.5 text-sm font-semibold text-amber-300"
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
      className="group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-neon-400/50 bg-gradient-to-b from-neon-300 via-neon-400 to-neon-600 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_10px_28px_-10px_rgba(57,255,20,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-300 hover:shadow-[0_14px_36px_-10px_rgba(57,255,20,0.7),0_0_28px_rgba(57,255,20,0.5),inset_0_1px_0_rgba(255,255,255,0.45)] disabled:cursor-not-allowed disabled:opacity-80"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
      <Link2 className="h-4 w-4" />
      {pending ? 'Enviando...' : 'Solicitar Afiliação'}
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
        className="max-h-36 w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] sm:max-h-44"
      />
    );
  }
  if (name === 'SUPERBET') {
    return (
      <img
        src="/superbet-logo-0.png"
        alt="Superbet"
        className="max-h-32 w-auto object-contain drop-shadow-[0_10px_24px_rgba(220,38,38,0.35)] sm:max-h-40"
      />
    );
  }
  if (name === 'BETFAIR') {
    return (
      <img
        src="/betfair-logo-0-1536x1536.png"
        alt="betfair"
        className="max-h-32 w-auto object-contain drop-shadow-[0_10px_24px_rgba(255,184,12,0.3)] sm:max-h-40"
      />
    );
  }
  if (name === 'NOVIBET') {
    return (
      <img
        src="/novibet-seeklogo.png"
        alt="novibet"
        className="max-h-40 w-auto object-contain drop-shadow-[0_10px_24px_rgba(16,185,129,0.4)] sm:max-h-48"
      />
    );
  }
  if (name === 'ESPORTIVA BET') {
    return (
      <img
        src="/ESPORTIVA_PNG.png"
        alt="EsportivaBet"
        className="max-h-32 w-auto object-contain drop-shadow-[0_10px_24px_rgba(59,130,246,0.35)] sm:max-h-40"
      />
    );
  }

  return (
    <span className="text-4xl font-black tracking-tight text-white drop-shadow-[0_8px_24px_rgba(57,255,20,0.4)] sm:text-5xl">
      {deal.name}
    </span>
  );
}
