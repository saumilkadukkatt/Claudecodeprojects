import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/app.store';
import { cn } from '../../../shared/utils/cn';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { LogEntry } from '../../../shared/types';

export function Toaster() {
  const { logs } = useAppStore();
  const [toasts, setToasts] = useState<LogEntry[]>([]);

  useEffect(() => {
    const latest = logs[0];
    if (!latest || latest.level === 'debug') return;
    if (latest.level === 'info') return; // Only show success/warn/error as toasts

    setToasts((prev) => [latest, ...prev].slice(0, 3));
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== latest.id));
    }, 4000);
    return () => clearTimeout(timer);
  }, [logs]);

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle size={14} className="text-emerald-400" />,
    error: <XCircle size={14} className="text-red-400" />,
    warn: <AlertCircle size={14} className="text-amber-400" />,
    info: <Info size={14} className="text-brand-400" />,
    debug: <Info size={14} className="text-slate-400" />,
  };

  const colors = {
    success: 'border-emerald-800 bg-emerald-900/50',
    error: 'border-red-800 bg-red-900/50',
    warn: 'border-amber-800 bg-amber-900/50',
    info: 'border-brand-800 bg-brand-900/50',
    debug: 'border-slate-700 bg-slate-800',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg border shadow-xl text-sm max-w-xs animate-slide-up',
            colors[toast.level]
          )}
        >
          {icons[toast.level]}
          <span className="text-slate-200 text-xs">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
