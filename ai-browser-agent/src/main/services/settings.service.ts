import { AppSettings, DEFAULT_SETTINGS } from '../../shared/types';
import { DatabaseService } from './database.service';
import { logger } from '../../shared/utils/logger';

export class SettingsService {
  private static instance: SettingsService;
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  async initialize(): Promise<void> {
    const db = DatabaseService.getInstance().getClient();
    const row = await db.settings.findUnique({ where: { id: 'default' } });
    if (row) {
      this.settings = {
        theme: row.theme as AppSettings['theme'],
        claudeModel: row.claudeModel,
        automationSpeed: row.automationSpeed,
        ocrEnabled: row.ocrEnabled,
        headlessMode: row.headlessMode,
        defaultExport: row.defaultExport as AppSettings['defaultExport'],
        approvalMode: row.approvalMode as AppSettings['approvalMode'],
        studyMode: row.studyMode,
        exportDir: row.exportDir,
      };
    }
    logger.info('Settings loaded');
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  async updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
    this.settings = { ...this.settings, ...partial };
    const db = DatabaseService.getInstance().getClient();
    await db.settings.update({
      where: { id: 'default' },
      data: partial,
    });
    logger.info('Settings updated');
    return { ...this.settings };
  }
}
