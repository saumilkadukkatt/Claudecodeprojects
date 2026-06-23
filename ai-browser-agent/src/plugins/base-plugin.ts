import { Page } from 'playwright';
import { PluginInfo, ExtractedContent } from '../shared/types';

export abstract class BasePlugin {
  abstract get info(): PluginInfo;

  matches(url: string): boolean {
    return this.info.urlPattern.test(url);
  }

  abstract login(page: Page, username: string, password: string): Promise<void>;

  abstract extractContent(page: Page): Promise<ExtractedContent>;

  async waitForAuth(page: Page): Promise<boolean> {
    // Subclasses can override to detect auth state
    return true;
  }

  async handleMfa(_page: Page): Promise<void> {
    // Pause and wait — MFA must never be bypassed
    throw new Error('MFA detected — automation paused, waiting for user input');
  }
}
