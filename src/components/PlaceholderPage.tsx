import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  roleLabel?: string;
  icon?: LucideIcon;
};

export default function PlaceholderPage({ title, subtitle, roleLabel, icon: Icon = Construction }: Props) {
  return (
    <div className="pb-10">
      <div className="mb-6 flex flex-col gap-2">
        {roleLabel && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
            {roleLabel}
          </span>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/10 dark:bg-[#1E1E24] dark:shadow-none">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
          <Icon className="h-6 w-6" />
        </div>
        <div className="max-w-md">
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            Módulo em construção
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Esta área será ativada na próxima sprint. A estrutura de acesso baseada em papéis já está conectada.
          </p>
        </div>
      </div>
    </div>
  );
}
