import type { Conversion } from '../lib/supabase';

type Status = Conversion['status'];

const styles: Record<Status, string> = {
  approved:
    'bg-neon-400/10 text-neon-400 ring-neon-400/30 shadow-[0_0_10px_rgba(57,255,20,0.15)]',
  pending: 'bg-amber-400/10 text-amber-400 ring-amber-400/20',
  rejected: 'bg-rose-400/10 text-rose-400 ring-rose-400/20',
};

const labels: Record<Status, string> = {
  approved: 'Aprovada',
  pending: 'Pendente',
  rejected: 'Rejeitada',
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
