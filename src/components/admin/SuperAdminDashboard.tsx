import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  Banknote,
  Check,
  ChevronRight,
  Coins,
  Eye,
  FileCheck2,
  LineChart,
  MoreVertical,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';

type AuditUser = {
  id: string;
  name: string;
  role: string;
  ftds_generated: number;
  profit_generated: number;
  status: string;
};

type HousePerformance = {
  key: string;
  label: string;
  ftds: number;
  ggr: number;
  profit: number;
  payout: number;
  conversion: number;
};

const fallbackAudit: AuditUser[] = [
  { id: 'a1', name: 'Agência Tubarões Media', role: 'AGENCY', ftds_generated: 4820, profit_generated: 284000, status: 'active' },
  { id: 'a2', name: 'Agência HighRoller BR', role: 'AGENCY', ftds_generated: 3610, profit_generated: 212400, status: 'active' },
  { id: 'a3', name: 'Pierre Aguiar', role: 'AFFILIATE', ftds_generated: 1842, profit_generated: 98600, status: 'active' },
  { id: 'a4', name: 'Rodrigo Alves', role: 'AFFILIATE', ftds_generated: 1210, profit_generated: 72100, status: 'active' },
  { id: 'a5', name: 'Marcus Trader', role: 'MANAGER', ftds_generated: 980, profit_generated: 54820, status: 'active' },
  { id: 'a6', name: 'Juliana Costa', role: 'AFFILIATE', ftds_generated: 760, profit_generated: 41200, status: 'blocked' },
  { id: 'a7', name: 'Equipe VIP BR', role: 'AGENCY', ftds_generated: 620, profit_generated: 32800, status: 'active' },
  { id: 'a8', name: 'Carlos Simões', role: 'SUB_AFFILIATE', ftds_generated: 412, profit_generated: 19400, status: 'active' },
  { id: 'a9', name: 'Agência Sports Hub', role: 'AGENCY', ftds_generated: 340, profit_generated: 16100, status: 'active' },
  { id: 'a10', name: 'Ricardo Picks', role: 'AFFILIATE', ftds_generated: 210, profit_generated: 9420, status: 'active' },
];

const HOUSE_CATALOG: { key: string; label: string; share: number }[] = [
  { key: 'superbet', label: 'SuperBet', share: 0.36 },
  { key: 'betmgm', label: 'BetMGM', share: 0.22 },
  { key: 'esportivabet', label: 'EsportivaBet', share: 0.16 },
  { key: 'betfair', label: 'BetFair', share: 0.14 },
  { key: 'novibet', label: 'NoviBet', share: 0.12 },
];

const HOUSE_SCALE: Record<string, number> = {
  all: 1,
  superbet: 0.42,
  betmgm: 0.26,
  esportivabet: 0.18,
  betfair: 0.14,
  novibet: 0.1,
};

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatBRLCompact = (v: number) =>
  v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
const formatInt = (v: number) => Math.round(v).toLocaleString('pt-BR');

function buildHousePerformance(u: AuditUser): HousePerformance[] {
  return HOUSE_CATALOG.map((h) => {
    const ftds = Math.round(Number(u.ftds_generated) * h.share);
    const profit = Number(u.profit_generated) * h.share;
    const ggr = profit * 3.6;
    const payout = profit * 0.42;
    const conversion = 8 + ((u.name.length * h.share * 11) % 9);
    return { key: h.key, label: h.label, ftds, ggr, profit, payout, conversion };
  });
}

