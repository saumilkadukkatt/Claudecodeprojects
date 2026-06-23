import { contextBridge, ipcRenderer } from 'electron';

// Expose a safe, typed API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Browser control
  browserLaunch: (url: string, headless: boolean) =>
    ipcRenderer.invoke('browser:launch', { url, headless }),
  browserNavigate: (url: string) => ipcRenderer.invoke('browser:navigate', { url }),
  browserClose: () => ipcRenderer.invoke('browser:close'),
  browserScreenshot: () => ipcRenderer.invoke('browser:screenshot'),
  browserAction: (action: unknown) => ipcRenderer.invoke('browser:action', action),
  browserPause: () => ipcRenderer.invoke('browser:pause'),
  browserResume: () => ipcRenderer.invoke('browser:resume'),
  browserStop: () => ipcRenderer.invoke('browser:stop'),

  // AI
  aiInterpretTask: (instruction: string, pageContent: string) =>
    ipcRenderer.invoke('ai:interpret-task', { instruction, pageContent }),
  aiStudyMode: (content: string, types: string[]) =>
    ipcRenderer.invoke('ai:study-mode', { content, types }),
  aiGeneral: (instruction: string, content: string) =>
    ipcRenderer.invoke('ai:general', { instruction, content }),

  // Database - Sessions
  dbSessionsList: () => ipcRenderer.invoke('db:sessions:list'),
  dbSessionsCreate: (name: string, url: string) =>
    ipcRenderer.invoke('db:sessions:create', { name, url }),
  dbSessionsGet: (id: string) => ipcRenderer.invoke('db:sessions:get', { id }),
  dbSessionsDelete: (id: string) => ipcRenderer.invoke('db:sessions:delete', { id }),

  // Database - Tasks
  dbTasksCreate: (sessionId: string, instruction: string) =>
    ipcRenderer.invoke('db:tasks:create', { sessionId, instruction }),
  dbTasksUpdate: (id: string, data: unknown) =>
    ipcRenderer.invoke('db:tasks:update', { id, data }),
  dbTasksGet: (id: string) => ipcRenderer.invoke('db:tasks:get', { id }),
  dbTasksList: (sessionId: string) => ipcRenderer.invoke('db:tasks:list', { sessionId }),

  // Database - Bookmarks
  dbBookmarksList: () => ipcRenderer.invoke('db:bookmarks:list'),
  dbBookmarksCreate: (url: string, title: string, description?: string) =>
    ipcRenderer.invoke('db:bookmarks:create', { url, title, description }),
  dbBookmarksDelete: (id: string) => ipcRenderer.invoke('db:bookmarks:delete', { id }),

  // Database - History
  dbHistoryList: (limit?: number) => ipcRenderer.invoke('db:history:list', { limit }),
  dbHistoryClear: () => ipcRenderer.invoke('db:history:clear'),

  // Database - Templates
  dbTemplatesList: () => ipcRenderer.invoke('db:templates:list'),
  dbTemplatesCreate: (template: unknown) =>
    ipcRenderer.invoke('db:templates:create', template),

  // Settings
  settingsGet: () => ipcRenderer.invoke('settings:get'),
  settingsUpdate: (data: unknown) => ipcRenderer.invoke('settings:update', data),

  // Export
  exportMarkdown: (taskId: string) => ipcRenderer.invoke('export:markdown', { taskId }),
  exportPdf: (taskId: string) => ipcRenderer.invoke('export:pdf', { taskId }),
  exportJson: (taskId: string) => ipcRenderer.invoke('export:json', { taskId }),

  // Logs
  onLogEntry: (callback: (entry: unknown) => void) => {
    ipcRenderer.on('log:entry', (_event, entry) => callback(entry));
    return () => ipcRenderer.removeAllListeners('log:entry');
  },

  // Browser events from main
  onBrowserEvent: (callback: (event: unknown) => void) => {
    ipcRenderer.on('browser:event', (_event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('browser:event');
  },

  // Action approval
  onActionApprovalRequest: (callback: (action: unknown) => void) => {
    ipcRenderer.on('action:approval-request', (_event, action) => callback(action));
    return () => ipcRenderer.removeAllListeners('action:approval-request');
  },
  actionApprove: (actionId: string) =>
    ipcRenderer.invoke('action:approve', { actionId }),
  actionReject: (actionId: string) =>
    ipcRenderer.invoke('action:reject', { actionId }),

  // Env config
  getEnvConfig: () => ipcRenderer.invoke('env:get-config'),
});
