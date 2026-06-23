import { Page } from 'playwright';
import { BasePlugin } from '../base-plugin';
import { ExtractedContent, PluginInfo } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export class LinkedInLearningPlugin extends BasePlugin {
  get info(): PluginInfo {
    return {
      name: 'linkedin-learning',
      displayName: 'LinkedIn Learning',
      urlPattern: /linkedin\.com\/learning/i,
      version: '1.0.0',
      description: 'LinkedIn Learning course reader',
    };
  }

  async login(page: Page, username: string, _password: string): Promise<void> {
    logger.info('LinkedIn Learning login initiated');
    await page.fill('#username', username);
    await page.click('[data-litms-control-urn*="submit"]');
    await page.waitForLoadState('networkidle');
  }

  async extractContent(page: Page): Promise<ExtractedContent> {
    const url = page.url();
    const title = await page.title();

    // Try to get transcript
    const transcriptText = await page.evaluate(() => {
      const transcript = document.querySelector(
        '[class*="transcript"], [data-test="transcript"], .classroom-transcript'
      );
      if (transcript) return (transcript as HTMLElement).innerText;

      // Fallback to visible content
      const main = document.querySelector('main, [role="main"]');
      return main ? (main as HTMLElement).innerText : document.body.innerText;
    });

    return {
      url,
      title,
      sections: [{ content: transcriptText, order: 0 }],
      rawText: transcriptText,
      extractedAt: new Date(),
    };
  }
}
