import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Papa from 'papaparse';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Sparkles,
  Table as TableIcon,
  UploadCloud,
  X,
} from 'lucide-react';
import { adminWrite } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';

type ImportedRow = {
  campaign_code: string;
  source_name: string;
  cadastros: number;
  ftd: number;
  deposito_total: number;
  net_revenue: number;
  qftd: number;
};

const HOUSE_OPTIONS = [
  { key: 'superbet', label: 'SuperBet' },
  { key: 'betmgm', label: 'BetMGM' },
  { key: 'esportivabet', label: 'EsportivaBet' },
  { key: 'betfair', label: 'BetFair' },
  { key: 'novibet', label: 'NoviBet' },
];

const REQUIRED_COLUMNS = [
  'ACID',
  'Registrations',
  'First Deposit Count',
  'Deposits',
  'Net revenue',
  'CPA count',
] as const;

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/\s/g, '').replace(/R\$/gi, '').replace(/[^\d,.-]/g, '');
  if (!cleaned) return 0;
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  let normalized = cleaned;
  if (hasComma && hasDot) normalized = cleaned.replace(/\./g, '').replace(',', '.');
  else if (hasComma) normalized = cleaned.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatInt = (v: number) => Math.round(v).toLocaleString('pt-BR');

export default function DataImportPage() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [house, setHouse] = useState('superbet');
  const [referenceDate, setReferenceDate] = useState(yesterdayISO());
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.cadastros += r.cadastros;
        acc.ftd += r.ftd;
        acc.qftd += r.qftd;
        acc.deposito_total += r.deposito_total;
        acc.net_revenue += r.net_revenue;
        return acc;
      },
      { cadastros: 0, ftd: 0, qftd: 0, deposito_total: 0, net_revenue: 0 },
    );
  }, [rows]);

  const showToast = (kind: 'success' | 'error', text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3200);
  };

  const resetAll = () => {
    setFile(null);
    setRows([]);
    setError(null);
    setParsing(false);
    setSaving(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (selected: File | null) => {
    setError(null);
    if (!selected) return;

    const isCsv =
      selected.type === 'text/csv' ||
      selected.type === 'application/vnd.ms-excel' ||
      selected.name.toLowerCase().endsWith('.csv');

    if (!isCsv) {
      setError('Arquivo inválido. Envie um CSV exportado da casa de apostas.');
      return;
    }

    setFile(selected);
    setParsing(true);

    Papa.parse<Record<string, string>>(selected, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        setParsing(false);

        if (result.errors?.length) {
          setError('Não foi possível ler o CSV. Verifique o arquivo e tente novamente.');
          setRows([]);
          return;
        }

        const data = result.data ?? [];
        if (data.length === 0) {
          setError('O arquivo está vazio ou não contém linhas de dados.');
          setRows([]);
          return;
        }

        const headers = result.meta?.fields ?? [];
        const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          setError(`Colunas obrigatórias ausentes: ${missing.join(', ')}.`);
          setRows([]);
          return;
        }

        const normalized: ImportedRow[] = data
          .map((r) => ({
            campaign_code: (r['ACID'] ?? '').toString().trim(),
            source_name: (r['Site Name'] ?? '').toString().trim(),
            cadastros: Math.round(toNumber(r['Registrations'])),
            ftd: Math.round(toNumber(r['First Deposit Count'])),
            deposito_total: toNumber(r['Deposits']),
            net_revenue: toNumber(r['Net revenue']),
            qftd: Math.round(toNumber(r['CPA count'])),
          }))
          .filter((r) => r.campaign_code || r.source_name);

        if (normalized.length === 0) {
          setError('Nenhuma linha válida encontrada após a filtragem.');
          setRows([]);
          return;
        }

        setRows(normalized);
      },
      error: () => {
        setParsing(false);
        setError('Falha ao processar o CSV. Tente novamente.');
        setRows([]);
      },
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSave = async () => {
    if (rows.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const payload = rows.map((r) => ({
        house,
        reference_date: referenceDate,
        campaign_code: r.campaign_code,
        source_name: r.source_name,
        registrations: r.cadastros,
        ftd: r.ftd,
        qftd: r.qftd,
        total_deposits: r.deposito_total,
        net_revenue: r.net_revenue,
        imported_by_email: user.email,
      }));
      await adminWrite({ table: 'imported_metrics', action: 'batch_insert', rows: payload });
      showToast('success', `Métricas importadas com sucesso (${payload.length} linhas).`);
      resetAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gravar no banco.';
      setError(msg);
      showToast('error', 'Falha ao gravar no banco de dados.');
    } finally {
      setSaving(false);
    }
  };

  const houseLabel = HOUSE_OPTIONS.find((h) => h.key === house)?.label ?? house;

  return (
    <div className="pb-10 text-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neon-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neon-600 ring-1 ring-neon-400/30 dark:text-neon-300">
            <Database className="h-3 w-3" />
            Super Admin · Ingestão
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Importar Dados
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Faça o upload de CSVs das casas de apostas, valide e grave no banco.
          </p>
        </div>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-neon-400/40 hover:text-neon-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-neon-400/40 dark:hover:text-neon-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recomeçar
          </button>
        )}
      </div>

      <Dropzone
        file={file}
        parsing={parsing}
        dragActive={dragActive}
        onInputChange={handleInputChange}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPickFile={() => inputRef.current?.click()}
        inputRef={inputRef}
      />

      <MetaControls
        house={house}
        onHouseChange={setHouse}
        referenceDate={referenceDate}
        onReferenceDateChange={setReferenceDate}
      />

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-700 shadow-[0_8px_30px_rgba(244,63,94,0.08)] dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Não foi possível processar o arquivo.</p>
            <p className="mt-0.5 text-[13px] opacity-90">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="rounded-lg p-1 text-rose-600 hover:bg-rose-100 dark:text-rose-200 dark:hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <SummaryStrip
            count={rows.length}
            cadastros={summary.cadastros}
            ftd={summary.ftd}
            qftd={summary.qftd}
            depositos={summary.deposito_total}
            netRevenue={summary.net_revenue}
          />
          <AuditTable rows={rows} />

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Casa:{' '}
              <span className="font-semibold text-gray-800 dark:text-white">{houseLabel}</span> ·
              Data:{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                {new Date(referenceDate + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#7CFF58]/40 bg-gradient-to-b from-[#7CFF58] via-[#39FF14] to-[#17B800] px-6 text-sm font-bold uppercase tracking-[0.18em] text-black shadow-[0_10px_30px_-8px_rgba(57,255,20,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(57,255,20,0.6),0_18px_44px_-10px_rgba(57,255,20,0.65),inset_0_1px_0_rgba(255,255,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/60 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0 sm:w-auto"
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/40 opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="relative">Gravando...</span>
                </>
              ) : (
                <span className="relative inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Salvar no Banco de Dados
                </span>
              )}
            </button>
          </div>
        </>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-rise ${
            toast.kind === 'success'
              ? 'border-neon-400/40 bg-[#0B0E0C]/90 text-neon-300'
              : 'border-rose-400/40 bg-rose-500/10 text-rose-200'
          }`}
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          {toast.text}
        </div>
      )}
    </div>
  );
}

function Dropzone({
  file,
  parsing,
  dragActive,
  onInputChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onPickFile,
  inputRef,
}: {
  file: File | null;
  parsing: boolean;
  dragActive: boolean;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onPickFile: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-10 transition-all duration-300 ${
        dragActive
          ? 'border-[#39FF14] bg-[#39FF14]/[0.06] shadow-[0_0_0_6px_rgba(57,255,20,0.08),0_30px_60px_-30px_rgba(57,255,20,0.35)]'
          : 'border-gray-300 bg-white/80 hover:border-[#39FF14] dark:border-gray-600 dark:bg-white/[0.03] dark:hover:border-[#39FF14]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(57,255,20,0.08),transparent_40%),radial-gradient(circle_at_90%_100%,rgba(57,255,20,0.05),transparent_45%)] opacity-80" />
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onInputChange}
      />
      <div className="relative flex flex-col items-center text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ring-1 transition ${
            dragActive
              ? 'bg-[#39FF14]/15 text-[#39FF14] ring-[#39FF14]/50 shadow-[0_0_28px_rgba(57,255,20,0.35)]'
              : 'bg-gray-900/5 text-gray-700 ring-gray-900/10 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10'
          }`}
        >
          {parsing ? <Loader2 className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
        </div>
        <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
          {file ? file.name : 'Arraste e solte o CSV aqui'}
        </h3>
        <p className="mt-1 max-w-lg text-sm text-gray-500 dark:text-slate-400">
          {file
            ? parsing
              ? 'Processando arquivo...'
              : 'Arquivo carregado. Confira a pré-visualização ou envie outro CSV.'
            : 'Planilhas da SuperBet, BetMGM, BetFair e demais casas são aceitas. Apenas .csv.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPickFile}
            className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_0_18px_rgba(57,255,20,0.35)] transition hover:bg-neon-300"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Selecionar Arquivo
          </button>
          <span className="text-xs text-gray-400 dark:text-slate-500">
            ou arraste diretamente nesta área
          </span>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-slate-500">
          {REQUIRED_COLUMNS.map((c) => (
            <span
              key={c}
              className="rounded-full border border-gray-200 bg-white px-2.5 py-1 dark:border-white/10 dark:bg-white/[0.02]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetaControls({
  house,
  onHouseChange,
  referenceDate,
  onReferenceDateChange,
}: {
  house: string;
  onHouseChange: (v: string) => void;
  referenceDate: string;
  onReferenceDateChange: (v: string) => void;
}) {
  return (
    <div className="mt-6 grid gap-4 rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.03] dark:shadow-none sm:grid-cols-2">
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
          <Database className="h-3.5 w-3.5" /> Casa de Apostas
        </label>
        <select
          value={house}
          onChange={(e) => onHouseChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-neon-400/50 focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
        >
          {HOUSE_OPTIONS.map((h) => (
            <option
              key={h.key}
              value={h.key}
              className="bg-white text-gray-800 dark:bg-[#121212] dark:text-slate-200"
            >
              {h.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" /> Data de Referência
        </label>
        <input
          type="date"
          value={referenceDate}
          onChange={(e) => onReferenceDateChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-neon-400/50 focus:ring-2 focus:ring-neon-400/20 dark:border-white/10 dark:bg-[#121212] dark:text-white"
        />
      </div>
    </div>
  );
}

function SummaryStrip({
  count,
  cadastros,
  ftd,
  qftd,
  depositos,
  netRevenue,
}: {
  count: number;
  cadastros: number;
  ftd: number;
  qftd: number;
  depositos: number;
  netRevenue: number;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <SummaryCard label="Linhas" value={formatInt(count)} tone="neutral" />
      <SummaryCard label="Cadastros" value={formatInt(cadastros)} tone="sky" />
      <SummaryCard label="FTD" value={formatInt(ftd)} tone="amber" />
      <SummaryCard label="QFTD" value={formatInt(qftd)} tone="neon" />
      <SummaryCard label="Depósitos" value={formatBRL(depositos)} tone="neutral" />
      <SummaryCard label="Net Revenue" value={formatBRL(netRevenue)} tone="neon" />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'neon' | 'sky' | 'amber' | 'neutral';
}) {
  const toneMap: Record<typeof tone, string> = {
    neon: 'text-neon-700 dark:text-neon-300',
    sky: 'text-sky-600 dark:text-sky-300',
    amber: 'text-amber-600 dark:text-amber-300',
    neutral: 'text-gray-900 dark:text-white',
  } as const;
  return (
    <div className="rounded-xl border border-gray-200 bg-white/80 p-3.5 backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.03]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold tabular-nums ${toneMap[tone]}`}>{value}</p>
    </div>
  );
}

function AuditTable({ rows }: { rows: ImportedRow[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.03] dark:shadow-none">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-white/5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white">
          <TableIcon className="h-4 w-4 text-neon-500 dark:text-neon-300" />
          Pré-visualização
          <span className="ml-2 inline-flex items-center rounded-full bg-neon-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-700 ring-1 ring-neon-400/30 dark:text-neon-300">
            {rows.length} linhas detectadas
          </span>
        </div>
      </div>
      <div className="max-h-[460px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-gray-50/95 backdrop-blur dark:bg-[#121212]/95">
            <tr className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
              <th className="px-5 py-3">ACID</th>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3 text-right">Cadastros</th>
              <th className="px-5 py-3 text-right">FTD</th>
              <th className="px-5 py-3 text-right">QFTD</th>
              <th className="px-5 py-3 text-right">Depósitos</th>
              <th className="px-5 py-3 text-right">Receita</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={`${r.campaign_code}-${idx}`}
                className="border-t border-gray-100 transition hover:bg-neon-400/[0.04] dark:border-white/5 dark:hover:bg-neon-400/[0.06]"
              >
                <td className="px-5 py-2.5 font-mono text-[12px] text-gray-600 dark:text-slate-300">
                  {r.campaign_code || '—'}
                </td>
                <td className="px-5 py-2.5 font-medium text-gray-900 dark:text-white">
                  {r.source_name || '—'}
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums text-gray-700 dark:text-slate-200">
                  {formatInt(r.cadastros)}
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums text-gray-700 dark:text-slate-200">
                  {formatInt(r.ftd)}
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums text-gray-700 dark:text-slate-200">
                  {formatInt(r.qftd)}
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums text-gray-700 dark:text-slate-200">
                  {formatBRL(r.deposito_total)}
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-neon-700 dark:text-neon-300">
                  {formatBRL(r.net_revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
