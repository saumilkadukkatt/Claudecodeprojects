import React, { useState } from 'react';
import { X, Settings, Monitor, Brain, Zap, Download, Shield, Eye } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { AppSettings } from '../../../shared/types';
import { cn } from '../../../shared/utils/cn';

const CLAUDE_MODELS = [
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 (Most capable)' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Balanced)' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Fast)' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const { settings, setSettings, addLog } = useAppStore();
  const [local, setLocal] = useState<AppSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const update = (key: keyof AppSettings, value: unknown) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const api = (window as unknown as { electronAPI?: { settingsUpdate: (d: unknown) => Promise<{ success: boolean; settings?: AppSettings }> } }).electronAPI;
    const result = await api?.settingsUpdate(local);
    if (result?.success && result.settings) {
      setSettings(result.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      addLog({ id: crypto.randomUUID(), level: 'success', message: 'Settings saved', timestamp: new Date() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-brand-400" />
            <h2 className="text-base font-semibold">Settings</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Appearance */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Monitor size={14} className="text-brand-400" /> Appearance
            </h3>
            <div>
              <label className="label mb-1 block">Theme</label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update('theme', t)}
                    className={cn('px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors border',
                      local.theme === t ? 'border-brand-500 bg-brand-600 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* AI Model */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Brain size={14} className="text-brand-400" /> AI Model
            </h3>
            <div>
              <label className="label mb-1 block">Claude Model</label>
              <select
                value={local.claudeModel}
                onChange={(e) => update('claudeModel', e.target.value)}
                className="input"
              >
                {CLAUDE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Automation */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Zap size={14} className="text-brand-400" /> Automation
            </h3>
            <div>
              <label className="label mb-1 block">Action Speed ({local.automationSpeed}ms delay)</label>
              <input
                type="range"
                min={100}
                max={3000}
                step={100}
                value={local.automationSpeed}
                onChange={(e) => update('automationSpeed', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300">Headless Mode</label>
              <button
                onClick={() => update('headlessMode', !local.headlessMode)}
                className={cn('w-10 h-5 rounded-full transition-colors', local.headlessMode ? 'bg-brand-600' : 'bg-slate-700')}
              >
                <span className={cn('block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5', local.headlessMode ? 'translate-x-5' : 'translate-x-0')} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300">OCR Fallback</label>
              <button
                onClick={() => update('ocrEnabled', !local.ocrEnabled)}
                className={cn('w-10 h-5 rounded-full transition-colors', local.ocrEnabled ? 'bg-brand-600' : 'bg-slate-700')}
              >
                <span className={cn('block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5', local.ocrEnabled ? 'translate-x-5' : 'translate-x-0')} />
              </button>
            </div>
          </section>

          {/* Security */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Shield size={14} className="text-brand-400" /> Security & Approval
            </h3>
            <div>
              <label className="label mb-1 block">Approval Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['manual', 'Manual', 'Approve every action'],
                  ['semi', 'Semi-Auto', 'Approve high-risk only'],
                  ['auto', 'Automatic', 'Read-only navigation'],
                ] as const).map(([val, label, desc]) => (
                  <button
                    key={val}
                    onClick={() => update('approvalMode', val)}
                    className={cn(
                      'p-2 rounded-lg border text-left transition-colors',
                      local.approvalMode === val
                        ? 'border-brand-500 bg-brand-900/30'
                        : 'border-slate-700 hover:border-slate-600'
                    )}
                  >
                    <div className="text-xs font-medium text-slate-200">{label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Export */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Download size={14} className="text-brand-400" /> Export
            </h3>
            <div>
              <label className="label mb-1 block">Default Format</label>
              <div className="flex gap-2">
                {(['markdown', 'pdf', 'json'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => update('defaultExport', f)}
                    className={cn('px-3 py-1.5 rounded text-xs font-medium uppercase transition-colors border',
                      local.defaultExport === f ? 'border-brand-500 bg-brand-600 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label mb-1 block">Export Directory</label>
              <input
                value={local.exportDir}
                onChange={(e) => update('exportDir', e.target.value)}
                className="input"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-800">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
