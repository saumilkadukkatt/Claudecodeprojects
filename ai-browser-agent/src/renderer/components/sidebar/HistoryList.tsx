import React, { useEffect, useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  url: string;
  title?: string;
  visitedAt: string;
}

export function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const api = (window as unknown as { electronAPI?: {
    dbHistoryList: (limit?: number) => Promise<{ success: boolean; history?: HistoryItem[] }>;
    dbHistoryClear: () => Promise<{ success: boolean }>;
  } }).electronAPI;

  useEffect(() => {
    api?.dbHistoryList(50).then((r) => { if (r.success) setHistory(r.history || []); });
  }, []);

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="label">History</span>
        <button
          onClick={() => { api?.dbHistoryClear(); setHistory([]); }}
          className="btn-ghost p-1 text-slate-500"
          title="Clear history"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-slate-600 italic">No history yet.</p>
      ) : (
        history.map((h) => (
          <div key={h.id} className="flex items-start gap-2 p-2 rounded hover:bg-slate-800">
            <Clock size={10} className="text-slate-600 mt-1 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-300 truncate">{h.title || h.url}</p>
              <p className="text-[10px] text-slate-600">{new Date(h.visitedAt).toLocaleString()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
