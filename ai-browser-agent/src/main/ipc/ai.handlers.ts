import { IpcMain } from 'electron';
import { interpretTask } from '../../ai/task-interpreter';
import { generateStudyMaterials, generateGeneralResponse } from '../../ai/study-mode';
import { SettingsService } from '../services/settings.service';
import { StudyOutputType } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export function setupAiHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    'ai:interpret-task',
    async (_event, { instruction, pageContent }: { instruction: string; pageContent: string }) => {
      try {
        const { claudeModel } = SettingsService.getInstance().getSettings();
        const result = await interpretTask(instruction, pageContent, claudeModel);
        return { success: true, ...result };
      } catch (error) {
        logger.error('AI task interpretation failed', { error: String(error) });
        return { success: false, error: String(error) };
      }
    }
  );

  ipcMain.handle(
    'ai:study-mode',
    async (_event, { content, types }: { content: string; types: StudyOutputType[] }) => {
      try {
        const { claudeModel } = SettingsService.getInstance().getSettings();
        const result = await generateStudyMaterials(content, types, claudeModel);
        return { success: true, ...result };
      } catch (error) {
        logger.error('Study mode generation failed', { error: String(error) });
        return { success: false, error: String(error) };
      }
    }
  );

  ipcMain.handle(
    'ai:general',
    async (_event, { instruction, content }: { instruction: string; content: string }) => {
      try {
        const { claudeModel } = SettingsService.getInstance().getSettings();
        const result = await generateGeneralResponse(instruction, content, claudeModel);
        return { success: true, content: result };
      } catch (error) {
        logger.error('General AI response failed', { error: String(error) });
        return { success: false, error: String(error) };
      }
    }
  );
}
