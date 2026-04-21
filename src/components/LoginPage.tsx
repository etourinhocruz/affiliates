import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

type Props = {
  onSuccess: () => void;
};

export default function LoginPage({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => {
      if (remember) localStorage.setItem('amg.session', '1');
      else sessionStorage.setItem('amg.session', '1');
      setLoading(false);
      onSuccess();
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-200">
      <aside className="relative hidden w-1/2 overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-[#0B0E14]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="absolute -top-32 -left-20 h-[28rem] w-[28rem] rounded-full bg-neon-400/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-10 h-[22rem] w-[22rem] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(57,255,20,0.08),transparent_60%)]" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-black p-1.5 ring-1 ring-neon-400/40 shadow-[0_0_22px_rgba(57,255,20,0.35)]">
              <img
                src="/AFFILIATES_LOGO_PNG_(2).png"
                alt="Mansão Green Affiliates"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <p className="text-[17px] font-bold tracking-tight text-white">
                Mansão{' '}
                <span className="text-neon-400 drop-shadow-[0_0_6px_rgba(57,255,20,0.55)]">
                  Green
                </span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-300">
                Affiliates
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-400/30 bg-neon-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-neon-300">
              <Sparkles className="h-3 w-3" /> Programa VIP
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-6xl">
              A Elite do{' '}
              <span className="bg-gradient-to-r from-neon-300 via-neon-400 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(57,255,20,0.35)]">
                iGaming.
              </span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-400 xl:text-lg">
              Gerencie suas campanhas, acompanhe suas comissões em tempo real e desbloqueie prêmios exclusivos.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FeatureRow
                icon={<TrendingUp className="h-4 w-4" />}
                title="Comissões em tempo real"
                desc="Dashboard vivo com CPA + RevShare."
              />
              <FeatureRow
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Parcerias premium"
                desc="Acesso antecipado às melhores casas."
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Mansão Green Affiliates. Todos os direitos reservados.
          </p>
        </div>
      </aside>

      <section className="relative flex w-full flex-1 items-center justify-center bg-[#121212] px-4 py-12 sm:px-8">
        <div className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-neon-400/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-10">
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-black p-1.5 ring-1 ring-neon-400/40">
                <img
                  src="/AFFILIATES_LOGO_PNG_(2).png"
                  alt="Mansão Green"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                Bem-vindo de volta
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
                onChange={setEmail}
                placeholder="voce@exemplo.com"
                icon={<Mail className="h-4 w-4" />}
                autoComplete="email"
                required
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Senha
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-400 transition hover:text-neon-400"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-neon-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#39FF14] focus:shadow-[0_0_0_4px_rgba(57,255,20,0.12)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:text-neon-400"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-400">
                <span className="relative inline-flex">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer h-4 w-4 appearance-none rounded border border-white/15 bg-black/40 transition checked:border-neon-400 checked:bg-neon-400/20 focus:outline-none focus:ring-2 focus:ring-neon-400/40"
                  />
                  <svg
                    viewBox="0 0 16 16"
                    className="pointer-events-none absolute left-0 top-0 h-4 w-4 scale-0 text-neon-400 transition peer-checked:scale-100"
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
                className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neon-400 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-black shadow-[0_10px_30px_-10px_rgba(57,255,20,0.6)] transition-all duration-300 hover:bg-neon-300 hover:shadow-[0_16px_40px_-10px_rgba(57,255,20,0.75)] disabled:cursor-not-allowed disabled:opacity-80"
              >
                <span
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100"
                />
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Autenticando...
                  </>
                ) : (
                  'Entrar no Painel'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Ainda não é parceiro?{' '}
              <a
                href="#"
                className="font-semibold text-neon-400 transition hover:text-neon-300 hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]"
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
      <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-neon-400">
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
          className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#39FF14] focus:shadow-[0_0_0_4px_rgba(57,255,20,0.12)]"
        />
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neon-400/10 text-neon-300 ring-1 ring-neon-400/30">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
