import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Search,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser, type Role } from '../contexts/UserContext';

type DemoAccount = {
  email: string;
  password: string;
  display_name: string;
  role: Role;
};

const FALLBACK_ACCOUNTS: DemoAccount[] = [
  { email: 'pierre@affiliates.com', password: 'Pierre@2026', display_name: 'Pierre Castro', role: 'AFFILIATE' },
  { email: 'rodrigo.alves@gmail.com', password: 'Rodrigo@2026', display_name: 'Rodrigo Alves', role: 'AFFILIATE' },
  { email: 'marina.q@tuboreomedia.com', password: 'Marina@2026', display_name: 'Marina Queiroz', role: 'AFFILIATE' },
  { email: 'fernanda@tuboreomedia.com', password: 'Agency@2026', display_name: 'Fernanda Arruda', role: 'AGENCY' },
  { email: 'marcus.manager@mansaogreen.com', password: 'Manager@2026', display_name: 'Marcus Trader', role: 'MANAGER' },
  { email: 'carlos.s@gmail.com', password: 'Sub@2026', display_name: 'Carlos Simões', role: 'SUB_AFFILIATE' },
  { email: 'admin@mansaogreen.com', password: 'Admin@2026', display_name: 'Diretor Geral', role: 'SUPER_ADMIN' },
];

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  AGENCY: 'Agência',
  MANAGER: 'Gerente',
  AFFILIATE: 'Afiliado',
  SUB_AFFILIATE: 'Sub-Afiliado',
};

type Props = { onSuccess: () => void };

export default function LoginPage({ onSuccess }: Props) {
  const { setRole, updateUser } = useUser();
  const [accounts, setAccounts] = useState<DemoAccount[]>(FALLBACK_ACCOUNTS);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('login_demo_accounts')
        .select('email,password,display_name,role')
        .order('sort_order', { ascending: true });
      if (data && data.length) setAccounts(data as DemoAccount[]);
    })();
  }, []);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.email === email),
    [accounts, email],
  );

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setPassword('');
    if (error) setError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!selectedAccount) {
      setError('Selecione um e-mail da lista autorizada.');
      return;
    }
    if (password !== selectedAccount.password) {
      setError('Senha incorreta para o usuário selecionado.');
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      if (remember) localStorage.setItem('amg.session', '1');
      else sessionStorage.setItem('amg.session', '1');
      setRole(selectedAccount.role);
      updateUser({
        name: selectedAccount.display_name,
        email: selectedAccount.email,
      });
      setLoading(false);
      onSuccess();
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden text-slate-200">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 90% at 25% 10%, #0F4A3A 0%, #093829 28%, #052620 55%, #021612 80%, #000807 100%)',
        }}
      />
      <BrandPanel />
      <AccessPanel
        accounts={accounts}
        email={email}
        password={password}
        selectedAccount={selectedAccount}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        remember={remember}
        setRemember={setRemember}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
      <p className="pointer-events-none absolute bottom-5 left-1/2 z-20 w-full -translate-x-1/2 whitespace-nowrap px-4 text-center text-xs text-slate-500/80">
        &copy; {new Date().getFullYear()} Mansão Green Affiliates. Todos os direitos reservados.
      </p>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden w-1/2 overflow-hidden lg:flex">
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'linear-gradient(45deg, rgba(132,255,180,0.10) 1px, transparent 1px), linear-gradient(-45deg, rgba(132,255,180,0.10) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 75% at 50% 45%, black 35%, transparent 80%)',
          maskImage:
            'radial-gradient(ellipse 75% 75% at 50% 45%, black 35%, transparent 80%)',
        }}
      />
      <div className="absolute -left-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#39FF14]/[0.08] blur-[150px]" />
      <div className="absolute -bottom-32 right-0 h-[26rem] w-[26rem] rounded-full bg-emerald-500/[0.12] blur-[150px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-10 pt-16 pb-24 xl:pt-20">
        <div
          className="flex flex-col items-center animate-hero"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[26px] bg-black p-2.5 ring-1 ring-[#39FF14]/50 shadow-[0_0_38px_rgba(57,255,20,0.42)]">
            <img
              src="/AFFILIATES_LOGO_PNG_(2).png"
              alt="Mansão Green Affiliates"
              className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.45em] text-[#7CFF58]/80">
            Mansão Green Affiliates
          </p>
        </div>

        <h1
          className="mt-12 text-center text-[52px] font-extrabold leading-[1.02] tracking-[-0.035em] animate-hero xl:text-[66px]"
          style={{ animationDelay: '220ms' }}
        >
          <span className="bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            O Seu
          </span>{' '}
          <span className="relative inline-block bg-gradient-to-r from-[#B6FFA1] via-[#39FF14] to-emerald-400 bg-clip-text pr-1 text-transparent drop-shadow-[0_0_30px_rgba(57,255,20,0.55)]">
            Império
          </span>
          <span className="bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            {' '}
            no iGaming.
          </span>
        </h1>

        <p
          className="mt-6 max-w-xl text-center text-base leading-relaxed text-slate-300/85 animate-hero xl:text-[17px]"
          style={{ animationDelay: '340ms' }}
        >
          Gerencie suas campanhas, acompanhe suas comissões em tempo real e
          desbloqueie prêmios exclusivos no programa mais premium do mercado.
        </p>

        <CommissionCard />
        <AffiliateStats />
      </div>
    </aside>
  );
}

