import React from 'react';
import { FileText, FileJson, File } from 'lucide-react';
import { useAppStore } from '../../store/app.store';

interface Props {
  onClose: () => void;
}

export function ExportMenu({ onClose }: Props) {
  const { activeTaskId, addLog } = useAppStore();

  const api = (window as unknown as { electronAPI?: {
    exportMarkdown: (id: string) => Promise<{ success: boolean; filepath?: string; error?: string }>;
    exportPdf: (id: string) => Promise<{ success: boolean; filepath?: string; error?: string }>;
    exportJson: (id: string) => Promise<{ success: boolean; filepath?: string; error?: string }>;
  } }).electronAPI;

  const handleExport = async (format: 'markdown' | 'pdf' | 'json') => {
    if (!activeTaskId || !api) return;
    onClose();
    const result = format === 'markdown'
      ? await api.exportMarkdown(activeTaskId)
      : format === 'pdf'
      ? await api.exportPdf(activeTaskId)
      : await api.exportJson(activeTaskId);

    addLog({
      id: crypto.randomUUID(),
      level: result.success ? 'success' : 'error',
      message: result.success
        ? `Exported to ${result.filepath}`
        : `Export failed: ${result.error}`,
      timestamp: new Date(),
    });
  };

  return (
    <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 w-44 py-1">
      <button onClick={() => handleExport('markdown')} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-700 text-slate-200">
        <FileText size={12} className="text-brand-400" /> Export Markdown
      </button>
      <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-700 text-slate-200">
        <File size={12} className="text-red-400" /> Export PDF
      </button>
      <button onClick={() => handleExport('json')} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-700 text-slate-200">
        <FileJson size={12} className="text-amber-400" /> Export JSON
      </button>
    </div>
  );
}
