import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/app.store';
import { cn } from '../../../shared/utils/cn';
import { Terminal, Trash2, ChevronDown } from 'lucide-react';

const LEVEL_COLORS: Record<string, string> = {
  info: 'text-slate-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
  debug: 'text-purple-400',
};

const LEVEL_BADGES: Record<string, string> = {
  info: 'badge-blue',
  warn: 'badge-yellow',
  error: 'badge-red',
  success: 'badge-green',
  debug: 'badge-gray',
};

export function BottomPanel() {
  const { logs, clearLogs, automationStatus } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="border-t border-slate-800 bg-slate-950 flex flex-col" style={{ height: '160px' }}>
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-slate-500" />
          <span className="text-xs font-medium text-slate-400">Task Logs</span>
          <span className={cn('badge text-xs', automationStatus === 'running' ? 'badge-green' : 'badge-gray')}>
            {automationStatus}
          </span>
        </div>
        <button onClick={clearLogs} className="btn-ghost p-1" title="Clear logs">
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">No logs yet.</p>
        ) : (
          logs.slice().reverse().map((log) => (
            <div key={log.id} className="flex gap-2 mb-0.5">
              <span className="text-slate-600 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn('shrink-0 w-14', LEVEL_COLORS[log.level] || 'text-slate-400')}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
