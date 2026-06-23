import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';
import { BrowserAction } from '../../../shared/types';
import { cn } from '../../../shared/utils/cn';

export function ActionApprovalModal() {
  const [pendingAction, setPendingAction] = useState<BrowserAction | null>(null);

  useEffect(() => {
    const api = (window as unknown as { electronAPI?: { onActionApprovalRequest?: (cb: (a: unknown) => void) => () => void; actionApprove: (id: string) => Promise<void>; actionReject: (id: string) => Promise<void> } }).electronAPI;
    const unsub = api?.onActionApprovalRequest?.((action) => {
      setPendingAction(action as BrowserAction);
    });
    return () => unsub?.();
  }, []);

  if (!pendingAction) return null;

  const handleApprove = async () => {
    const api = (window as unknown as { electronAPI?: { actionApprove: (id: string) => Promise<void> } }).electronAPI;
    await api?.actionApprove(pendingAction.id);
    setPendingAction(null);
  };

  const handleReject = async () => {
    const api = (window as unknown as { electronAPI?: { actionReject: (id: string) => Promise<void> } }).electronAPI;
    await api?.actionReject(pendingAction.id);
    setPendingAction(null);
  };

  const riskColors = {
    low: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
    medium: 'text-amber-400 bg-amber-900/30 border-amber-800',
    high: 'text-red-400 bg-red-900/30 border-red-800',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[480px] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-400" />
          <h2 className="text-base font-semibold">Action Approval Required</h2>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-slate-800 rounded-lg">
            <p className="text-sm font-medium text-slate-200">{pendingAction.description}</p>
            <div className="flex gap-2 mt-2">
              <span className="label">Type:</span>
              <span className="text-xs text-slate-300 font-mono">{pendingAction.type}</span>
            </div>
            {pendingAction.target && (
              <div className="flex gap-2 mt-1">
                <span className="label">Target:</span>
                <span className="text-xs text-slate-400 font-mono truncate">{pendingAction.target}</span>
              </div>
            )}
            {pendingAction.value && (
              <div className="flex gap-2 mt-1">
                <span className="label">Value:</span>
                <span className="text-xs text-slate-400 font-mono truncate">{pendingAction.value}</span>
              </div>
            )}
          </div>

          <div className={cn('px-3 py-2 rounded border text-xs font-medium', riskColors[pendingAction.riskLevel])}>
            Risk level: {pendingAction.riskLevel.toUpperCase()}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleApprove} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <ShieldCheck size={16} />
            Approve
          </button>
          <button onClick={handleReject} className="flex-1 btn-danger flex items-center justify-center gap-2">
            <ShieldX size={16} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
