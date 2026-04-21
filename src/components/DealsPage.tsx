import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Link2,
  Wallet,
  TrendingUp,
  Coins,
  Target,
  BadgeDollarSign,
  Trophy,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Deal } from '../lib/supabase';

const fallbackDeals: Deal[] = [
  {
    id: '1',
    name: 'SUPERBET',
    banner: '',
    logo: 'SB',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 1,
    logo_url: '',
    banner_color: 'from-red-950 via-slate-900 to-black',
    cpa_value: '200,00',
    rev_value: '25',
    deposito_min: '50,00',
    aposta_min: '50,00',
    additional_info: null,
  },
  {
    id: '2',
    name: 'Betfair',
    banner: '',
    logo: 'BF',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 2,
    logo_url: '',
    banner_color: 'from-yellow-900 via-slate-900 to-black',
    cpa_value: '100,00',
    rev_value: null,
    deposito_min: '10,00',
    aposta_min: '10,00',
    additional_info: null,
  },
  {
    id: '3',
    name: 'novibet',
    banner: '',
    logo: 'NB',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 3,
    logo_url: '',
    banner_color: 'from-emerald-900 via-slate-900 to-black',
    cpa_value: '300,00',
    rev_value: '25',
    deposito_min: '20,00',
    aposta_min: '5,00',
    additional_info: {
      title: 'CPA PROGRESSIVO',
      tiers: [
        { giros: '1º Giro', comissao: 'R$ 35,00' },
        { giros: '2º Giro', comissao: 'R$ 300,00' },
        { giros: '3º Giro', comissao: 'R$ 1.200,00' },
      ],
    },
  },
  {
    id: '4',
    name: 'ESPORTIVA BET',
    banner: '',
    logo: 'EB',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 4,
    logo_url: '',
    banner_color: 'from-blue-950 via-slate-900 to-black',
    cpa_value: '100,00',
    rev_value: '25',
    deposito_min: '30,00',
    aposta_min: '30,00',
    additional_info: null,
  },
  {
    id: '5',
    name: 'BET MGM',
    banner: '',
    logo: 'MG',
    baseline: '',
    cpa: '',
    revshare: '',
    sort_order: 5,
    logo_url: '',
    banner_color: 'from-amber-900 via-slate-900 to-black',
    cpa_value: '180,00',
    rev_value: '25',
    deposito_min: '30,00',
    aposta_min: '30,00',
    additional_info: null,
  },
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(fallbackDeals);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length) setDeals(data as Deal[]);
    })();
  }, []);

  const go = (i: number) => {
    setCurrentIndex(((i % deals.length) + deals.length) % deals.length);
    setAnimKey((k) => k + 1);
  };

  const nextDeal = () => go(currentIndex + 1);
  const prevDeal = () => go(currentIndex - 1);

  const deal = deals[currentIndex];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-400/10 text-neon-400 ring-1 ring-neon-400/30 shadow-[0_0_18px_rgba(57,255,20,0.2)]">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Deals Disponíveis
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Escolha a casa de apostas e solicite sua afiliação.
          </p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-3xl">
        <button
          onClick={prevDeal}
          aria-label="Deal anterior"
          className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-900/90 p-3 text-slate-300 shadow-lg backdrop-blur transition hover:border-neon-400/50 hover:text-neon-300 hover:shadow-[0_0_22px_rgba(57,255,20,0.25)] sm:p-4"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          onClick={nextDeal}
          aria-label="Próximo deal"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 rounded-full border border-white/10 bg-slate-900/90 p-3 text-slate-300 shadow-lg backdrop-blur transition hover:border-neon-400/50 hover:text-neon-300 hover:shadow-[0_0_22px_rgba(57,255,20,0.25)] sm:p-4"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <DealCard key={animKey} deal={deal} />

        <div className="mt-6 flex items-center justify-center gap-2">
          {deals.map((d, i) => (
            <button
              key={d.id}
              onClick={() => go(i)}
              aria-label={`Ir para ${d.name}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-8 bg-neon-400 shadow-[0_0_10px_rgba(57,255,20,0.6)]'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
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

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#1E1E24] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out animate-[fadeIn_0.35s_ease-in-out]">
      <div className={`relative flex h-56 items-center justify-center sm:h-64 ${getBannerBg(deal.name)}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative z-10 flex h-full w-full items-center justify-center px-8">
          <BrandLogo deal={deal} />
        </div>
      </div>

      <div className="px-6 pb-8 pt-6 sm:px-10">
        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {deal.name}
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Casa parceira oficial da Mansão Green Affiliates.
        </p>

        {hasValidRev(deal.rev_value) ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricItem
              icon={<BadgeDollarSign className="h-4 w-4" />}
              label="Deal CPA"
              value={deal.cpa_value === 'Progressivo' ? 'Progressivo' : `R$ ${deal.cpa_value}`}
              highlight
            />
            <MetricItem
              icon={<TrendingUp className="h-4 w-4" />}
              label="Deal Rev"
              value={`${deal.rev_value}%`}
            />
            <MetricItem
              icon={<Coins className="h-4 w-4" />}
              label="Depósito Mín."
              value={`R$ ${deal.deposito_min}`}
            />
            <MetricItem
              icon={<Target className="h-4 w-4" />}
              label="Aposta Mín."
              value={`R$ ${deal.aposta_min}`}
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricItem
              icon={<BadgeDollarSign className="h-5 w-5" />}
              label="Deal CPA"
              value={deal.cpa_value === 'Progressivo' ? 'Progressivo' : `R$ ${deal.cpa_value}`}
              highlight
              large
            />
            <MetricItem
              icon={<Coins className="h-5 w-5" />}
              label="Depósito Mín."
              value={`R$ ${deal.deposito_min}`}
              large
            />
            <MetricItem
              icon={<Target className="h-5 w-5" />}
              label="Aposta Mín."
              value={`R$ ${deal.aposta_min}`}
              large
            />
          </div>
        )}

        {deal.additional_info && (
          <div className="mt-6 rounded-2xl border border-neon-400/20 bg-gradient-to-br from-neon-400/5 to-transparent p-5">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-neon-300" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neon-300">
                {deal.additional_info.title}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {deal.additional_info.tiers.map((tier) => (
                <div
                  key={tier.giros}
                  className="rounded-xl border border-white/5 bg-slate-900/60 p-3 text-center"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {tier.giros}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">{tier.comissao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(57,255,20,0.35)] transition-all duration-200 hover:bg-neon-300 hover:shadow-[0_0_36px_rgba(57,255,20,0.55)]">
          <Link2 className="h-4 w-4" />
          Solicitar Afiliação
        </button>
      </div>
    </div>
  );
}

function hasValidRev(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-' || trimmed.toUpperCase() === 'N/A') return false;
  return true;
}

function MetricItem({
  icon,
  label,
  value,
  highlight = false,
  large = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border transition ${
        large ? 'px-5 py-5' : 'px-4 py-4'
      } ${
        highlight
          ? 'border-neon-400/30 bg-neon-400/5'
          : 'border-white/5 bg-slate-800/60'
      }`}
    >
      <div
        className={`flex items-center gap-1.5 ${
          highlight ? 'text-neon-300' : 'text-slate-400'
        }`}
      >
        {icon}
        <p
          className={`font-semibold uppercase tracking-[0.18em] ${
            large ? 'text-[11px]' : 'text-[10px]'
          }`}
        >
          {label}
        </p>
      </div>
      <p
        className={`mt-2 font-bold leading-tight ${
          large ? 'text-lg sm:text-xl' : 'text-base'
        } ${highlight ? 'text-neon-300' : 'text-white'}`}
      >
        {value}
      </p>
    </div>
  );
}

function getBannerBg(rawName: string): string {
  const name = rawName.toUpperCase();
  switch (name) {
    case 'SUPERBET':
      return 'bg-white';
    case 'BETFAIR':
      return 'bg-[#FFB80C]';
    case 'NOVIBET':
      return 'bg-[#141B33]';
    case 'BET MGM':
      return 'bg-[#0B0B0B]';
    case 'ESPORTIVA BET':
      return 'bg-gradient-to-br from-blue-950 via-slate-900 to-black';
    default:
      return 'bg-gradient-to-br from-slate-900 via-slate-900 to-black';
  }
}

function BrandLogo({ deal }: { deal: Deal }) {
  const name = deal.name.toUpperCase();

  if (name === 'BET MGM') {
    return (
      <img
        src="/BETMGM-Logo-Stylish-Presentation-PNG.png"
        alt="BetMGM"
        className="max-h-40 w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] sm:max-h-48"
      />
    );
  }

  if (name === 'SUPERBET') {
    return (
      <img
        src="/superbet-logo-0.png"
        alt="Superbet"
        className="max-h-44 w-auto object-contain sm:max-h-52"
      />
    );
  }

  if (name === 'BETFAIR') {
    return (
      <img
        src="/betfair-logo-0-1536x1536.png"
        alt="betfair"
        className="max-h-44 w-auto object-contain sm:max-h-52"
      />
    );
  }

  if (name === 'NOVIBET') {
    return (
      <img
        src="/novibet-seeklogo.png"
        alt="novibet"
        className="max-h-52 w-auto object-contain sm:max-h-60"
      />
    );
  }

  if (name === 'ESPORTIVA BET' || name === 'ESPORTIVABET' || name === 'ESPORTIVA') {
    return (
      <img
        src="/ESPORTIVA_PNG.png"
        alt="EsportivaBet"
        className="max-h-44 w-auto object-contain sm:max-h-52"
      />
    );
  }

  const styles: Record<string, { text: string; label: string; font: string }> = {
    SUPERBET: { text: 'text-white', label: 'superbet', font: 'font-black italic tracking-tight' },
    BETFAIR: { text: 'text-[#FFB80C]', label: 'betfair', font: 'font-extrabold tracking-tight' },
    NOVIBET: { text: 'text-white', label: 'novibet', font: 'font-extrabold lowercase tracking-tight' },
    'ESPORTIVA BET': { text: 'text-white', label: 'esportiva', font: 'font-black tracking-tight' },
  };

  const s = styles[name] ?? { text: 'text-neon-300', label: deal.logo, font: 'font-extrabold' };

  return (
    <span className={`${s.text} ${s.font} text-4xl leading-none drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)] sm:text-5xl`}>
      {s.label}
    </span>
  );
}
