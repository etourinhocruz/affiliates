import { LayoutDashboard, Megaphone, BarChart3, Wallet, Settings, X } from 'lucide-react';
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
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/5 bg-slate-950/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
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
              <p className="text-[15px] font-bold tracking-tight text-white">
                Mansão{' '}
                <span className="text-neon-400 drop-shadow-[0_0_6px_rgba(57,255,20,0.55)]">
                  Green
                </span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                Affiliates
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
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

        <div className="m-4 rounded-2xl border border-white/5 bg-gradient-to-br from-neon-400/10 via-slate-900 to-slate-950 p-5">
          <p className="text-sm font-semibold text-white">Suporte Exclusivo</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Fale comigo agora no WhatsApp para tirar a sua dúvida.
          </p>
          <button className="mt-4 flex w-full items-center gap-2 rounded-lg bg-neon-400 py-1.5 pl-1.5 pr-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-200 hover:bg-neon-300 hover:shadow-neon">
            <img
              src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=2&fit=crop"
              alt="Atendente"
              className="h-7 w-7 flex-shrink-0 rounded-full object-cover ring-2 ring-slate-950"
            />
            <span className="flex-1 text-center">Me chama aqui</span>
          </button>
        </div>
      </aside>
    </>
  );
}