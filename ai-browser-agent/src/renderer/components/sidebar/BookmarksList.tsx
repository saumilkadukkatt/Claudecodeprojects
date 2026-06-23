import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
}

export function BookmarksList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ url: '', title: '', description: '' });

  const api = (window as unknown as { electronAPI?: {
    dbBookmarksList: () => Promise<{ success: boolean; bookmarks?: Bookmark[] }>;
    dbBookmarksCreate: (url: string, title: string, description?: string) => Promise<{ success: boolean; bookmark?: Bookmark }>;
    dbBookmarksDelete: (id: string) => Promise<{ success: boolean }>;
  } }).electronAPI;

  useEffect(() => {
    api?.dbBookmarksList().then((r) => { if (r.success) setBookmarks(r.bookmarks || []); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = form.url.startsWith('http') ? form.url : `https://${form.url}`;
    const r = await api?.dbBookmarksCreate(url, form.title, form.description);
    if (r?.success && r.bookmark) {
      setBookmarks((p) => [r.bookmark!, ...p]);
      setForm({ url: '', title: '', description: '' });
      setCreating(false);
    }
  };

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="label">Bookmarks</span>
        <button onClick={() => setCreating(!creating)} className="btn-ghost p-1">
          <Plus size={14} />
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="space-y-2 p-2 bg-slate-800 rounded-lg">
          <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="URL" className="input text-xs h-7" />
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="input text-xs h-7" />
          <div className="flex gap-1">
            <button type="submit" className="btn-primary text-xs py-1 px-2">Save</button>
            <button type="button" onClick={() => setCreating(false)} className="btn-ghost text-xs py-1 px-2">Cancel</button>
          </div>
        </form>
      )}

      {bookmarks.length === 0 ? (
        <p className="text-xs text-slate-600 italic">No bookmarks yet.</p>
      ) : (
        bookmarks.map((b) => (
          <div key={b.id} className="group flex items-start gap-2 p-2 rounded-lg hover:bg-slate-800">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{b.title}</p>
              <p className="text-[10px] text-slate-500 truncate">{b.url}</p>
            </div>
            <button onClick={() => { api?.dbBookmarksDelete(b.id); setBookmarks((p) => p.filter((x) => x.id !== b.id)); }}
              className="opacity-0 group-hover:opacity-100 btn-ghost p-0.5 text-red-400">
              <Trash2 size={10} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
