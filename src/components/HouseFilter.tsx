import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';

export type HouseOption = {
  key: string;
  label: string;
  logoSrc?: string;
  fallbackSrc?: string;
  textFallback?: { text: string; cls: string };
};

const HOUSE_OPTIONS: HouseOption[] = [
  {
    key: 'all',
    label: 'Todas as Casas',
    logoSrc: '/logo-mansao.png',
    fallbackSrc: '/AFFILIATES_LOGO_PNG_(2).png',
  },
  {
    key: 'superbet',
    label: 'SuperBet',
    logoSrc: '/superbet.png',
    fallbackSrc: '/superbet-logo-0.png',
    textFallback: { text: 'superbet', cls: 'text-rose-400 italic font-black' },
  },
  {
    key: 'betmgm',
    label: 'BetMGM',
    logoSrc: '/betmgm.png',
    fallbackSrc: '/BETMGM-Logo-Stylish-Presentation-PNG.png',
    textFallback: { text: 'BetMGM', cls: 'text-amber-300 font-black' },
  },
  {
    key: 'esportivabet',
    label: 'EsportivaBet',
    logoSrc: '/esportivabet.png',
    fallbackSrc: '/ESPORTIVA_PNG.png',
    textFallback: { text: 'esportiva', cls: 'text-sky-300 font-black' },
  },
  {
    key: 'betfair',
    label: 'BetFair',
    logoSrc: '/betfair.png',
    fallbackSrc: '/betfair-logo-0-1536x1536.png',
    textFallback: { text: 'betfair', cls: 'text-amber-300 font-black' },
  },
  {
    key: 'novibet',
    label: 'NoviBet',
    logoSrc: '/novibet.png',
    fallbackSrc: '/novibet-seeklogo.png',
    textFallback: { text: 'novibet', cls: 'text-emerald-300 font-black' },
  },
];

export const HOUSE_FILTER_OPTIONS = HOUSE_OPTIONS;

type Props = {
  value: string;
  onChange: (key: string) => void;
  options?: HouseOption[];
};

export default function HouseFilter({ value, onChange, options = HOUSE_OPTIONS }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.key === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Casa ativa: ${selected.label}`}
        className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-slate-700 transition-all duration-200 hover:border-neon-400/40 hover:shadow-[0_0_16px_rgba(57,255,20,0.18)] dark:border-white/5 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
      >
        <HouseLogo option={selected} variant="trigger" />
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 md:inline">
          {selected.key === 'all' ? 'Geral' : selected.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform duration-300 dark:text-slate-400 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-200 dark:border-white/10 dark:bg-[#1E1E24]/95 dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0'
        }`}
        role="listbox"
      >
        <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Casa de Apostas
        </p>
        {options.map((opt) => {
          const active = opt.key === value;
          return (
            <button
              key={opt.key}
              role="option"
              aria-selected={active}
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                active
                  ? 'bg-neon-400/10 text-slate-900 dark:text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <HouseLogo option={opt} variant="menu" />
              <span className="flex-1 truncate">{opt.label}</span>
              {active && (
                <Check className="h-4 w-4 text-neon-500 dark:text-neon-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HouseLogo({
  option,
  variant,
}: {
  option: HouseOption;
  variant: 'trigger' | 'menu';
}) {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'text'>('primary');

  useEffect(() => {
    setStage('primary');
  }, [option.key]);

  const src =
    stage === 'primary'
      ? option.logoSrc
      : stage === 'fallback'
        ? option.fallbackSrc
        : undefined;

  const frameCls =
    variant === 'trigger'
      ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10 overflow-hidden'
      : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10 overflow-hidden';

  if (option.key === 'all' && (!src || stage === 'text')) {
    return (
      <span className={frameCls}>
        <Globe className="h-4 w-4 text-neon-500 dark:text-neon-300" />
      </span>
    );
  }

  if (src) {
    return (
      <span className={frameCls}>
        <img
          src={src}
          alt={option.label}
          className="h-5 max-w-[28px] object-contain"
          onError={() =>
            setStage((s) =>
              s === 'primary' && option.fallbackSrc
                ? 'fallback'
                : 'text',
            )
          }
        />
      </span>
    );
  }

  const t = option.textFallback ?? { text: option.label.slice(0, 2).toLowerCase(), cls: 'text-white font-bold' };

  return (
    <span className={`${frameCls} ${t.cls} text-[10px] leading-none tracking-tight`}>
      {t.text}
    </span>
  );
}
