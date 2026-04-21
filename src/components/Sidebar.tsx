import { LayoutDashboard, Megaphone, BarChart3, Wallet, Settings, X, Trophy, Users } from 'lucide-react';
import SidebarItem from './SidebarItem';

type Props = {
  active: string;
  onNavigate: (key: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const items = [
  { key: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { key: 'campaigns', label: 'Campanhas', icon: Megaphone },
  { key: 'reports', label: 'Relatórios', icon: BarChart3 },
  { key: 'deals', label: 'Deals Disponíveis', icon: Wallet },
  { key: 'affiliates', label: 'Meus Afiliados', icon: Users },
  { key: 'gamification', label: 'Premiações', icon: Trophy },
  { key: 'settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ active, onNavigate, mobileOpen, onCloseMobile }: Props) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-200 bg-white shadow-[2px_0_12px_rgba(15,23,42,0.04)] transition-[transform,background-color,border-color] duration-300 dark:border-white/5 dark:bg-slate-950/80 dark:shadow-none dark:backdrop-blur-xl lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between px-6 pt-7 pb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-black p-1.5 ring-1 ring-neon-400/40 shadow-[0_0_22px_rgba(57,255,20,0.35)]">
              <img
                src="/AFFILIATES_LOGO_PNG_(2).png"
                alt="Mansão Green Affiliates"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
                Mansão{' '}
                <span className="text-neon-500 drop-shadow-[0_0_6px_rgba(31,230,0,0.4)] dark:text-neon-400 dark:drop-shadow-[0_0_6px_rgba(57,255,20,0.55)]">
                  Green
                </span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-500 dark:text-slate-300">
                Affiliates
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4">
          {items.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={active === item.key}
              onClick={() => {
                onNavigate(item.key);
                onCloseMobile();
              }}
            />
          ))}
        </nav>

        <div className="m-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-neon-400/10 via-white to-gray-50 p-5 dark:border-white/5 dark:from-neon-400/10 dark:via-slate-900 dark:to-slate-950">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Suporte Exclusivo</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
            Fale comigo agora no WhatsApp para tirar a sua dúvida.
          </p>
          <button className="mt-4 flex w-full items-center gap-2 rounded-lg bg-neon-400 py-1.5 pl-1.5 pr-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-200 hover:bg-neon-300 hover:shadow-neon">
            <img
              src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=2&fit=crop"
              alt="Atendente"
              className="h-7 w-7 flex-shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-slate-950"
            />
            <span className="flex-1 text-center">Me chama aqui</span>
          </button>
        </div>
      </aside>
    </>
  );
}