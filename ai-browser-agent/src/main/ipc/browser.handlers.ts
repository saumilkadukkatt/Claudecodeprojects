import { IpcMain, BrowserWindow } from 'electron';
import { BrowserService } from '../services/browser.service';
import { SettingsService } from '../services/settings.service';
import { BrowserAction } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export function setupBrowserHandlers(ipcMain: IpcMain): void {
  const browserService = BrowserService.getInstance();

  // Forward browser events to renderer
  browserService.addEventListener((event) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send('browser:event', event);
  });

  ipcMain.handle('browser:launch', async (_event, { url, headless }: { url: string; headless: boolean }) => {
    try {
      await browserService.launch(url, headless);
      return { success: true };
    } catch (error) {
      logger.error('Browser launch failed', { error: String(error) });
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('browser:navigate', async (_event, { url }: { url: string }) => {
    try {
      await browserService.navigate(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('browser:close', async () => {
    try {
      await browserService.close();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('browser:screenshot', async () => {
    try {
      const screenshot = await browserService.takeScreenshot();
      return { success: true, screenshot };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('browser:action', async (event, action: BrowserAction) => {
    const settings = SettingsService.getInstance().getSettings();

    // Check approval requirements
    if (action.requiresApproval && settings.approvalMode !== 'auto') {
      // Send approval request to renderer
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.webContents.send('action:approval-request', action);
        // Wait for approval response via invoke
      }
    }

    try {
      const result = await browserService.executeAction(action);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('browser:pause', () => {
    browserService.pause();
    return { success: true };
  });

  ipcMain.handle('browser:resume', () => {
    browserService.resume();
    return { success: true };
  });

  ipcMain.handle('browser:stop', () => {
    browserService.stop();
    return { success: true };
  });

  ipcMain.handle('browser:get-content', async () => {
    try {
      const content = await browserService.getPageContent();
      const url = await browserService.getPageUrl();
      const title = await browserService.getPageTitle();
      return { success: true, content, url, title };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
