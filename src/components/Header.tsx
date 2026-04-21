import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Settings,
  Sun,
  Trophy,
  User,
  Wallet,
  Shield,
  Building2,
  Briefcase,
  UserCog,
  Users,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { getInitials, useUser, type Role } from '../contexts/UserContext';
import HouseFilter from './HouseFilter';

const ROLE_OPTIONS: {
  key: Role;
  label: string;
  description: string;
  icon: typeof Shield;
}[] = [
  { key: 'SUPER_ADMIN', label: 'Super Admin', description: 'Controle total da plataforma', icon: Shield },
  { key: 'AGENCY', label: 'Agência', description: 'Gestão da rede da agência', icon: Building2 },
  { key: 'MANAGER', label: 'Gerente', description: 'Gestão de afiliados do time', icon: Briefcase },
  { key: 'AFFILIATE', label: 'Afiliado', description: 'Painel do afiliado padrão', icon: UserCog },
  { key: 'SUB_AFFILIATE', label: 'Sub-Afiliado', description: 'Visão resumida', icon: Users },
];

type Props = {
  onOpenMobile: () => void;
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
};

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: 'wallet' | 'trophy' | 'megaphone' | 'check';
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Saque aprovado',
    description: 'R$ 5.000,00 caíram na sua conta bancária.',
    time: 'há 3 min',
    icon: 'wallet',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Novo prêmio desbloqueado',
    description: 'Você atingiu a meta do Apple Watch SE3.',
    time: 'há 1 h',
    icon: 'trophy',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Campanha aprovada',
    description: 'Sua criativa FB Ads Black está no ar.',
    time: 'há 5 h',
    icon: 'megaphone',
    unread: true,
  },
  {
    id: 'n4',
    title: 'Meta atingida',
    description: '342 QFTDs esta semana — bônus liberado.',
    time: 'ontem',
    icon: 'check',
    unread: false,
  },
];

