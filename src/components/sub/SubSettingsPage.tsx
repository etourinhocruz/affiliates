import { useState } from 'react';
import { Check, Key, Settings as SettingsIcon, User, Wallet } from 'lucide-react';

export default function SubSettingsPage() {
  const [name, setName] = useState('Carlos Simões');
  const [email, setEmail] = useState('carlos.s@gmail.com');
  const [pix, setPix] = useState('carlos.s@gmail.com');
  const [saved, setSaved] = useState(false);

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
          <SettingsIcon className="h-3 w-3" />
          Sub-Afiliado · Configurações
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Ajustes da conta
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Atualize seus dados pessoais, dados de pagamento e preferências de segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Perfil" icon={<User className="h-4 w-4" />}>
          <Field label="Nome">
            <Input value={name} onChange={setName} />
          </Field>
          <Field label="E-mail">
            <Input value={email} onChange={setEmail} type="email" />
          </Field>
        </Card>

        <Card title="Recebimento" icon={<Wallet className="h-4 w-4" />}>
          <Field label="Chave PIX">
            <Input value={pix} onChange={setPix} />
          </Field>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
            Os pagamentos são processados todo dia 5. Chaves inválidas serão rejeitadas automaticamente.
          </p>
        </Card>

        <Card title="Segurança" icon={<Key className="h-4 w-4" />}>
          <Field label="Senha atual">
            <Input value="" onChange={() => {}} type="password" />
          </Field>
          <Field label="Nova senha">
            <Input value="" onChange={() => {}} type="password" />
          </Field>
        </Card>

        <Card title="Preferências" icon={<SettingsIcon className="h-4 w-4" />}>
          <Toggle label="Receber e-mail de performance semanal" defaultOn />
          <Toggle label="Receber dicas de engajamento" defaultOn />
          <Toggle label="Receber notificações push" />
        </Card>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#39FF14]">
            <Check className="h-4 w-4" />
            Configurações salvas
          </span>
        )}
        <button
          onClick={() => {
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2400);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] hover:bg-neon-300"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-[#1E1E24]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
          {icon}
        </span>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block last:mb-0">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
    />
  );
}

function Toggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm text-gray-800 dark:text-slate-200"
    >
      <span>{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
          on ? 'bg-[#39FF14] shadow-[0_0_14px_rgba(57,255,20,0.45)]' : 'bg-gray-300 dark:bg-white/10'
        }`}
      >
        <span
          className={`absolute h-4 w-4 rounded-full bg-white shadow transition ${
            on ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
