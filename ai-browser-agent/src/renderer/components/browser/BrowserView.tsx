import React, { useState } from 'react';
import { useAppStore } from '../../store/app.store';
import { TaskInput } from './TaskInput';
import { Globe, Monitor, AlertTriangle } from 'lucide-react';

export function BrowserView() {
  const { browserUrl, browserStatus, screenshot, mfaDetected, captchaDetected } = useAppStore();
  const [showScreenshot, setShowScreenshot] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
      {/* Alerts */}
      {(mfaDetected || captchaDetected) && (
        <div className="bg-amber-900/50 border border-amber-700 text-amber-300 px-4 py-2 flex items-center gap-2 text-sm">
          <AlertTriangle size={16} />
          {mfaDetected
            ? 'MFA detected — automation paused. Please complete authentication in the browser window.'
            : 'Captcha detected — automation paused. Please solve the captcha in the browser window.'}
        </div>
      )}

      {/* Browser content area */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        {browserStatus === 'idle' ? (
          <div className="text-center text-slate-600 space-y-3">
            <Globe size={48} className="mx-auto text-slate-700" />
            <p className="text-lg font-medium text-slate-500">No browser session</p>
            <p className="text-sm">Enter a URL above to launch the browser</p>
          </div>
        ) : browserStatus === 'loading' ? (
          <div className="text-center text-slate-500 space-y-3">
            <Monitor size={48} className="mx-auto animate-pulse text-brand-600" />
            <p className="text-sm">Launching browser…</p>
          </div>
        ) : browserStatus === 'error' ? (
          <div className="text-center text-red-400 space-y-3">
            <AlertTriangle size={48} className="mx-auto" />
            <p className="font-medium">Browser error</p>
            <p className="text-sm text-slate-500">Check the logs panel for details.</p>
          </div>
        ) : (
          <div className="flex-1 w-full flex flex-col items-center justify-center p-6 overflow-auto">
            {screenshot ? (
              <div className="w-full max-w-4xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">{browserUrl}</p>
                  <button
                    onClick={() => setShowScreenshot(!showScreenshot)}
                    className="btn-ghost text-xs py-1"
                  >
                    {showScreenshot ? 'Hide screenshot' : 'Show screenshot'}
                  </button>
                </div>
                {showScreenshot && (
                  <img
                    src={screenshot}
                    alt="Browser screenshot"
                    className="w-full rounded-lg border border-slate-700 shadow-xl"
                  />
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <Monitor size={48} className="mx-auto text-brand-700" />
                <p className="font-medium text-slate-400">Browser running</p>
                <p className="text-sm">{browserUrl}</p>
                <p className="text-xs text-slate-600">
                  The browser is running in a separate window.
                  Use the task input below to interact with it.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task input at bottom of browser view */}
      {browserStatus === 'ready' && <TaskInput />}
    </div>
  );
}
