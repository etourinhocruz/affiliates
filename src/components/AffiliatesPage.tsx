import { useMemo, useState } from 'react';
import {
  ChevronRight,
  Copy,
  Check,
  Link2,
  TrendingUp,
  Users,
  X,
  Sparkles,
  Zap,
  Layers,
  Wallet,
} from 'lucide-react';

type Affiliate = {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  ftds: number;
  profitGenerated: number;
  cpaDeal: number;
  revDeal: number;
  subAffiliates?: Affiliate[];
};

const masterLimits = {
  cpaMax: 200,
  revMax: 30,
};

const mockDownline: Affiliate[] = [
  {
    id: 'a1',
    name: 'Rafael Martins',
    level: 1,
    ftds: 312,
    profitGenerated: 48720,
    cpaDeal: 120,
    revDeal: 18,
    subAffiliates: [
      {
        id: 'a1-1',
        name: 'Bruno Azevedo',
        level: 2,
        ftds: 158,
        profitGenerated: 19840,
        cpaDeal: 80,
        revDeal: 12,
        subAffiliates: [
          {
            id: 'a1-1-1',
            name: 'Camila Souza',
            level: 3,
            ftds: 74,
            profitGenerated: 6920,
            cpaDeal: 50,
            revDeal: 8,
            subAffiliates: [
              {
                id: 'a1-1-1-1',
                name: 'Diego Lopes',
                level: 4,
                ftds: 31,
                profitGenerated: 2140,
                cpaDeal: 30,
                revDeal: 5,
                subAffiliates: [
                  {
                    id: 'a1-1-1-1-1',
                    name: 'Eduarda Prado',
                    level: 5,
                    ftds: 12,
                    profitGenerated: 680,
                    cpaDeal: 15,
                    revDeal: 3,
                  },
                ],
              },
            ],
          },
          {
            id: 'a1-1-2',
            name: 'Felipe Rocha',
            level: 3,
            ftds: 42,
            profitGenerated: 3120,
            cpaDeal: 45,
            revDeal: 7,
          },
        ],
      },
      {
        id: 'a1-2',
        name: 'Gabriela Nunes',
        level: 2,
        ftds: 96,
        profitGenerated: 11240,
        cpaDeal: 75,
        revDeal: 11,
      },
    ],
  },
  {
    id: 'a2',
    name: 'Marina Castro',
    level: 1,
    ftds: 248,
    profitGenerated: 36180,
    cpaDeal: 110,
    revDeal: 16,
    subAffiliates: [
      {
        id: 'a2-1',
        name: 'Henrique Lima',
        level: 2,
        ftds: 112,
        profitGenerated: 13480,
        cpaDeal: 70,
        revDeal: 10,
        subAffiliates: [
          {
            id: 'a2-1-1',
            name: 'Isabela Ramos',
            level: 3,
            ftds: 54,
            profitGenerated: 4280,
            cpaDeal: 40,
            revDeal: 6,
          },
        ],
      },
    ],
  },
  {
    id: 'a3',
    name: 'Thiago Moreira',
    level: 1,
    ftds: 189,
    profitGenerated: 27890,
    cpaDeal: 100,
    revDeal: 15,
    subAffiliates: [
      {
        id: 'a3-1',
        name: 'João Vitor',
        level: 2,
        ftds: 88,
        profitGenerated: 9420,
        cpaDeal: 65,
        revDeal: 10,
      },
      {
        id: 'a3-2',
        name: 'Larissa Campos',
        level: 2,
        ftds: 61,
        profitGenerated: 6480,
        cpaDeal: 60,
        revDeal: 9,
      },
    ],
  },
  {
    id: 'a4',
    name: 'Patricia Andrade',
    level: 1,
    ftds: 134,
    profitGenerated: 18420,
    cpaDeal: 90,
    revDeal: 14,
  },
];

