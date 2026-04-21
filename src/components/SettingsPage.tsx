import { Settings } from 'lucide-react';
import ChangePasswordForm from './ChangePasswordForm';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-400/10 text-neon-400 ring-1 ring-neon-400/30 shadow-[0_0_18px_rgba(57,255,20,0.2)]">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Configurações
          </h2>
          <p className="mt-1 text-sm text-slate-400">Segurança e notificações</p>
        </div>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
