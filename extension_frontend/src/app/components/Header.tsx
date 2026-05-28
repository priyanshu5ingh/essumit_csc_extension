import { Building2, Circle, Bot, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface HeaderProps {
  onOpenAI: () => void;
}

export default function Header({ onOpenAI }: HeaderProps) {
  const { syncState, syncMsg, triggerSync } = useOfflineSync();

  const syncTitle =
    syncState === 'loading'
      ? 'Sync चल रहा है...'
      : syncState === 'success'
        ? syncMsg || 'Sync हो गया'
        : syncState === 'error'
          ? syncMsg || 'Sync failed'
          : 'ऑफ़लाइन ऐप सिंक करें (Desktop App → form auto-fill)';

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-gradient-to-r from-navy to-[#1e2a3d] border-b border-white/5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-saffron-deep flex items-center justify-center shadow-lg shadow-saffron/20">
          <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            CSC सहायक
          </h1>
          <p className="text-[10px] text-slate-400 leading-none font-medium">Digital Service Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={triggerSync}
          disabled={syncState === 'loading'}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
          title={syncTitle}
        >
          {syncState === 'loading' && <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />}
          {syncState === 'success' && <CheckCircle className="w-3.5 h-3.5 text-green" strokeWidth={2} />}
          {syncState === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />}
          {(syncState === 'idle' || !syncState) && <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />}
        </button>

        <button
          onClick={onOpenAI}
          className="w-9 h-9 rounded-md bg-gradient-to-br from-saffron/20 to-saffron/10 hover:from-saffron/30 hover:to-saffron/20 flex items-center justify-center transition-all duration-200 group relative border border-saffron/10"
          title="AI सहायक"
        >
          <Bot className="w-4 h-4 text-saffron" strokeWidth={2} />
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green rounded-full border-2 border-navy"></div>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green/10 border border-green/20">
          <Circle className="w-1.5 h-1.5 fill-green text-green animate-pulse" />
          <span className="text-[11px] font-medium text-green">Online</span>
        </div>
      </div>
    </header>
  );
}
