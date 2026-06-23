import React, { useState } from 'react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { useAutomation } from '../../hooks/useAutomation';
import { useAppStore } from '../../store/app.store';
import { cn } from '../../../shared/utils/cn';
import { StudyOutputType } from '../../../shared/types';

const STUDY_OPTIONS: { type: StudyOutputType; label: string }[] = [
  { type: 'simple_summary', label: 'Simple Summary' },
  { type: 'detailed_explanation', label: 'Detailed Explanation' },
  { type: 'key_concepts', label: 'Key Concepts' },
  { type: 'glossary', label: 'Glossary' },
  { type: 'examples', label: 'Practical Examples' },
  { type: 'interview_questions', label: 'Interview Questions' },
  { type: 'flashcards', label: 'Flashcards' },
  { type: 'quiz', label: 'Quiz' },
  { type: 'revision_notes', label: 'Revision Notes' },
  { type: 'mermaid_diagram', label: 'Mermaid Diagram' },
  { type: 'learning_path', label: 'Learning Path' },
  { type: 'prerequisites', label: 'Prerequisites' },
  { type: 'common_mistakes', label: 'Common Mistakes' },
  { type: 'best_practices', label: 'Best Practices' },
];

interface Props {
  onClose: () => void;
}

export function StudyModePanel({ onClose }: Props) {
  const [selected, setSelected] = useState<StudyOutputType[]>(['simple_summary', 'key_concepts', 'flashcards']);
  const { aiLoading } = useAppStore();
  const { runStudyMode } = useAutomation();

  const toggle = (type: StudyOutputType) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (selected.length === 0) return;
    const api = (window as unknown as { electronAPI?: { browserGetContent?: () => Promise<{ success: boolean; content?: string }> } }).electronAPI;
    const contentResult = await api?.browserGetContent?.() ?? { success: true, content: '' };
    await runStudyMode(contentResult.content || '', selected);
    onClose();
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-brand-400" />
          <span className="text-sm font-medium">Study Mode — Select Outputs</span>
        </div>
        <button onClick={onClose} className="btn-ghost p-1">
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {STUDY_OPTIONS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={cn(
              'text-left px-3 py-2 rounded text-xs font-medium transition-colors border',
              selected.includes(type)
                ? 'bg-brand-600 border-brand-500 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleGenerate}
          disabled={aiLoading || selected.length === 0}
          className="btn-primary flex items-center gap-2"
        >
          {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
          Generate ({selected.length} selected)
        </button>
        <button onClick={() => setSelected(STUDY_OPTIONS.map((o) => o.type))} className="btn-secondary">
          All
        </button>
        <button onClick={() => setSelected([])} className="btn-ghost">
          None
        </button>
      </div>
    </div>
  );
}