const levelStyles: Record<number, { badge: string; rail: string; dot: string }> = {
  1: {
    badge: 'bg-neon-400/15 text-neon-300 ring-neon-400/40',
    rail: 'from-neon-400/50 to-neon-400/0',
    dot: 'bg-neon-400 shadow-[0_0_10px_rgba(57,255,20,0.7)]',
  },
  2: {
    badge: 'bg-sky-400/15 text-sky-300 ring-sky-400/40',
    rail: 'from-sky-400/50 to-sky-400/0',
    dot: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.6)]',
  },
  3: {
    badge: 'bg-fuchsia-400/15 text-fuchsia-300 ring-fuchsia-400/40',
    rail: 'from-fuchsia-400/50 to-fuchsia-400/0',
    dot: 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.6)]',
  },
  4: {
    badge: 'bg-amber-400/15 text-amber-300 ring-amber-400/40',
    rail: 'from-amber-400/50 to-amber-400/0',
    dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]',
  },
  5: {
    badge: 'bg-rose-400/15 text-rose-300 ring-rose-400/40',
    rail: 'from-rose-400/50 to-rose-400/0',
    dot: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.6)]',
  },
};

const campaigns = [
  { id: 'general', label: 'Geral — mansaogreen.com/r/' },
  { id: 'elite', label: 'Recrutamento Elite — /r/elite/' },
  { id: 'stream', label: 'Streamers & Criadores — /r/stream/' },
  { id: 'social', label: 'Tráfego Social — /r/social/' },
];

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

function countByLevel(list: Affiliate[], level: number, acc = { count: 0, revenue: 0 }) {
  for (const a of list) {
    if (a.level === level) {
      acc.count += 1;
      acc.revenue += a.profitGenerated;
    }
    if (a.subAffiliates) countByLevel(a.subAffiliates, level, acc);
  }
  return acc;
}

