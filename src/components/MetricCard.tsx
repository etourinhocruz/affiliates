import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  accent?: 'neon' | 'sky' | 'amber' | 'rose';
};

const accentMap: Record<NonNullable<Props['accent']>, { glow: string; text: string }> = {
  neon: { glow: 'from-neon-400/25 to-neon-500/0', text: 'text-neon-400' },
  sky: { glow: 'from-sky-400/20 to-sky-500/0', text: 'text-sky-400' },
  amber: { glow: 'from-amber-400/20 to-amber-500/0', text: 'text-amber-400' },
  rose: { glow: 'from-rose-400/20 to-rose-500/0', text: 'text-rose-400' },
};

export default function MetricCard({ label, value, delta, icon: Icon, accent = 'neon' }: Props) {
  const positive = delta >= 0;
  const a = accentMap[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_20px_60px_-20px_rgba(57,255,20,0.3)]">
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${a.glow} blur-2xl`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${a.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            positive
              ? 'bg-neon-400/10 text-neon-400'
              : 'bg-rose-400/10 text-rose-400'
          }`}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {positive ? '+' : ''}
          {delta}%
        </span>
        <span className="text-xs text-slate-500">vs. semana anterior</span>
      </div>
    </div>
  );
}
