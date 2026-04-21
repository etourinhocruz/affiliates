import type { Conversion } from '../lib/supabase';
import StatusBadge from './StatusBadge';

type Props = { items: Conversion[] };

const currency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (d: string) =>
  new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ConversionsTable({ items }: Props) {
  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-base font-semibold text-white">Últimas Conversões</h3>
          <p className="text-xs text-slate-400">Atualizado em tempo real</p>
        </div>
        <button className="text-xs font-semibold text-neon-400 transition hover:text-neon-300">
          Ver todas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3 font-medium">Data</th>
              <th className="px-6 py-3 font-medium">ID do Usuário</th>
              <th className="px-6 py-3 font-medium">Campanha</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.id}
                className="border-t border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="px-6 py-4 text-slate-400">{formatDate(row.converted_at)}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-200">{row.user_ref}</td>
                <td className="px-6 py-4 text-slate-200">{row.campaign}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 text-right font-semibold text-white">
                  {currency(Number(row.commission))}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                  Nenhuma conversão encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
