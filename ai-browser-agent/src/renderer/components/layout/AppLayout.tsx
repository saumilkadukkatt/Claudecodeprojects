import React from 'react';
import { TopToolbar } from '../toolbar/TopToolbar';
import { LeftSidebar } from '../sidebar/LeftSidebar';
import { BrowserView } from '../browser/BrowserView';
import { RightSidebar } from '../sidebar/RightSidebar';
import { BottomPanel } from './BottomPanel';
import { MfaAlert } from '../common/MfaAlert';
import { ActionApprovalModal } from '../common/ActionApprovalModal';
import { useAppStore } from '../../store/app.store';

export function AppLayout() {
  const { leftSidebarOpen, rightSidebarOpen, bottomPanelOpen } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      <TopToolbar />

      <div className="flex flex-1 overflow-hidden">
        {leftSidebarOpen && <LeftSidebar />}

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <BrowserView />
        </main>

        {rightSidebarOpen && <RightSidebar />}
      </div>

      {bottomPanelOpen && <BottomPanel />}

      <MfaAlert />
      <ActionApprovalModal />
    </div>
  );
}
