import { Trophy, Lock, Sparkles, Flame } from 'lucide-react';

type Prize = {
  id: string;
  title: string;
  subtitle: string;
  qftdTarget: number;
  image: string;
};

const mockPrizes: Prize[] = [
  {
    id: 'apple-watch-se3',
    title: 'Apple Watch SE3',
    subtitle: 'Smartwatch Apple',
    qftdTarget: 500,
    image: '/Captura_de_Tela_2026-04-20_às_23.55.20.png',
  },
  {
    id: 'ipad-11',
    title: 'iPad 11',
    subtitle: 'Tablet Apple',
    qftdTarget: 800,
    image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'kit-apple',
    title: 'Kit Apple',
    subtitle: 'iPhone 17 Pro Max + Macbook + AirPods',
    qftdTarget: 2000,
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'cancun',
    title: 'Viagem Cancún All Inclusive',
    subtitle: '4 Noites + Acompanhante',
    qftdTarget: 4000,
    image: 'https://images.pexels.com/photos/1island/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'final-champions',
    title: 'Passaporte Final Champions League',
    subtitle: 'Hotel 5 estrelas, passagem Premium Economy, ingresso + 2 camisas oficiais dos finalistas',
    qftdTarget: 7000,
    image: 'https://images.pexels.com/photos/140066/pexels-photo-140066.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'cash-100k',
    title: 'R$ 100.000,00 no PIX',
    subtitle: 'Direto na sua conta',
    qftdTarget: 10000,
    image: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'copa-mundo',
    title: 'Passaporte Copa do Mundo',
    subtitle: 'Hotel 4 estrelas, passagem Premium Economy, ingresso para os 3 jogos do Brasil (fase de grupos) + camisa oficial do Brasil',
    qftdTarget: 15000,
    image: 'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'bmw-320i',
    title: 'BMW 320i 0KM 2026',
    subtitle: 'O carro dos seus sonhos',
    qftdTarget: 25000,
    image: 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

export default function GamificationPage() {
  const currentQFTDs = 2450;

  const unlockedCount = mockPrizes.filter((p) => currentQFTDs >= p.qftdTarget).length;
  const nextPrize = mockPrizes.find((p) => currentQFTDs < p.qftdTarget);

  return (
    <>
      <div className="mb-8 animate-rise">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Gamificação SuperBet
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Desbloqueie recompensas exclusivas ao atingir metas de QFTD.
        </p>
      </div>

      <section
        className="relative mb-8 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0F1A12] via-[#101016] to-[#14201A] p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] animate-rise sm:p-8"
        style={{ animationDelay: '60ms' }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neon-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-400/25 to-emerald-500/10 ring-1 ring-neon-400/40 shadow-[0_0_22px_rgba(57,255,20,0.35)]">
              <Trophy className="h-6 w-6 text-neon-300" />
            </div>
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neon-300">
                <Sparkles className="h-3 w-3" /> Ranking SuperBet
              </p>
              <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Ranking de Gamificação SuperBet
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Seu saldo atual:{' '}
                <span className="text-xl font-extrabold text-neon-300 drop-shadow-[0_0_10px_rgba(57,255,20,0.55)]">
                  {currentQFTDs.toLocaleString('pt-BR')}
                </span>{' '}
                QFTDs válidos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-stretch gap-3">
            <div className="min-w-[160px] rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-3 backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Prêmios desbloqueados
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {unlockedCount}
                <span className="text-sm text-slate-500"> / {mockPrizes.length}</span>
              </p>
            </div>
            {nextPrize && (
              <div className="min-w-[200px] rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-3 backdrop-blur-md">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Flame className="h-3 w-3 text-amber-300" /> Próxima meta
                </p>
                <p className="mt-1 truncate text-sm font-bold text-white">{nextPrize.title}</p>
                <p className="text-xs text-slate-400">
                  Faltam{' '}
                  <span className="font-bold text-neon-300">
                    {(nextPrize.qftdTarget - currentQFTDs).toLocaleString('pt-BR')}
                  </span>{' '}
                  QFTDs
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mockPrizes.map((prize, index) => {
          const progress = Math.min((currentQFTDs / prize.qftdTarget) * 100, 100);
          const unlocked = currentQFTDs >= prize.qftdTarget;
          const missing = Math.max(prize.qftdTarget - currentQFTDs, 0);

          return (
            <article
              key={prize.id}
              style={{ animationDelay: `${120 + index * 60}ms` }}
              className="group relative flex animate-rise flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#121212] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-neon-400/30 hover:shadow-[0_20px_50px_-20px_rgba(57,255,20,0.35)]"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-neon-400/[0.06] blur-3xl transition-opacity duration-500 group-hover:bg-neon-400/[0.12]" />

              <div className="relative flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                    unlocked
                      ? 'bg-neon-400/15 text-neon-300 ring-1 ring-neon-400/40'
                      : 'bg-white/5 text-slate-400 ring-1 ring-white/10'
                  }`}
                >
                  {unlocked ? (
                    <>
                      <Trophy className="h-3 w-3" /> Desbloqueado
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" /> Bloqueado
                    </>
                  )}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Meta:{' '}
                  <span className="text-slate-300">
                    {prize.qftdTarget.toLocaleString('pt-BR')}
                  </span>
                </span>
              </div>

              <div className="relative mt-5 flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent ring-1 ring-white/5">
                <img
                  src={prize.image}
                  alt={prize.title}
                  className="h-full w-full rounded-xl object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
              </div>

              <div className="relative mt-5 flex flex-col items-center text-center">
                <h3 className="text-lg font-bold text-white">{prize.title}</h3>
                <p className="mt-1 text-xs font-medium text-neon-300/90">{prize.subtitle}</p>
              </div>

              <div className="relative mt-5">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400">
                    <span className="text-white">{currentQFTDs.toLocaleString('pt-BR')}</span>
                    {' / '}
                    {prize.qftdTarget.toLocaleString('pt-BR')} QFTDs
                  </span>
                  <span
                    className={`font-bold ${
                      unlocked ? 'text-neon-300' : 'text-slate-400'
                    }`}
                  >
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-500 via-neon-400 to-neon-300 shadow-[0_0_12px_rgba(57,255,20,0.6)] transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="relative mt-5">
                {unlocked ? (
                  <button className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon-400 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_24px_rgba(57,255,20,0.4)] transition-all duration-300 hover:bg-neon-300 hover:shadow-[0_0_36px_rgba(57,255,20,0.65)]">
                    <Trophy className="h-4 w-4 transition group-hover/btn:-translate-y-0.5" />
                    Resgatar Prêmio
                  </button>
                ) : (
                  <button
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/[0.04] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 ring-1 ring-white/5"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Faltam {missing.toLocaleString('pt-BR')} QFTDs
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
