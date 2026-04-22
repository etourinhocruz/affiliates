import { useEffect, useMemo, useState } from 'react';
import { Check, MessageCircle, Pencil, Search, Users, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Aff = {
  id: string;
  name: string;
  email: string;
  ftds: number;
  target_ftds: number;
  net_revenue: number;
  commission_split: number;
  status: 'active' | 'paused';
};

const fallback: Aff[] = [
  { id: 'a1', name: 'Rodrigo Alves', email: 'rodrigo.alves@gmail.com', ftds: 1210, target_ftds: 1500, net_revenue: 42800, commission_split: 25, status: 'active' },
  { id: 'a2', name: 'Camila Rocha', email: 'camila.rocha@gmail.com', ftds: 498, target_ftds: 800, net_revenue: 16420, commission_split: 22, status: 'active' },
  { id: 'a3', name: 'Diego Martins', email: 'diego.m@partners.br', ftds: 612, target_ftds: 900, net_revenue: 19700, commission_split: 22, status: 'active' },
  { id: 'a4', name: 'Bruno Tavares', email: 'bruno@partners.br', ftds: 184, target_ftds: 500, net_revenue: 6120, commission_split: 20, status: 'paused' },
  { id: 'a5', name: 'Vinícius Lopes', email: 'vini.lopes@partners.br', ftds: 356, target_ftds: 600, net_revenue: 11800, commission_split: 22, status: 'active' },
];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const formatInt = (v: number) => Math.round(v).toLocaleString('pt-BR');

export default function ManagerAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Aff[]>(fallback);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Aff | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('manager_affiliates')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length) setAffiliates(data as Aff[]);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return affiliates;
    return affiliates.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
    );
  }, [affiliates, search]);

  const updateLocal = (id: string, patch: Partial<Aff>) =>
    setAffiliates((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600 ring-1 ring-amber-400/30 dark:text-amber-300">
          <Users className="h-3 w-3" />
          Manager Suite · Afiliados
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Meus Afiliados
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Ajuste metas, split e status de cada afiliado sob a sua gestão.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/80 p-3 dark:border-white/5 dark:bg-[#1E1E24]/80 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar afiliado..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#1E1E24] dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-black/30 dark:text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Afiliado</th>
                <th className="px-3 py-3 text-left font-semibold">Meta</th>
                <th className="px-3 py-3 text-right font-semibold">FTDs</th>
                <th className="px-3 py-3 text-right font-semibold">Net Revenue</th>
                <th className="px-3 py-3 text-right font-semibold">Split</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const pct = a.target_ftds ? Math.min((a.ftds / a.target_ftds) * 100, 100) : 0;
                return (
                  <tr key={a.id} className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{a.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{a.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-44">
                        <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400">
                          <span>{pct.toFixed(0)}%</span>
                          <span className="tabular-nums">{formatInt(a.target_ftds)}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#39FF14] to-emerald-300" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-900 dark:text-white">
                      {formatInt(Number(a.ftds))}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-gray-900 dark:text-white">
                      {formatBRL(Number(a.net_revenue))}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums font-semibold text-[#1C8A14] dark:text-[#39FF14]">
                      {Number(a.commission_split).toFixed(0)}%
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${a.status === 'active' ? 'bg-emerald-900/20 text-[#39FF14] ring-neon-400/40' : 'bg-amber-900/20 text-amber-600 ring-amber-400/40 dark:text-amber-300'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.status === 'active' ? 'bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.9)]' : 'bg-amber-500'}`} />
                        {a.status === 'active' ? 'Ativo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setToast(`Mensagem enviada para ${a.name}.`)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-neon-300"
                          title="Enviar mensagem"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditing(a)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#39FF14]/90 px-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-[#39FF14]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditAffiliateModal
          aff={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateLocal(editing.id, patch);
            setToast(`Dados de ${editing.name} atualizados.`);
            setEditing(null);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-rise">
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

function EditAffiliateModal({
  aff,
  onClose,
  onSave,
}: {
  aff: Aff;
  onClose: () => void;
  onSave: (patch: Partial<Aff>) => void;
}) {
  const [target, setTarget] = useState(aff.target_ftds);
  const [split, setSplit] = useState(aff.commission_split);
  const [status, setStatus] = useState<Aff['status']>(aff.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#14141A]">
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-white/5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-400/10 text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
              <Pencil className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                Editar afiliado
              </h4>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                Ajuste meta, split e status de {aff.name}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-800 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
              Meta de FTDs
            </span>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
              Split de comissão (%)
            </span>
            <input
              type="number"
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Aff['status'])}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
            >
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-white/5">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave({ target_ftds: target, commission_split: split, status })}
            className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] hover:bg-neon-300"
          >
            <Check className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
