import { useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import {
  Check,
  ChevronDown,
  ClipboardList,
  Database,
  FileSpreadsheet,
  Loader2,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type HouseKey = 'superbet' | 'betmgm' | 'esportivabet' | 'betfair' | 'novibet';

const HOUSES: { key: HouseKey; label: string }[] = [
  { key: 'superbet', label: 'Superbet' },
  { key: 'betmgm', label: 'BetMGM' },
  { key: 'esportivabet', label: 'EsportivaBet' },
  { key: 'betfair', label: 'BetFair' },
  { key: 'novibet', label: 'Novibet' },
];

type CampaignRow = {
  siteId: string;
  siteName: string;
  acid: string;
  ftd: string;
  revenue: string;
};

function pick(obj: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const match = Object.keys(obj).find(
      (x) => x.trim().toLowerCase() === k.toLowerCase(),
    );
    if (match && obj[match] != null) return String(obj[match]);
  }
  return '';
}

export default function DataUploadPage() {
  const [house, setHouse] = useState<HouseKey>('superbet');
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [persisting, setPersisting] = useState(false);
  const [persistResult, setPersistResult] = useState<{
    inserted: number;
    updated: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const houseLabel = useMemo(
    () => HOUSES.find((h) => h.key === house)?.label ?? '',
    [house],
  );

  const persistRows = async (parsed: CampaignRow[], betHouse: HouseKey) => {
    const unique = new Map<string, CampaignRow>();
    for (const r of parsed) {
      const acid = r.acid.trim();
      if (!acid) continue;
      const key = `${betHouse}::${acid}`;
      const prev = unique.get(key);
      const ftd = Number(r.ftd || '0') || 0;
      const revenue = Number(String(r.revenue || '0').replace(',', '.')) || 0;
      if (!prev) {
        unique.set(key, { ...r, acid, ftd: String(ftd), revenue: String(revenue) });
      } else {
        unique.set(key, {
          ...prev,
          siteId: prev.siteId || r.siteId,
          siteName: prev.siteName || r.siteName,
          ftd: String((Number(prev.ftd) || 0) + ftd),
          revenue: String((Number(prev.revenue) || 0) + revenue),
        });
      }
    }
    const list = Array.from(unique.values());
    if (list.length === 0) {
      setPersistResult({ inserted: 0, updated: 0 });
      return;
    }

    setPersisting(true);
    const nowIso = new Date().toISOString();
    const payload = list.map((r) => ({
      bet_house: betHouse,
      site_id: r.siteId,
      site_name: r.siteName,
      acid: r.acid,
      campaign_key: `${betHouse}::${r.siteId}::${r.acid}`,
      ftd: Number(r.ftd) || 0,
      revenue: Number(r.revenue) || 0,
      last_seen_at: nowIso,
      updated_at: nowIso,
    }));
    const keys = payload.map((p) => p.campaign_key);

    const { data: existing } = await supabase
      .from('campaign_assignments')
      .select('campaign_key')
      .in('campaign_key', keys);
    const existingSet = new Set(
      (existing || []).map((e) => String(e.campaign_key)),
    );

    const { error } = await supabase
      .from('campaign_assignments')
      .upsert(payload, { onConflict: 'campaign_key' });

    setPersisting(false);

    if (error) {
      setParseError(
        `Não foi possível salvar as campanhas no banco: ${error.message}`,
      );
      return;
    }

    const inserted = payload.filter(
      (p) => !existingSet.has(p.campaign_key),
    ).length;
    const updated = payload.length - inserted;
    setPersistResult({ inserted, updated });
  };

  const handleFile = (file: File) => {
    if (!file) return;
    const isCsv =
      file.type === 'text/csv' ||
      file.name.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      setParseError('O arquivo precisa estar no formato .csv');
      return;
    }
    setFileName(file.name);
    setParseError(null);
    setPersistResult(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed: CampaignRow[] = result.data
          .map((raw) => ({
            siteId: pick(raw, ['Site ID', 'SiteID', 'site_id', 'id']),
            siteName: pick(raw, [
              'Site Name',
              'SiteName',
              'site_name',
              'name',
            ]),
            acid: pick(raw, ['ACID', 'Tracker', 'acid', 'tracker']),
            ftd: pick(raw, ['FTD', 'ftd', 'FTDs', 'ftds']),
            revenue: pick(raw, [
              'Receita',
              'Revenue',
              'revenue',
              'receita',
            ]),
          }))
          .filter(
            (r) =>
              r.siteId || r.siteName || r.acid || r.ftd || r.revenue,
          );
        setRows(parsed);
        void persistRows(parsed, house);
      },
      error: () => {
        setParseError('Não foi possível ler o arquivo CSV.');
      },
    });
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearData = () => {
    setRows([]);
    setFileName(null);
    setParseError(null);
    setPersistResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="pb-10 text-slate-100 animate-rise">
      <header className="mb-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-300 ring-1 ring-neon-400/30">
          <Database className="h-3 w-3" />
          Super Admin · Ingestão de Dados
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Upload de Dados
        </h2>
        <p className="text-sm text-slate-400">
          Selecione a casa de aposta e envie o arquivo CSV diário para
          processamento e atribuição.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-white/5 bg-[#1E1E24]/80 p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Selecione a Casa de Aposta
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Zap className="h-4 w-4" />
              </span>
              <select
                value={house}
                onChange={(e) => setHouse(e.target.value as HouseKey)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-9 text-sm font-semibold text-white transition focus:border-neon-400/60 focus:outline-none focus:shadow-[0_0_0_4px_rgba(57,255,20,0.08)]"
              >
                {HOUSES.map((h) => (
                  <option key={h.key} value={h.key} className="bg-[#14141A]">
                    {h.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-3 text-xs text-slate-400">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                <ClipboardList className="h-3 w-3" />
                Colunas esperadas
              </p>
              <p>Site ID · Site Name · ACID · FTD · Receita</p>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 ${
              dragging
                ? 'border-neon-400/70 bg-neon-400/5 shadow-[0_0_40px_rgba(57,255,20,0.15)]'
                : 'border-white/10 bg-black/30 hover:border-neon-400/40 hover:bg-neon-400/5'
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-400/10 text-neon-300 ring-1 ring-neon-400/30 shadow-[0_0_18px_rgba(57,255,20,0.25)]">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold text-white">
              Arraste e solte o arquivo CSV aqui
            </p>
            <p className="mt-1 text-xs text-slate-400">
              ou clique para selecionar do seu computador · apenas .csv
            </p>

            {fileName && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neon-400/30 bg-neon-400/10 px-3 py-1 text-[11px] font-semibold text-neon-300">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                {fileName}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearData();
                  }}
                  className="ml-1 rounded-full p-0.5 text-neon-300/80 transition hover:bg-neon-400/20 hover:text-white"
                  aria-label="Limpar arquivo"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}

            {parseError && (
              <p className="mt-3 text-xs font-semibold text-rose-300">
                {parseError}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        </div>
      </section>

      {(persisting || persistResult) && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-neon-400/30 bg-neon-400/5 px-4 py-3 text-sm text-slate-200 backdrop-blur-xl">
          {persisting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-neon-300" />
              <span>Ingerindo campanhas no banco...</span>
            </>
          ) : persistResult ? (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neon-400/20 text-neon-300">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>
                Ingestão concluída: <span className="font-bold text-neon-300">{persistResult.inserted}</span>{' '}
                nova(s) e <span className="font-bold text-neon-300">{persistResult.updated}</span> atualizada(s).
                A atribuição é feita na aba <span className="font-semibold text-white">Atribuição de Campanhas</span>.
              </span>
            </>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1E1E24]/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-2 border-b border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Pré-visualização das Campanhas Ingeridas
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Casa selecionada: <span className="text-neon-300">{houseLabel}</span>
                {rows.length > 0 && (
                  <>
                    {' · '}
                    <span>{rows.length} linhas lidas</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="bg-black/30 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 text-left font-semibold">Site ID</th>
                  <th className="px-3 py-3 text-left font-semibold">Site Name</th>
                  <th className="px-3 py-3 text-left font-semibold">ACID (Tracker)</th>
                  <th className="px-3 py-3 text-right font-semibold">FTD</th>
                  <th className="px-5 py-3 text-right font-semibold">Receita</th>
                </tr>
              </thead>
              <tbody>
                {(rows || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400 ring-1 ring-white/10">
                          <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          Nenhum dado encontrado
                        </p>
                        <p className="text-xs text-slate-400">
                          Envie um arquivo .csv para ingerir as campanhas automaticamente no banco.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={`${r.acid || r.siteId}-${i}`}
                      className="border-b border-white/5 text-slate-200 transition hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-left font-semibold text-white">
                        {r.siteId || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-left">
                        {r.siteName || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-left font-mono text-xs text-slate-300">
                        {r.acid || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {r.ftd || '0'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums font-bold text-neon-300">
                        {r.revenue || '0'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
