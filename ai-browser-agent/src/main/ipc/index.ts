import { IpcMain } from 'electron';
import { setupBrowserHandlers } from './browser.handlers';
import { setupAiHandlers } from './ai.handlers';
import { setupDbHandlers } from './database.handlers';
import { setupSettingsHandlers } from './settings.handlers';
import { setupExportHandlers } from './export.handlers';
import { setupEnvHandlers } from './env.handlers';

export function setupIpcHandlers(ipcMain: IpcMain): void {
  setupBrowserHandlers(ipcMain);
  setupAiHandlers(ipcMain);
  setupDbHandlers(ipcMain);
  setupSettingsHandlers(ipcMain);
  setupExportHandlers(ipcMain);
  setupEnvHandlers(ipcMain);
}
