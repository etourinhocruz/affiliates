import { useEffect, useMemo, useState } from 'react';
import { Filter, Network, Search, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Member = {
  id: string;
  name: string;
  email: string;
  tier: string;
  ftds: number;
  net_revenue: number;
  commission: number;
  conversion_rate: number;
  status: 'active' | 'paused';
};

const fallback: Member[] = [
  { id: 'm1', name: 'Rodrigo Alves', email: 'rodrigo.alves@gmail.com', tier: 'Afiliado Gold', ftds: 1210, net_revenue: 42800, commission: 12840, conversion_rate: 18.4, status: 'active' },
  { id: 'm2', name: 'Marina Queiroz', email: 'marina.q@tuboreomedia.com', tier: 'Afiliado Gold', ftds: 984, net_revenue: 33600, commission: 9820, conversion_rate: 16.7, status: 'active' },
  { id: 'm3', name: 'Diego Martins', email: 'diego.m@tuboreomedia.com', tier: 'Afiliado', ftds: 612, net_revenue: 19700, commission: 5810, conversion_rate: 12.1, status: 'active' },
  { id: 'm4', name: 'Camila Rocha', email: 'camila.rocha@gmail.com', tier: 'Afiliado', ftds: 498, net_revenue: 16420, commission: 4720, conversion_rate: 11.3, status: 'active' },
  { id: 'm5', name: 'Bruno Tavares', email: 'bruno@partners.br', tier: 'Afiliado Júnior', ftds: 184, net_revenue: 6120, commission: 1650, conversion_rate: 7.8, status: 'paused' },
  { id: 'm6', name: 'Isabela Mota', email: 'isa.mota@tuboreomedia.com', tier: 'Afiliado', ftds: 302, net_revenue: 10240, commission: 2980, conversion_rate: 9.4, status: 'active' },
];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const formatInt = (v: number) => Math.round(v).toLocaleString('pt-BR');

export default function AgencyNetworkPage() {
  const [members, setMembers] = useState<Member[]>(fallback);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | string>('ALL');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('agency_members')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length) setMembers(data as Member[]);
    })();
  }, []);

  const tiers = useMemo(
    () => Array.from(new Set(members.map((m) => m.tier))),
    [members],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (tierFilter !== 'ALL' && m.tier !== tierFilter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [members, search, tierFilter]);

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600 ring-1 ring-sky-400/30 dark:text-sky-300">
          <Network className="h-3 w-3" />
          Agency Suite · Rede
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Minha Rede de Afiliados
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Gerencie a estrutura, o status e a performance de cada afiliado da agência.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/80 p-3 backdrop-blur-xl dark:border-white/5 dark:bg-[#1E1E24]/80 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar afiliado por nome ou email..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm font-semibold text-gray-800 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 md:w-56"
          >
            <option value="ALL">Todos os tiers</option>
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300">
          <UserPlus className="h-4 w-4" />
          Convidar Afiliado
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Estrutura</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              {formatInt(filtered.length)} de {formatInt(members.length)} afiliados
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-black/30 dark:text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Afiliado</th>
                <th className="px-3 py-3 text-left font-semibold">Tier</th>
                <th className="px-3 py-3 text-right font-semibold">FTDs</th>
                <th className="px-3 py-3 text-right font-semibold">Net Revenue</th>
                <th className="px-3 py-3 text-right font-semibold">Comissão</th>
                <th className="px-3 py-3 text-right font-semibold">Conversão</th>
                <th className="px-5 py-3 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    Nenhum afiliado encontrado.
                  </td>
                </tr>
              )}
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                >
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-[11px] font-bold text-white dark:from-[#272732] dark:to-[#14141A]">
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{m.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-700 ring-1 ring-sky-400/30 dark:text-sky-300">
                      {m.tier}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-900 dark:text-white">
                    {formatInt(Number(m.ftds))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-900 dark:text-white">
                    {formatBRL(Number(m.net_revenue))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums font-semibold text-[#1C8A14] dark:text-[#39FF14]">
                    {formatBRL(Number(m.commission))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-700 dark:text-slate-200">
                    {Number(m.conversion_rate).toFixed(1)}%
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
                        m.status === 'active'
                          ? 'bg-emerald-900/20 text-[#39FF14] ring-neon-400/40'
                          : 'bg-amber-900/20 text-amber-600 ring-amber-400/40 dark:text-amber-300'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          m.status === 'active'
                            ? 'bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.9)]'
                            : 'bg-amber-500'
                        }`}
                      />
                      {m.status === 'active' ? 'Ativo' : 'Pausado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
