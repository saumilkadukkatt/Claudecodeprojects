import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/app.store';
import { SessionsList } from './SessionsList';
import { BookmarksList } from './BookmarksList';
import { TemplatesList } from './TemplatesList';
import { HistoryList } from './HistoryList';
import { Clock, Bookmark, Layers, MessageSquare } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

const TABS = [
  { id: 'sessions' as const, label: 'Sessions', icon: MessageSquare },
  { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark },
  { id: 'templates' as const, label: 'Templates', icon: Layers },
  { id: 'history' as const, label: 'History', icon: Clock },
];

export function LeftSidebar() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            title={label}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors border-b-2',
              activeTab === id
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon size={14} />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sessions' && <SessionsList />}
        {activeTab === 'bookmarks' && <BookmarksList />}
        {activeTab === 'templates' && <TemplatesList />}
        {activeTab === 'history' && <HistoryList />}
      </div>
    </aside>
  );
}
