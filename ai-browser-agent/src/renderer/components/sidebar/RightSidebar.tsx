import React, { useState } from 'react';
import { useAppStore } from '../../store/app.store';
import { AiOutputPanel } from '../ai/AiOutputPanel';
import { Brain, Copy, Download, Trash2, Loader2 } from 'lucide-react';

export function RightSidebar() {
  const { aiOutput, aiLoading, setAiOutput, activeTaskId } = useAppStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMd = async () => {
    if (!activeTaskId) return;
    const api = (window as unknown as { electronAPI?: { exportMarkdown: (id: string) => Promise<{ success: boolean; filepath?: string }> } }).electronAPI;
    const result = await api?.exportMarkdown(activeTaskId);
    if (result?.success) {
      useAppStore.getState().addLog({
        id: crypto.randomUUID(),
        level: 'success',
        message: `Exported to ${result.filepath}`,
        timestamp: new Date(),
      });
    }
  };

  return (
    <aside className="w-96 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-brand-400" />
          <span className="text-sm font-medium">AI Output</span>
          {aiLoading && <Loader2 size={12} className="animate-spin text-brand-400" />}
        </div>
        <div className="flex gap-1">
          <button onClick={handleCopy} disabled={!aiOutput} className="btn-ghost p-1.5 text-xs" title="Copy">
            {copied ? '✓' : <Copy size={12} />}
          </button>
          <button onClick={handleExportMd} disabled={!aiOutput || !activeTaskId} className="btn-ghost p-1.5" title="Export Markdown">
            <Download size={12} />
          </button>
          <button onClick={() => setAiOutput('')} disabled={!aiOutput} className="btn-ghost p-1.5 text-red-400" title="Clear">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {aiLoading && !aiOutput ? (
          <div className="flex items-center justify-center h-32 text-slate-500 gap-2">
            <Loader2 size={20} className="animate-spin text-brand-500" />
            <span className="text-sm">Generating…</span>
          </div>
        ) : aiOutput ? (
          <AiOutputPanel content={aiOutput} />
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600 space-y-2 p-6">
            <Brain size={32} className="text-slate-700" />
            <p className="text-sm text-center">AI output will appear here after you run a task or study mode.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
