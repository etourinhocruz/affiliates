import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Cog,
  FileClock,
  Flame,
  Gem,
  LayoutDashboard,
  LineChart,
  Network,
  PieChart,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCog,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import Sidebar, { getMenuForRole } from './components/Sidebar';
import Header from './components/Header';
import RevenueChart from './components/RevenueChart';
import SettingsPage from './components/SettingsPage';
import DealsPage from './components/DealsPage';
import ReportsPage from './components/ReportsPage';
import CampaignsPage from './components/CampaignsPage';
import GamificationPage from './components/GamificationPage';
import AffiliatesPage from './components/AffiliatesPage';
import LoginPage from './components/LoginPage';
import AnimatedNumber from './components/AnimatedNumber';
import PlaceholderPage from './components/PlaceholderPage';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import { useUser } from './contexts/UserContext';
import { supabase } from './lib/supabase';
import type { DailyMetric } from './lib/supabase';
import { fallbackMetrics } from './data/mockData';

type DashboardSegment = {
  house_key: string;
  label: string;
  cadastros: number;
  ftd: number;
  qftd: number;
  deposito_total: number;
  net_revenue: number;
  cpa_commission: number;
  rev_commission: number;
  cadastros_yesterday: number;
  sort_order: number;
};

const fallbackSegments: DashboardSegment[] = [
  {
    house_key: 'all',
    label: 'Geral',
    cadastros: 1235,
    ftd: 428,
    qftd: 342,
    deposito_total: 146910,
    net_revenue: 48300,
    cpa_commission: 18420,
    rev_commission: 6580,
    cadastros_yesterday: 1108,
    sort_order: 1,
  },
  {
    house_key: 'superbet',
    label: 'SuperBet',
    cadastros: 850,
    ftd: 300,
    qftd: 240,
    deposito_total: 102000,
    net_revenue: 35000,
    cpa_commission: 13200,
    rev_commission: 4900,
    cadastros_yesterday: 760,
    sort_order: 2,
  },
  {
    house_key: 'betmgm',
    label: 'BetMGM',
    cadastros: 276,
    ftd: 94,
    qftd: 76,
    deposito_total: 31480,
    net_revenue: 11200,
    cpa_commission: 4100,
    rev_commission: 1380,
    cadastros_yesterday: 248,
    sort_order: 4,
  },
  {
    house_key: 'esportivabet',
    label: 'EsportivaBet',
    cadastros: 232,
    ftd: 78,
    qftd: 62,
    deposito_total: 26820,
    net_revenue: 9400,
    cpa_commission: 3450,
    rev_commission: 1150,
    cadastros_yesterday: 210,
    sort_order: 5,
  },
  {
    house_key: 'betfair',
    label: 'BetFair',
    cadastros: 198,
    ftd: 68,
    qftd: 55,
    deposito_total: 22050,
    net_revenue: 8100,
    cpa_commission: 2900,
    rev_commission: 980,
    cadastros_yesterday: 172,
    sort_order: 6,
  },
  {
    house_key: 'novibet',
    label: 'NoviBet',
    cadastros: 164,
    ftd: 56,
    qftd: 45,
    deposito_total: 18720,
    net_revenue: 6600,
    cpa_commission: 2450,
    rev_commission: 820,
    cadastros_yesterday: 148,
    sort_order: 7,
  },
];

