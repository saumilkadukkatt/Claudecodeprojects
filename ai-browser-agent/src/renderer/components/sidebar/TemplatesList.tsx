import React, { useEffect, useState } from 'react';
import { Play, Layers } from 'lucide-react';
import { useAppStore } from '../../store/app.store';

interface Template {
  id: string;
  name: string;
  description?: string;
  plugin?: string;
  steps: string;
}

const BUILT_IN_TEMPLATES = [
  {
    id: 'sap-press',
    name: 'SAP PRESS Study',
    description: 'Open library, read chapter, generate notes, export',
    steps: '[{"order":1,"instruction":"Open My Library"},{"order":2,"instruction":"Open the book"},{"order":3,"instruction":"Read Chapter 1"},{"order":4,"instruction":"Generate detailed notes and flashcards"},{"order":5,"instruction":"Export as Markdown"}]',
    plugin: 'sap-press',
  },
  {
    id: 'linkedin-learning',
    name: 'LinkedIn Learning',
    description: 'Open course, summarize transcript, generate quiz',
    steps: '[{"order":1,"instruction":"Open the course"},{"order":2,"instruction":"Watch lesson and extract transcript"},{"order":3,"instruction":"Summarize transcript"},{"order":4,"instruction":"Generate quiz"}]',
    plugin: 'linkedin-learning',
  },
  {
    id: 'jira-report',
    name: 'Jira Sprint Report',
    description: 'Open sprint, summarize tickets, generate status report',
    steps: '[{"order":1,"instruction":"Open current sprint"},{"order":2,"instruction":"Extract all tickets and their status"},{"order":3,"instruction":"Generate status report"}]',
  },
];

export function TemplatesList() {
  const [templates, setTemplates] = useState<Template[]>(BUILT_IN_TEMPLATES);
  const { addLog } = useAppStore();

  const handleRun = (template: Template) => {
    const steps = JSON.parse(template.steps) as { order: number; instruction: string }[];
    addLog({
      id: crypto.randomUUID(),
      level: 'info',
      message: `Template "${template.name}" loaded — ${steps.length} steps`,
      timestamp: new Date(),
    });
  };

  return (
    <div className="p-3 space-y-2">
      <span className="label">Task Templates</span>
      {templates.map((t) => (
        <div key={t.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-brand-400" />
              <span className="text-xs font-medium text-slate-200">{t.name}</span>
            </div>
            <button onClick={() => handleRun(t)} className="btn-ghost p-1 text-brand-400" title="Load template">
              <Play size={12} />
            </button>
          </div>
          {t.description && <p className="text-[10px] text-slate-500">{t.description}</p>}
          {t.plugin && (
            <span className="badge badge-blue text-[10px]">{t.plugin}</span>
          )}
        </div>
      ))}
    </div>
  );
}