function AffiliateStats() {
  return (
    <div
      className="group relative mt-5 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),0_0_40px_rgba(57,255,20,0.08)] backdrop-blur-2xl animate-hero transition-all duration-500 hover:-translate-y-1 hover:border-[#39FF14]/25 hover:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95),0_0_48px_rgba(57,255,20,0.16)]"
      style={{ animationDelay: '540ms' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(57,255,20,0.12),transparent_55%)]" />
      <div className="relative grid grid-cols-2 gap-5">
        <StatCell
          icon={<UserPlus className="h-4 w-4 text-[#7CFF58]" />}
          label="Novos Registros"
          value="1.420"
          trend="+12% esta semana"
        />
        <div className="pointer-events-none absolute inset-y-2 left-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <StatCell
          icon={<Banknote className="h-4 w-4 text-[#7CFF58]" />}
          label="Payout Total"
          value="R$ 52.180"
          trend="+8,4% vs. mês passado"
        />
      </div>
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#39FF14]/10 ring-1 ring-[#39FF14]/30">
          {icon}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300/70">
          {label}
        </p>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-white">{value}</p>
      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#7CFF58]">
        <ArrowRight className="h-3 w-3 -rotate-45" />
        {trend}
      </p>
    </div>
  );
}

function CommissionCard() {
  return (
    <div
      className="group relative mt-12 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-hero transition-all duration-500 hover:-translate-y-1 hover:border-[#39FF14]/25 hover:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95),0_0_40px_rgba(57,255,20,0.15)]"
      style={{ animationDelay: '460ms' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(57,255,20,0.14),transparent_55%)]" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300/70">
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
            <linearGradient id="lgLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="60%" stopColor="#39FF14" />
              <stop offset="100%" stopColor="#B6FFA1" />
            </linearGradient>
            <linearGradient id="lgArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39FF14" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,80 C40,72 70,66 110,56 C150,46 180,52 215,38 C250,24 290,30 325,18 C355,8 380,6 400,4 L400,100 L0,100 Z"
            fill="url(#lgArea)"
          />
          <path
            d="M0,80 C40,72 70,66 110,56 C150,46 180,52 215,38 C250,24 290,30 325,18 C355,8 380,6 400,4"
            fill="none"
            stroke="url(#lgLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-draw drop-shadow-[0_0_10px_rgba(57,255,20,0.65)]"
          />
          <circle
            cx="400"
            cy="4"
            r="4"
            fill="#39FF14"
            className="drop-shadow-[0_0_10px_rgba(57,255,20,0.9)]"
          />
        </svg>
      </div>
    </div>
  );
}

type AccessProps = {
  accounts: DemoAccount[];
  email: string;
  password: string;
  selectedAccount?: DemoAccount;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  remember: boolean;
  setRemember: (v: boolean) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: FormEvent) => void;
};

