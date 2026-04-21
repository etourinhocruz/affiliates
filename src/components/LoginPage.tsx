import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';

type Props = {
  onSuccess: () => void;
};

export default function LoginPage({ onSuccess }: Props) {
  const VALID_EMAIL = 'pierre@affiliates.com';
  const VALID_PASSWORD = 'Pierre@2026';

  const [email, setEmail] = useState(VALID_EMAIL);
  const [password, setPassword] = useState(VALID_PASSWORD);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (email.trim() !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setError('Credenciais inválidas. Tente novamente.');
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      if (remember) localStorage.setItem('amg.session', '1');
      else sessionStorage.setItem('amg.session', '1');
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="flex min-h-screen w-full bg-black text-slate-200">
      {/* Left column — Branding / Immersion */}
      <aside className="relative hidden w-1/2 overflow-hidden lg:flex">
        {/* Mesh gradient base */}
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 20% 15%, rgba(16,66,40,0.75), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(6,36,22,0.8), transparent 60%), radial-gradient(ellipse 70% 55% at 50% 50%, rgba(12,48,28,0.55), transparent 65%), linear-gradient(180deg, #030806 0%, #000000 100%)',
          }}
        />
        {/* Subtle top light sweep */}
        <div
          className="absolute -top-40 left-1/2 h-[60%] w-[120%] -translate-x-1/2 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(57,255,20,0.10) 0%, rgba(57,255,20,0.04) 30%, transparent 70%)',
          }}
        />
        {/* Diagonal grid with mask fade */}
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(-45deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 70% at 40% 40%, black 30%, transparent 75%)',
            maskImage:
              'radial-gradient(ellipse 70% 70% at 40% 40%, black 30%, transparent 75%)',
          }}
        />
        {/* Neon orbs */}
        <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#39FF14]/10 blur-[140px]" />
        <div className="absolute -bottom-40 right-0 h-[24rem] w-[24rem] rounded-full bg-emerald-600/10 blur-[140px]" />

        <div className="relative z-10 flex w-full flex-col justify-between p-14 xl:pl-20 xl:pr-16 xl:py-20">
          {/* Logo */}
          <div
            className="flex items-center gap-4 animate-hero"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-black p-2 ring-1 ring-[#39FF14]/40 shadow-[0_0_28px_rgba(57,255,20,0.4)]">
              <img
                src="/AFFILIATES_LOGO_PNG_(2).png"
                alt="Mansão Green Affiliates"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <p className="text-2xl font-bold tracking-tight text-white">
                Mansão{' '}
                <span className="text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
                  Green
                </span>
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-400">
                Affiliates
              </p>
            </div>
          </div>

          {/* Hero copy */}
          <div className="max-w-xl">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[#39FF14]/25 bg-[#39FF14]/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#7CFF58] animate-hero backdrop-blur-sm"
              style={{ animationDelay: '120ms' }}
            >
              <Sparkles className="h-3 w-3" /> Programa VIP
            </span>

            <h1
              className="mt-8 text-[60px] font-extrabold leading-[0.98] tracking-[-0.035em] animate-hero xl:text-[78px]"
              style={{ animationDelay: '220ms' }}
            >
              <span className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                O Seu
              </span>{' '}
              <span className="relative inline-block bg-gradient-to-r from-[#7CFF58] via-[#39FF14] to-emerald-400 bg-clip-text pr-1 text-transparent drop-shadow-[0_0_30px_rgba(57,255,20,0.45)]">
                Império
              </span>
              <br />
              <span className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                no iGaming.
              </span>
            </h1>

            <p
              className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 animate-hero xl:text-[17px]"
              style={{ animationDelay: '340ms' }}
            >
              Gerencie suas campanhas, acompanhe suas comissões em tempo real e
              desbloqueie prêmios exclusivos no programa mais premium do mercado.
            </p>

            {/* Floating glass card with minimal growth chart */}
            <div
              className="group relative mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-hero transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:border-[#39FF14]/25 hover:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95),0_0_40px_rgba(57,255,20,0.12)]"
              style={{ animationDelay: '460ms' }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(57,255,20,0.12),transparent_55%)]" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Comissão Acumulada
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                    R$ 184.320
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#7CFF58]">
                    <ArrowRight className="h-3 w-3 -rotate-45" />
                    +38,2% este mês
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39FF14]/10 ring-1 ring-[#39FF14]/30">
                  <Sparkles className="h-4 w-4 text-[#7CFF58]" />
                </div>
              </div>

              <div className="relative mt-5 h-[92px] w-full">
                <svg
                  viewBox="0 0 400 100"
                  preserveAspectRatio="none"
                  className="h-full w-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="60%" stopColor="#39FF14" />
                      <stop offset="100%" stopColor="#B6FFA1" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#39FF14" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 C40,72 70,66 110,56 C150,46 180,52 215,38 C250,24 290,30 325,18 C355,8 380,6 400,4 L400,100 L0,100 Z"
                    fill="url(#areaGrad)"
                  />
                  <path
                    d="M0,80 C40,72 70,66 110,56 C150,46 180,52 215,38 C250,24 290,30 325,18 C355,8 380,6 400,4"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="animate-draw drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]"
                  />
                  <circle cx="400" cy="4" r="4" fill="#39FF14" className="drop-shadow-[0_0_10px_rgba(57,255,20,0.9)]" />
                </svg>
              </div>
            </div>
          </div>

          <p
            className="text-xs text-slate-600 animate-hero"
            style={{ animationDelay: '620ms' }}
          >
            &copy; {new Date().getFullYear()} Mansão Green Affiliates. Todos os direitos reservados.
          </p>
        </div>
      </aside>

      {/* Right column — Glass vault */}
      <section className="relative flex w-full flex-1 items-center justify-center bg-black px-4 py-12 sm:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-40 right-[-10%] h-[32rem] w-[32rem] rounded-full bg-[#39FF14]/[0.04] blur-[140px]" />
          <div className="absolute bottom-[-20%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/[0.04] blur-[140px]" />
        </div>

        <div
          className="relative w-full max-w-md animate-hero"
          style={{ animationDelay: '200ms' }}
        >
          {/* Outer neon glow */}
          <div className="absolute -inset-6 rounded-[2rem] bg-[#39FF14]/[0.03] blur-2xl" />
          <div className="absolute -inset-2 rounded-[1.75rem] shadow-[0_0_50px_rgba(57,255,20,0.05)]" />

          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),0_0_50px_rgba(57,255,20,0.05)] backdrop-blur-2xl transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),0_0_80px_rgba(57,255,20,0.12)] sm:p-10">
            {/* top inner highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-black p-1.5 ring-1 ring-[#39FF14]/40">
                <img
                  src="/AFFILIATES_LOGO_PNG_(2).png"
                  alt="Mansão Green"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Bem-vindo
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Insira suas credenciais para acessar sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field
                id="email"
                label="E-mail"
                type="email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  if (error) setError(null);
                }}
                placeholder="voce@exemplo.com"
                icon={<Mail className="h-4 w-4" />}
                autoComplete="email"
                required
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-widest text-gray-400"
                  >
                    Senha
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 transition hover:text-[#39FF14]"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-[#39FF14]">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="h-14 w-full rounded-xl border border-white/10 bg-black/50 pl-11 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/50 focus:shadow-[0_0_0_4px_rgba(57,255,20,0.08)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:text-[#39FF14]"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-400">
                <span className="relative inline-flex">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer h-4 w-4 appearance-none rounded border border-white/15 bg-black/50 transition checked:border-[#39FF14] checked:bg-[#39FF14]/20 focus:outline-none focus:ring-2 focus:ring-[#39FF14]/40"
                  />
                  <svg
                    viewBox="0 0 16 16"
                    className="pointer-events-none absolute left-0 top-0 h-4 w-4 scale-0 text-[#39FF14] transition peer-checked:scale-100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8.5l3.2 3.2L13 5" />
                  </svg>
                </span>
                Lembrar de mim
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#7CFF58]/40 bg-gradient-to-b from-[#7CFF58] via-[#39FF14] to-[#17B800] text-sm font-bold uppercase tracking-[0.22em] text-black shadow-[0_10px_30px_-8px_rgba(57,255,20,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 hover:animate-pulse-glow hover:shadow-[0_0_32px_rgba(57,255,20,0.6),0_18px_44px_-10px_rgba(57,255,20,0.65),inset_0_1px_0_rgba(255,255,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/60 disabled:cursor-not-allowed disabled:opacity-85 disabled:hover:translate-y-0 disabled:hover:animate-none"
              >
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
                <span
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/40 opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100"
                />
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    <span className="relative">Autenticando...</span>
                  </>
                ) : (
                  <span className="relative inline-flex items-center gap-2">
                    Entrar no Painel
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                )}
              </button>

              {error && (
                <p
                  role="alert"
                  className="animate-fade-in text-center text-sm font-medium text-rose-400/90"
                >
                  {error}
                </p>
              )}
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Ainda não é parceiro?{' '}
              <a
                href="#"
                className="font-semibold text-[#39FF14] transition hover:text-[#7CFF58] hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]"
              >
                Solicitar Acesso
              </a>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Ao entrar, você concorda com nossos Termos e Política de Privacidade.
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400"
      >
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-[#39FF14]">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="h-14 w-full rounded-xl border border-white/10 bg-black/50 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/50 focus:shadow-[0_0_0_4px_rgba(57,255,20,0.08)]"
        />
      </div>
    </div>
  );
}


export default LoginPage