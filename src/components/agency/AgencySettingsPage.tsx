import { useState } from 'react';
import { Building2, Check, CreditCard, Mail, Percent, Settings as SettingsIcon, Users } from 'lucide-react';

export default function AgencySettingsPage() {
  const [name, setName] = useState('Agência Tubarões Media');
  const [cnpj, setCnpj] = useState('47.912.118/0001-09');
  const [email, setEmail] = useState('contato@tuboreomedia.com');
  const [payout, setPayout] = useState('PIX (CNPJ)');
  const [split, setSplit] = useState('15');
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600 ring-1 ring-sky-400/30 dark:text-sky-300">
          <SettingsIcon className="h-3 w-3" />
          Agency Suite · Configurações
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Configurações da Agência
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Dados cadastrais, preferências de pagamento e split padrão da rede.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Dados cadastrais" icon={<Building2 className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Razão social">
                <Input value={name} onChange={setName} />
              </Field>
              <Field label="CNPJ">
                <Input value={cnpj} onChange={setCnpj} />
              </Field>
              <Field label="E-mail da agência">
                <Input value={email} onChange={setEmail} type="email" />
              </Field>
              <Field label="Responsável financeiro">
                <Input value="Fernanda Arruda" onChange={() => {}} />
              </Field>
            </div>
          </Card>

          <Card title="Preferências de pagamento" icon={<CreditCard className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Método preferencial">
                <select
                  value={payout}
                  onChange={(e) => setPayout(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
                >
                  <option>PIX (CNPJ)</option>
                  <option>Transferência Bancária</option>
                  <option>Carteira USDT (TRC-20)</option>
                </select>
              </Field>
              <Field label="Dia de pagamento">
                <Input value="Todo dia 5" onChange={() => {}} />
              </Field>
            </div>
          </Card>

          <Card title="Split padrão da rede" icon={<Percent className="h-4 w-4" />}>
            <Field label="Override da agência (%)">
              <div className="relative">
                <input
                  type="number"
                  value={split}
                  onChange={(e) => setSplit(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm font-bold text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#39FF14]">
                  %
                </span>
              </div>
            </Field>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              Percentual aplicado automaticamente sobre a comissão gerada por cada afiliado da rede.
            </p>
          </Card>

          <div className="flex items-center justify-end gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#39FF14]">
                <Check className="h-4 w-4" />
                Configurações salvas
              </span>
            )}
            <button
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300"
            >
              Salvar alterações
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <Card title="Equipe principal" icon={<Users className="h-4 w-4" />}>
            <ul className="space-y-3">
              {[
                { name: 'Fernanda Arruda', role: 'Head de Operações' },
                { name: 'Marcus Trader', role: 'Gerente Principal' },
                { name: 'Paula Dias', role: 'Financeiro' },
              ].map((p) => (
                <li key={p.name} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-[#121212]">
                    {p.name
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">{p.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Notificações" icon={<Mail className="h-4 w-4" />}>
            <Toggle label="Resumo diário por e-mail" defaultOn />
            <Toggle label="Alertas de meta atingida" defaultOn />
            <Toggle label="Novos afiliados aprovados" />
          </Card>
        </aside>
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
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
    <label className="block">
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
