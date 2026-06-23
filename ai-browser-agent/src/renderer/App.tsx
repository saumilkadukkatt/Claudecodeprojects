import React, { useEffect } from 'react';
import { useAppStore } from './store/app.store';
import { AppLayout } from './components/layout/AppLayout';
import { Toaster } from './components/common/Toaster';

export default function App() {
  const { setSettings, addLog } = useAppStore();

  useEffect(() => {
    // Load settings on mount
    const api = (window as unknown as { electronAPI?: { settingsGet: () => Promise<{ success: boolean; settings?: unknown }> } }).electronAPI;
    if (!api) return;

    api.settingsGet().then((result) => {
      if (result.success && result.settings) {
        setSettings(result.settings as Parameters<typeof setSettings>[0]);
      }
    });

    // Subscribe to log events
    const unsubLogs = api.onLogEntry?.((entry) => {
      addLog(entry as Parameters<typeof addLog>[0]);
    });

    // Subscribe to browser events
    const unsubBrowser = api.onBrowserEvent?.((event) => {
      const e = event as { type: string; url?: string; error?: string };
      addLog({
        id: crypto.randomUUID(),
        level: e.type === 'error' ? 'error' : 'info',
        message: `Browser: ${e.type}${e.url ? ` → ${e.url}` : ''}${e.error ? ` — ${e.error}` : ''}`,
        timestamp: new Date(),
      });
    });

    return () => {
      unsubLogs?.();
      unsubBrowser?.();
    };
  }, [setSettings, addLog]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <AppLayout />
      <Toaster />
    </div>
  );
}