export default function AffiliatesPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ a1: true });
  const [copied, setCopied] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0].id);
  const [modalTarget, setModalTarget] = useState<Affiliate | null>(null);

  const inviteLink = useMemo(() => {
    const base = 'https://mansaogreen.com/r/';
    const c = selectedCampaign === 'general' ? '' : `${selectedCampaign}/`;
    return `${base}${c}lucas-master`;
  }, [selectedCampaign]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const toggle = (id: string) =>
    setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const funnelLevels = [1, 2, 3, 4, 5].map((lv) => ({
    level: lv,
    ...countByLevel(mockDownline, lv),
  }));

  const totalActive = funnelLevels.reduce((s, l) => s + l.count, 0);
  const totalRevenue = funnelLevels.reduce((s, l) => s + l.revenue, 0);

  return (
    <>
      <div className="mb-8 animate-rise">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Meus Afiliados
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie sua rede multi-nível e ajuste o repasse de cada afiliado em tempo real.
        </p>
      </div>

      <section className="animate-rise" style={{ animationDelay: '60ms' }}>
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#1A1F1C] via-[#161821] to-[#0F1A14] p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neon-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neon-300">
                <Sparkles className="h-3.5 w-3.5" /> Convite Master
              </p>
              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                Recrute líderes e multiplique sua rede
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Gere links específicos para cada campanha de recrutamento.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="appearance-none rounded-xl border border-white/10 bg-[#121218]/80 py-3 pl-4 pr-10 text-sm text-slate-200 outline-none transition focus:border-neon-400/50 focus:ring-2 focus:ring-neon-400/20"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#121218]">
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#0F1013]/80 px-4 py-3 ring-1 ring-inset ring-white/5">
              <Link2 className="h-4 w-4 flex-shrink-0 text-neon-300" />
              <span className="truncate text-sm font-medium text-slate-200">{inviteLink}</span>
            </div>
            <button
              onClick={handleCopy}
              className="group flex items-center justify-center gap-2 rounded-xl bg-neon-400 px-5 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 transition-all duration-200 hover:bg-neon-300 hover:shadow-neon"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Copiar Link
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 animate-rise" style={{ animationDelay: '140ms' }}>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Funil de Rede
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">Performance por nível — últimos 30 dias</h3>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Total da rede</p>
            <p className="text-sm font-bold text-neon-300">
              {totalActive} afiliados · {formatBRL(totalRevenue)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {funnelLevels.map(({ level, count, revenue }, idx) => {
            const styles = levelStyles[level];
            return (
              <div
                key={level}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10"
                style={{ animationDelay: `${200 + idx * 60}ms` }}
              >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${styles.rail}`} />
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${styles.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                    Nível {level}
                  </span>
                  <Layers className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-white">{count}</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  afiliados ativos
                </p>
                <div className="mt-4 border-t border-white/5 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Receita gerada
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-neon-300">{formatBRL(revenue)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 mb-10 animate-rise" style={{ animationDelay: '280ms' }}>
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#141419]/70 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Árvore de Downline
              </p>
              <h3 className="mt-0.5 text-lg font-bold text-white">Expanda cada líder para ver sua rede</h3>
            </div>
            <span className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300 sm:inline-flex">
              <Users className="h-3.5 w-3.5" /> {totalActive} afiliados totais
            </span>
          </div>

          <div className="hidden grid-cols-[minmax(240px,2fr)_auto_1fr_1fr_1fr_auto] items-center gap-4 border-b border-white/5 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:grid">
            <span>Afiliado</span>
            <span>Nível</span>
            <span>FTDs da Rede</span>
            <span>Lucro Gerado</span>
            <span>Deal Atual</span>
            <span className="text-right">Ações</span>
          </div>

          <ul className="divide-y divide-white/5">
            {mockDownline.map((a) => (
              <TreeRow
                key={a.id}
                affiliate={a}
                depth={0}
                expanded={expanded}
                onToggle={toggle}
                onAdjust={setModalTarget}
              />
            ))}
          </ul>
        </div>
      </section>

      {modalTarget && (
        <SpreadModal
          affiliate={modalTarget}
          onClose={() => setModalTarget(null)}
        />
      )}
    </>
  );
}

function TreeRow({
  affiliate,
  depth,
  expanded,
  onToggle,
  onAdjust,
}: {
  affiliate: Affiliate;
  depth: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAdjust: (a: Affiliate) => void;
}) {
  const hasChildren = !!affiliate.subAffiliates?.length;
  const isOpen = !!expanded[affiliate.id];
  const styles = levelStyles[affiliate.level];

  return (
    <li>
      <div
        className="grid grid-cols-[1fr_auto] items-center gap-3 px-6 py-4 transition hover:bg-white/[0.03] md:grid-cols-[minmax(240px,2fr)_auto_1fr_1fr_1fr_auto] md:gap-4"
        style={{ paddingLeft: `${24 + depth * 24}px` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren ? (
            <button
              onClick={() => onToggle(affiliate.id)}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-slate-400 transition hover:border-neon-400/30 hover:text-neon-300"
              aria-label="Expandir"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-300 ${
                  isOpen ? 'rotate-90' : ''
                }`}
              />
            </button>
          ) : (
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
              <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            </div>
          )}

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 text-sm font-bold text-white ring-1 ring-white/10">
              {affiliate.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{affiliate.name}</p>
              <p className="truncate text-[11px] text-slate-500">ID: {affiliate.id.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${styles.badge}`}
        >
          N{affiliate.level}
        </span>

        <div className="hidden md:block">
          <p className="text-sm font-semibold text-white">{affiliate.ftds.toLocaleString('pt-BR')}</p>
          <p className="text-[11px] text-slate-500">FTDs</p>
        </div>

        <div className="hidden md:block">
          <p className="text-sm font-bold text-neon-300">{formatBRL(affiliate.profitGenerated)}</p>
          <p className="text-[11px] text-slate-500">Últimos 30 dias</p>
        </div>

        <div className="hidden md:block">
          <p className="text-sm font-semibold text-white">
            R$ {affiliate.cpaDeal} <span className="text-xs font-normal text-slate-400">CPA</span>
          </p>
          <p className="text-[11px] text-slate-500">{affiliate.revDeal}% Rev</p>
        </div>

        <div className="col-span-2 flex justify-end md:col-span-1">
          <button
            onClick={() => onAdjust(affiliate)}
            className="flex items-center gap-1.5 rounded-lg border border-neon-400/30 bg-neon-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neon-300 transition hover:border-neon-400/60 hover:bg-neon-400/20 hover:shadow-neon"
          >
            <Zap className="h-3.5 w-3.5" />
            Ajustar Repasse
          </button>
        </div>
      </div>

      <div
        className={`grid overflow-hidden transition-all duration-500 ease-out ${
          hasChildren && isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          {hasChildren && (
            <ul className="border-l border-white/5" style={{ marginLeft: `${36 + depth * 24}px` }}>
              {affiliate.subAffiliates!.map((sub) => (
                <TreeRow
                  key={sub.id}
                  affiliate={sub}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  onAdjust={onAdjust}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

function SpreadModal({
  affiliate,
  onClose,
}: {
  affiliate: Affiliate;
  onClose: () => void;
}) {
  const [cpa, setCpa] = useState(affiliate.cpaDeal);
  const [rev, setRev] = useState(affiliate.revDeal);

  const cpaMargin = masterLimits.cpaMax - cpa;
  const revMargin = masterLimits.revMax - rev;

  const simulatedFtds = 100;
  const simulatedRevPerFtd = 420;
  const simulatedProfit =
    cpaMargin * simulatedFtds + (revMargin / 100) * simulatedFtds * simulatedRevPerFtd;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#15181E] via-[#121218] to-[#0D1116] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] animate-rise">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-neon-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex items-start justify-between border-b border-white/5 p-6">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neon-300">
              <Zap className="h-3.5 w-3.5" /> Ajuste de Spread
            </p>
            <h3 className="mt-1.5 text-xl font-bold text-white">{affiliate.name}</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Defina quanto repassar e visualize sua margem em tempo real.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/5 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-300 ring-1 ring-neon-400/30">
              <Wallet className="h-3 w-3" /> Seu limite
            </span>
            <span className="text-sm font-semibold text-white">
              CPA R$ {masterLimits.cpaMax}
            </span>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-sm font-semibold text-white">Rev {masterLimits.revMax}%</span>
          </div>

          <SpreadSlider
            label="CPA (Custo por Aquisição)"
            min={0}
            max={masterLimits.cpaMax}
            step={5}
            value={cpa}
            onChange={setCpa}
            unit="R$"
            repasseLabel={`R$ ${cpa}`}
            marginLabel={`R$ ${cpaMargin}`}
            marginSuffix="por CPA"
          />

          <div className="h-5" />

          <SpreadSlider
            label="RevShare (Receita Recorrente)"
            min={0}
            max={masterLimits.revMax}
            step={1}
            value={rev}
            onChange={setRev}
            unit="%"
            repasseLabel={`${rev}%`}
            marginLabel={`${revMargin}%`}
            marginSuffix="da fatia"
          />

          <div className="mt-7 overflow-hidden rounded-2xl border border-neon-400/20 bg-gradient-to-br from-neon-400/5 via-transparent to-transparent p-5">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neon-300">
              <TrendingUp className="h-3.5 w-3.5" /> Simulador de Ganhos
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Se <span className="font-semibold text-white">{affiliate.name.split(' ')[0]}</span>{' '}
              trouxer <span className="font-semibold text-white">{simulatedFtds} FTDs</span> com este novo acordo,
              seu lucro passivo será de:
            </p>
            <p className="mt-3 text-3xl font-extrabold text-neon-300 drop-shadow-[0_0_18px_rgba(57,255,20,0.45)] sm:text-4xl">
              {formatBRL(Math.round(simulatedProfit))}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Baseado em valor médio de R$ {simulatedRevPerFtd} de receita por FTD qualificado.
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-end gap-3 border-t border-white/5 bg-white/[0.02] p-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/5 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-neon-400 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 transition hover:bg-neon-300 hover:shadow-neon"
          >
            <Check className="h-4 w-4" />
            Salvar Acordo
          </button>
        </div>
      </div>
    </div>
  );
}

function SpreadSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit,
  repasseLabel,
  marginLabel,
  marginSuffix,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  repasseLabel: string;
  marginLabel: string;
  marginSuffix: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
        <p className="text-[11px] text-slate-500">
          {min}
          {unit === '%' ? '%' : ''} – {max}
          {unit === '%' ? '%' : ''}
        </p>
      </div>

      <div className="relative h-2.5 w-full rounded-full bg-white/5 ring-1 ring-inset ring-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 via-sky-300 to-neon-400 shadow-[0_0_16px_rgba(57,255,20,0.45)] transition-[width] duration-150"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-950 [&::-webkit-slider-thumb]:bg-neon-400 [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(57,255,20,0.7)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-950 [&::-moz-range-thumb]:bg-neon-400"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Repasse para o afiliado
          </p>
          <p className="mt-1 text-lg font-bold text-sky-300">{repasseLabel}</p>
        </div>
        <div className="rounded-xl border border-neon-400/30 bg-neon-400/5 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neon-300">
            Sua margem (lucro)
          </p>
          <p className="mt-1 text-lg font-bold text-neon-300 drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
            {marginLabel}{' '}
            <span className="text-[11px] font-normal text-slate-400">{marginSuffix}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
