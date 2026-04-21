import {
  useRef,
  useState,
  type InputHTMLAttributes,
  type DragEvent,
} from 'react';
import {
  CheckCircle2,
  Copy,
  FileCheck2,
  KeyRound,
  Link2,
  Lock,
  Mail,
  Save,
  ScanLine,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone,
  Upload,
  User as UserIcon,
  Wallet,
  X,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

type ToastTone = 'success' | 'error';

type KycStatus = 'missing' | 'pending' | 'verified';

const POSTBACK_VARS = ['{click_id}', '{campaign_id}', '{payout}', '{status}'];

export default function SettingsPage() {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user.name);
  const [pix, setPix] = useState(user.pix);
  const [pixType, setPixType] = useState(user.pixType ?? 'cpf');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [postbackUrl, setPostbackUrl] = useState('');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const [kycStatus, setKycStatus] = useState<KycStatus>('missing');
  const [kycFiles, setKycFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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

  const savePostback = () => {
    const trimmed = postbackUrl.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
      showToast('error', 'Informe uma URL válida (http ou https).');
      return;
    }
    showToast('success', 'URL de postback salva.');
  };

  const copyVar = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedVar(value);
      window.setTimeout(() => setCopiedVar(null), 1400);
    } catch {
      setCopiedVar(null);
    }
  };

  const handleFiles = (list: FileList | null) => {
    if (!list || !list.length) return;
    const incoming = Array.from(list).slice(0, 2);
    setKycFiles(incoming);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const submitKyc = () => {
    if (!kycFiles.length) {
      showToast('error', 'Envie pelo menos um documento.');
      return;
    }
    setKycStatus('pending');
    showToast('success', 'Documentos enviados. Análise em até 48h.');
  };

  const toggle2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      showToast('success', 'Autenticação em dois fatores desativada.');
    } else {
      setTwoFactorEnabled(true);
      showToast('success', '2FA ativado com sucesso.');
    }
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
            Gerencie dados, pagamentos, integrações e segurança do seu programa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Column 1 */}
        <div className="flex flex-col gap-6">
          <Card
            icon={<UserIcon className="h-5 w-5" />}
            title="Dados Pessoais"
            subtitle="Estas informações aparecem no seu perfil e comunicações."
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
            icon={<Link2 className="h-5 w-5" />}
            title="Postback Global (S2S)"
            subtitle="Configure sua URL para receber conversões em tempo real no seu tracker."
            delay={140}
          >
            <Input
              label="URL de Postback"
              value={postbackUrl}
              onChange={(e) => setPostbackUrl(e.target.value)}
              placeholder="https://seu-tracker.com/postback?cid={click_id}"
              icon={<Link2 className="h-4 w-4" />}
            />

            <div className="mt-4 rounded-xl border border-gray-200/80 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/[0.03]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                Variáveis disponíveis
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {POSTBACK_VARS.map((v) => (
                  <button
                    key={v}
                    onClick={() => copyVar(v)}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-mono text-[11px] text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neon-400/40 hover:text-neon-600 hover:shadow-[0_0_14px_rgba(57,255,20,0.18)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-neon-300"
                  >
                    {copiedVar === v ? (
                      <CheckCircle2 className="h-3 w-3 text-neon-500 dark:text-neon-300" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    )}
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <PrimaryButton onClick={savePostback}>
                <Save className="h-4 w-4" /> Salvar postback
              </PrimaryButton>
            </div>
          </Card>

          <Card
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Segurança"
            subtitle="Atualize sua senha periodicamente para manter sua conta protegida."
            delay={220}
          >
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Senha atual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-h-[1.25rem] text-xs font-medium text-rose-500 dark:text-rose-400">
                {passwordError ?? ' '}
              </p>
              <SecondaryButton onClick={updatePassword}>
                <ShieldCheck className="h-4 w-4" /> Atualizar senha
              </SecondaryButton>
            </div>
          </Card>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-6">
          <Card
            icon={<Wallet className="h-5 w-5" />}
            title="Dados de Pagamento"
            subtitle="Receba suas comissões direto na sua conta via PIX."
            delay={100}
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
            icon={<FileCheck2 className="h-5 w-5" />}
            title="Verificação de Conta (KYC)"
            subtitle="Necessário para liberar saques acima de R$ 5.000,00 e resgate de prêmios."
            delay={180}
            action={<KycBadge status={kycStatus} />}
          >
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-300 ${
                dragging
                  ? 'border-neon-400 bg-neon-400/5 shadow-[0_0_22px_rgba(57,255,20,0.22)]'
                  : 'border-gray-300 bg-gray-50 hover:border-neon-400/50 hover:bg-neon-400/[0.04] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-neon-400/40'
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-400/10 text-neon-500 ring-1 ring-neon-400/30 dark:text-neon-300">
                <ScanLine className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                Arraste os documentos aqui
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                RG / CNH — frente e verso (PDF, JPG ou PNG, até 8MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-600 dark:text-neon-300">
                ou clique para selecionar
              </span>
            </label>

            {kycFiles.length > 0 && (
              <ul className="mt-4 space-y-2">
                {kycFiles.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-gray-700 dark:text-slate-300">
                      <FileCheck2 className="h-3.5 w-3.5 shrink-0 text-neon-500 dark:text-neon-300" />
                      <span className="truncate">{f.name}</span>
                    </span>
                    <button
                      onClick={() =>
                        setKycFiles((list) => list.filter((_, idx) => idx !== i))
                      }
                      className="text-slate-400 transition hover:text-rose-500"
                      aria-label="Remover arquivo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex justify-end">
              <SecondaryButton onClick={submitKyc}>
                <Upload className="h-4 w-4" /> Enviar documentos
              </SecondaryButton>
            </div>
          </Card>

          <Card
            icon={<Smartphone className="h-5 w-5" />}
            title="Autenticação em Dois Fatores (2FA)"
            subtitle="Proteja seus saques e dados adicionando uma camada extra de segurança."
            delay={260}
            action={
              <ToggleSwitch enabled={twoFactorEnabled} onChange={toggle2FA} />
            }
          >
            <div className="rounded-xl border border-gray-200/80 bg-gray-50 p-4 text-sm dark:border-white/5 dark:bg-white/[0.03]">
              {twoFactorEnabled ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neon-400/15 text-neon-500 ring-1 ring-neon-400/30 dark:text-neon-300">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      2FA ativo
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                      Códigos de 6 dígitos serão solicitados em cada saque e login
                      de novo dispositivo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-500 ring-1 ring-amber-400/30">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        2FA desativado
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                        Escaneie o QR Code no Google Authenticator e insira o
                        código para ativar.
                      </p>
                    </div>
                  </div>
                  <SecondaryButton onClick={toggle2FA}>
                    <Smartphone className="h-4 w-4" /> Configurar Google
                    Authenticator
                  </SecondaryButton>
                </div>
              )}
            </div>
          </Card>
        </div>
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
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative animate-rise overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-neon-400/30 hover:shadow-[0_18px_50px_-20px_rgba(57,255,20,0.18)] dark:border-white/5 dark:bg-[#1E1E24]/80 sm:p-7 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-neon-400/0 to-transparent transition-all duration-300 group-hover:via-neon-400/60" />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-400/10 text-neon-500 ring-1 ring-neon-400/30 shadow-[0_0_14px_rgba(57,255,20,0.18)] dark:text-neon-300">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white sm:text-lg">
              {title}
            </h3>
            <p className="mt-0.5 max-w-md text-xs text-gray-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
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

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-neon-400/40 bg-transparent px-5 py-2.5 text-sm font-semibold text-neon-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-400 hover:bg-neon-400/10 hover:text-neon-500 hover:shadow-[0_0_18px_rgba(57,255,20,0.25)] dark:text-neon-300 dark:hover:text-neon-200"
    >
      {children}
    </button>
  );
}

function KycBadge({ status }: { status: KycStatus }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-400/40 bg-neon-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neon-600 dark:text-neon-300">
        <CheckCircle2 className="h-3 w-3" /> Verificado
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
        <ScanLine className="h-3 w-3" /> Pendente de Envio
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
      <X className="h-3 w-3" /> Não Verificado
    </span>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-400/60 ${
        enabled
          ? 'border-neon-400/60 bg-gradient-to-b from-neon-300 to-neon-500 shadow-[0_0_18px_rgba(57,255,20,0.45)]'
          : 'border-gray-300 bg-gray-200 dark:border-white/10 dark:bg-white/10'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