const notifIconMap = {
  wallet: { icon: Wallet, tone: 'text-neon-300 bg-neon-400/15 ring-neon-400/30' },
  trophy: { icon: Trophy, tone: 'text-amber-300 bg-amber-400/15 ring-amber-400/30' },
  megaphone: { icon: Megaphone, tone: 'text-sky-300 bg-sky-400/15 ring-sky-400/30' },
  check: { icon: CheckCircle2, tone: 'text-neon-300 bg-neon-400/15 ring-neon-400/30' },
};

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('mg-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export default function Header({ onOpenMobile, onNavigate, onLogout }: Props) {
  const { user, selectedHouse, setSelectedHouse, role, setRole } = useUser();
  const userName = user.name;
  const initials = getInitials(userName);
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const currentRole = ROLE_OPTIONS.find((r) => r.key === role) ?? ROLE_OPTIONS[3];
  const RoleIcon = currentRole.icon;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    window.localStorage.setItem('mg-theme', theme);
  }, [theme]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifications((list) => list.map((n) => ({ ...n, unread: false })));

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white transition-colors duration-300 dark:border-white/5 dark:bg-slate-950/70 dark:backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 lg:px-10">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-500">Bem-vindo de volta</p>
          <h1 className="truncate text-base font-semibold text-slate-900 transition-colors dark:text-white sm:text-lg">
            Olá,{' '}
            <span className="text-neon-500 drop-shadow-[0_0_6px_rgba(31,230,0,0.35)] dark:text-neon-400 dark:drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]">
              {userName}
            </span>
          </h1>
        </div>

        <HouseFilter value={selectedHouse} onChange={setSelectedHouse} />

        <div ref={roleRef} className="relative hidden md:block">
          <button
            onClick={() => {
              setRoleOpen((o) => !o);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur-xl transition-all duration-200 hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-neon-400/40 dark:hover:text-neon-300"
          >
            <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:inline dark:text-slate-500">
              Visão:
            </span>
            <span className="flex items-center gap-1.5">
              <RoleIcon className="h-3.5 w-3.5 text-neon-500 dark:text-neon-400" />
              {currentRole.label}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform dark:text-slate-500 ${
                roleOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`absolute right-0 mt-2 w-72 origin-top-right transition-all duration-200 ease-in-out ${
              roleOpen
                ? 'pointer-events-auto scale-100 opacity-100 translate-y-0'
                : 'pointer-events-none scale-95 opacity-0 -translate-y-1'
            }`}
          >
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#13141A]/90 dark:shadow-black/40 z-50">
              <div className="border-b border-slate-200 bg-gradient-to-r from-neon-400/5 to-transparent px-4 py-3 dark:border-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-600 dark:text-neon-300">
                  Modo Demonstração
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  Troque a visão para inspecionar a plataforma sob outro perfil.
                </p>
              </div>
              <ul className="max-h-96 overflow-y-auto py-1">
                {ROLE_OPTIONS.map((opt) => {
                  const Ico = opt.icon;
                  const active = opt.key === role;
                  return (
                    <li key={opt.key}>
                      <button
                        onClick={() => {
                          setRole(opt.key);
                          setRoleOpen(false);
                        }}
                        className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                          active
                            ? 'bg-neon-400/10 text-neon-700 dark:text-neon-300'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${
                            active
                              ? 'bg-neon-400/20 text-neon-600 ring-neon-400/40 dark:text-neon-300'
                              : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10'
                          }`}
                        >
                          <Ico className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-semibold">{opt.label}</span>
                            {active && <Check className="h-4 w-4 text-neon-500 dark:text-neon-300" />}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                            {opt.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-all duration-200 ease-in-out hover:border-neon-400/40 hover:text-neon-500 dark:border-white/5 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-neon-300"
        >
          <Sun
            className={`h-5 w-5 transition-all duration-300 ${
              theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
            }`}
          />
          <Moon
            className={`absolute inset-0 m-auto h-5 w-5 transition-all duration-300 ${
              theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            aria-label="Notificações"
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-all duration-200 ease-in-out hover:border-neon-400/40 hover:text-neon-500 dark:border-white/5 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-neon-400 px-1 text-[10px] font-bold text-slate-950 shadow-[0_0_10px_rgba(57,255,20,0.9)]">
                {unreadCount}
              </span>
            )}
          </button>

          <div
            className={`absolute right-0 mt-2 w-80 origin-top-right transition-all duration-200 ease-in-out ${
              notifOpen
                ? 'pointer-events-auto scale-100 opacity-100 translate-y-0'
                : 'pointer-events-none scale-95 opacity-0 -translate-y-1'
            }`}
          >
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#13141A]/90 dark:shadow-black/40 z-50">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/5">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Notificações</p>
                  <p className="text-[11px] text-slate-500">
                    {unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo em dia'}
                  </p>
                </div>
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-[11px] font-semibold uppercase tracking-wider text-neon-600 transition hover:text-neon-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neon-300 dark:hover:text-neon-200"
                >
                  Marcar todas como lidas
                </button>
              </div>

              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Ico = notifIconMap[n.icon].icon;
                  return (
                    <li
                      key={n.id}
                      className="group flex cursor-pointer items-start gap-3 border-b border-slate-100 px-4 py-3 transition-colors duration-200 ease-in-out last:border-b-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/[0.04]"
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${notifIconMap[n.icon].tone}`}
                      >
                        <Ico className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {n.title}
                          </p>
                          {n.unread && (
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neon-400 shadow-[0_0_6px_rgba(57,255,20,0.9)]" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
                          {n.description}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {n.time}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button className="block w-full border-t border-slate-200 bg-slate-50 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-600 transition hover:text-neon-600 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:text-neon-300">
                Ver todas
              </button>
            </div>
          </div>
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-3 rounded-xl border border-transparent p-1 pr-2 transition-all duration-200 ease-in-out hover:border-slate-200 hover:bg-slate-100/70 dark:hover:border-white/10 dark:hover:bg-white/5"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{userName}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-400 to-neon-600 text-sm font-bold text-slate-950 shadow-[0_0_16px_rgba(57,255,20,0.35)]">
              {initials}
            </div>
          </button>

          <div
            className={`absolute right-0 mt-2 w-56 origin-top-right transition-all duration-200 ease-in-out ${
              profileOpen
                ? 'pointer-events-auto scale-100 opacity-100 translate-y-0'
                : 'pointer-events-none scale-95 opacity-0 -translate-y-1'
            }`}
          >
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#13141A]/90 dark:shadow-black/40 z-50">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-white/5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-neon-600 dark:text-neon-300">
                  {user.role}
                </p>
              </div>

              <ProfileItem
                icon={User}
                label="Meu perfil"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate?.('settings');
                }}
              />
              <ProfileItem
                icon={Settings}
                label="Configurações de conta"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate?.('settings');
                }}
              />

              <div className="border-t border-slate-200 dark:border-white/5">
                <ProfileItem
                  icon={LogOut}
                  label="Sair"
                  danger
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  danger = false,
  onClick,
}: {
  icon: typeof Check;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out ${
        danger
          ? 'text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