function App() {
  const { selectedHouse, role } = useUser();
  const [activeMenu, setActiveMenu] = useState<string>(() => getMenuForRole(role)[0].key);

  useEffect(() => {
    const items = getMenuForRole(role);
    if (!items.some((i) => i.key === activeMenu)) {
      setActiveMenu(items[0].key);
    }
  }, [role, activeMenu]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [metrics, setMetrics] = useState<DailyMetric[]>(fallbackMetrics);
  const [segments, setSegments] = useState<DashboardSegment[]>(fallbackSegments);
  const [authed, setAuthed] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      (localStorage.getItem('amg.session') === '1' ||
        sessionStorage.getItem('amg.session') === '1'),
  );

  useEffect(() => {
    (async () => {
      const { data: m } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: true });
      if (m && m.length) setMetrics(m as DailyMetric[]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase
        .from('dashboard_segments')
        .select('*')
        .order('sort_order', { ascending: true });
      if (s && s.length) setSegments(s as DashboardSegment[]);
    })();
  }, []);

  const segment = useMemo(
    () => segments.find((s) => s.house_key === selectedHouse) ?? segments[0],
    [segments, selectedHouse],
  );

  const allSegment = useMemo(
    () => segments.find((s) => s.house_key === 'all') ?? segments[0],
    [segments],
  );

  const funnel = useMemo(() => {
    const cadastrosDelta =
      segment.cadastros_yesterday > 0
        ? ((segment.cadastros - segment.cadastros_yesterday) /
            segment.cadastros_yesterday) *
          100
        : 0;
    const revLiquido = Number(segment.cpa_commission) + Number(segment.rev_commission);
    return {
      cadastros: segment.cadastros,
      cadastrosDelta,
      ftd: segment.ftd,
      ftdConv: segment.cadastros ? (segment.ftd / segment.cadastros) * 100 : 0,
      qftd: segment.qftd,
      qftdConv: segment.ftd ? (segment.qftd / segment.ftd) * 100 : 0,
      depositoTotal: Number(segment.deposito_total),
      valuePlayer: segment.ftd ? Number(segment.deposito_total) / segment.ftd : 0,
      netRevenue: Number(segment.net_revenue),
      revLiquido,
      cpaCommission: Number(segment.cpa_commission),
      revCommission: Number(segment.rev_commission),
    };
  }, [segment]);

  const segmentScale = useMemo(() => {
    if (!allSegment || !allSegment.cadastros) return 1;
    return segment.cadastros / allSegment.cadastros;
  }, [segment, allSegment]);

  const handleLogout = () => {
    localStorage.removeItem('amg.session');
    sessionStorage.removeItem('amg.session');
    setAuthed(false);
    setActiveMenu('overview');
  };

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />;
  }

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

  const renderDashboard = () => (
    <>
      <div className="mb-8 animate-rise" style={{ animationDelay: '0ms' }}>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Visão Geral
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Acompanhe suas métricas de afiliação em tempo real.
          {segment.house_key !== 'all' && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-neon-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              {segment.label}
            </span>
          )}
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Pillar
          delay={60}
          icon={<UserPlus className="h-5 w-5" />}
          label="Cadastros"
          value={<AnimatedNumber value={funnel.cadastros} format={formatInt} />}
          footer={<DeltaBadge delta={funnel.cadastrosDelta} suffix="vs ontem" />}
        />
        <Pillar
          delay={120}
          icon={<Flame className="h-5 w-5" />}
          label="FTD"
          value={<AnimatedNumber value={funnel.ftd} format={formatInt} />}
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
          value={<AnimatedNumber value={funnel.qftd} format={formatInt} />}
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
          value={<AnimatedNumber value={funnel.depositoTotal} format={formatBRLCompact} />}
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
          value={<AnimatedNumber value={funnel.netRevenue} format={formatBRLCompact} />}
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
        <RevenueChart
          data={metrics}
          segmentKey={selectedHouse}
          segmentScale={segmentScale}
          segmentLabel={segment.label}
        />
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
      case 'gamification':
        return <GamificationPage />;
      case 'affiliates':
        return <AffiliatesPage />;
      case 'overview':
        return renderDashboard();

      case 'admin-dashboard':
        return <SuperAdminDashboard />;
      case 'admin-users':
        return (
          <PlaceholderPage
            roleLabel="Super Admin · Gestão de Usuários"
            title="Gestão de Usuários"
            subtitle="Controle de contas, permissões e hierarquia da plataforma."
            icon={UserCog}
          />
        );
      case 'admin-withdrawals':
        return (
          <PlaceholderPage
            roleLabel="Super Admin · Financeiro"
            title="Aprovação de Saques"
            subtitle="Fila de saques pendentes para revisão e liberação."
            icon={ShieldCheck}
          />
        );
      case 'admin-audit':
        return (
          <PlaceholderPage
            roleLabel="Super Admin · Compliance"
            title="Auditoria"
            subtitle="Log completo de ações administrativas e integrações."
            icon={FileClock}
          />
        );
      case 'admin-settings':
        return (
          <PlaceholderPage
            roleLabel="Super Admin · Plataforma"
            title="Configurações Globais"
            subtitle="Parâmetros de comissão, integrações e governança."
            icon={Cog}
          />
        );

      case 'agency-overview':
        return (
          <PlaceholderPage
            roleLabel="Agency Suite"
            title="Visão Geral da Agência"
            subtitle="Performance consolidada de toda a sua rede de afiliados."
            icon={LayoutDashboard}
          />
        );
      case 'agency-network':
        return (
          <PlaceholderPage
            roleLabel="Agency Suite"
            title="Minha Rede"
            subtitle="Estrutura e performance dos afiliados sob gestão."
            icon={Network}
          />
        );
      case 'agency-reports':
        return (
          <PlaceholderPage
            roleLabel="Agency Suite"
            title="Relatórios"
            subtitle="Analise os resultados agregados da agência."
            icon={BarChart3}
          />
        );
      case 'agency-settings':
        return (
          <PlaceholderPage
            roleLabel="Agency Suite"
            title="Configurações"
            subtitle="Preferências e dados cadastrais da agência."
            icon={SettingsIcon}
          />
        );

      case 'manager-dashboard':
        return (
          <PlaceholderPage
            roleLabel="Manager Suite"
            title="Dashboard Gerencial"
            subtitle="Acompanhe o time de afiliados sob sua gestão."
            icon={Briefcase}
          />
        );
      case 'manager-affiliates':
        return (
          <PlaceholderPage
            roleLabel="Manager Suite"
            title="Afiliados"
            subtitle="Gerencie metas, comissões e status dos afiliados."
            icon={Users}
          />
        );
      case 'manager-settings':
        return (
          <PlaceholderPage
            roleLabel="Manager Suite"
            title="Configurações"
            subtitle="Preferências gerenciais e notificações."
            icon={SettingsIcon}
          />
        );

      case 'sub-overview':
        return (
          <PlaceholderPage
            roleLabel="Sub-Afiliado"
            title="Visão Resumida"
            subtitle="Resumo simplificado da sua performance."
            icon={PieChart}
          />
        );
      case 'sub-reports':
        return (
          <PlaceholderPage
            roleLabel="Sub-Afiliado"
            title="Relatórios"
            subtitle="Consulte os seus dados de conversão."
            icon={BarChart3}
          />
        );
      case 'sub-settings':
        return (
          <PlaceholderPage
            roleLabel="Sub-Afiliado"
            title="Configurações"
            subtitle="Ajustes da sua conta."
            icon={SettingsIcon}
          />
        );

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-900 transition-colors duration-300 dark:bg-[#0B0E14] dark:text-slate-200">
      <div className="pointer-events-none fixed inset-0 hidden overflow-hidden dark:block">
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
        <Header
          onOpenMobile={() => setMobileOpen(true)}
          onNavigate={setActiveMenu}
          onLogout={handleLogout}
        />

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
  value: React.ReactNode;
  footer: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="group relative animate-rise overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_38px_-10px_rgba(15,23,42,0.12)] dark:border-gray-800 dark:bg-[#1E1E24] dark:shadow-none dark:hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]"
    >
      <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-400/0 to-transparent transition-all duration-300 group-hover:via-neon-400/70 group-hover:shadow-[0_0_14px_rgba(57,255,20,0.5)]" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <div className="rounded-lg bg-gray-100 p-2 text-gray-600 transition group-hover:text-neon-500 dark:bg-white/5 dark:text-slate-300 dark:group-hover:text-neon-300">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900 dark:text-white sm:text-[26px]">
        {value}
      </p>
      <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-800">{footer}</div>
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
            ? 'bg-gray-900 text-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.15)] dark:bg-neon-400/10 dark:text-neon-300 dark:shadow-none dark:ring-1 dark:ring-neon-400/30'
            : 'bg-gray-900 text-rose-400 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-1 dark:ring-rose-400/30'
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
      {suffix && <span className="text-[11px] text-gray-500 dark:text-slate-500">{suffix}</span>}
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
    neon: 'text-neon-700 dark:text-neon-300 dark:drop-shadow-[0_0_8px_rgba(57,255,20,0.35)]',
    sky: 'text-sky-600 dark:text-sky-300',
    amber: 'text-amber-600 dark:text-amber-300',
  };
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
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
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-200 dark:border-gray-800 dark:bg-[#1E1E24] dark:shadow-none flex flex-col md:flex-row md:items-stretch md:justify-between gap-6">
      <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            <Sparkles className="h-3 w-3" /> Comissões CPA
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            <AnimatedNumber value={cpa} format={format} />
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Valor fixo por jogador qualificado</p>
        </div>

        <div className="flex-1 sm:border-l sm:border-gray-200 sm:pl-10 dark:sm:border-gray-800">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            <Sparkles className="h-3 w-3" /> Comissões REV
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            <AnimatedNumber value={rev} format={format} />
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Participação recorrente na receita</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gray-900 p-5 text-right ring-1 ring-gray-900 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] md:min-w-[280px] dark:ring-white/5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-neon-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-neon-400/10 blur-3xl" />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Saldo Total Disponível
        </p>
        <p className="relative mt-2 text-4xl font-extrabold leading-none tabular-nums text-[#39FF14] drop-shadow-[0_0_18px_rgba(57,255,20,0.55)] sm:text-5xl">
          <AnimatedNumber value={total} format={format} />
        </p>
        <p className="relative mt-2 text-xs text-slate-400">Atualizado em tempo real</p>
      </div>
    </div>
  );
}

export default App;
