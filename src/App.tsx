import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Flame,
  Gem,
  LineChart,
  Sparkles,
  Trophy,
  UserPlus,
  Wallet,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RevenueChart from './components/RevenueChart';
import SettingsPage from './components/SettingsPage';
import DealsPage from './components/DealsPage';
import ReportsPage from './components/ReportsPage';
import CampaignsPage from './components/CampaignsPage';
import { supabase } from './lib/supabase';
import type { DailyMetric } from './lib/supabase';
import { fallbackMetrics } from './data/mockData';

function App() {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [metrics, setMetrics] = useState<DailyMetric[]>(fallbackMetrics);

  useEffect(() => {
    (async () => {
      const { data: m } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: true });
      if (m && m.length) setMetrics(m as DailyMetric[]);
    })();
  }, []);

  const funnel = useMemo(() => {
    const cadastros = 1235;
    const cadastrosYesterday = 1108;
    const cadastrosDelta = ((cadastros - cadastrosYesterday) / cadastrosYesterday) * 100;
    const ftd = 428;
    const qftd = 342;
    const depositoTotal = 146910;
    const netRevenue = 48300;
    const cpaCommission = 18420;
    const revCommission = 6580;
    const revLiquido = cpaCommission + revCommission;
    return {
      cadastros,
      cadastrosDelta,
      ftd,
      ftdConv: (ftd / cadastros) * 100,
      qftd,
      qftdConv: (qftd / ftd) * 100,
      depositoTotal,
      valuePlayer: depositoTotal / ftd,
      netRevenue,
      revLiquido,
      cpaCommission,
      revCommission,
    };
  }, []);

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

  const renderDashboard = () => (
    <>
      <div className="mb-8 animate-rise" style={{ animationDelay: '0ms' }}>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Visão Geral
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Acompanhe suas métricas de afiliação em tempo real.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Pillar
          delay={60}
          icon={<UserPlus className="h-5 w-5" />}
          label="Cadastros"
          value={funnel.cadastros.toLocaleString('pt-BR')}
          footer={<DeltaBadge delta={funnel.cadastrosDelta} suffix="vs ontem" />}
        />
        <Pillar
          delay={120}
          icon={<Flame className="h-5 w-5" />}
          label="FTD"
          value={funnel.ftd.toLocaleString('pt-BR')}
          footer={
            <FooterMetric
              label="Cadastro → FTD"
              value={`${funnel.ftdConv.toFixed(1)}%`}
              tone="sky"
            />
          }
        />
        <Pillar
          delay={180}
          icon={<Trophy className="h-5 w-5" />}
          label="QFTD"
          value={funnel.qftd.toLocaleString('pt-BR')}
          footer={
            <FooterMetric
              label="FTD → QFTD"
              value={`${funnel.qftdConv.toFixed(1)}%`}
              tone="amber"
            />
          }
        />
        <Pillar
          delay={240}
          icon={<Wallet className="h-5 w-5" />}
          label="Depósito Total"
          value={formatBRLCompact(funnel.depositoTotal)}
          footer={
            <FooterMetric
              label="Value Player"
              value={formatBRL(funnel.valuePlayer)}
              tone="amber"
              icon={<Gem className="h-3 w-3" />}
            />
          }
        />
        <Pillar
          delay={300}
          icon={<LineChart className="h-5 w-5" />}
          label="Net Revenue"
          value={formatBRLCompact(funnel.netRevenue)}
          footer={
            <FooterMetric
              label="Rev Líquido"
              value={formatBRL(funnel.revLiquido)}
              tone="neon"
            />
          }
        />
      </section>

      <section
        className="mt-6 animate-rise"
        style={{ animationDelay: '360ms' }}
      >
        <FinancialPanel
          cpa={funnel.cpaCommission}
          rev={funnel.revCommission}
          total={funnel.revLiquido}
          format={formatBRL}
        />
      </section>

      <section
        className="mt-6 mb-10 animate-rise"
        style={{ animationDelay: '440ms' }}
      >
        <RevenueChart data={metrics} />
      </section>
    </>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'settings':
        return <SettingsPage />;
      case 'deals':
        return <DealsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'campaigns':
        return <CampaignsPage />;
      case 'overview':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-neon-400/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <Sidebar
        active={activeMenu}
        onNavigate={setActiveMenu}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="relative lg:pl-72">
        <Header userName="Lucas" onOpenMobile={() => setMobileOpen(true)} />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function Pillar({
  icon,
  label,
  value,
  footer,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  footer: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="group relative animate-rise overflow-hidden rounded-2xl border border-white/5 bg-[#1E1E24]/70 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]"
    >
      <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-400/0 to-transparent transition-all duration-300 group-hover:via-neon-400/70 group-hover:shadow-[0_0_14px_rgba(57,255,20,0.5)]" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <div className="rounded-lg bg-white/5 p-2 text-slate-300 transition group-hover:text-neon-300">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-white sm:text-[26px]">{value}</p>
      <div className="mt-4 border-t border-white/5 pt-3">{footer}</div>
    </div>
  );
}

function DeltaBadge({ delta, suffix }: { delta: number; suffix?: string }) {
  const positive = delta >= 0;
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          positive
            ? 'bg-neon-400/10 text-neon-300 ring-1 ring-neon-400/30'
            : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30'
        }`}
      >
        {positive ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {positive ? '+' : ''}
        {delta.toFixed(1)}%
      </span>
      {suffix && <span className="text-[11px] text-slate-500">{suffix}</span>}
    </div>
  );
}

function FooterMetric({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: 'neon' | 'sky' | 'amber';
  icon?: React.ReactNode;
}) {
  const toneMap = {
    neon: 'text-neon-300 drop-shadow-[0_0_8px_rgba(57,255,20,0.35)]',
    sky: 'text-sky-300',
    amber: 'text-amber-300',
  };
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
        {icon}
        {label}
      </span>
      <span className={`text-sm font-bold ${toneMap[tone]}`}>{value}</span>
    </div>
  );
}

function FinancialPanel({
  cpa,
  rev,
  total,
  format,
}: {
  cpa: number;
  rev: number;
  total: number;
  format: (v: number) => string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#1A1F1C] via-[#1A1A20] to-[#14201A] p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] transition-all duration-300 sm:p-8">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-neon-400/5 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Sparkles className="h-3 w-3" /> Comissões CPA
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{format(cpa)}</p>
            <p className="mt-1 text-xs text-slate-500">Valor fixo por jogador qualificado</p>
          </div>

          <div className="relative sm:pl-6 lg:border-l lg:border-white/5 lg:pl-8">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Sparkles className="h-3 w-3" /> Comissões REV
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{format(rev)}</p>
            <p className="mt-1 text-xs text-slate-500">Participação recorrente na receita</p>
          </div>

          <div className="relative sm:col-span-2 lg:col-span-1 lg:border-l lg:border-white/5 lg:pl-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-300">
              Saldo Total Disponível
            </p>
            <p className="mt-2 text-4xl font-extrabold leading-none text-neon-300 drop-shadow-[0_0_18px_rgba(57,255,20,0.5)] sm:text-5xl">
              {format(total)}
            </p>
            <p className="mt-2 text-xs text-slate-400">Atualizado em tempo real</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
