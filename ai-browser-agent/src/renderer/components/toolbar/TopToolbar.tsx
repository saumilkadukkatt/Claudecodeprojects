import React, { useState } from 'react';
import {
  Globe,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Settings,
  PanelLeft,
  PanelRight,
  PanelBottom,
  Camera,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { useAutomation } from '../../hooks/useAutomation';
import { SettingsModal } from '../settings/SettingsModal';
import { ExportMenu } from '../common/ExportMenu';
import { cn } from '../../../shared/utils/cn';

export function TopToolbar() {
  const {
    browserUrl,
    setBrowserUrl,
    browserStatus,
    automationStatus,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleBottomPanel,
    leftSidebarOpen,
    rightSidebarOpen,
    bottomPanelOpen,
    activeTaskId,
  } = useAppStore();

  const { launchBrowser, pauseAutomation, resumeAutomation, stopAutomation } = useAutomation();

  const [urlInput, setUrlInput] = useState(browserUrl);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const handleNavigate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const url = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
    await launchBrowser(url);
    setBrowserUrl(url);
  };

  const handleScreenshot = async () => {
    const api = (window as unknown as { electronAPI?: { browserScreenshot: () => Promise<{ success: boolean; screenshot?: string }> } }).electronAPI;
    if (!api) return;
    const result = await api.browserScreenshot();
    if (result.success && result.screenshot) {
      useAppStore.getState().setScreenshot(result.screenshot);
    }
  };

  return (
    <>
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center gap-2 px-3 shrink-0">
        {/* Sidebar toggles */}
        <button
          onClick={toggleLeftSidebar}
          className={cn('btn-ghost p-2', leftSidebarOpen && 'text-brand-400')}
          title="Toggle left panel"
        >
          <PanelLeft size={16} />
        </button>

        <div className="w-px h-6 bg-slate-700" />

        {/* URL bar */}
        <form onSubmit={handleNavigate} className="flex-1 flex gap-2 min-w-0">
          <div className="relative flex-1">
            <Globe
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL or search..."
              className="input pl-9 h-8"
            />
          </div>
          <button
            type="submit"
            disabled={browserStatus === 'loading'}
            className="btn-primary h-8 px-3 flex items-center gap-1"
          >
            {browserStatus === 'loading' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            Go
          </button>
        </form>

        <div className="w-px h-6 bg-slate-700" />

        {/* Automation controls */}
        <div className="flex gap-1">
          {automationStatus === 'running' ? (
            <button onClick={pauseAutomation} className="btn-secondary h-8 px-2" title="Pause">
              <Pause size={14} />
            </button>
          ) : automationStatus === 'paused' ? (
            <button onClick={resumeAutomation} className="btn-primary h-8 px-2" title="Resume">
              <Play size={14} />
            </button>
          ) : null}

          {automationStatus !== 'idle' && (
            <button onClick={stopAutomation} className="btn-danger h-8 px-2" title="Stop">
              <Square size={14} />
            </button>
          )}

          <button onClick={handleScreenshot} className="btn-ghost p-2" title="Screenshot">
            <Camera size={14} />
          </button>

          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="btn-ghost p-2"
              title="Export"
              disabled={!activeTaskId}
            >
              <Download size={14} />
            </button>
            {exportOpen && (
              <ExportMenu onClose={() => setExportOpen(false)} />
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-slate-700" />

        {/* Right controls */}
        <button
          onClick={toggleBottomPanel}
          className={cn('btn-ghost p-2', bottomPanelOpen && 'text-brand-400')}
          title="Toggle log panel"
        >
          <PanelBottom size={16} />
        </button>

        <button
          onClick={toggleRightSidebar}
          className={cn('btn-ghost p-2', rightSidebarOpen && 'text-brand-400')}
          title="Toggle AI panel"
        >
          <PanelRight size={16} />
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="btn-ghost p-2"
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
