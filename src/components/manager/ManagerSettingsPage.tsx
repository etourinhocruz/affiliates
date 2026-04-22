import { useState } from 'react';
import { Bell, Check, Settings as SettingsIcon, Target, Trophy } from 'lucide-react';

export default function ManagerSettingsPage() {
  const [monthlyTarget, setMonthlyTarget] = useState('4500');
  const [dailyDigest, setDailyDigest] = useState(true);
  const [missedTargetAlert, setMissedTargetAlert] = useState(true);
  const [newAffAlert, setNewAffAlert] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600 ring-1 ring-amber-400/30 dark:text-amber-300">
          <SettingsIcon className="h-3 w-3" />
          Manager Suite · Configurações
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Preferências Gerenciais
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Configure metas do time, alertas e integrações que recebe ao longo do mês.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-[#1E1E24]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              <Target className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Meta do time</h3>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
              FTDs mensais agregados
            </span>
            <input
              type="number"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            />
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
            Essa meta é distribuída automaticamente entre os afiliados ativos ponderando histórico recente.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-[#1E1E24]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              <Bell className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Alertas</h3>
          </div>
          <Toggle label="Resumo diário por e-mail" value={dailyDigest} onChange={setDailyDigest} />
          <Toggle label="Alerta de meta não cumprida" value={missedTargetAlert} onChange={setMissedTargetAlert} />
          <Toggle label="Novo afiliado na carteira" value={newAffAlert} onChange={setNewAffAlert} />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-[#1E1E24] lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              <Trophy className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Bônus de performance</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <BonusCard label="Meta atingida" target="+2% de split" tone="neon" />
            <BonusCard label="Meta superada 110%" target="+5% de split" tone="sky" />
            <BonusCard label="Meta superada 125%" target="Bônus R$ 2.500" tone="amber" />
          </div>
        </section>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#39FF14]">
            <Check className="h-4 w-4" />
            Preferências salvas
          </span>
        )}
        <button
          onClick={() => {
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2400);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] hover:bg-neon-300"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm text-gray-800 dark:text-slate-200"
    >
      <span>{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
          value ? 'bg-[#39FF14] shadow-[0_0_14px_rgba(57,255,20,0.45)]' : 'bg-gray-300 dark:bg-white/10'
        }`}
      >
        <span
          className={`absolute h-4 w-4 rounded-full bg-white shadow transition ${
            value ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

function BonusCard({ label, target, tone }: { label: string; target: string; tone: 'neon' | 'sky' | 'amber' }) {
  const text =
    tone === 'neon'
      ? 'text-[#39FF14]'
      : tone === 'sky'
        ? 'text-sky-600 dark:text-sky-300'
        : 'text-amber-600 dark:text-amber-300';
  const ring =
    tone === 'neon'
      ? 'ring-neon-400/30'
      : tone === 'sky'
        ? 'ring-sky-400/30'
        : 'ring-amber-400/30';
  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50/60 p-4 ring-1 dark:border-white/5 dark:bg-white/5 ${ring}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1.5 text-lg font-bold ${text}`}>{target}</p>
    </div>
  );
}
