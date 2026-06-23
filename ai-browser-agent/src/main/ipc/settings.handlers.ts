import { IpcMain } from 'electron';
import { SettingsService } from '../services/settings.service';
import { AppSettings } from '../../shared/types';

export function setupSettingsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('settings:get', async () => {
    try {
      const settings = SettingsService.getInstance().getSettings();
      return { success: true, settings };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('settings:update', async (_event, data: Partial<AppSettings>) => {
    try {
      const settings = await SettingsService.getInstance().updateSettings(data);
      return { success: true, settings };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
