import { useState, type InputHTMLAttributes } from 'react';
import {
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

type ToastTone = 'success' | 'error';

export default function SettingsPage() {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user.name);
  const [pix, setPix] = useState(user.pix);
  const [pixType, setPixType] = useState(user.pixType ?? 'cpf');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ tone: ToastTone; msg: string } | null>(
    null,
  );

  const showToast = (tone: ToastTone, msg: string) => {
    setToast({ tone, msg });
    window.setTimeout(() => setToast(null), 2600);
  };

  const saveProfile = () => {
    if (!name.trim()) return;
    updateUser({ name: name.trim() });
    showToast('success', 'Perfil atualizado com sucesso.');
  };

  const savePix = () => {
    if (!pix.trim()) {
      showToast('error', 'Informe uma chave PIX válida.');
      return;
    }
    updateUser({ pix: pix.trim(), pixType });
    showToast('success', 'Chave PIX salva com segurança.');
  };

  const updatePassword = () => {
    setPasswordError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos de senha.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação não confere com a nova senha.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('success', 'Senha atualizada com sucesso.');
  };

  return (
    <div className="animate-rise pb-16" style={{ animationDelay: '0ms' }}>
      <div className="mb-10 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-400/10 text-neon-400 ring-1 ring-neon-400/30 shadow-[0_0_18px_rgba(57,255,20,0.2)]">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Configurações
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Gerencie seus dados pessoais, pagamentos e segurança.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          icon={<UserIcon className="h-5 w-5" />}
          title="Dados Pessoais"
          subtitle="Estas informações aparecem no seu perfil e nas comunicações."
          delay={60}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
            <Input
              label="E-mail"
              value={user.email}
              readOnly
              icon={<Mail className="h-4 w-4" />}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-slate-500">
              Role atual:{' '}
              <span className="font-semibold text-neon-500 dark:text-neon-300">
                {user.role}
              </span>
            </p>
            <PrimaryButton onClick={saveProfile}>
              <Save className="h-4 w-4" /> Salvar alterações
            </PrimaryButton>
          </div>
        </Card>

        <Card
          icon={<Wallet className="h-5 w-5" />}
          title="Dados de Pagamento"
          subtitle="Receba suas comissões direto na sua conta via PIX."
          delay={140}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <FieldLabel>Tipo de chave</FieldLabel>
              <select
                value={pixType}
                onChange={(e) => setPixType(e.target.value)}
                className="block w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-neon-400 focus:ring-2 focus:ring-neon-400/30 focus:shadow-[0_0_0_4px_rgba(57,255,20,0.12)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-neon-400"
              >
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Aleatória</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Chave PIX"
                value={pix}
                onChange={(e) => setPix(e.target.value)}
                placeholder="Informe sua chave PIX"
                icon={<KeyRound className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500 dark:text-slate-500">
              Pagamentos serão processados apenas para contas com a mesma
              titularidade do cadastro.
            </p>
            <PrimaryButton onClick={savePix}>
              <Save className="h-4 w-4" /> Salvar chave PIX
            </PrimaryButton>
          </div>
        </Card>

        <Card
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Segurança"
          subtitle="Atualize sua senha periodicamente para manter sua conta protegida."
          delay={220}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
            />
            <Input
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
            />
          </div>

          <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-[1.25rem] text-xs font-medium text-rose-500 dark:text-rose-400">
              {passwordError ?? ' '}
            </p>
            <button
              onClick={updatePassword}
              className="inline-flex items-center gap-2 rounded-xl border border-neon-400/40 bg-transparent px-5 py-2.5 text-sm font-semibold text-neon-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-400 hover:bg-neon-400/10 hover:text-neon-500 hover:shadow-[0_0_18px_rgba(57,255,20,0.25)] dark:text-neon-300 dark:hover:text-neon-200"
            >
              <ShieldCheck className="h-4 w-4" /> Atualizar senha
            </button>
          </div>
        </Card>
      </div>

      {toast && (
        <div
          className={`pointer-events-none fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-xl transition-all duration-300 ${
            toast.tone === 'success'
              ? 'border-neon-400/40 bg-neon-400/10 text-neon-600 shadow-[0_0_22px_rgba(57,255,20,0.3)] dark:text-neon-300'
              : 'border-rose-400/40 bg-rose-500/10 text-rose-500 dark:text-rose-300'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Card({
  icon,
  title,
  subtitle,
  children,
  delay = 0,
  className = '',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative animate-rise overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-neon-400/30 hover:shadow-[0_18px_50px_-20px_rgba(57,255,20,0.18)] dark:border-white/5 dark:bg-[#1E1E24]/80 sm:p-7 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-neon-400/0 to-transparent transition-all duration-300 group-hover:via-neon-400/60" />

      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-400/10 text-neon-500 ring-1 ring-neon-400/30 shadow-[0_0_14px_rgba(57,255,20,0.18)] dark:text-neon-300">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white sm:text-lg">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
      {children}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ReactNode;
};

function Input({ label, icon, className = '', ...rest }: InputProps) {
  const readOnly = rest.readOnly;
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
            {icon}
          </span>
        )}
        <input
          {...rest}
          className={`block w-full rounded-xl border border-gray-200 bg-white py-3 text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-neon-400 focus:ring-2 focus:ring-neon-400/30 focus:shadow-[0_0_0_4px_rgba(57,255,20,0.12)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-neon-400 ${
            icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } ${readOnly ? 'cursor-not-allowed text-gray-500 dark:text-slate-400' : ''} ${className}`}
        />
      </div>
    </div>
  );
}

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-neon-400/50 bg-gradient-to-b from-neon-300 via-neon-400 to-neon-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-8px_rgba(57,255,20,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(57,255,20,0.5),0_14px_34px_-8px_rgba(57,255,20,0.55),inset_0_1px_0_rgba(255,255,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-400/60"
    >
      {children}
    </button>
  );
}