export default function SuperAdminDashboard() {
  const { selectedHouse } = useUser();
  const [audit, setAudit] = useState<AuditUser[]>(fallbackAudit);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('admin_audit_users')
        .select('*')
        .order('profit_generated', { ascending: false });
      if (data && data.length) setAudit(data as AuditUser[]);
    })();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const scale = HOUSE_SCALE[selectedHouse] ?? 1;
  const houseLabel = HOUSE_CATALOG.find((h) => h.key === selectedHouse)?.label;

  const totals = useMemo(() => {
    const ftds = audit.reduce((a, u) => a + Number(u.ftds_generated), 0) * scale;
    const profit = audit.reduce((a, u) => a + Number(u.profit_generated), 0) * scale;
    return { ftds, profit };
  }, [audit, scale]);

  const ggrTotal = totals.profit * 3.8;
  const netRevenue = totals.profit * 1.9;
  const paidToAffiliates = totals.profit * 0.42;
  const platformMargin = ggrTotal > 0 ? ((ggrTotal - paidToAffiliates) / ggrTotal) * 100 : 0;

  const pendingWithdraw = 124000 * scale;
  const pendingKyc = Math.max(1, Math.round(3 * scale));
  const postbackFailures = Math.max(1, Math.round(2 * scale));

  const handleImpersonate = (u: AuditUser) => {
    setMenuOpen(null);
    setToast(`Sessão de impersonação iniciada como ${u.name}.`);
  };

  const handleBlock = (u: AuditUser) => {
    setMenuOpen(null);
    setAudit((list) =>
      list.map((x) =>
        x.id === u.id
          ? { ...x, status: x.status === 'active' ? 'blocked' : 'active' }
          : x,
      ),
    );
    setToast(
      u.status === 'active'
        ? `Acesso de ${u.name} bloqueado.`
        : `Acesso de ${u.name} reativado.`,
    );
  };

  return (
    <div className="pb-10 text-slate-900 animate-rise dark:text-slate-100">
      <header className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
            <ShieldCheck className="h-3 w-3" />
            Super Admin Console
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Acesso nível 5 · Auditoria global
          </span>
          {houseLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600 ring-1 ring-sky-400/30 dark:text-sky-300">
              <Zap className="h-3 w-3" />
              Filtro: {houseLabel}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Centro de Comando da Plataforma
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Monitoramento em tempo real das operações globais da Mansão Green Affiliates.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <ActionCard
          tone="neon"
          icon={<Banknote className="h-5 w-5" />}
          label="Saques Pendentes"
          kpi={formatBRL(pendingWithdraw)}
          subtitle={`${formatInt(Math.max(1, Math.round(14 * scale)))} solicitações aguardando`}
          ctaLabel="Revisar Esteira"
        />
        <ActionCard
          tone="sky"
          icon={<FileCheck2 className="h-5 w-5" />}
          label="Novas Agências KYC"
          kpi={formatInt(pendingKyc)}
          subtitle="Aguardando validação de identidade"
          ctaLabel="Validar KYC"
        />
        <ActionCard
          tone="rose"
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Alerta de Postback"
          kpi={formatInt(postbackFailures)}
          subtitle="Nas últimas 24h"
          ctaLabel="Ver Logs"
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MacroCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="GGR Global"
          value={formatBRLCompact(ggrTotal)}
          hint="Receita bruta consolidada"
        />
        <MacroCard
          icon={<LineChart className="h-5 w-5" />}
          label="Net Revenue Global"
          value={formatBRLCompact(netRevenue)}
          hint="Após taxas e bônus"
        />
        <MacroCard
          icon={<Coins className="h-5 w-5" />}
          label="Total Pago a Afiliados"
          value={formatBRLCompact(paidToAffiliates)}
          hint="Comissões liquidadas no período"
        />
        <MacroCard
          icon={<PieChart className="h-5 w-5" />}
          label="Margem de Lucro"
          value={`${platformMargin.toFixed(1)}%`}
          hint="Lucro líquido / GGR"
        />
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-[0_0_50px_rgba(57,255,20,0.05)] dark:backdrop-blur-xl">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Auditoria de Usuários
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              Clique em uma linha para inspecionar a performance por casa de aposta.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <Users className="h-3 w-3" />
              {formatInt(totals.ftds)} FTDs
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-neon-400/10 px-2.5 py-1 font-semibold uppercase tracking-wider text-neon-700 ring-1 ring-neon-400/30 dark:text-neon-300">
              <Coins className="h-3 w-3" />
              {formatBRLCompact(totals.profit)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-black/30 dark:text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Nome / Empresa</th>
                <th className="px-3 py-3 text-left font-semibold">Role</th>
                <th className="px-3 py-3 text-right font-semibold">FTDs Gerados</th>
                <th className="px-3 py-3 text-right font-semibold">Lucro Gerado</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((u) => {
                const isOpen = !!expanded[u.id];
                const scaledFtds = Number(u.ftds_generated) * scale;
                const scaledProfit = Number(u.profit_generated) * scale;
                return (
                  <Fragment key={u.id}>
                    <tr
                      onClick={() => setExpanded((e) => ({ ...e, [u.id]: !e[u.id] }))}
                      className="cursor-pointer border-b border-gray-100 text-gray-700 transition hover:bg-gray-50 dark:border-white/5 dark:text-slate-200 dark:hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-left">
                        <div className="flex items-center gap-3">
                          <ChevronRight
                            className={`h-4 w-4 text-gray-400 transition-transform dark:text-slate-500 ${
                              isOpen ? 'rotate-90 text-neon-500 dark:text-neon-400' : ''
                            }`}
                          />
                          <UserAvatar name={u.name} role={u.role} />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-slate-500">
                              {roleCaption(u.role)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-left">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right tabular-nums font-semibold text-gray-900 dark:text-white">
                        {formatInt(scaledFtds)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right tabular-nums">
                        <span className="font-bold text-neon-600 dark:text-neon-300 dark:drop-shadow-[0_0_6px_rgba(57,255,20,0.25)]">
                          {formatBRL(scaledProfit)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="relative inline-flex" ref={menuOpen === u.id ? menuRef : undefined}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen((m) => (m === u.id ? null : u.id));
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-neon-300"
                            aria-label="Ações"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {menuOpen === u.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#14141A]"
                            >
                              <button
                                onClick={() => handleImpersonate(u)}
                                className="flex w-full items-center gap-2.5 border-b border-gray-100 bg-neon-400/10 px-3 py-2.5 text-left text-sm font-semibold text-neon-700 transition hover:bg-neon-400/20 dark:border-white/5 dark:text-neon-300"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-400/20 text-[#39FF14] ring-1 ring-neon-400/40">
                                  <Eye className="h-3.5 w-3.5" />
                                </span>
                                <div className="flex flex-col">
                                  <span>Logar como</span>
                                  <span className="text-[10px] font-medium uppercase tracking-wider text-neon-600/80 dark:text-neon-300/70">
                                    Impersonate
                                  </span>
                                </div>
                              </button>
                              <button
                                onClick={() => handleBlock(u)}
                                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 ring-1 ring-rose-400/30 dark:text-rose-300">
                                  <Ban className="h-3.5 w-3.5" />
                                </span>
                                <div className="flex flex-col">
                                  <span>
                                    {u.status === 'active' ? 'Bloquear Acesso' : 'Reativar Acesso'}
                                  </span>
                                  <span className="text-[10px] font-medium uppercase tracking-wider text-rose-500/80 dark:text-rose-300/70">
                                    {u.status === 'active' ? 'Suspende login' : 'Restaura acesso'}
                                  </span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="p-0">
                        <div
                          className={`grid overflow-hidden transition-all duration-500 ease-out ${
                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="min-h-0">
                            <HouseBreakdown user={u} scale={scale} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-rise">
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

function roleCaption(role: string): string {
  switch (role) {
    case 'AGENCY':
      return 'Agência Parceira';
    case 'MANAGER':
      return 'Gerente';
    case 'AFFILIATE':
      return 'Afiliado';
    case 'SUB_AFFILIATE':
      return 'Sub-Afiliado';
    case 'SUPER_ADMIN':
      return 'Super Admin';
    default:
      return role;
  }
}

function UserAvatar({ name, role }: { name: string; role: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  const toneByRole: Record<string, string> = {
    AGENCY: 'from-sky-500/25 to-sky-700/30 ring-sky-400/30 text-sky-100',
    MANAGER: 'from-amber-500/25 to-amber-700/30 ring-amber-400/30 text-amber-100',
    AFFILIATE: 'from-emerald-500/25 to-emerald-700/30 ring-neon-400/30 text-neon-100',
    SUB_AFFILIATE: 'from-slate-500/25 to-slate-700/30 ring-slate-400/30 text-slate-100',
    SUPER_ADMIN: 'from-rose-500/25 to-rose-700/30 ring-rose-400/30 text-rose-100',
  };
  const cls = toneByRole[role] ?? toneByRole.SUB_AFFILIATE;
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold ring-1 ${cls}`}
    >
      {initials}
    </span>
  );
}

function ActionCard({
  tone,
  icon,
  label,
  kpi,
  subtitle,
  ctaLabel,
}: {
  tone: 'neon' | 'sky' | 'rose';
  icon: React.ReactNode;
  label: string;
  kpi: string;
  subtitle: string;
  ctaLabel: string;
}) {
  const toneMap = {
    neon: {
      border: 'border-neon-400/25 hover:border-neon-400/50',
      icon: 'bg-neon-400/10 text-neon-600 ring-neon-400/30 dark:text-neon-300',
      kpi: 'text-neon-600 dark:text-neon-300 dark:drop-shadow-[0_0_10px_rgba(57,255,20,0.35)]',
      button:
        'border-neon-400/40 text-neon-700 hover:bg-neon-400/10 hover:text-neon-600 dark:text-neon-300 dark:hover:text-neon-200 dark:hover:border-neon-400/60',
      glow: 'from-neon-400/10 to-transparent',
    },
    sky: {
      border: 'border-sky-400/25 hover:border-sky-400/50',
      icon: 'bg-sky-500/10 text-sky-600 ring-sky-400/30 dark:text-sky-300',
      kpi: 'text-sky-600 dark:text-sky-300',
      button:
        'border-sky-400/40 text-sky-700 hover:bg-sky-500/10 hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200 dark:hover:border-sky-400/60',
      glow: 'from-sky-500/10 to-transparent',
    },
    rose: {
      border: 'border-rose-400/25 hover:border-rose-400/50',
      icon: 'bg-rose-500/10 text-rose-600 ring-rose-400/30 dark:text-rose-300',
      kpi: 'text-rose-600 dark:text-rose-300',
      button:
        'border-rose-400/40 text-rose-700 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-200 dark:hover:border-rose-400/60',
      glow: 'from-rose-500/10 to-transparent',
    },
  };
  const t = toneMap[tone];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 dark:bg-[#1E1E24] dark:shadow-[0_0_50px_rgba(57,255,20,0.04)] dark:backdrop-blur-xl ${t.border}`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${t.glow} blur-3xl`}
      />
      <div className="relative flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ring-1 ring-inset ${t.icon}`}>{icon}</div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <p className={`relative mt-5 text-3xl font-extrabold tabular-nums ${t.kpi}`}>{kpi}</p>
      <p className="relative mt-1 text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>
      <button
        className={`relative mt-5 inline-flex items-center gap-1.5 rounded-lg border bg-transparent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${t.button}`}
      >
        {ctaLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function MacroCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-400/30 dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-[0_0_50px_rgba(57,255,20,0.04)] dark:backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-400/0 to-transparent transition duration-300 group-hover:via-neon-400/70" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
          {label}
        </p>
        <div className="rounded-lg bg-gray-100 p-2 text-gray-600 transition group-hover:text-neon-500 dark:bg-white/5 dark:text-slate-300 dark:group-hover:text-neon-300">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-extrabold tabular-nums text-neon-600 dark:text-neon-300 dark:drop-shadow-[0_0_10px_rgba(57,255,20,0.35)] sm:text-[26px]">
        {value}
      </p>
      <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    AGENCY: 'bg-sky-500/10 text-sky-700 ring-sky-400/30 dark:text-sky-300',
    MANAGER: 'bg-amber-500/10 text-amber-700 ring-amber-400/30 dark:text-amber-300',
    AFFILIATE: 'bg-neon-400/10 text-neon-700 ring-neon-400/30 dark:text-neon-300',
    SUB_AFFILIATE: 'bg-slate-500/10 text-slate-700 ring-slate-400/30 dark:text-slate-300',
    SUPER_ADMIN: 'bg-rose-500/10 text-rose-700 ring-rose-400/30 dark:text-rose-300',
  };
  const cls = map[role] ?? 'bg-slate-500/10 text-slate-700 ring-slate-400/30 dark:text-slate-300';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${cls}`}
    >
      {role.replace('_', ' ').toLowerCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
        active
          ? 'bg-neon-400/10 text-neon-700 ring-neon-400/30 dark:text-neon-300'
          : 'bg-rose-500/10 text-rose-700 ring-rose-400/30 dark:text-rose-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? 'bg-neon-500 shadow-[0_0_6px_rgba(57,255,20,0.9)]' : 'bg-rose-500'
        }`}
      />
      {active ? 'Ativo' : 'Bloqueado'}
    </span>
  );
}

function HouseBreakdown({ user, scale }: { user: AuditUser; scale: number }) {
  const rows = useMemo(() => buildHousePerformance(user), [user]);
  return (
    <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/5 dark:bg-black/40">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
        Performance por Casa de Aposta · Últimos 30 dias
      </p>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#14141A]">
        <table className="w-full min-w-[720px] text-xs">
          <thead>
            <tr className="bg-gray-100 text-[10px] uppercase tracking-wider text-gray-500 dark:bg-black/40 dark:text-slate-500">
              <th className="px-4 py-2.5 text-left font-semibold">Casa</th>
              <th className="px-3 py-2.5 text-right font-semibold">FTDs</th>
              <th className="px-3 py-2.5 text-right font-semibold">GGR</th>
              <th className="px-3 py-2.5 text-right font-semibold">Lucro</th>
              <th className="px-3 py-2.5 text-right font-semibold">Payout</th>
              <th className="px-4 py-2.5 text-right font-semibold">Conversão</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.key}
                className="border-t border-gray-100 text-gray-700 dark:border-white/5 dark:text-slate-300"
              >
                <td className="whitespace-nowrap px-4 py-2.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-neon-400/20 to-emerald-600/20 text-[10px] font-bold text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
                      {r.label.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {r.label}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                  {formatInt(r.ftds * scale)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-gray-800 dark:text-slate-100">
                  {formatBRL(r.ggr * scale)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums font-bold text-neon-600 dark:text-neon-300">
                  {formatBRL(r.profit * scale)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-gray-700 dark:text-slate-200">
                  {formatBRL(r.payout * scale)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                  {r.conversion.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
