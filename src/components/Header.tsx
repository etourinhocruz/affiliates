import { Bell, Menu } from 'lucide-react';

type Props = {
  userName: string;
  onOpenMobile: () => void;
};

export default function Header({ userName, onOpenMobile }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <p className="text-xs text-slate-500">Bem-vindo de volta</p>
          <h1 className="text-base font-semibold text-white sm:text-lg">
            Olá, <span className="text-neon-400 drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]">{userName}</span>
          </h1>
        </div>

        <button className="relative rounded-xl border border-white/5 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neon-400 shadow-[0_0_8px_rgba(57,255,20,0.9)]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-slate-500">Afiliado Ouro</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-400 to-neon-600 text-sm font-bold text-slate-950 shadow-[0_0_16px_rgba(57,255,20,0.35)]">
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
