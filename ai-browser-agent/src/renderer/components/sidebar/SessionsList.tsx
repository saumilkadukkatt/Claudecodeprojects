import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { cn } from '../../../shared/utils/cn';

interface DbSession {
  id: string;
  name: string;
  url: string;
  status: string;
  createdAt: string;
}

export function SessionsList() {
  const { activeSessionId, setActiveSession, addLog } = useAppStore();
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const api = (window as unknown as { electronAPI?: {
    dbSessionsList: () => Promise<{ success: boolean; sessions?: DbSession[] }>;
    dbSessionsCreate: (name: string, url: string) => Promise<{ success: boolean; session?: DbSession }>;
    dbSessionsDelete: (id: string) => Promise<{ success: boolean }>;
  } }).electronAPI;

  const load = async () => {
    const result = await api?.dbSessionsList();
    if (result?.success) setSessions(result.sessions || []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    const result = await api?.dbSessionsCreate(newName, url);
    if (result?.success && result.session) {
      setSessions((prev) => [result.session!, ...prev]);
      setNewName('');
      setNewUrl('');
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api?.dbSessionsDelete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) setActiveSession(null);
  };

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="label">Sessions</span>
        <button onClick={() => setCreating(!creating)} className="btn-ghost p-1">
          <Plus size={14} />
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="space-y-2 p-2 bg-slate-800 rounded-lg">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Session name"
            className="input text-xs h-7"
          />
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
            className="input text-xs h-7"
          />
          <div className="flex gap-1">
            <button type="submit" className="btn-primary text-xs py-1 px-2">Create</button>
            <button type="button" onClick={() => setCreating(false)} className="btn-ghost text-xs py-1 px-2">Cancel</button>
          </div>
        </form>
      )}

      {sessions.length === 0 ? (
        <p className="text-xs text-slate-600 italic px-1">No sessions yet.</p>
      ) : (
        sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => setActiveSession(session.id)}
            className={cn(
              'group flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors',
              activeSessionId === session.id
                ? 'bg-brand-900/40 border border-brand-800'
                : 'hover:bg-slate-800 border border-transparent'
            )}
          >
            <Globe size={12} className="text-slate-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{session.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{session.url}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
              className="opacity-0 group-hover:opacity-100 btn-ghost p-0.5 text-red-400"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
