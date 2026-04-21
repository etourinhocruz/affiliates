import { FormEvent, useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Feedback = { kind: 'success' | 'error'; message: string } | null;

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (next.length < 8) {
      setFeedback({ kind: 'error', message: 'A nova senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    if (next !== confirm) {
      setFeedback({ kind: 'error', message: 'A confirmação não coincide com a nova senha.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);

    if (error) {
      setFeedback({ kind: 'error', message: error.message });
      return;
    }

    setFeedback({ kind: 'success', message: 'Senha alterada com sucesso.' });
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-white/5 bg-[#1E1E24] p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-400/10 text-neon-400 ring-1 ring-neon-400/30">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Alterar Senha</h3>
          <p className="text-xs text-slate-400">Mantenha sua conta protegida com uma senha forte.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          label="SENHA ATUAL"
          placeholder="........"
          value={current}
          onChange={setCurrent}
          visible={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
          autoComplete="current-password"
        />
        <PasswordField
          label="NOVA SENHA"
          placeholder="Mínimo 8 caracteres"
          value={next}
          onChange={setNext}
          visible={showNext}
          onToggle={() => setShowNext((v) => !v)}
          autoComplete="new-password"
        />
        <PasswordField
          label="CONFIRMAR NOVA SENHA"
          placeholder="Repita a nova senha"
          value={confirm}
          onChange={setConfirm}
          visible={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          autoComplete="new-password"
        />

        {feedback && (
          <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ring-1 ring-inset ${
              feedback.kind === 'success'
                ? 'bg-neon-400/10 text-neon-300 ring-neon-400/30'
                : 'bg-rose-500/10 text-rose-300 ring-rose-500/30'
            }`}
          >
            {feedback.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_22px_rgba(57,255,20,0.35)] transition-all duration-200 hover:bg-neon-300 hover:shadow-[0_0_32px_rgba(57,255,20,0.55)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? 'Salvando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete?: string;
};

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-lg bg-slate-900/80 px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 ring-1 ring-inset ring-white/5 transition focus:outline-none focus:ring-2 focus:ring-neon-400/60"
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition hover:text-slate-200"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
