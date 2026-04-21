import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function SidebarItem({ icon: Icon, label, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-neon-400/10 text-neon-400 shadow-[0_0_0_1px_rgba(57,255,20,0.25)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-neon-400 shadow-[0_0_12px_rgba(57,255,20,0.9)]" />
      )}
      <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-neon-400' : ''}`} />
      <span>{label}</span>
    </button>
  );
}
