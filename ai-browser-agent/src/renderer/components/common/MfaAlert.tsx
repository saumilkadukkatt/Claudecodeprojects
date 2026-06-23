import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useAppStore } from '../../store/app.store';

export function MfaAlert() {
  const { mfaDetected, captchaDetected, setMfaDetected, setCaptchaDetected, resumeAutomation } = useAppStore();
  const { resumeAutomation: resume } = { resumeAutomation: useAppStore.getState().setAutomationStatus };

  if (!mfaDetected && !captchaDetected) return null;

  const handleDismiss = async () => {
    const api = (window as unknown as { electronAPI?: { browserResume: () => Promise<void> } }).electronAPI;
    await api?.browserResume();
    setMfaDetected(false);
    setCaptchaDetected(false);
    useAppStore.getState().setAutomationStatus('running');
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-amber-900 border border-amber-600 rounded-xl shadow-2xl p-4 max-w-md">
        <div className="flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-200 text-sm">
              {mfaDetected ? 'Multi-Factor Authentication Required' : 'Captcha Detected'}
            </p>
            <p className="text-amber-300/80 text-xs mt-1">
              {mfaDetected
                ? 'Please complete the MFA challenge in the browser window, then click Continue.'
                : 'Please solve the captcha in the browser window, then click Continue.'}
            </p>
            <p className="text-amber-400/60 text-[10px] mt-1 italic">
              Automation will never bypass authentication or captcha.
            </p>
          </div>
          <button onClick={handleDismiss} className="btn-ghost p-1 text-amber-400">
            <X size={14} />
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={handleDismiss} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
            Continue Automation
          </button>
        </div>
      </div>
    </div>
  );
}
