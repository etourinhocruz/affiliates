import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Building2,
  ChevronRight,
  Coins,
  LineChart,
  LogIn,
  PieChart,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type AuditUser = {
  id: string;
  name: string;
  role: string;
  ftds_generated: number;
  profit_generated: number;
  status: string;
};

const fallbackAudit: AuditUser[] = [
  { id: 'a1', name: 'Agência Tubarões Media', role: 'AGENCY', ftds_generated: 4820, profit_generated: 284000, status: 'active' },
  { id: 'a2', name: 'Agência HighRoller BR', role: 'AGENCY', ftds_generated: 3610, profit_generated: 212400, status: 'active' },
  { id: 'a3', name: 'Pierre Aguiar', role: 'AFFILIATE', ftds_generated: 1842, profit_generated: 98600, status: 'active' },
  { id: 'a4', name: 'Rodrigo Alves', role: 'AFFILIATE', ftds_generated: 1210, profit_generated: 72100, status: 'active' },
  { id: 'a5', name: 'Marcus Trader', role: 'MANAGER', ftds_generated: 980, profit_generated: 54820, status: 'active' },
  { id: 'a6', name: 'Juliana Costa', role: 'AFFILIATE', ftds_generated: 760, profit_generated: 41200, status: 'blocked' },
  { id: 'a7', name: 'Equipe VIP BR', role: 'AGENCY', ftds_generated: 620, profit_generated: 32800, status: 'active' },
  { id: 'a8', name: 'Sub-Afiliado Carlos', role: 'SUB_AFFILIATE', ftds_generated: 412, profit_generated: 19400, status: 'active' },
  { id: 'a9', name: 'Agência Sports Hub', role: 'AGENCY', ftds_generated: 340, profit_generated: 16100, status: 'active' },
  { id: 'a10', name: 'Ricardo Picks', role: 'AFFILIATE', ftds_generated: 210, profit_generated: 9420, status: 'active' },
];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatBRLCompact(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

function formatInt(value: number): string {
  return value.toLocaleString('pt-BR');
}

export default function SuperAdminDashboard() {
  const [audit, setAudit] = useState<AuditUser[]>(fallbackAudit);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('admin_audit_users')
        .select('*')
        .order('profit_generated', { ascending: false });
      if (data && data.length) setAudit(data as AuditUser[]);
    })();
  }, []);

  const totals = useMemo(
    () =>
      audit.reduce(
        (acc, u) => ({
          ftds: acc.ftds + Number(u.ftds_generated),
          profit: acc.profit + Number(u.profit_generated),
        }),
        { ftds: 0, profit: 0 },
      ),
    [audit],
  );

  const ggrTotal = totals.profit * 3.8;
  const netRevenue = totals.profit * 1.9;
  const paidToAffiliates = totals.profit * 0.42;
  const platformMargin =
    ggrTotal > 0 ? ((ggrTotal - paidToAffiliates) / ggrTotal) * 100 : 0;

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
            <ShieldCheck className="h-3 w-3" />
            Super Admin Console
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Acesso nível 5 · Auditoria global
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Centro de Comando da Plataforma
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Monitoramento em tempo real das operações globais da Mansão Green Affiliates.
        </p>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActionCard
          tone="neon"
          icon={<Banknote className="h-5 w-5" />}
          label="Saques Pendentes"
          primary="14 solicitações"
          secondary={formatBRL(124000)}
          description="Aguardando aprovação do time financeiro"
          actionLabel="Revisar"
        />
        <ActionCard
          tone="sky"
          icon={<Building2 className="h-5 w-5" />}
          label="Novas Agências"
          primary="3 aguardando"
          secondary="KYC em análise"
          description="Documentação recebida nas últimas 48h"
          actionLabel="Analisar KYC"
        />
        <ActionCard
          tone="rose"
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Alerta de Postback"
          primary="2 falhas"
          secondary="Últimas 24h"
          description="Integrações instáveis com casas parceiras"
          actionLabel="Diagnosticar"
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MacroCard
          label="GGR Total"
          value={formatBRLCompact(ggrTotal)}
          hint="Receita bruta consolidada"
          icon={<TrendingUp className="h-5 w-5" />}
          tone="sky"
        />
        <MacroCard
          label="Net Revenue Global"
          value={formatBRLCompact(netRevenue)}
          hint="Após taxas e bônus"
          icon={<LineChart className="h-5 w-5" />}
          tone="neon"
        />
        <MacroCard
          label="Pago a Afiliados"
          value={formatBRLCompact(paidToAffiliates)}
          hint="Comissões liquidadas no mês"
          icon={<Coins className="h-5 w-5" />}
          tone="amber"
        />
        <MacroCard
          label="Margem da Plataforma"
          value={`${platformMargin.toFixed(1)}%`}
          hint="Lucro líquido / GGR"
          icon={<PieChart className="h-5 w-5" />}
          tone="neon"
        />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Auditoria de Usuários
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              Top performers da rede global · {formatInt(audit.length)} contas ativas
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <Users className="h-3 w-3" />
              {formatInt(totals.ftds)} FTDs totais
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-neon-400/10 px-2.5 py-1 font-semibold uppercase tracking-wider text-neon-700 ring-1 ring-neon-400/30 dark:text-neon-300">
              <Coins className="h-3 w-3" />
              {formatBRLCompact(totals.profit)} gerados
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-black/30 dark:text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Nome / Empresa</th>
                <th className="px-3 py-3 text-left font-semibold">Role</th>
                <th className="px-3 py-3 text-center font-semibold">FTDs Gerados</th>
                <th className="px-3 py-3 text-right font-semibold">Lucro Gerado</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((u) => {
                const isOpen = !!expanded[u.id];
                return (
                  <Fragment key={u.id}>
                    <tr
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [u.id]: !e[u.id] }))
                      }
                      className="cursor-pointer border-b border-gray-100 text-gray-700 transition hover:bg-gray-50 dark:border-white/5 dark:text-slate-200 dark:hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-left">
                        <div className="flex items-center gap-2.5">
                          <ChevronRight
                            className={`h-4 w-4 text-gray-400 transition-transform dark:text-slate-500 ${
                              isOpen ? 'rotate-90 text-neon-500 dark:text-neon-400' : ''
                            }`}
                          />
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-[11px] font-bold text-white ring-1 ring-white/10">
                            {u.name
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-slate-500">
                              ID · {u.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center tabular-nums font-semibold">
                        {formatInt(u.ftds_generated)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right tabular-nums">
                        <span className="font-bold text-neon-600 dark:text-neon-300 dark:drop-shadow-[0_0_6px_rgba(57,255,20,0.25)]">
                          {formatBRL(Number(u.profit_generated))}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-neon-300"
                          >
                            <LogIn className="h-3.5 w-3.5" />
                            Logar como
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-rose-400/40 hover:text-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-rose-300"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Suspender
                          </button>
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
                            <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/5 dark:bg-black/30">
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <DrillStat label="Última atividade" value="há 2h" />
                                <DrillStat label="Sessões (7d)" value={formatInt(28)} />
                                <DrillStat
                                  label="Ticket médio"
                                  value={formatBRL(
                                    u.ftds_generated > 0
                                      ? Number(u.profit_generated) / u.ftds_generated
                                      : 0,
                                  )}
                                />
                                <DrillStat label="Canais ativos" value="4" />
                              </div>
                            </div>
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
    </div>
  );
}

function ActionCard({
  tone,
  icon,
  label,
  primary,
  secondary,
  description,
  actionLabel,
}: {
  tone: 'neon' | 'sky' | 'rose';
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary: string;
  description: string;
  actionLabel: string;
}) {
  const toneMap = {
    neon: {
      ring: 'ring-neon-400/30 border-neon-400/30',
      icon: 'bg-neon-400/10 text-neon-600 dark:text-neon-300',
      accent: 'text-neon-600 dark:text-neon-300',
      button:
        'bg-neon-400 text-slate-950 hover:bg-neon-300 shadow-[0_0_18px_rgba(57,255,20,0.35)]',
    },
    sky: {
      ring: 'ring-sky-400/30 border-sky-400/30',
      icon: 'bg-sky-400/10 text-sky-600 dark:text-sky-300',
      accent: 'text-sky-600 dark:text-sky-300',
      button:
        'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_18px_rgba(14,165,233,0.35)]',
    },
    rose: {
      ring: 'ring-rose-400/30 border-rose-400/30',
      icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
      accent: 'text-rose-600 dark:text-rose-300',
      button:
        'bg-rose-500 text-white hover:bg-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.35)]',
    },
  };
  const t = toneMap[tone];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1E1E24] dark:shadow-none dark:backdrop-blur-xl ${t.ring}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/0 to-white/0 blur-3xl dark:from-neon-400/5 dark:to-transparent" />
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ring-1 ring-inset ${t.icon}`}>{icon}</div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <div className="mt-4">
        <p className={`text-2xl font-extrabold tabular-nums ${t.accent}`}>{primary}</p>
        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{secondary}</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        className={`mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${t.button}`}
      >
        {actionLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function MacroCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: 'neon' | 'sky' | 'amber';
}) {
  const toneMap = {
    neon: 'text-neon-600 dark:text-neon-300 dark:drop-shadow-[0_0_10px_rgba(57,255,20,0.35)]',
    sky: 'text-sky-600 dark:text-sky-300',
    amber: 'text-amber-600 dark:text-amber-300',
  };
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
          {label}
        </p>
        <div className="rounded-lg bg-gray-100 p-2 text-gray-600 dark:bg-white/5 dark:text-slate-300">
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-2xl font-extrabold tabular-nums sm:text-[26px] ${toneMap[tone]}`}>
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

function DrillStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/5 dark:bg-[#14141A]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-900 tabular-nums dark:text-white">{value}</p>
    </div>
  );
}
