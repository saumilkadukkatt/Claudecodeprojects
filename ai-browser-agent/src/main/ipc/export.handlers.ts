import { IpcMain } from 'electron';
import { DatabaseService } from '../services/database.service';
import { SettingsService } from '../services/settings.service';
import { exportMarkdown } from '../../exports/markdown.exporter';
import { exportPdf } from '../../exports/pdf.exporter';
import { exportJson } from '../../exports/json.exporter';
import { logger } from '../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export function setupExportHandlers(ipcMain: IpcMain): void {
  async function getTaskData(taskId: string) {
    const db = DatabaseService.getInstance().getClient();
    return db.task.findUnique({
      where: { id: taskId },
      include: { summaries: true, flashcards: true, quizItems: true, sources: true },
    });
  }

  ipcMain.handle('export:markdown', async (_event, { taskId }: { taskId: string }) => {
    try {
      const task = await getTaskData(taskId);
      if (!task) throw new Error('Task not found');
      const { exportDir } = SettingsService.getInstance().getSettings();

      const content = task.summaries.map((s) => s.content).join('\n\n') || task.result || '';
      const result = await exportMarkdown(
        { title: task.instruction.slice(0, 60), content },
        exportDir
      );

      const db = DatabaseService.getInstance().getClient();
      await db.export.create({
        data: { id: uuidv4(), taskId, format: 'markdown', filename: result.filename, filepath: result.filepath, size: result.size },
      });

      return { success: true, ...result };
    } catch (error) {
      logger.error('Markdown export failed', { error: String(error) });
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('export:pdf', async (_event, { taskId }: { taskId: string }) => {
    try {
      const task = await getTaskData(taskId);
      if (!task) throw new Error('Task not found');
      const { exportDir } = SettingsService.getInstance().getSettings();

      const content = task.summaries.map((s) => s.content).join('\n\n') || task.result || '';
      const result = await exportPdf(
        { title: task.instruction.slice(0, 60), content },
        exportDir
      );

      const db = DatabaseService.getInstance().getClient();
      await db.export.create({
        data: { id: uuidv4(), taskId, format: 'pdf', filename: result.filename, filepath: result.filepath, size: result.size },
      });

      return { success: true, ...result };
    } catch (error) {
      logger.error('PDF export failed', { error: String(error) });
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('export:json', async (_event, { taskId }: { taskId: string }) => {
    try {
      const task = await getTaskData(taskId);
      if (!task) throw new Error('Task not found');
      const { exportDir } = SettingsService.getInstance().getSettings();

      const exportData = {
        instruction: task.instruction,
        status: task.status,
        createdAt: task.createdAt,
        summaries: task.summaries,
        flashcards: task.flashcards,
        quizItems: task.quizItems,
      };

      const result = await exportJson(exportData, task.instruction.slice(0, 60), exportDir);

      const db = DatabaseService.getInstance().getClient();
      await db.export.create({
        data: { id: uuidv4(), taskId, format: 'json', filename: result.filename, filepath: result.filepath, size: result.size },
      });

      return { success: true, ...result };
    } catch (error) {
      logger.error('JSON export failed', { error: String(error) });
      return { success: false, error: String(error) };
    }
  });
}
