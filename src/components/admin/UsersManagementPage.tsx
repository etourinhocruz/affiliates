import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Ban,
  Check,
  Eye,
  Filter,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Role = 'SUPER_ADMIN' | 'AGENCY' | 'MANAGER' | 'AFFILIATE' | 'SUB_AFFILIATE';
type KycStatus = 'verified' | 'pending' | 'rejected';
type UserStatus = 'active' | 'blocked';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  parent_agency: string;
  kyc_status: KycStatus;
  total_ftds: number;
  status: UserStatus;
  created_at: string;
};

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  AGENCY: 'Agência',
  MANAGER: 'Gerente',
  AFFILIATE: 'Afiliado',
  SUB_AFFILIATE: 'Sub-Afiliado',
};

const ROLE_STYLE: Record<Role, string> = {
  SUPER_ADMIN: 'bg-rose-500/10 text-rose-700 ring-rose-400/30 dark:text-rose-300',
  AGENCY: 'bg-sky-500/10 text-sky-700 ring-sky-400/30 dark:text-sky-300',
  MANAGER: 'bg-amber-500/10 text-amber-700 ring-amber-400/30 dark:text-amber-300',
  AFFILIATE: 'bg-neon-400/10 text-neon-700 ring-neon-400/30 dark:text-neon-300',
  SUB_AFFILIATE: 'bg-slate-500/10 text-slate-700 ring-slate-400/30 dark:text-slate-300',
};

const FILTER_OPTIONS: { key: 'ALL' | Role; label: string }[] = [
  { key: 'ALL', label: 'Todos os Papéis' },
  { key: 'SUPER_ADMIN', label: 'Super Admins' },
  { key: 'AGENCY', label: 'Agências' },
  { key: 'MANAGER', label: 'Gerentes' },
  { key: 'AFFILIATE', label: 'Afiliados' },
  { key: 'SUB_AFFILIATE', label: 'Sub-Afiliados' },
];

