import { IpcMain } from 'electron';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export function setupEnvHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('env:get-config', () => {
    // Return ONLY non-sensitive config — never return credentials
    return {
      websiteUrl: process.env.WEBSITE_URL || '',
      hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
      hasCredentials: Boolean(process.env.LOGIN_USERNAME || process.env.LOGIN_EMAIL),
      headlessMode: process.env.HEADLESS_MODE === 'true',
      claudeModel: process.env.CLAUDE_MODEL || '',
      exportDir: process.env.EXPORT_DIR || '',
    };
  });
}
