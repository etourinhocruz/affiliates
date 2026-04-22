import { useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import {
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Database,
  FileSpreadsheet,
  History,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react';

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

type UploadLog = {
  id: string;
  house: string;
  reportDate: string;
  uploadedAt: string;
  status: 'success' | 'pending' | 'failed';
};

const MOCK_LOGS: UploadLog[] = [
  {
    id: 'log-1',
    house: 'Superbet',
    reportDate: '19/04/2026',
    uploadedAt: '20/04/2026 08:42',
    status: 'success',
  },
  {
    id: 'log-2',
    house: 'BetMGM',
    reportDate: '19/04/2026',
    uploadedAt: '20/04/2026 08:55',
    status: 'success',
  },
  {
    id: 'log-3',
    house: 'Novibet',
    reportDate: '18/04/2026',
    uploadedAt: '19/04/2026 09:10',
    status: 'success',
  },
  {
    id: 'log-4',
    house: 'BetFair',
    reportDate: '18/04/2026',
    uploadedAt: '19/04/2026 09:18',
    status: 'success',
  },
];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const houseLabel = useMemo(
    () => HOUSES.find((h) => h.key === house)?.label ?? '',
    [house],
  );

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1E1E24]/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-2 border-b border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Campanhas Lidas / Para Atribuição
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Casa selecionada: <span className="text-neon-300">{houseLabel}</span>
                {rows.length > 0 && (
                  <>
                    {' · '}
                    <span>{rows.length} linhas importadas</span>
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
                  <th className="px-3 py-3 text-right font-semibold">Receita</th>
                  <th className="px-5 py-3 text-right font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400 ring-1 ring-white/10">
                          <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          Nenhum dado encontrado
                        </p>
                        <p className="text-xs text-slate-400">
                          Envie um arquivo .csv para visualizar as campanhas para
                          atribuição.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={`${r.siteId}-${i}`}
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
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums font-bold text-neon-300">
                        {r.revenue || '0'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-neon-400/40 bg-neon-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neon-300 transition hover:border-neon-400/60 hover:bg-neon-400/20 hover:text-white">
                          Atribuir/Revisar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1E1E24]/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-400/10 text-neon-300 ring-1 ring-neon-400/30">
                <History className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Histórico de Atualizações
                </h3>
                <p className="text-[11px] text-slate-400">Últimos uploads processados</p>
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-3 p-4">
            {MOCK_LOGS.map((log) => (
              <li
                key={log.id}
                className="rounded-xl border border-white/5 bg-black/30 p-4 transition hover:border-neon-400/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{log.house}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Referência:{' '}
                      <span className="font-semibold text-slate-200">
                        {log.reportDate}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Upload:{' '}
                      <span className="font-semibold text-slate-200">
                        {log.uploadedAt}
                      </span>
                    </p>
                  </div>
                  <StatusPill status={log.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: UploadLog['status'] }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neon-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neon-300 ring-1 ring-neon-400/30">
        <CheckCircle2 className="h-3 w-3" />
        Sucesso
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
        Pendente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300 ring-1 ring-rose-400/30">
      Falhou
    </span>
  );
}
