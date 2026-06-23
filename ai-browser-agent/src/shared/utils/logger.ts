import { LogEntry, LogLevel } from '../types';
import { v4 as uuidv4 } from 'uuid';

type LogListener = (entry: LogEntry) => void;

class Logger {
  private listeners: LogListener[] = [];
  private entries: LogEntry[] = [];
  private maxEntries = 1000;

  addListener(listener: LogListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>) {
    // Never log credential-related keys
    const safeContext = context ? this.sanitize(context) : undefined;

    const entry: LogEntry = {
      id: uuidv4(),
      level,
      message,
      timestamp: new Date(),
      context: safeContext,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    this.listeners.forEach((l) => l(entry));

    // Console output (safe)
    const prefix = `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}]`;
    if (level === 'error') {
      console.error(prefix, message, safeContext || '');
    } else if (level === 'warn') {
      console.warn(prefix, message, safeContext || '');
    } else {
      console.log(prefix, message, safeContext || '');
    }
  }

  private sanitize(obj: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential', 'auth', 'login'];
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase();
      if (sensitiveKeys.some((s) => lower.includes(s))) {
        result[k] = '[REDACTED]';
      } else {
        result[k] = v;
      }
    }
    return result;
  }

  info(message: string, context?: Record<string, unknown>) {
    this.emit('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.emit('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.emit('error', message, context);
  }

  success(message: string, context?: Record<string, unknown>) {
    this.emit('success', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      this.emit('debug', message, context);
    }
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  clear() {
    this.entries = [];
  }
}

export const logger = new Logger();
