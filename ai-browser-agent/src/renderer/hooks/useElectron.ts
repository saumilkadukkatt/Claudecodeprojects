// Type-safe hook for accessing the electron API exposed via preload
export function useElectron() {
  const api = (window as unknown as { electronAPI: ElectronAPI }).electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Make sure preload is loaded.');
  }
  return api;
}

export interface ElectronAPI {
  browserLaunch: (url: string, headless: boolean) => Promise<{ success: boolean; error?: string }>;
  browserNavigate: (url: string) => Promise<{ success: boolean; error?: string }>;
  browserClose: () => Promise<{ success: boolean; error?: string }>;
  browserScreenshot: () => Promise<{ success: boolean; screenshot?: string; error?: string }>;
  browserAction: (action: unknown) => Promise<{ success: boolean; result?: string; error?: string }>;
  browserPause: () => Promise<{ success: boolean }>;
  browserResume: () => Promise<{ success: boolean }>;
  browserStop: () => Promise<{ success: boolean }>;

  aiInterpretTask: (instruction: string, pageContent: string) => Promise<{
    success: boolean;
    actions?: unknown[];
    summary?: string;
    error?: string;
  }>;
  aiStudyMode: (content: string, types: string[]) => Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }>;
  aiGeneral: (instruction: string, content: string) => Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }>;

  dbSessionsList: () => Promise<{ success: boolean; sessions?: unknown[]; error?: string }>;
  dbSessionsCreate: (name: string, url: string) => Promise<{ success: boolean; session?: unknown; error?: string }>;
  dbSessionsGet: (id: string) => Promise<{ success: boolean; session?: unknown; error?: string }>;
  dbSessionsDelete: (id: string) => Promise<{ success: boolean; error?: string }>;

  dbTasksCreate: (sessionId: string, instruction: string) => Promise<{ success: boolean; task?: unknown; error?: string }>;
  dbTasksUpdate: (id: string, data: unknown) => Promise<{ success: boolean; task?: unknown; error?: string }>;
  dbTasksGet: (id: string) => Promise<{ success: boolean; task?: unknown; error?: string }>;
  dbTasksList: (sessionId: string) => Promise<{ success: boolean; tasks?: unknown[]; error?: string }>;

  dbBookmarksList: () => Promise<{ success: boolean; bookmarks?: unknown[]; error?: string }>;
  dbBookmarksCreate: (url: string, title: string, description?: string) => Promise<{ success: boolean; bookmark?: unknown; error?: string }>;
  dbBookmarksDelete: (id: string) => Promise<{ success: boolean; error?: string }>;

  dbHistoryList: (limit?: number) => Promise<{ success: boolean; history?: unknown[]; error?: string }>;
  dbHistoryClear: () => Promise<{ success: boolean; error?: string }>;

  dbTemplatesList: () => Promise<{ success: boolean; templates?: unknown[]; error?: string }>;
  dbTemplatesCreate: (template: unknown) => Promise<{ success: boolean; template?: unknown; error?: string }>;

  settingsGet: () => Promise<{ success: boolean; settings?: unknown; error?: string }>;
  settingsUpdate: (data: unknown) => Promise<{ success: boolean; settings?: unknown; error?: string }>;

  exportMarkdown: (taskId: string) => Promise<{ success: boolean; filepath?: string; error?: string }>;
  exportPdf: (taskId: string) => Promise<{ success: boolean; filepath?: string; error?: string }>;
  exportJson: (taskId: string) => Promise<{ success: boolean; filepath?: string; error?: string }>;

  onLogEntry: (callback: (entry: unknown) => void) => () => void;
  onBrowserEvent: (callback: (event: unknown) => void) => () => void;
  onActionApprovalRequest: (callback: (action: unknown) => void) => () => void;
  actionApprove: (actionId: string) => Promise<void>;
  actionReject: (actionId: string) => Promise<void>;

  getEnvConfig: () => Promise<{
    websiteUrl: string;
    hasApiKey: boolean;
    hasCredentials: boolean;
    headlessMode: boolean;
    claudeModel: string;
    exportDir: string;
  }>;
}
