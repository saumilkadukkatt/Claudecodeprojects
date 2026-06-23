import React, { useState } from 'react';
import { Send, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { useAutomation } from '../../hooks/useAutomation';
import { StudyModePanel } from './StudyModePanel';
import { cn } from '../../../shared/utils/cn';

export function TaskInput() {
  const [instruction, setInstruction] = useState('');
  const [mode, setMode] = useState<'task' | 'study' | 'general'>('task');
  const [showStudyPanel, setShowStudyPanel] = useState(false);
  const { aiLoading, settings } = useAppStore();
  const { executeTask, runGeneralAI } = useAutomation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || aiLoading) return;

    if (mode === 'task') {
      await executeTask(instruction);
    } else if (mode === 'general') {
      const api = (window as unknown as { electronAPI?: { browserGetContent?: () => Promise<{ success: boolean; content?: string }> } }).electronAPI;
      const contentResult = await api?.browserGetContent?.() ?? { success: true, content: '' };
      await runGeneralAI(instruction, contentResult.content || '');
    } else {
      setShowStudyPanel(true);
      return;
    }

    setInstruction('');
  };

  const PLACEHOLDERS = {
    task: 'e.g. "Open My Library, search for ABAP RESTful, open first result, summarize chapter 1"',
    study: 'Describe what to study — then configure below',
    general: 'e.g. "Extract all table data", "Summarize this page", "Draft email from this content"',
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900/50 p-4 space-y-3">
      {/* Mode selector */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
        {([['task', 'Automate', Sparkles], ['study', 'Study Mode', BookOpen], ['general', 'AI Query', Send]] as const).map(
          ([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                mode === m
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          )
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={PLACEHOLDERS[mode]}
          rows={2}
          className="input resize-none flex-1"
          disabled={aiLoading}
        />
        <button
          type="submit"
          disabled={aiLoading || !instruction.trim()}
          className="btn-primary self-end h-10 px-4"
        >
          {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>

      {settings.approvalMode === 'manual' && (
        <p className="text-xs text-amber-500">
          Manual approval mode — each action will require your confirmation.
        </p>
      )}

      {showStudyPanel && <StudyModePanel onClose={() => setShowStudyPanel(false)} />}
    </div>
  );
}
