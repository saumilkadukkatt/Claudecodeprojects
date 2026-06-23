import { IpcMain } from 'electron';
import { DatabaseService } from '../services/database.service';
import { logger } from '../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export function setupDbHandlers(ipcMain: IpcMain): void {
  const getDb = () => DatabaseService.getInstance().getClient();

  // Sessions
  ipcMain.handle('db:sessions:list', async () => {
    try {
      const sessions = await getDb().session.findMany({ orderBy: { updatedAt: 'desc' } });
      return { success: true, sessions };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:sessions:create', async (_event, { name, url }: { name: string; url: string }) => {
    try {
      const session = await getDb().session.create({
        data: { id: uuidv4(), name, url },
      });
      return { success: true, session };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:sessions:get', async (_event, { id }: { id: string }) => {
    try {
      const session = await getDb().session.findUnique({
        where: { id },
        include: { tasks: { orderBy: { createdAt: 'desc' } } },
      });
      return { success: true, session };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:sessions:delete', async (_event, { id }: { id: string }) => {
    try {
      await getDb().session.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Tasks
  ipcMain.handle('db:tasks:create', async (_event, { sessionId, instruction }: { sessionId: string; instruction: string }) => {
    try {
      const task = await getDb().task.create({
        data: { id: uuidv4(), sessionId, instruction },
      });
      return { success: true, task };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:tasks:update', async (_event, { id, data }: { id: string; data: Record<string, unknown> }) => {
    try {
      const task = await getDb().task.update({
        where: { id },
        data: {
          ...data,
          actions: typeof data.actions === 'object' ? JSON.stringify(data.actions) : data.actions,
        },
      });
      return { success: true, task };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:tasks:get', async (_event, { id }: { id: string }) => {
    try {
      const task = await getDb().task.findUnique({
        where: { id },
        include: { summaries: true, flashcards: true, quizItems: true, sources: true },
      });
      return { success: true, task };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:tasks:list', async (_event, { sessionId }: { sessionId: string }) => {
    try {
      const tasks = await getDb().task.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, tasks };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Bookmarks
  ipcMain.handle('db:bookmarks:list', async () => {
    try {
      const bookmarks = await getDb().bookmark.findMany({ orderBy: { createdAt: 'desc' } });
      return { success: true, bookmarks };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:bookmarks:create', async (_event, { url, title, description }: { url: string; title: string; description?: string }) => {
    try {
      const bookmark = await getDb().bookmark.create({
        data: { id: uuidv4(), url, title, description },
      });
      return { success: true, bookmark };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:bookmarks:delete', async (_event, { id }: { id: string }) => {
    try {
      await getDb().bookmark.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // History
  ipcMain.handle('db:history:list', async (_event, { limit }: { limit?: number }) => {
    try {
      const history = await getDb().history.findMany({
        orderBy: { visitedAt: 'desc' },
        take: limit || 100,
      });
      return { success: true, history };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:history:clear', async () => {
    try {
      await getDb().history.deleteMany();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Templates
  ipcMain.handle('db:templates:list', async () => {
    try {
      const templates = await getDb().taskTemplate.findMany({ orderBy: { name: 'asc' } });
      return { success: true, templates };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('db:templates:create', async (_event, template: { name: string; description?: string; steps: unknown[]; plugin?: string }) => {
    try {
      const created = await getDb().taskTemplate.create({
        data: {
          id: uuidv4(),
          name: template.name,
          description: template.description,
          steps: JSON.stringify(template.steps),
          plugin: template.plugin,
        },
      });
      return { success: true, template: created };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
