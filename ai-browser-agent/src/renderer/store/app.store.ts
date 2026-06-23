import { create } from 'zustand';
import { AppSettings, DEFAULT_SETTINGS, LogEntry, Session, Task } from '../../shared/types';

interface AppState {
  // Settings
  settings: AppSettings;
  setSettings: (settings: Partial<AppSettings>) => void;

  // Sessions
  sessions: Session[];
  activeSessionId: string | null;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  removeSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;

  // Tasks
  tasks: Task[];
  activeTaskId: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  setActiveTask: (id: string | null) => void;

  // Browser
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
  browserStatus: 'idle' | 'loading' | 'ready' | 'error';
  setBrowserStatus: (status: AppState['browserStatus']) => void;
  screenshot: string | null;
  setScreenshot: (screenshot: string | null) => void;

  // AI
  aiOutput: string;
  setAiOutput: (output: string) => void;
  aiLoading: boolean;
  setAiLoading: (loading: boolean) => void;

  // Logs
  logs: LogEntry[];
  addLog: (entry: LogEntry) => void;
  clearLogs: () => void;

  // UI
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  bottomPanelOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleBottomPanel: () => void;
  activeTab: 'sessions' | 'bookmarks' | 'templates' | 'history';
  setActiveTab: (tab: AppState['activeTab']) => void;

  // MFA / Captcha
  mfaDetected: boolean;
  captchaDetected: boolean;
  setMfaDetected: (v: boolean) => void;
  setCaptchaDetected: (v: boolean) => void;

  // Automation
  automationStatus: 'idle' | 'running' | 'paused' | 'stopped';
  setAutomationStatus: (status: AppState['automationStatus']) => void;

  // Action approval queue
  pendingActionId: string | null;
  setPendingActionId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: { ...DEFAULT_SETTINGS },
  setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

  sessions: [],
  activeSessionId: null,
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  removeSession: (id) => set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
  setActiveSession: (id) => set({ activeSessionId: id }),

  tasks: [],
  activeTaskId: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  setActiveTask: (id) => set({ activeTaskId: id }),

  browserUrl: '',
  setBrowserUrl: (url) => set({ browserUrl: url }),
  browserStatus: 'idle',
  setBrowserStatus: (status) => set({ browserStatus: status }),
  screenshot: null,
  setScreenshot: (screenshot) => set({ screenshot }),

  aiOutput: '',
  setAiOutput: (output) => set({ aiOutput: output }),
  aiLoading: false,
  setAiLoading: (loading) => set({ aiLoading: loading }),

  logs: [],
  addLog: (entry) =>
    set((state) => ({
      logs: [entry, ...state.logs].slice(0, 500),
    })),
  clearLogs: () => set({ logs: [] }),

  leftSidebarOpen: true,
  rightSidebarOpen: true,
  bottomPanelOpen: true,
  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  toggleBottomPanel: () => set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  activeTab: 'sessions',
  setActiveTab: (tab) => set({ activeTab: tab }),

  mfaDetected: false,
  captchaDetected: false,
  setMfaDetected: (v) => set({ mfaDetected: v }),
  setCaptchaDetected: (v) => set({ captchaDetected: v }),

  automationStatus: 'idle',
  setAutomationStatus: (status) => set({ automationStatus: status }),

  pendingActionId: null,
  setPendingActionId: (id) => set({ pendingActionId: id }),
}));
