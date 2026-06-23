import { z } from 'zod';

// ============================================
// Browser Actions
// ============================================

export const BrowserActionTypeSchema = z.enum([
  'navigate',
  'click',
  'type',
  'scroll',
  'extract',
  'wait',
  'back',
  'forward',
  'save',
  'download',
  'select',
  'screenshot',
  'pause',
  'resume',
  'stop',
]);

export type BrowserActionType = z.infer<typeof BrowserActionTypeSchema>;

export const BrowserActionSchema = z.object({
  id: z.string().uuid(),
  type: BrowserActionTypeSchema,
  target: z.string().optional(),
  value: z.string().optional(),
  description: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  requiresApproval: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'failed']).default('pending'),
  result: z.string().optional(),
  error: z.string().optional(),
});

export type BrowserAction = z.infer<typeof BrowserActionSchema>;

// ============================================
// Session & Task
// ============================================

export type SessionStatus = 'idle' | 'active' | 'paused' | 'completed' | 'error';
export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';
export type ApprovalMode = 'manual' | 'semi' | 'auto';

export interface Session {
  id: string;
  name: string;
  url: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  sessionId: string;
  instruction: string;
  status: TaskStatus;
  actions: BrowserAction[];
  result?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AI Study Mode
// ============================================

export type StudyOutputType =
  | 'simple_summary'
  | 'detailed_explanation'
  | 'key_concepts'
  | 'glossary'
  | 'examples'
  | 'interview_questions'
  | 'flashcards'
  | 'quiz'
  | 'revision_notes'
  | 'mermaid_diagram'
  | 'learning_path'
  | 'prerequisites'
  | 'common_mistakes'
  | 'best_practices';

export interface StudyOutput {
  type: StudyOutputType;
  content: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// ============================================
// Content Extraction
// ============================================

export interface ExtractedSection {
  title?: string;
  content: string;
  order: number;
}

export interface ExtractedContent {
  url: string;
  title?: string;
  sections: ExtractedSection[];
  rawText: string;
  extractedAt: Date;
}

// ============================================
// Settings
// ============================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  claudeModel: string;
  automationSpeed: number;
  ocrEnabled: boolean;
  headlessMode: boolean;
  defaultExport: 'markdown' | 'pdf' | 'json';
  approvalMode: ApprovalMode;
  studyMode: boolean;
  exportDir: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  claudeModel: 'claude-opus-4-8',
  automationSpeed: 500,
  ocrEnabled: false,
  headlessMode: false,
  defaultExport: 'markdown',
  approvalMode: 'semi',
  studyMode: false,
  exportDir: './exports',
};

// ============================================
// IPC Events
// ============================================

export interface IpcChannels {
  // Browser control
  'browser:launch': { url: string; headless: boolean };
  'browser:navigate': { url: string };
  'browser:close': void;
  'browser:screenshot': void;
  'browser:action': BrowserAction;
  'browser:pause': void;
  'browser:resume': void;
  'browser:stop': void;

  // AI
  'ai:interpret-task': { instruction: string; pageContent: string };
  'ai:study-mode': { content: string; types: StudyOutputType[] };
  'ai:general': { instruction: string; content: string };

  // Database
  'db:sessions:list': void;
  'db:sessions:create': { name: string; url: string };
  'db:sessions:get': { id: string };
  'db:tasks:create': { sessionId: string; instruction: string };
  'db:tasks:update': { id: string; data: Partial<Task> };

  // Settings
  'settings:get': void;
  'settings:update': Partial<AppSettings>;

  // Export
  'export:markdown': { taskId: string };
  'export:pdf': { taskId: string };
  'export:json': { taskId: string };
}

// ============================================
// Task Template
// ============================================

export interface TemplateStep {
  order: number;
  instruction: string;
  description?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  steps: TemplateStep[];
  plugin?: string;
}

// ============================================
// Log
// ============================================

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

// ============================================
// Export
// ============================================

export interface ExportResult {
  filename: string;
  filepath: string;
  format: 'markdown' | 'pdf' | 'json';
  size: number;
}

// ============================================
// Plugin
// ============================================

export interface PluginInfo {
  name: string;
  displayName: string;
  urlPattern: RegExp;
  version: string;
  description: string;
}