const fallbackUsers: AdminUser[] = [
  { id: 'u1', name: 'Pierre Aguiar', email: 'pierre@mansaogreen.com', role: 'SUPER_ADMIN', parent_agency: 'Nenhuma', kyc_status: 'verified', total_ftds: 0, status: 'active', created_at: '2025-11-02' },
  { id: 'u2', name: 'Agência Tubarões Media', email: 'contato@tuboreomedia.com', role: 'AGENCY', parent_agency: 'Nenhuma', kyc_status: 'verified', total_ftds: 4820, status: 'active', created_at: '2025-12-14' },
  { id: 'u3', name: 'Agência HighRoller BR', email: 'ops@highroller.br', role: 'AGENCY', parent_agency: 'Nenhuma', kyc_status: 'verified', total_ftds: 3610, status: 'active', created_at: '2026-01-08' },
  { id: 'u4', name: 'Marcus Trader', email: 'marcus@tuboreomedia.com', role: 'MANAGER', parent_agency: 'Agência Tubarões Media', kyc_status: 'verified', total_ftds: 980, status: 'active', created_at: '2026-01-16' },
  { id: 'u5', name: 'Rodrigo Alves', email: 'rodrigo.alves@gmail.com', role: 'AFFILIATE', parent_agency: 'Agência Tubarões Media', kyc_status: 'verified', total_ftds: 1210, status: 'active', created_at: '2026-02-12' },
  { id: 'u6', name: 'Juliana Costa', email: 'juliana.costa@outlook.com', role: 'AFFILIATE', parent_agency: 'Agência HighRoller BR', kyc_status: 'pending', total_ftds: 760, status: 'blocked', created_at: '2026-02-19' },
  { id: 'u7', name: 'Carlos Simões', email: 'carlos.s@gmail.com', role: 'SUB_AFFILIATE', parent_agency: 'Rodrigo Alves', kyc_status: 'verified', total_ftds: 412, status: 'active', created_at: '2026-03-18' },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatInt(value: number): string {
  return value.toLocaleString('pt-BR');
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(fallbackUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length) setUsers(data as AdminUser[]);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const updateUser = async (id: string, patch: Partial<AdminUser>) => {
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    await supabase.from('admin_users').update(patch).eq('id', id);
  };

  const handleBlock = (u: AdminUser) => {
    const nextStatus: UserStatus = u.status === 'active' ? 'blocked' : 'active';
    updateUser(u.id, { status: nextStatus });
    setToast(
      nextStatus === 'blocked'
        ? `Acesso bloqueado para ${u.name}.`
        : `Acesso reativado para ${u.name}.`,
    );
    setOpenMenu(null);
  };

  const handleImpersonate = (u: AdminUser) => {
    setToast(`Iniciando sessão como ${u.name}...`);
    setOpenMenu(null);
  };

  const handleEdit = (u: AdminUser) => {
    setEditing(u);
    setOpenMenu(null);
  };

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
          <Shield className="h-3 w-3" />
          Super Admin · Gestão de Usuários
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Controle de Contas da Plataforma
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Gerencie agências, gerentes, afiliados e sub-afiliados com auditoria completa.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/80 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-white/5 dark:bg-[#1E1E24]/80 dark:shadow-none md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou ID..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | Role)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm font-semibold text-gray-800 transition focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 md:w-56"
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.key} value={o.key} className="bg-white text-gray-800 dark:bg-[#1E1E24] dark:text-slate-200">
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300"
        >
          <Plus className="h-4 w-4" />
          Adicionar Usuário
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Base de Usuários
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              {formatInt(filtered.length)} de {formatInt(users.length)} contas exibidas
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-black/30 dark:text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Usuário</th>
                <th className="px-3 py-3 text-left font-semibold">Papel & Hierarquia</th>
                <th className="px-3 py-3 text-left font-semibold">Cadastro</th>
                <th className="px-3 py-3 text-left font-semibold">Performance & KYC</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    Nenhum usuário encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
              {filtered.map((u) => {
                const blocked = u.status === 'blocked';
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-100 transition hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5 ${
                      blocked ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-bold text-white ring-1 ring-white/10 dark:from-[#272732] dark:to-[#14141A]">
                          {getInitials(u.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {u.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-left">
                      <RoleBadge role={u.role} />
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
                        ↳ Vinculado a:{' '}
                        <span className="font-semibold text-gray-700 dark:text-slate-300">
                          {u.parent_agency || 'Nenhuma'}
                        </span>
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-left tabular-nums text-gray-700 dark:text-slate-200">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold tabular-nums text-gray-900 dark:text-white">
                          {formatInt(u.total_ftds)}
                        </span>
                        <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-500">
                          FTDs
                        </span>
                        <KycShield kyc={u.kyc_status} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <ActionMenu
                        open={openMenu === u.id}
                        onToggle={() =>
                          setOpenMenu((m) => (m === u.id ? null : u.id))
                        }
                        onEdit={() => handleEdit(u)}
                        onImpersonate={() => handleImpersonate(u)}
                        onBlock={() => handleBlock(u)}
                        blocked={blocked}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            await updateUser(editing.id, patch);
            setToast(`Usuário ${editing.name} atualizado.`);
            setEditing(null);
          }}
        />
      )}

      {addOpen && (
        <AddUserModal
          onClose={() => setAddOpen(false)}
          onCreate={async (payload) => {
            const optimistic: AdminUser = {
              id: `tmp-${Date.now()}`,
              name: payload.name,
              email: payload.email,
              role: payload.role,
              parent_agency: payload.parent_agency || 'Nenhuma',
              kyc_status: 'pending',
              total_ftds: 0,
              status: 'active',
              created_at: new Date().toISOString(),
            };
            setUsers((list) => [optimistic, ...list]);
            setAddOpen(false);
            setToast(`Usuário ${payload.name} cadastrado.`);
            const { data } = await supabase
              .from('admin_users')
              .insert({
                name: payload.name,
                email: payload.email,
                role: payload.role,
                parent_agency: payload.parent_agency || 'Nenhuma',
              })
              .select()
              .maybeSingle();
            if (data) {
              setUsers((list) =>
                list.map((u) => (u.id === optimistic.id ? (data as AdminUser) : u)),
              );
            }
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-rise">
          <div className="flex items-center gap-2.5 rounded-full border border-neon-400/40 bg-slate-900/95 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(57,255,20,0.35)] backdrop-blur-xl dark:bg-[#14141A]/95">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neon-400/20 text-neon-300">
              <Check className="h-3.5 w-3.5" />
            </span>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${ROLE_STYLE[role]}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
        active
          ? 'bg-emerald-900/20 text-[#39FF14] ring-neon-400/40 dark:bg-emerald-950/40'
          : 'bg-rose-900/20 text-rose-500 ring-rose-400/40 dark:bg-rose-950/40 dark:text-rose-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? 'bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.9)]' : 'bg-rose-500'
        }`}
      />
      {active ? 'Ativo' : 'Bloqueado'}
    </span>
  );
}

function KycShield({ kyc }: { kyc: KycStatus }) {
  if (kyc === 'verified') {
    return (
      <span
        title="KYC Verificado"
        className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300"
      >
        <ShieldCheck className="h-3 w-3" />
      </span>
    );
  }
  if (kyc === 'pending') {
    return (
      <span
        title="KYC Pendente"
        className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-400/10 text-amber-600 ring-1 ring-amber-400/30 dark:text-amber-300"
      >
        <Shield className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span
      title="KYC Rejeitado"
      className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 ring-1 ring-rose-400/30 dark:text-rose-300"
    >
      <ShieldAlert className="h-3 w-3" />
    </span>
  );
}

function ActionMenu({
  open,
  onToggle,
  onEdit,
  onImpersonate,
  onBlock,
  blocked,
}: {
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onImpersonate: () => void;
  onBlock: () => void;
  blocked: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onToggle]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={onToggle}
        aria-label="Ações"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-neon-300"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#13141A]/95">
          <MenuButton icon={<Pencil className="h-4 w-4" />} onClick={onEdit}>
            Editar Usuário
          </MenuButton>
          <div className="my-1 h-px bg-gradient-to-r from-transparent via-neon-400/30 to-transparent" />
          <MenuButton
            icon={<Eye className="h-4 w-4" />}
            onClick={onImpersonate}
            highlight
          >
            Logar como (Impersonate)
          </MenuButton>
          <div className="border-t border-gray-100 dark:border-white/5">
            <MenuButton
              icon={blocked ? <Lock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              onClick={onBlock}
              danger
            >
              {blocked ? 'Reativar Acesso' : 'Bloquear Acesso'}
            </MenuButton>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon,
  children,
  onClick,
  danger = false,
  highlight = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  highlight?: boolean;
}) {
  const base = 'flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors';
  const tone = danger
    ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
    : highlight
      ? 'text-neon-700 hover:bg-neon-400/10 dark:text-neon-300'
      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white';
  return (
    <button onClick={onClick} className={`${base} ${tone}`}>
      {icon}
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}

function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: (patch: Partial<AdminUser>) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [parent, setParent] = useState(user.parent_agency);
  const [deal, setDeal] = useState('CPA R$ 250 + 25% Rev');

  return (
    <Modal onClose={onClose} title="Editar Usuário" subtitle={`Atualize os dados de ${user.name}`}>
      <div className="space-y-4">
        <Field label="Nome">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </Field>
        <Field label="E-mail">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </Field>
        <Field label="Agência Vinculada">
          <input
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </Field>
        <Field label="Repasse (Deal)">
          <input
            value={deal}
            onChange={(e) => setDeal(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </Field>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave({ name, email, parent_agency: parent })}
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300"
        >
          <Check className="h-4 w-4" />
          Salvar alterações
        </button>
      </div>
    </Modal>
  );
}

function AddUserModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (payload: { name: string; email: string; role: Role; parent_agency: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('AFFILIATE');
  const [parent, setParent] = useState('');
  const disabled = !name.trim() || !email.trim();

  return (
    <Modal
      onClose={onClose}
      title="Adicionar Usuário"
      subtitle="Cadastre uma nova conta manualmente na plataforma."
      icon={<UserPlus className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <Field label="Nome">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Afiliado"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </Field>
        <Field label="E-mail">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="joao@afiliados.com"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </Field>
        <Field label="Papel">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          >
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <option key={r} value={r} className="bg-white text-gray-800 dark:bg-[#1E1E24] dark:text-slate-200">
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Agência Vinculada (opcional)">
          <input
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            placeholder="Ex: Agência Tubarões Media"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </Field>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          disabled={disabled}
          onClick={() => onCreate({ name, email, role, parent_agency: parent })}
          className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Plus className="h-4 w-4" />
          Criar conta
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  subtitle,
  icon,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#14141A]">
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-white/5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              {icon ?? <Pencil className="h-4 w-4" />}
            </span>
            <div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h4>
              {subtitle && (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-800 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
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
