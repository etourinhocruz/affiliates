import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe as Globe2 } from 'lucide-react';

export type HouseOption = {
  key: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (key: string) => void;
  options: HouseOption[];
};

const brandAccent: Record<string, string> = {
  all: 'text-neon-500 dark:text-neon-300',
  superbet: 'text-rose-500 dark:text-rose-300',
  sportingbet: 'text-sky-500 dark:text-sky-300',
  betmgm: 'text-amber-500 dark:text-amber-300',
  betfair: 'text-amber-500 dark:text-amber-300',
};

const brandBg: Record<string, string> = {
  all: 'bg-neon-400/15 ring-neon-400/30',
  superbet: 'bg-rose-500/15 ring-rose-400/30',
  sportingbet: 'bg-sky-500/15 ring-sky-400/30',
  betmgm: 'bg-amber-500/15 ring-amber-400/30',
  betfair: 'bg-amber-500/15 ring-amber-400/30',
};

export default function HouseFilter({ value, onChange, options }: Props) {
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
    <div ref={ref} className="relative z-40 w-full sm:w-[260px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-neon-400/40 hover:shadow-[0_0_16px_rgba(57,255,20,0.18)] focus:outline-none focus:ring-2 focus:ring-neon-400/30 dark:border-white/10 dark:bg-[#1E1E24]/80 dark:text-white"
      >
        <BrandMark houseKey={selected.key} size="sm" />
        <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-slate-400">
            Casa de Apostas
          </span>
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-300 dark:text-slate-400 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`absolute left-0 right-0 top-full z-50 mt-2 origin-top rounded-xl border border-gray-200 bg-white/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)] backdrop-blur-xl transition-all duration-200 dark:border-white/10 dark:bg-[#1E1E24]/95 dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0'
        }`}
        role="listbox"
      >
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
              className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                active
                  ? 'bg-neon-400/10 text-gray-900 dark:text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <BrandMark houseKey={opt.key} size="sm" />
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

function BrandMark({
  houseKey,
  size = 'md',
}: {
  houseKey: string;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const bg = brandBg[houseKey] ?? 'bg-white/10 ring-white/10';

  if (houseKey === 'all') {
    return (
      <span
        className={`flex ${dim} shrink-0 items-center justify-center rounded-lg ring-1 ${bg}`}
      >
        <Globe2 className={`${brandAccent.all} h-4 w-4`} />
      </span>
    );
  }

  const label: Record<string, { text: string; cls: string }> = {
    superbet: { text: 'sb', cls: 'text-rose-400 italic font-black' },
    sportingbet: { text: 'sp', cls: 'text-sky-400 font-black' },
    betmgm: { text: 'mg', cls: 'text-amber-300 font-black' },
    betfair: { text: 'bf', cls: 'text-amber-300 font-black' },
  };
  const l = label[houseKey] ?? { text: houseKey.slice(0, 2), cls: 'text-white font-bold' };

  return (
    <span
      className={`flex ${dim} shrink-0 items-center justify-center rounded-lg ring-1 ${bg} ${l.cls} text-[11px] tracking-tight`}
    >
      {l.text}
    </span>
  );
}