function AccessPanel({
  accounts,
  email,
  password,
  selectedAccount,
  onEmailChange,
  onPasswordChange,
  remember,
  setRemember,
  showPassword,
  setShowPassword,
  loading,
  error,
  onSubmit,
}: AccessProps) {
  const emailOptions = useMemo(
    () =>
      accounts.map((a) => ({
        value: a.email,
        label: a.email,
        description: `${a.display_name} · ${ROLE_LABEL[a.role]}`,
      })),
    [accounts],
  );

  const passwordOptions = useMemo(() => {
    if (!selectedAccount) return [];
    return [
      {
        value: selectedAccount.password,
        label: '••••••••••',
        description: `Credencial de ${selectedAccount.display_name}`,
      },
    ];
  }, [selectedAccount]);

  return (
    <section className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 lg:block hidden"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 80% 15%, rgba(15,74,58,0.55) 0%, rgba(9,56,41,0.35) 35%, rgba(5,38,32,0.15) 65%, transparent 90%)',
        }}
      />
      <GreenDust />

      <div
        className="relative z-10 w-full max-w-md animate-hero"
        style={{ animationDelay: '200ms' }}
      >
        <div className="absolute -inset-6 rounded-[2rem] bg-[#39FF14]/[0.06] blur-2xl" />
        <div className="absolute -inset-2 rounded-[1.75rem] shadow-[0_0_80px_rgba(57,255,20,0.12)]" />

        <div className="relative rounded-3xl border border-[#39FF14]/20 bg-white/[0.04] p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),0_0_80px_rgba(57,255,20,0.12),inset_0_1px_0_rgba(57,255,20,0.15)] backdrop-blur-2xl transition-shadow duration-500 hover:border-[#39FF14]/35 hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),0_0_120px_rgba(57,255,20,0.22),inset_0_1px_0_rgba(57,255,20,0.25)] sm:p-10">
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

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
                E-mail
              </label>
              <LoginCombobox
                value={email}
                options={emailOptions}
                placeholder="Selecione um usuário autorizado..."
                emptyLabel="Nenhum usuário autorizado encontrado."
                icon={<Mail className="h-4 w-4" />}
                onChange={onEmailChange}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-slate-500 transition hover:text-[#39FF14]"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <LoginCombobox
                value={password}
                options={passwordOptions}
                placeholder={
                  selectedAccount
                    ? 'Escolha a credencial correspondente...'
                    : 'Selecione um e-mail primeiro'
                }
                emptyLabel={
                  selectedAccount
                    ? 'Nenhuma credencial disponível.'
                    : 'Escolha um e-mail para habilitar a senha.'
                }
                icon={<KeyRound className="h-4 w-4" />}
                disabled={!selectedAccount}
                onChange={onPasswordChange}
                obfuscate={!showPassword}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:text-[#39FF14]"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
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
              className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#7CFF58]/40 bg-gradient-to-b from-[#7CFF58] via-[#39FF14] to-[#17B800] text-sm font-bold uppercase tracking-[0.22em] text-black shadow-[0_10px_30px_-8px_rgba(57,255,20,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_32px_rgba(57,255,20,0.6),0_18px_44px_-10px_rgba(57,255,20,0.65),inset_0_1px_0_rgba(255,255,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/60 disabled:cursor-not-allowed disabled:opacity-85 disabled:hover:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/40 opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
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
  );
}

type ComboOption = {
  value: string;
  label: string;
  description?: string;
};

function LoginCombobox({
  value,
  options,
  placeholder,
  emptyLabel,
  icon,
  onChange,
  disabled = false,
  obfuscate = false,
  trailing,
}: {
  value: string;
  options: ComboOption[];
  placeholder: string;
  emptyLabel: string;
  icon: React.ReactNode;
  onChange: (v: string) => void;
  disabled?: boolean;
  obfuscate?: boolean;
  trailing?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) setTerm('');
  }, [open]);

  const normalized = term.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      options.filter((o) =>
        normalized
          ? o.label.toLowerCase().includes(normalized) ||
            (o.description?.toLowerCase().includes(normalized) ?? false)
          : true,
      ),
    [options, normalized],
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setTerm('');
  };

  const displayValue = selected
    ? obfuscate
      ? '•'.repeat(Math.min(selected.value.length, 12))
      : selected.label
    : '';

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex h-14 items-center gap-2 rounded-xl border bg-black/50 px-3 transition ${
          open
            ? 'border-[#39FF14] shadow-[0_0_0_4px_rgba(57,255,20,0.10)]'
            : 'border-white/10'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <span
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
            open ? 'text-[#39FF14]' : 'text-slate-500'
          }`}
        >
          {icon}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={open ? term : displayValue}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => {
            setTerm(e.target.value);
            if (!open) setOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={!open}
          className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
        />
        {value && !open && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            aria-label="Limpar"
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {trailing}
        {open ? (
          <Search className="h-4 w-4 text-[#39FF14]" />
        ) : (
          <ChevronDown
            className={`h-4 w-4 transition ${disabled ? 'text-slate-700' : 'text-slate-500'}`}
          />
        )}
      </div>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#0B0E0C]/95 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">{emptyLabel}</p>
          ) : (
            <ul>
              {filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#39FF14]/10 hover:text-[#39FF14] ${
                        isSelected ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {obfuscate ? '•'.repeat(Math.min(opt.value.length, 12)) : opt.label}
                        </p>
                        {opt.description && (
                          <p className="mt-0.5 truncate text-[11px] text-slate-500">
                            {opt.description}
                          </p>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function GreenDust() {
  const particles = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.4,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 10,
        blur: Math.random() > 0.55 ? 'blur(0.5px)' : 'blur(1.2px)',
        opacity: 0.15 + Math.random() * 0.55,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 right-[-12%] h-[36rem] w-[36rem] rounded-full bg-[#39FF14]/[0.05] blur-[150px]" />
      <div className="absolute bottom-[-20%] left-[-15%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/[0.05] blur-[150px]" />

      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#39FF14] animate-dust"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            filter: p.blur,
            boxShadow: '0 0 10px rgba(57,255,20,0.7)',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
